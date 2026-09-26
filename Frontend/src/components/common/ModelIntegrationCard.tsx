import React, { useState } from 'react';
import { Cpu, Terminal, ArrowRight, CheckCircle2, FileText } from 'lucide-react';

interface Props {
  modelTitle: string;        // e.g. "PREDICTION MODEL"
  functionName: string;      // e.g. "predictSubsurfaceTemperature()"
  filePath: string;          // e.g. "src/models/predictionModel.ts"
  description: string;
}

export const ModelIntegrationCard: React.FC<Props> = ({
  modelTitle,
  functionName,
  filePath,
  description,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl bg-gradient-to-r from-[#0b1736] to-[#070d1e] border border-cyan-500/30 p-4 shadow-[0_4px_20px_rgba(0,240,255,0.08)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                [ CONNECT {modelTitle} HERE ]
              </span>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Demo Data Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center space-x-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Hide Integration Guide' : 'View Integration Details'}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#040814] border border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> File target: {filePath}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Function: {functionName}</span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Replace the simulated return inside <code className="text-cyan-300 bg-slate-900 px-1 rounded">{functionName}</code> with a call to your trained model (PyTorch, TensorFlow, ONNX, or FastAPI backend).
            </p>

            <div className="p-2 rounded bg-slate-950 text-[11px] text-cyan-300 overflow-x-auto">
              <span className="text-slate-500">// Example API fetch inside {functionName}:</span>
              <br />
              <span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> fetch(<span className="text-emerald-300">'http://localhost:8000/api/v1/predict'</span>, &#123; method: <span className="text-emerald-300">'POST'</span>, body: JSON.stringify(inputData) &#125;);
            </div>

            <div className="flex items-center space-x-4 pt-1 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> PyTorch Ready
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> TensorFlow Ready
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> FastAPI / Flask Ready
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> ONNX Web Execution
              </span>
            </div>
          </div>
          <div className="text-[10px] text-cyan-400/80 flex items-center justify-end gap-1">
            <span>Refer to <strong>MODEL_INTEGRATION_README.txt</strong> for full 20-step integration docs</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
};
