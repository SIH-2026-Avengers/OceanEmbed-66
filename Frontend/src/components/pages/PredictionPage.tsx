import React, { useState } from 'react';
import { useOcean } from '../../context/OceanContext';
import { ModelIntegrationCard } from '../common/ModelIntegrationCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  Cpu,
  Play,
  CheckCircle,
  Loader2,
  Calendar,
  Compass,
  Zap,
  Sliders,
  Layers,
} from 'lucide-react';

export const PredictionPage: React.FC = () => {
  const {
    currentLocation,
    modelInputs,
    isDemoMode,
    predictionData,
    isPredicting,
    predictionStep,
    predictionMessage,
    predictionError,
    runPrediction,
    selectedDepth,
    setSelectedDepth,
  } = useOcean();

  const [activeTab, setActiveTab] = useState<'profile' | 'table'>('profile');

  // Input features list
  const inputFeatures = [
    { label: 'analysed_sst', value: `${modelInputs.analysed_sst} °C` },
    { label: 'sos', value: `${modelInputs.sos} PSU` },
    { label: 'sla', value: `${modelInputs.sla} m` },
    { label: 'u', value: `${modelInputs.u} m/s` },
    { label: 'v', value: `${modelInputs.v} m/s` },
    { label: 'uwnd', value: `${modelInputs.uwnd} m/s` },
    { label: 'vwnd', value: `${modelInputs.vwnd} m/s` },
  ];

  const pipelineSteps = [
    { step: 1, label: 'Satellite Observations' },
    { step: 2, label: 'Ocean Embedding' },
    { step: 3, label: 'Deep Learning Model' },
    { step: 4, label: 'Subsurface Reconstruction' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            Subsurface Temperature Prediction
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono">
              Deep Learning AI Engine
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reconstruct vertical subsurface temperature profile (0–1000m) from satellite surface parameters
          </p>
        </div>

        {/* Selected Location Pill */}
        <div className="px-3.5 py-2 rounded-xl bg-[#0b1329] border border-cyan-500/30 text-xs text-cyan-300 flex items-center space-x-2 shrink-0">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">{currentLocation.name}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({currentLocation.latStr}, {currentLocation.lonStr})
          </span>
        </div>
      </div>

      {/* Model Integration Callout */}
      <ModelIntegrationCard
        modelTitle="PREDICTION MODEL"
        functionName="predictSubsurfaceTemperature(inputData)"
        filePath="src/models/predictionModel.ts"
        description="Live predictions load automatically for the selected location. Use Run Prediction after changing model inputs."
      />

      {/* Workflow Pipeline Card */}
      <div className="ocean-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>AI Reconstruction Pipeline Architecture</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">ResU-Net Model</span>
        </div>

        {/* Pipeline Steps Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
          {pipelineSteps.map((s, idx) => {
            const isCompleted = predictionStep > s.step || (!isPredicting && predictionStep === 0);
            const isCurrent = isPredicting && predictionStep === s.step;

            return (
              <div
                key={s.step}
                className={`p-3.5 rounded-xl border transition-all relative ${
                  isCurrent
                    ? 'ocean-card-glow border-cyan-400 bg-cyan-950/60 text-white'
                    : isCompleted
                    ? 'bg-[#0b1329]/80 border-cyan-500/30 text-slate-200'
                    : 'bg-[#050814]/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400">
                    STEP 0{s.step}
                  </span>
                  {isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>

                <div className="font-bold text-xs mt-3">{s.label}</div>

                {idx < 3 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-cyan-500/40 font-mono text-xs">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trigger Button & Status */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-cyan-500/10">
          <div className="text-xs text-slate-300">
            {isPredicting ? (
              <span className="flex items-center gap-2 text-cyan-300 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                {predictionMessage || 'Processing satellite observation tensors...'}
              </span>
            ) : (
              <span className="text-slate-400">
                Ready to execute deep learning model inference for <strong>{currentLocation.name}</strong>.
              </span>
            )}
          </div>

          <button
            onClick={runPrediction}
            disabled={isPredicting}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              isPredicting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
            }`}
          >
            {isPredicting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Prediction...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Run Prediction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input Features Section */}
      <div className="ocean-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            Input Satellite Observation Features
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            7 model channels (constant-grid prototype)
          </span>
        </div>

        {!isDemoMode && (
          <p className="text-xs text-amber-300">
            Prototype inputs are repeated across the 68 × 80 grid. Training normalization and output-channel depth mapping still need confirmation; live metrics require reference observations.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-1">
          {inputFeatures.map((f) => (
            <div key={f.label} className="p-3 rounded-lg bg-[#050814] border border-cyan-500/20 space-y-1">
              <span className="text-[10px] text-slate-400 block truncate">{f.label}</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph and Table Section */}
      <div className="ocean-card p-5 space-y-4">
        {/* Toggle Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Reconstructed Temperature vs Depth Profile
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                0m → 1000m Water Column
              </span>
            </h3>
          </div>

          <div className="flex items-center space-x-2 bg-[#050814] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermocline Profile (Graph)
            </button>
            {predictionError && <p role="alert" className="text-xs text-red-300 sm:ml-4">{predictionError}</p>}
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'table'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Depth Matrix (Table)
            </button>
          </div>
        </div>

        {/* Tab 1: Recharts Temperature vs Depth Profile */}
        {activeTab === 'profile' ? (
          <div className="space-y-4">
            
            {/* Thermocline Explanation Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs flex items-center justify-between">
                <span className="text-slate-300">Surface Mixed Layer (0-100m)</span>
                <span className="text-cyan-400 font-bold font-mono">~28°C - 23°C</span>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-xs flex items-center justify-between shadow-[0_0_10px_rgba(0,240,255,0.15)]">
                <span className="text-cyan-200 font-semibold">Thermocline Layer (100-300m)</span>
                <span className="text-amber-400 font-bold font-mono">Rapid Drop</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Deep Ocean (300-1000m)</span>
                <span className="text-blue-400 font-bold font-mono">&lt; 15°C - 5°C</span>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-[420px] w-full pt-4">
              {predictionData.length === 0 ? (
                <div role="status" className="h-full flex items-center justify-center text-sm text-slate-400">
                  {isPredicting ? predictionMessage || 'Running model...' : predictionError || 'No prediction data available.'}
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={predictionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  
                  {/* X Axis: Temperature */}
                  <XAxis
                    type="number"
                    dataKey="predictedTemp"
                    name="Temperature"
                    unit={isDemoMode ? '°C' : ''}
                    domain={isDemoMode ? [0, 35] : ['auto', 'auto']}
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: isDemoMode ? 'Temperature (°C)' : 'Raw model output (unscaled)', position: 'insideBottom', offset: -10, fill: '#00f0ff', fontSize: 12 }}
                  />

                  {/* Y Axis: Inverted Depth */}
                  <YAxis
                    type="number"
                    dataKey="depth"
                    name="Depth"
                    unit="m"
                    reversed
                    domain={[0, 1000]}
                    ticks={[0, 50, 100, 200, 300, 500, 750, 1000]}
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#00f0ff', fontSize: 12 }}
                  />

                  {/* Thermocline Highlight Zone */}
                  <ReferenceArea
                    y1={100}
                    y2={300}
                    fill="#00f0ff"
                    fillOpacity={0.08}
                    stroke="#00f0ff"
                    strokeOpacity={0.2}
                    label={{ value: 'Thermocline Region (100m - 300m)', fill: '#00f0ff', fontSize: 11, position: 'center' }}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-lg bg-[#0b1329] border border-cyan-400 text-xs space-y-1 shadow-xl font-mono">
                            <div className="text-cyan-400 font-bold">Depth: {data.depth} m</div>
                            <div className="text-white">{isDemoMode ? 'Predicted Temp' : 'Raw model output'}: <span className="text-emerald-400 font-bold">{data.predictedTemp}{isDemoMode ? '°C' : ''}</span></div>
                            <div className="text-slate-400">ARGO Benchmark: {data.argoTemp == null ? 'Unavailable' : `${data.argoTemp}°C`}</div>
                            <div className="text-amber-400">Delta Error: {data.error == null ? 'Unavailable' : `±${data.error}°C`}</div>
                            <div className="text-cyan-300">Confidence: {data.confidence == null ? 'Unavailable' : `${data.confidence}%`}</div>
                            <div className="text-slate-500 text-[10px]">Zone: {data.zone}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Predicted Subsurface Line */}
                  <Line
                    type="monotone"
                    dataKey="predictedTemp"
                    stroke="#00f0ff"
                    strokeWidth={3}
                    dot={{ fill: '#00f0ff', r: 5, stroke: '#070d1e', strokeWidth: 2 }}
                    activeDot={{ r: 8, stroke: '#00f0ff', strokeWidth: 2 }}
                    name="AI Predicted Temp"
                  />

                  {/* ARGO Benchmark Reference Line */}
                  <Line
                    type="monotone"
                    dataKey="argoTemp"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#f59e0b', r: 4 }}
                    name="ARGO Observed Float"
                  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Depth-wise Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#050814] text-cyan-300 border-b border-cyan-500/30">
                <tr>
                  <th className="p-3">Depth Level (m)</th>
                  <th className="p-3">{isDemoMode ? 'AI Predicted Temp (°C)' : 'Raw model output (unscaled)'}</th>
                  <th className="p-3">ARGO Benchmark (°C)</th>
                  <th className="p-3">Residual Error (ΔT)</th>
                  <th className="p-3">Confidence Score</th>
                  <th className="p-3">Thermal Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {predictionData.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-slate-400">{isPredicting ? 'Running model...' : predictionError || 'No prediction data available.'}</td></tr>
                )}
                {predictionData.map((row) => (
                  <tr
                    key={row.depth}
                    onClick={() => setSelectedDepth(row.depth)}
                    className={`hover:bg-cyan-950/30 transition-colors cursor-pointer ${
                      selectedDepth === row.depth ? 'bg-cyan-950/50 text-cyan-200 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <td className="p-3 text-cyan-400 font-bold">{row.depth} m</td>
                    <td className="p-3 text-emerald-400 font-bold">{row.predictedTemp}{isDemoMode ? ' °C' : ''}</td>
                    <td className="p-3 text-amber-300">{row.argoTemp == null ? 'N/A' : `${row.argoTemp} °C`}</td>
                    <td className="p-3 text-slate-400">{row.error == null ? 'N/A' : `±${row.error} °C`}</td>
                    <td className="p-3 text-cyan-300">{row.confidence == null ? 'Unavailable' : `${row.confidence}%`}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          row.zone === 'Surface Layer'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                            : row.zone === 'Thermocline'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/30'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {row.zone}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
