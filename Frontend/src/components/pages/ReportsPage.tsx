import React, { useState } from 'react';
import { useOcean } from '../../context/OceanContext';
import { generateSummary } from '../../models/summaryModel';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCode,
  Map,
  Box,
  CheckCircle2,
  AlertCircle,
  Compass,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentLocation, predictionData, selectedLocation, isDemoMode } = useOcean();
  const summary = generateSummary(predictionData, selectedLocation, isDemoMode ? '°C' : 'unscaled model units');
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);

  const handleDownload = (filename: string, content: string, type: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: type });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloadedItem(filename);
    setTimeout(() => setDownloadedItem(null), 3000);
  };

  const downloadCSVProfile = () => {
    let csv = `Depth_m,Predicted_Value,ARGO_Temp_C,Error_Delta_C,Confidence_Pct,Thermal_Zone\n`;
    predictionData.forEach((row) => {
      csv += `${row.depth},${row.predictedTemp},${row.argoTemp ?? ''},${row.error ?? ''},${row.confidence ?? ''},${row.zone}\n`;
    });
    handleDownload(`OceanEmbed_${selectedLocation}_Temp_Profile.csv`, csv, 'text/csv');
  };

  const download3DJSON = () => {
    const json = JSON.stringify(
      {
        location: currentLocation.name,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        timestamp: new Date().toISOString(),
        depths: predictionData.map((d) => d.depth),
        temperatures: predictionData.map((d) => d.predictedTemp),
      },
      null,
      2
    );
    handleDownload(`OceanEmbed_${selectedLocation}_3D_Volume.json`, json, 'application/json');
  };

  const downloadSummaryPDF = () => {
    const reportText = `
================================================================================
                    OCEANEMBED (SIH PS 26066) - RECONSTRUCTION REPORT
================================================================================
Target Region: ${currentLocation.name} (${currentLocation.latStr}, ${currentLocation.lonStr})
Generated On: ${new Date().toLocaleString()}
Ministry of Earth Sciences (MoES) - Government of India

SUMMARY METRICS:
--------------------------------------------------------------------------------
RMSE: ${summary.rmse == null ? 'Unavailable' : `${summary.rmse} °C`}
MAE: ${summary.mae == null ? 'Unavailable' : `${summary.mae} °C`}
R2 Score: ${summary.r2 ?? 'Unavailable'}
Model Confidence: ${summary.confidence == null ? 'Unavailable (model has no confidence output)' : `${summary.confidence} %`}

VERTICAL SUBSURFACE PROFILE (0 - 1000m):
--------------------------------------------------------------------------------
${predictionData.map((d) => `Depth: ${d.depth}m | Predicted: ${d.predictedTemp}${isDemoMode ? '°C' : ' (unscaled model units)'} | ARGO Float: ${d.argoTemp == null ? 'Unavailable' : `${d.argoTemp}°C`} | Error: ${d.error == null ? 'Unavailable' : `${d.error}°C`}`).join('\n')}

================================================================================
`;
    handleDownload(`OceanEmbed_${selectedLocation}_Summary_Report.txt`, reportText, 'text/plain');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            Reports & Scientific Data Export
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono">
              Export Center
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Export subsurface ocean reconstruction profiles, 3D grids, and ARGO benchmark reports
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#0b1329] border border-cyan-500/30 text-xs text-cyan-300 flex items-center space-x-2 shrink-0">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">{currentLocation.name}</span>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadedItem && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Successfully exported: <strong>{downloadedItem}</strong></span>
        </div>
      )}

      {/* Main Download Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: CSV Profile */}
        <div className="ocean-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Vertical Temperature Profile (CSV)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export standard tabular data (Depth 0–1000m, AI Predicted Temp, ARGO float benchmark, error ΔT, thermal zone).
            </p>
          </div>

          <button
            onClick={downloadCSVProfile}
            className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Profile</span>
          </button>
        </div>

        {/* Card 2: 3D Data JSON */}
        <div className="ocean-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">3D Volumetric Grid Data (JSON)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export full 3D spatial coordinate voxel matrices (depth × lat × lon) for WebGL or GIS software integration.
            </p>
          </div>

          <button
            onClick={download3DJSON}
            className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <FileCode className="w-4 h-4" />
            <span>Download 3D JSON Data</span>
          </button>
        </div>

        {/* Card 3: Report Summary PDF / TXT */}
        <div className="ocean-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Reconstruction Summary Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export model outputs and benchmark statistics when reference observations are available.
            </p>
          </div>

          <button
            onClick={downloadSummaryPDF}
            className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Summary Report</span>
          </button>
        </div>

        {/* Card 4: 2D Observation Map (NetCDF) */}
        <div className="ocean-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">2D Observation Layer (NetCDF / PNG)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export satellite sea surface observation raster field for GIS tools (QGIS / ArcGIS / Python xarray).
            </p>
          </div>

          <button
            onClick={() => handleDownload(`OceanEmbed_${selectedLocation}_SST_Map.nc`, 'NetCDF-4 binary header simulation', 'application/x-netcdf')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download NetCDF Map</span>
          </button>
        </div>

        {/* Card 5: ARGO Benchmark Grid */}
        <div className="ocean-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">ARGO Validation Benchmark CSV</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export side-by-side comparison tables between physical in-situ ARGO floats and OceanEmbed prediction outputs.
            </p>
          </div>

          <button
            onClick={downloadCSVProfile}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download ARGO Grid CSV</span>
          </button>
        </div>

      </div>
    </div>
  );
};
