import React, { useState } from 'react';
import { useOcean } from '../../context/OceanContext';
import { Ocean3DCanvas } from '../3d/Ocean3DCanvas';
import { Box, Layers, Sliders, RefreshCw, Eye } from 'lucide-react';

export const Ocean3DPage: React.FC = () => {
  const { currentLocation } = useOcean();

  const [depthSlider, setDepthSlider] = useState<number>(500);
  const [viewMode, setViewMode] = useState<'volume' | 'vertical' | 'horizontal'>('volume');
  const [variable, setVariable] = useState<string>('Temperature');
  const [depthRange, setDepthRange] = useState<string>('0-1000');
  const [colorMap, setColorMap] = useState<string>('Thermal');
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showLand, setShowLand] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const resetView = () => {
    setDepthSlider(500);
    setViewMode('volume');
    setVariable('Temperature');
    setDepthRange('0-1000');
    setColorMap('Thermal');
    setShowContours(true);
    setShowLand(true);
    setShowGrid(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header matching Screenshot Frame 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-2">
            3D Subsurface Ocean Temperature
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore reconstructed temperature in 3D (0 – 1000 m)
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0b1329] border border-cyan-500/30 text-cyan-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Data: Latest (12 Sep 2026)</span>
          </span>
        </div>
      </div>

      {/* Main 3D Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: View Settings (3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="ocean-card p-4 space-y-4">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider border-b border-cyan-500/20 pb-2">
              View Settings
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Variable Dropdown */}
              <div>
                <label className="text-slate-400 block mb-1">Variable</label>
                <select
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  className="w-full bg-[#050814] border border-cyan-500/30 rounded px-2.5 py-1.5 text-cyan-300 font-mono focus:outline-none"
                >
                  <option value="Temperature">Temperature</option>
                  <option value="Salinity">Salinity</option>
                  <option value="Density">Density</option>
                </select>
              </div>

              {/* Depth Range Dropdown */}
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

              {/* Color Map Dropdown */}
              <div>
                <label className="text-slate-400 block mb-1">Color Map</label>
                <select
                  value={colorMap}
                  onChange={(e) => setColorMap(e.target.value)}
                  className="w-full bg-[#050814] border border-cyan-500/30 rounded px-2.5 py-1.5 text-cyan-300 font-mono focus:outline-none"
                >
                  <option value="Thermal">Thermal</option>
                  <option value="Rainbow">Rainbow</option>
                  <option value="Viridis">Viridis</option>
                </select>
              </div>

              {/* Toggle Switches */}
              <div className="pt-2 border-t border-cyan-500/10 space-y-3">
                
                {/* Show Contours */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Show Contours</span>
                  <button
                    onClick={() => setShowContours(!showContours)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      showContours ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        showContours ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Land */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Show Land</span>
                  <button
                    onClick={() => setShowLand(!showLand)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      showLand ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        showLand ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Grid */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Show Grid</span>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      showGrid ? 'bg-[#050814] border border-cyan-500/40' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-400 transition-transform ${
                        showGrid ? 'translate-x-5 bg-cyan-400' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

              </div>

              {/* Reset View Button */}
              <button
                onClick={resetView}
                className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] mt-4"
              >
                Reset View
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 3D Canvas Area & Controls (9 Columns) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="ocean-card p-4 space-y-3 relative flex flex-col justify-between min-h-[540px]">
            
            {/* Top View Mode Toggles */}
            <div className="flex items-center justify-end space-x-2 z-10">
              <button
                onClick={() => setViewMode('volume')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'volume'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#050814] text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                3D View
              </button>
              <button
                onClick={() => setViewMode('vertical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'vertical'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#050814] text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Vertical Slice
              </button>
              <button
                onClick={() => setViewMode('horizontal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'horizontal'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#050814] text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Horizontal Depth Map
              </button>
            </div>

            {/* Main 3D Canvas + Color Scale Bar Layout */}
            <div className="relative flex-1 rounded-xl overflow-hidden border border-cyan-500/30 bg-[#050814] min-h-[420px] flex">
              
              {/* WebGL 3D Canvas */}
              <div className="flex-1">
                <Ocean3DCanvas
                  depthSlider={depthSlider}
                  viewMode={viewMode}
                  showGrid={showGrid}
                  showDepthSlice={showContours}
                  showContours={showLand}
                />
              </div>

              {/* Vertical Color Scale Legend on Right side of frame */}
              <div className="w-16 p-3 bg-[#070d1e]/80 border-l border-cyan-500/20 backdrop-blur-md flex flex-col items-center justify-between text-[10px] font-mono text-slate-300 z-10">
                <span className="text-cyan-300 font-bold text-center leading-tight">Temperature (°C)</span>
                
                <div className="flex-1 w-3 my-2 rounded-full bg-gradient-to-b from-red-500 via-amber-400 via-emerald-400 via-cyan-400 to-blue-700 border border-slate-700" />
                
                <div className="flex flex-col justify-between h-full space-y-2 text-right">
                  <span className="text-red-400 font-bold">&gt; 30</span>
                  <span>25</span>
                  <span>20</span>
                  <span>15</span>
                  <span>10</span>
                  <span>5</span>
                  <span className="text-blue-400 font-bold">0</span>
                </div>
              </div>

            </div>

            {/* Bottom Slider Control Bar matching Screenshot Frame 3 */}
            <div className="p-3 rounded-xl bg-[#050814] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                <span>Depth Slice: {depthSlider} m</span>
                <span className="text-slate-400">0 m → 1000 m</span>
              </div>

              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={depthSlider}
                onChange={(e) => setDepthSlider(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 m</span>
                <span>1000 m</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
