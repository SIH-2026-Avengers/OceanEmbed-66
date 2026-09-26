import React from 'react';
import { useOcean, LOCATION_DETAILS } from '../../context/OceanContext';
import { ParameterType, LocationKey } from '../../types/ocean';
import { TemperatureLegend } from '../common/TemperatureLegend';
import { Layers, MapPin, Compass, AlertCircle, Maximize2, RefreshCw } from 'lucide-react';

export const Map2DPage: React.FC = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    currentLocation,
    selectedParameter,
    setSelectedParameter,
  } = useOcean();

  const parameters: { key: ParameterType; label: string; unit: string }[] = [
    { key: 'sst', label: 'SST (Sea Temp)', unit: '°C' },
    { key: 'sss', label: 'SSS (Salinity)', unit: 'PSU' },
    { key: 'ssh', label: 'SSH (Altimetry)', unit: 'm' },
    { key: 'chlorophyll', label: 'Chlorophyll-a', unit: 'mg/m³' },
    { key: 'wind_speed', label: 'Wind Speed', unit: 'm/s' },
  ];

  const locations: LocationKey[] = ['bay_of_bengal', 'arabian_sea'];

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            2D Ocean Observation Map
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono">
              Dedicated View
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            High-resolution surface observation satellite grid layer (MODIS / Sentinel-3 / Jason-3)
          </p>
        </div>

        {/* Selected Location Quick Selector */}
        <div className="flex items-center space-x-2 bg-[#0b1329] p-1.5 rounded-xl border border-cyan-500/30">
          {locations.map((locKey) => {
            const loc = LOCATION_DETAILS[locKey];
            const isSelected = selectedLocation === locKey;
            return (
              <button
                key={locKey}
                onClick={() => setSelectedLocation(locKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🌊 {loc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>DATA SOURCE:</strong> Demo satellite observation grid layer for {currentLocation.name}. Real satellite feeds (NetCDF / GeoTIFF) can be loaded via API backend.
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-500/20">
          RESOLUTION: 0.25° × 0.25°
        </span>
      </div>

      {/* Main Map View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Controls Column (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Parameter Switcher Card */}
          <div className="ocean-card p-4 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs border-b border-cyan-500/20 pb-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Select Satellite Parameter</span>
            </div>

            <div className="space-y-1.5">
              {parameters.map((p) => {
                const isSelected = selectedParameter === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setSelectedParameter(p.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'bg-[#050814]/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{p.unit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Info Box */}
          <div className="ocean-card p-4 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs border-b border-cyan-500/20 pb-2.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Region Specifications</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Basin:</span>
                <span className="font-bold text-white">{currentLocation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lat Center:</span>
                <span className="font-mono text-cyan-300">{currentLocation.latStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lon Center:</span>
                <span className="font-mono text-cyan-300">{currentLocation.lonStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active SST:</span>
                <span className="font-mono text-cyan-300">{currentLocation.surfaceTemp} °C</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <TemperatureLegend title={`${selectedParameter.toUpperCase()} Surface Spectrum`} />
        </div>

        {/* Right Map Canvas Area (9 Cols) */}
        <div className="lg:col-span-9">
          <div className="ocean-card p-4 relative min-h-[560px] flex flex-col justify-between overflow-hidden">
            
            {/* Header controls overlay */}
            <div className="flex items-center justify-between z-10 bg-[#070d1e]/80 p-3 rounded-lg border border-cyan-500/20 backdrop-blur-md mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {currentLocation.name} 2D Surface Matrix
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-500/30">
                  Parameter: {selectedParameter.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedLocation(selectedLocation === 'bay_of_bengal' ? 'arabian_sea' : 'bay_of_bengal')}
                  className="px-2.5 py-1 rounded text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Switch Region
                </button>
              </div>
            </div>

            {/* Interactive Simulated Map Canvas */}
            <div className="relative flex-1 rounded-xl overflow-hidden border border-cyan-500/30 bg-[#050814] min-h-[460px] flex items-center justify-center group">
              
              {/* Dynamic Ocean Thermal Heatmap Shader simulation */}
              <div
                className="absolute inset-0 transition-all duration-700 opacity-90"
                style={{
                  background: selectedLocation === 'bay_of_bengal'
                    ? 'radial-gradient(circle at 60% 40%, rgba(239,68,68,0.85) 0%, rgba(249,115,22,0.7) 20%, rgba(234,179,8,0.6) 40%, rgba(16,185,129,0.5) 60%, rgba(6,182,212,0.4) 80%, rgba(30,58,138,0.9) 100%)'
                    : 'radial-gradient(circle at 40% 60%, rgba(239,68,68,0.85) 0%, rgba(249,115,22,0.7) 25%, rgba(16,185,129,0.5) 50%, rgba(2,132,199,0.4) 75%, rgba(30,58,138,0.9) 100%)'
                }}
              />

              {/* Geographic Grid Lines & Coastline Simulation */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff0f_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0f_1px,transparent_1px)] bg-[size:32px_32px]" />

              {/* Floating Lat / Lon Grid Numbers */}
              <div className="absolute top-2 left-4 text-[10px] font-mono text-cyan-400/60 z-10">20.0° N</div>
              <div className="absolute top-2 right-4 text-[10px] font-mono text-cyan-400/60 z-10">92.0° E</div>
              <div className="absolute bottom-2 left-4 text-[10px] font-mono text-cyan-400/60 z-10">10.0° N</div>
              <div className="absolute bottom-2 right-4 text-[10px] font-mono text-cyan-400/60 z-10">80.0° E</div>

              {/* Target Location Pulsing Pin */}
              <div className="absolute z-20 flex flex-col items-center cursor-pointer">
                <div className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.8)] flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{currentLocation.name}</span>
                </div>
                <div className="text-[10px] text-slate-300 font-mono mt-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                  {currentLocation.latStr}, {currentLocation.lonStr} | {selectedParameter.toUpperCase()}: {currentLocation.surfaceTemp}
                </div>
              </div>

              {/* Controls overlay in bottom right */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-1.5">
                <div className="px-2.5 py-1 rounded bg-slate-950/90 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  Zoom Level: 6.5x
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-950/90 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                  Projection: EPSG:4326
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
