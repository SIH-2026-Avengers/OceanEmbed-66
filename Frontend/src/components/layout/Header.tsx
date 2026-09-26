import React, { useState } from 'react';
import { useOcean } from '../../context/OceanContext';
import { ProjectIntegrationModal } from '../common/ProjectIntegrationModal';
import {
  Compass,
  Database,
  Radio,
  User,
  Clock,
  SlidersHorizontal,
  Code2,
  HelpCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentLocation,
    isDemoMode,
    setIsDemoMode,
    lastUpdated,
  } = useOcean();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <header className="h-16 bg-[#070d1e]/90 border-b border-cyan-500/20 px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-20 select-none">
        {/* Title & Branding */}
        <div className="flex items-center space-x-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                OceanEmbed
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono">
                Satellite to Subsurface
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Explore satellite observations and ocean conditions
            </p>
          </div>

          {/* Selected Location Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0b1329] border border-cyan-500/30 text-xs text-cyan-300 font-medium">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="font-bold">{currentLocation.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({currentLocation.latStr}, {currentLocation.lonStr})
            </span>
          </div>
        </div>

        {/* Right Actions & Status Badges */}
        <div className="flex items-center space-x-3">
          
          {/* Where to Add My Code / Model Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Where to Add Project Things</span>
          </button>

          {/* Mode Switcher Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              isDemoMode
                ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Toggle between local mock data and real backend server"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isDemoMode ? '● DEMO MODE' : '● LIVE MODEL'}</span>
          </button>

          {/* Data Status */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-[#0b1329] border border-cyan-500/20 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Data:</span>
            <span className="font-semibold text-cyan-300">Latest ({currentDate})</span>
          </div>

          {/* User / Profile Icon */}
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer">
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Integration Guide Modal */}
      <ProjectIntegrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
