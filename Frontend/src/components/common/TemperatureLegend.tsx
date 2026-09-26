import React from 'react';

interface Props {
  title?: string;
}

export const TemperatureLegend: React.FC<Props> = ({ title = 'Ocean Temperature Scale (°C)' }) => {
  const ticks = [
    { label: '0°C', color: '#1e3a8a' },
    { label: '5°C', color: '#0284c7' },
    { label: '10°C', color: '#06b6d4' },
    { label: '15°C', color: '#10b981' },
    { label: '20°C', color: '#eab308' },
    { label: '25°C', color: '#f97316' },
    { label: '30°C+', color: '#ef4444' },
  ];

  return (
    <div className="ocean-card p-3 rounded-lg space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
        <span>{title}</span>
        <span className="text-[10px] text-cyan-400 font-mono">Thermal Spectrum</span>
      </div>

      {/* Color Gradient Bar */}
      <div className="h-3 w-full rounded-full thermal-gradient shadow-[0_0_10px_rgba(0,240,255,0.2)]" />

      {/* Ticks */}
      <div className="flex justify-between text-[9px] text-slate-400 font-mono px-0.5">
        {ticks.map((t) => (
          <span key={t.label} className="flex flex-col items-center">
            <span className="w-0.5 h-1 bg-slate-600 mb-0.5" />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
};
