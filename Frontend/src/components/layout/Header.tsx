import React from 'react';
import { useOcean } from '../../context/OceanContext';
import {
  User,
  SlidersHorizontal,
  Menu,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    isDemoMode,
    setIsDemoMode,
    toggleMobileSidebar,
  } = useOcean();

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-14 sm:h-16 bg-[#070d1e]/90 border-b border-cyan-500/20 px-3 sm:px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-20 select-none">
      {/* Left Side: Mobile Menu Button & Title / Branding */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
              OceanEmbed
            </h2>
            <span className="hidden xs:inline-block text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono">
              Satellite to Subsurface
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400">
            Explore satellite observations and ocean conditions
          </p>
        </div>
      </div>

      {/* Right Actions & Status Badges */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mode Switcher Toggle */}
        <button
          onClick={() => setIsDemoMode(!isDemoMode)}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            isDemoMode
              ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
          }`}
          title="Toggle between local mock data and real backend server"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">{isDemoMode ? '● DEMO MODE' : '● LIVE MODEL'}</span>
          <span className="sm:hidden">{isDemoMode ? 'DEMO' : 'LIVE'}</span>
        </button>

        {/* Data Status */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-[#0b1329] border border-cyan-500/20 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Data:</span>
          <span className="font-semibold text-cyan-300">Latest ({currentDate})</span>
        </div>

        {/* User / Profile Icon */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
    </header>
  );
};


