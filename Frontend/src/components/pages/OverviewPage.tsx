import React, { useState } from 'react';
import { useOcean, LOCATION_DETAILS } from '../../context/OceanContext';
import { LocationKey, ParameterType } from '../../types/ocean';
import { Real2DMap } from '../common/Real2DMap';
import { TemperatureLegend } from '../common/TemperatureLegend';
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Waves,
  Leaf,
  Wind,
  Navigation,
  Play,
  Loader2,
  Sliders,
  CheckCircle,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    currentLocation,
    selectedParameter,
    setSelectedParameter,
    predictionData,
    isPredicting,
    predictionMessage,
    runPrediction,
  } = useOcean();

  const [activeTab, setActiveTab] = useState<'profile' | 'table'>('profile');
  const [depthRange, setDepthRange] = useState<string>('0-1000');
  const [depthInterval, setDepthInterval] = useState<string>('50');
  const [locationTab, setLocationTab] = useState<'search' | 'coordinates'>('search');
  const [searchQuery, setSearchQuery] = useState<string>('Arabian Sea');

  // Input Parameter state override for prediction inputs
  const [inputs, setInputs] = useState({
    sst: currentLocation.surfaceTemp,
    sss: currentLocation.sss,
    ssh: currentLocation.ssh,
    chlorophyll: currentLocation.chlorophyll,
    windSpeed: currentLocation.windSpeed,
  });

  // Handle location switch
  const handleSelectLocation = (locKey: LocationKey) => {
    setSelectedLocation(locKey);
    const loc = LOCATION_DETAILS[locKey];
    setInputs({
      sst: loc.surfaceTemp,
      sss: loc.sss,
      ssh: loc.ssh,
      chlorophyll: loc.chlorophyll,
      windSpeed: loc.windSpeed,
    });
  };

  const quickLocations: { key: LocationKey; name: string }[] = [
    { key: 'arabian_sea', name: 'Arabian Sea' },
    { key: 'bay_of_bengal', name: 'Bay of Bengal' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* SECTION 1: GLOBAL OCEAN OVERVIEW (DASHBOARD) */}
      <div className="space-y-5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-2">
              Global Ocean Overview
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore satellite observations and ocean conditions
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0b1329] border border-cyan-500/30 text-cyan-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Data: Latest (12 Sep 2026)</span>
            </span>
          </div>
        </div>

        {/* 3-Column Dashboard Layout matching Screenshot Frame 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT PANEL: Set Location (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="ocean-card p-4 space-y-4">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider border-b border-cyan-500/20 pb-2">
                Set Location
              </div>

              {/* Search / Coordinates Toggle */}
              <div className="flex bg-[#050814] p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setLocationTab('search')}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    locationTab === 'search'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Search
                </button>
                <button
                  onClick={() => setLocationTab('coordinates')}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    locationTab === 'coordinates'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Coordinates
                </button>
              </div>

              {/* Search Input Box */}
              {locationTab === 'search' ? (
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Arabian Sea..."
                      className="w-full bg-[#050814] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button className="p-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <input
                    type="text"
                    value={`${currentLocation.latitude}° N`}
                    readOnly
                    className="bg-[#050814] border border-cyan-500/30 rounded px-2.5 py-1.5 text-cyan-300 text-center"
                  />
                  <input
                    type="text"
                    value={`${currentLocation.longitude}° E`}
                    readOnly
                    className="bg-[#050814] border border-cyan-500/30 rounded px-2.5 py-1.5 text-cyan-300 text-center"
                  />
                </div>
              )}

              {/* Selected Location Card */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Selected Location
                </span>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-bold text-sm text-cyan-200">{currentLocation.name}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono pl-6">
                  {currentLocation.latStr}, {currentLocation.lonStr}
                </div>
                <button className="w-full mt-2 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold transition-all">
                  Set Location
                </button>
              </div>

              {/* Quick Locations */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Quick Locations
                </span>
                <div className="space-y-1.5">
                  {quickLocations.map((loc) => {
                    const isSelected = selectedLocation === loc.key;
                    return (
                      <button
                        key={loc.key}
                        onClick={() => handleSelectLocation(loc.key)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : 'bg-[#050814] text-slate-300 border border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <span>🌊 {loc.name}</span>
                        {isSelected && <span className="text-[10px] font-mono font-bold">ACTIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* CENTER PANEL: Real 2D Map (6 Columns) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="ocean-card p-4 space-y-3 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Sea Surface Temperature (SST)
                  </span>
                  
                  {/* View Selector */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400">View:</span>
                    <select
                      value={selectedParameter}
                      onChange={(e) => setSelectedParameter(e.target.value as ParameterType)}
                      className="bg-[#050814] border border-cyan-500/30 rounded px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none"
                    >
                      <option value="sst">SST</option>
                      <option value="sss">SSS</option>
                      <option value="ssh">SSH</option>
                      <option value="chlorophyll">Chlorophyll-a</option>
                      <option value="wind_speed">Wind Speed</option>
                    </select>
                  </div>
                </div>

                {/* Real Interactive Leaflet 2D Map */}
                <div className="mt-3">
                  <Real2DMap selectedParam={selectedParameter} heightClass="h-[360px]" />
                </div>
              </div>

              {/* Thermal Legend Scale */}
              <TemperatureLegend />
            </div>
          </div>

          {/* RIGHT PANEL: Ocean Status Panel (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="ocean-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Ocean Status <span className="text-slate-400 font-normal">({currentLocation.name})</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {/* SST */}
                <div className="p-2.5 rounded-lg bg-[#050814] border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-red-500/10 text-red-400">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Sea Surface Temperature (SST)</div>
                      <div className="text-sm font-extrabold text-white font-mono">{currentLocation.surfaceTemp} °C</div>
                    </div>
                  </div>
                </div>

                {/* SSS */}
                <div className="p-2.5 rounded-lg bg-[#050814] border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Sea Surface Salinity (SSS)</div>
                      <div className="text-sm font-extrabold text-white font-mono">{currentLocation.sss} PSU</div>
                    </div>
                  </div>
                </div>

                {/* SSH */}
                <div className="p-2.5 rounded-lg bg-[#050814] border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                      <Waves className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Sea Surface Height (SSH)</div>
                      <div className="text-sm font-extrabold text-white font-mono">{currentLocation.ssh} m</div>
                    </div>
                  </div>
                </div>

                {/* Chlorophyll-a */}
                <div className="p-2.5 rounded-lg bg-[#050814] border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Chlorophyll-a</div>
                      <div className="text-sm font-extrabold text-white font-mono">{currentLocation.chlorophyll} mg/m³</div>
                    </div>
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="p-2.5 rounded-lg bg-[#050814] border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Wind Speed</div>
                      <div className="text-sm font-extrabold text-white font-mono">{currentLocation.windSpeed} m/s</div>
                    </div>
                  </div>
                </div>

                {/* Current Speed */}
                <div className="p-2.5 rounded-lg bg-[#050814] border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Current Speed</div>
                      <div className="text-sm font-extrabold text-white font-mono">{currentLocation.surfaceCurrent} m/s</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Source Badges */}
              <div className="pt-2 border-t border-cyan-500/10 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Data Source</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-center">
                  <span className="p-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">MODIS</span>
                  <span className="p-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">Sentinel</span>
                  <span className="p-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">Jason-3</span>
                  <span className="p-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">Copernicus</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: SUBSURFACE TEMPERATURE PREDICTION & DEPTH INPUTS (Screenshot Frame 2) */}
      <div className="space-y-5 pt-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Subsurface Temperature Prediction
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                AI Deep Learning
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Predict ocean temperature profile from satellite observations
            </p>
          </div>
        </div>

        {/* 3-Column Layout matching Screenshot Frame 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT PANEL: Selected Location & Model Settings (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Selected Location Box with Change Location button */}
            <div className="ocean-card p-4 space-y-3">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider border-b border-cyan-500/20 pb-2">
                Selected Location
              </div>

              <div className="p-3 rounded-lg bg-[#050814] border border-cyan-500/30 space-y-2">
                <div className="h-24 rounded overflow-hidden relative border border-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 to-blue-950/80" />
                  <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-cyan-300 font-mono">📍 {currentLocation.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{currentLocation.latStr}, {currentLocation.lonStr}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-300 font-bold">{currentLocation.name}</span>
                  <span className="text-cyan-400 font-mono">{currentLocation.latStr}, {currentLocation.lonStr}</span>
                </div>

                <button
                  onClick={() => setSelectedLocation(selectedLocation === 'arabian_sea' ? 'bay_of_bengal' : 'arabian_sea')}
                  className="w-full py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold transition-all mt-1"
                >
                  Change Location
                </button>
              </div>
            </div>

            {/* Model Settings & Prediction Trigger */}
            <div className="ocean-card p-4 space-y-3">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider border-b border-cyan-500/20 pb-2 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Model Settings & Inputs</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Depth Range</label>
                  <select
                    value={depthRange}
                    onChange={(e) => setDepthRange(e.target.value)}
                    className="w-full bg-[#050814] border border-cyan-500/30 rounded px-2.5 py-1.5 text-cyan-300 font-mono focus:outline-none"
                  >
                    <option value="0-1000">0 – 1000 m</option>
                    <option value="0-500">0 – 500 m</option>
                    <option value="0-2000">0 – 2000 m</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Depth Interval</label>
                  <select
                    value={depthInterval}
                    onChange={(e) => setDepthInterval(e.target.value)}
                    className="w-full bg-[#050814] border border-cyan-500/30 rounded px-2.5 py-1.5 text-cyan-300 font-mono focus:outline-none"
                  >
                    <option value="50">50 m</option>
                    <option value="25">25 m</option>
                    <option value="100">100 m</option>
                  </select>
                </div>

                {/* Satellite Input Overrides */}
                <div className="pt-2 border-t border-cyan-500/10 space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Surface Inputs (°C, PSU, m)</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500">SST:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.sst}
                        onChange={(e) => setInputs({ ...inputs, sst: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#050814] border border-cyan-500/30 rounded px-2 py-1 text-cyan-300"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">SSS:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.sss}
                        onChange={(e) => setInputs({ ...inputs, sss: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#050814] border border-cyan-500/30 rounded px-2 py-1 text-cyan-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Run Prediction Button */}
                <button
                  onClick={runPrediction}
                  disabled={isPredicting}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 mt-3 ${
                    isPredicting
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  }`}
                >
                  {isPredicting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-950" />
                      <span>Running Model...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Run Prediction</span>
                    </>
                  )}
                </button>
                
                {isPredicting && (
                  <p className="text-[10px] text-cyan-400 font-mono animate-pulse text-center">
                    {predictionMessage || 'Processing satellite observation tensor...'}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* CENTER PANEL: Temperature Profile Chart (6 Columns) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="ocean-card p-4 space-y-3 flex flex-col justify-between h-full">
              
              {/* Header with Profile / Table toggle */}
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Temperature Profile (0 – 1000 m)
                </span>

                <div className="flex items-center space-x-1 bg-[#050814] p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-3 py-1 rounded transition-all ${
                      activeTab === 'profile'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-3 py-1 rounded transition-all ${
                      activeTab === 'table'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>

              {/* Chart area */}
              {activeTab === 'profile' ? (
                <div className="h-[380px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={predictionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      
                      <XAxis
                        type="number"
                        dataKey="predictedTemp"
                        name="Temperature"
                        unit="°C"
                        domain={[0, 30]}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -10, fill: '#00f0ff', fontSize: 11 }}
                      />

                      <YAxis
                        type="number"
                        dataKey="depth"
                        name="Depth"
                        unit="m"
                        reversed
                        domain={[0, 1000]}
                        ticks={[0, 200, 400, 600, 800, 1000]}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#00f0ff', fontSize: 11 }}
                      />

                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 rounded-lg bg-[#0b1329] border border-cyan-400 text-xs space-y-1 shadow-xl font-mono">
                                <div className="text-cyan-400 font-bold">Depth: {data.depth} m</div>
                                <div className="text-white">Predicted Temp: <span className="text-cyan-300 font-bold">{data.predictedTemp}°C</span></div>
                                <div className="text-amber-400">ARGO Float: {data.argoTemp}°C</div>
                                <div className="text-slate-400">Confidence: {data.confidence}%</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="predictedTemp"
                        stroke="#00f0ff"
                        strokeWidth={3}
                        dot={{ fill: '#00f0ff', r: 4, stroke: '#070d1e', strokeWidth: 2 }}
                        name="Predicted (OceanEmbed)"
                      />

                      <Line
                        type="monotone"
                        dataKey="argoTemp"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ fill: '#94a3b8', r: 3 }}
                        name="ARGO (If available)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto h-[380px]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#050814] text-cyan-300 border-b border-cyan-500/30">
                      <tr>
                        <th className="p-2.5">Depth (m)</th>
                        <th className="p-2.5">Predicted Temp (°C)</th>
                        <th className="p-2.5">ARGO Float (°C)</th>
                        <th className="p-2.5">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {predictionData.map((row) => (
                        <tr key={row.depth} className="hover:bg-cyan-950/20 text-slate-300">
                          <td className="p-2.5 text-cyan-400 font-bold">{row.depth} m</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{row.predictedTemp} °C</td>
                          <td className="p-2.5 text-amber-300">{row.argoTemp} °C</td>
                          <td className="p-2.5 text-cyan-300">{row.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Chart Legend Footer */}
              <div className="flex items-center justify-center space-x-6 text-xs pt-2 border-t border-cyan-500/10 font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  <span className="text-cyan-300">Predicted (OceanEmbed)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-300" />
                  <span className="text-slate-400">ARGO (If available)</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: Predicted Values & Model Confidence (3 Columns) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Predicted Values Table matching screenshot */}
            <div className="ocean-card p-4 space-y-3">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider border-b border-cyan-500/20 pb-2">
                Predicted Values <span className="text-slate-400 font-normal text-[10px]">(Selected Depths)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-1.5 px-2">Depth (m)</th>
                      <th className="py-1.5 px-2 text-right">Temperature (°C)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {predictionData.map((row) => (
                      <tr key={row.depth} className="hover:bg-cyan-950/20 text-slate-200">
                        <td className="py-1.5 px-2 text-cyan-400">{row.depth}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-white">{row.predictedTemp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Confidence Box matching screenshot */}
            <div className="ocean-card p-4 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Model Confidence
              </div>

              <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                92.4 %
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(0,240,255,0.6)]"
                  style={{ width: '92.4%' }}
                />
              </div>

              <p className="text-[10px] text-slate-400">
                High confidence validation score based on ARGO profiling float benchmark agreement.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
