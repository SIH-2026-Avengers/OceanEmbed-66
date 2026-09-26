import React from 'react';
import { ParameterType } from '../../types/ocean';
import { Thermometer, Droplets, ArrowUpDown, Sprout, Wind, Activity, HelpCircle } from 'lucide-react';

interface Props {
  paramKey: ParameterType | 'current';
  title: string;
  shortKey: string;
  value: number | string;
  unit: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const ParameterCard: React.FC<Props> = ({
  paramKey,
  title,
  shortKey,
  value,
  unit,
  description,
  isActive = false,
  onClick,
}) => {
  const getIcon = () => {
    switch (paramKey) {
      case 'sst':
        return Thermometer;
      case 'sss':
        return Droplets;
      case 'ssh':
        return ArrowUpDown;
      case 'chlorophyll':
        return Sprout;
      case 'wind_speed':
        return Wind;
      default:
        return Activity;
    }
  };

  const Icon = getIcon();

  return (
    <div
      onClick={onClick}
      className={`ocean-card p-3.5 rounded-xl cursor-pointer transition-all relative group ${
        isActive ? 'ocean-card-glow border-cyan-400 bg-cyan-950/40' : 'hover:border-cyan-500/40'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className={`p-2 rounded-lg ${
              isActive ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-white">{shortKey}</span>
              <span className="text-[10px] text-slate-400 font-mono">({title})</span>
            </div>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
              {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </div>
          </div>
        </div>

        {/* Scientific Tooltip */}
        <div className="relative group/tooltip">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400 cursor-help transition-colors" />
          <div className="absolute right-0 top-6 hidden group-hover/tooltip:block w-48 p-2 rounded-lg bg-[#0b1329] border border-cyan-500/40 text-[10px] text-slate-300 shadow-xl z-50 pointer-events-none">
            <span className="font-bold text-cyan-400 block mb-0.5">{title} ({shortKey})</span>
            {description}
            <span className="block mt-1 text-[9px] text-slate-500 italic">* Demo satellite parameter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
