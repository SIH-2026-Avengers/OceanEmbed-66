import React from 'react';
import { OceanProvider, useOcean } from './context/OceanContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './components/pages/OverviewPage';
import { Ocean3DPage } from './components/pages/Ocean3DPage';
import { SummaryPage } from './components/pages/SummaryPage';

const MainContent: React.FC = () => {
  const { activePage } = useOcean();

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'ocean3d':
        return <Ocean3DPage />;
      case 'summary':
        return <SummaryPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#050814] flex flex-col min-w-0">
      <Header />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderPage()}
      </main>
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
