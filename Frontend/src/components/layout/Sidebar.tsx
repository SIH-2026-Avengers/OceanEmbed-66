import React from 'react';
import { useOcean, PageType } from '../../context/OceanContext';
import {
  LayoutDashboard,
  Box,
  Globe,
  Waves,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react';

interface NavItem {
  id: PageType;
  label: string;
  badge?: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    currentLocation,
  } = useOcean();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ocean3d', label: '3D Ocean', icon: Box, badge: 'WebGL' },
  ];

  const handleNavClick = (id: PageType) => {
    setActivePage(id);
    setIsMobileSidebarOpen(false);
  };

  const renderContent = (isMobile = false) => (
    <>
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-[#0b1329]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <Waves className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-base sm:text-lg text-white tracking-wide flex items-center gap-1.5">
                  OceanEmbed
                </h1>
                <p className="text-[10px] sm:text-[11px] text-cyan-400/80 font-medium tracking-tight">
                  Satellite to Subsurface
                </p>
              </div>
            </div>

            {isMobile && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5 text-cyan-300" />
              </button>
            )}
          </div>
          
          <div className="mt-3 px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/20 text-[10px] text-cyan-300 font-mono flex items-center justify-between">
            <span>SIH PS 26066</span>
            <span className="text-cyan-400 font-bold">MoES</span>
          </div>

          {isMobile && (
            <div className="mt-2 flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#070d1e] border border-cyan-500/20 text-[11px] text-cyan-300 font-medium">
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold truncate">{currentLocation.name}</span>
              <span className="text-[9px] text-slate-400 font-mono shrink-0">
                ({currentLocation.latStr})
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5 mt-2">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation (2)
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isActive
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Official Government Branding Footer */}
      <div className="p-3.5 m-3 rounded-xl bg-[#0b1329]/80 border border-cyan-500/20 text-center space-y-1.5">
        <div className="flex items-center justify-center space-x-2 text-slate-300 text-xs font-semibold">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Govt. of India</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          Ministry of Earth Sciences
          <br />
          <span className="text-cyan-400/90 font-mono">(MoES)</span>
        </div>
        <div className="pt-1.5 border-t border-cyan-500/10 flex items-center justify-center gap-1.5 text-[9px] text-emerald-400 font-mono">
          <ShieldCheck className="w-3 h-3" />
          <span>Verified Platform</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Visible on lg and larger) */}
      <aside className="hidden lg:flex w-64 bg-[#070d1e]/90 border-r border-cyan-500/20 flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-md z-30 select-none">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-over Drawer & Overlay (Visible when toggled on mobile) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-[#070d1e] border-r border-cyan-500/30 flex flex-col justify-between h-full z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] select-none">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

