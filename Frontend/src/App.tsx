import React from 'react';
import { OceanProvider, useOcean, PageType } from './context/OceanContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './components/pages/OverviewPage';
import { Ocean3DPage } from './components/pages/Ocean3DPage';
import { LayoutDashboard, Box } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const { activePage, setActivePage } = useOcean();

  const navItems: { id: PageType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ocean3d', label: '3D Ocean', icon: Box },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d1e]/95 backdrop-blur-md border-t border-cyan-500/30 px-3 py-1.5 flex justify-around items-center select-none shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-cyan-500/20' : 'bg-transparent'}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const MainContent: React.FC = () => {
  const { activePage } = useOcean();

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'ocean3d':
        return <Ocean3DPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#050814] flex flex-col min-w-0">
      <Header />
      <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 lg:pb-8 overflow-y-auto">
        {renderPage()}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <OceanProvider>
      <div className="flex min-h-screen bg-[#050814] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
        <Sidebar />
        <MainContent />
      </div>
    </OceanProvider>
  );
};

export default App;

