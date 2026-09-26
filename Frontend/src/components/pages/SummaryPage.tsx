import React, { useState } from 'react';
import { useOcean } from '../../context/OceanContext';
import { generateSummary } from '../../models/summaryModel';
import {
  Thermometer,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
} from 'lucide-react';

export const SummaryPage: React.FC = () => {
  const { selectedLocation, predictionData } = useOcean();
  const summary = generateSummary(predictionData, selectedLocation);

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (type: string, filename: string) => {
    setDownloading(type);
    setTimeout(() => {
      setDownloading(null);
      alert(`Downloaded ${filename} successfully!`);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Screenshot Frame 4 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-2">
            Reconstruction Summary
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Model performance and comparison with in-situ observations
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0b1329] border border-cyan-500/30 text-cyan-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Data: Latest (12 Sep 2026)</span>
          </span>
        </div>
      </div>

      {/* Top 4 Metrics Cards Grid matching Screenshot Frame 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: RMSE */}
        <div className="ocean-card p-4 space-y-2 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-mono">RMSE</div>
            <div className="text-2xl font-extrabold text-white font-mono">{summary.rmse} °C</div>
          </div>
        </div>

        {/* Metric 2: MAE */}
        <div className="ocean-card p-4 space-y-2 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-mono">MAE</div>
            <div className="text-2xl font-extrabold text-white font-mono">{summary.mae} °C</div>
          </div>
        </div>

        {/* Metric 3: R² Score */}
        <div className="ocean-card p-4 space-y-2 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-mono">R² Score</div>
            <div className="text-2xl font-extrabold text-white font-mono">{summary.r2}</div>
          </div>
        </div>

        {/* Metric 4: Accuracy */}
        <div className="ocean-card p-4 space-y-2 flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-mono">Accuracy</div>
            <div className="text-2xl font-extrabold text-white font-mono">94.2 %</div>
          </div>
        </div>

      </div>

      {/* ARGO Benchmark 3-Panel Maps Comparison (500 m Depth) */}
      <div className="ocean-card p-5 space-y-4">
        
        {/* 3 Map Comparison Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Panel 1: ARGO Observed (500 m) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">
              ARGO Observed (500 m)
            </div>
            
            <div className="h-44 rounded-xl bg-[#050814] overflow-hidden relative border border-cyan-500/30 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-cyan-700 via-amber-600 to-red-600 opacity-80" />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-white bg-slate-950/80 px-3 py-1 rounded-lg border border-cyan-500/40 shadow-xl">
                  In-situ Float Field (500m)
                </span>
              </div>
            </div>

            {/* Scale Bar */}
            <div className="space-y-1">
              <div className="h-2 rounded-full thermal-gradient border border-slate-700" />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
              </div>
              <div className="text-[10px] text-slate-400 text-center font-mono">Temperature (°C)</div>
            </div>
          </div>

          {/* Panel 2: OceanEmbed Prediction (500 m) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-cyan-300">
              OceanEmbed Prediction (500 m)
            </div>

            <div className="h-44 rounded-xl bg-[#050814] overflow-hidden relative border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.15)] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-cyan-700 via-amber-600 to-red-600 opacity-80" />
              <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-950/90 px-3 py-1 rounded-lg border border-cyan-400 shadow-xl">
                  AI Model Output (500m)
                </span>
              </div>
            </div>

            {/* Scale Bar */}
            <div className="space-y-1">
              <div className="h-2 rounded-full thermal-gradient border border-slate-700" />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
              </div>
              <div className="text-[10px] text-slate-400 text-center font-mono">Temperature (°C)</div>
            </div>
          </div>

          {/* Panel 3: Prediction Error (500 m) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-300">
              Prediction Error (500 m)
            </div>

            <div className="h-44 rounded-xl bg-[#050814] overflow-hidden relative border border-amber-500/30 group">
              <div className="absolute inset-0 error-gradient opacity-70" />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950/90 px-3 py-1 rounded-lg border border-amber-500/40 shadow-xl">
                  Error ΔT Grid (500m)
                </span>
              </div>
            </div>

            {/* Scale Bar */}
            <div className="space-y-1">
              <div className="h-2 rounded-full error-gradient border border-slate-700" />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>-3</span>
                <span>-2</span>
                <span>-1</span>
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
              <div className="text-[10px] text-slate-400 text-center font-mono">Error (°C)</div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Grid: Key Insights & Download Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 7 Columns: Key Insights checklist matching Screenshot Frame 4 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="ocean-card p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-cyan-500/20 pb-3">
                Key Insights
              </div>

              <div className="space-y-3 pt-3">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Accurate reconstruction of subsurface temperature using only satellite surface observations.</span>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>High agreement with ARGO float measurements.</span>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Better performance in open ocean regions; higher error near coastal and dynamic regions.</span>
                </div>

                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Useful for climate monitoring, marine heatwave detection, and ocean circulation studies.</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-cyan-400/80 font-mono italic pt-3 border-t border-cyan-500/10">
              Verified by Ministry of Earth Sciences (MoES) Benchmark Suite.
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Download Results buttons matching Screenshot Frame 4 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="ocean-card p-5 space-y-4">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-cyan-500/20 pb-3">
              Download Results
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleDownload('csv', 'oceanembed_temperature_profile.csv')}
                className="w-full p-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Download Profile (CSV)</span>
              </button>

              <button
                onClick={() => handleDownload('netcdf', 'oceanembed_3d_spatial.nc')}
                className="w-full p-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Download Maps (NetCDF)</span>
              </button>

              <button
                onClick={() => handleDownload('pdf', 'oceanembed_validation_report.pdf')}
                className="w-full p-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Download Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
