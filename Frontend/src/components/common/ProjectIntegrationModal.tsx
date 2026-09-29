import React, { useState } from 'react';
import { X, Code2, Server, FileCode, CheckCircle, Copy, Terminal, ExternalLink, HelpCircle } from 'lucide-react';

interface ProjectIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectIntegrationModal: React.FC<ProjectIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'fastapi' | 'pytorch' | 'schema'>('files');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const fastApiCode = `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="OceanEmbed ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SatelliteInput(BaseModel):
    locationKey: str
    sst: float
    sss: float
    ssh: float
    chlorophyll: float
    wind_speed: float
    latitude: float
    longitude: float

@app.post("/api/v1/predict")
def predict_subsurface(data: SatelliteInput):
    # Run your PyTorch / TensorFlow / ResNet Model Inference here
    # predictions = my_model(data.dict())
    
    return {
        "depths": [0, 50, 100, 200, 300, 500, 750, 1000],
        "temperatures": [28.6, 26.2, 22.9, 18.4, 14.7, 11.2, 7.8, 5.1],
        "argo_benchmarks": [28.6, 26.0, 23.1, 18.1, 14.9, 11.0, 7.9, 5.0],
        "confidences": [98.5, 96.2, 94.8, 93.1, 91.5, 92.4, 95.0, 96.8]
    }
`;

  const pytorchCode = `import torch
import torch.nn as nn

class OceanEmbedResNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Input features: [SST, SSS, SSH, Chlorophyll, WindSpeed, Lat, Lon]
        self.fc = nn.Sequential(
            nn.Linear(7, 128),
            nn.ReLU(),
            nn.Linear(128, 256),
            nn.ReLU(),
            nn.Linear(256, 8) # 8 Depth outputs: [0, 50, 100, 200, 300, 500, 750, 1000m]
        )

    def forward(self, x):
        return self.fc(x)

# Load trained weights
model = OceanEmbedResNet()
model.load_state_dict(torch.load("weights/oceanembed_best.pt"))
model.eval()
`;

  const jsonSchemaCode = `// Request Payload sent to your ML Backend
{
  "locationKey": "arabian_sea",
  "latitude": 18.5,
  "longitude": 65.2,
  "sst": 28.6,
  "sss": 34.8,
  "ssh": 0.12,
  "chlorophyll": 0.31,
  "wind_speed": 6.4
}

// Expected JSON Response from your ML Backend
{
  "depths": [0, 50, 100, 200, 300, 500, 750, 1000],
  "temperatures": [28.6, 26.2, 22.9, 18.4, 14.7, 11.2, 7.8, 5.1],
  "argo_benchmarks": [28.6, 26.0, 23.1, 18.1, 14.9, 11.0, 7.9, 5.0],
  "confidences": [98.5, 96.2, 94.8, 93.1, 91.5, 92.4, 95.0, 96.8]
}
`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-cyan-500/20 flex items-center justify-between bg-[#070d1e]/80">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shrink-0">
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-wide flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>Project Integration Guide</span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  ML & Backend Setup
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Instructions to connect your Python models, FastAPI server, or weights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-cyan-500/20 bg-[#050814] px-3 sm:px-5 pt-2 sm:pt-3 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('files')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'files'
                ? 'bg-[#0b1329] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_10px_rgba(0,240,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>1. Frontend Files</span>
          </button>

          <button
            onClick={() => setActiveTab('fastapi')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'fastapi'
                ? 'bg-[#0b1329] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_10px_rgba(0,240,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>2. FastAPI Backend</span>
          </button>

          <button
            onClick={() => setActiveTab('pytorch')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'pytorch'
                ? 'bg-[#0b1329] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_10px_rgba(0,240,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Model Weights</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`whitespace-nowrap px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'schema'
                ? 'bg-[#0b1329] text-cyan-300 border-t-2 border-cyan-400 shadow-[0_-4px_10px_rgba(0,240,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>4. JSON Schema</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: FRONTEND FILES */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
                <strong>Project Modular Architecture:</strong> The application UI components call modular helper functions in <code className="bg-cyan-900/60 px-1.5 py-0.5 rounded font-mono text-cyan-300">src/models/</code>. Replace the return statements inside those functions with your HTTP calls or PyTorch ONNX inferences!
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#050814] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      src/models/predictionModel.ts
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      Function: predictSubsurfaceTemperature()
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Replace the mock array generator with a <code className="text-cyan-300 font-mono">fetch("http://localhost:8000/api/v1/predict")</code> call to your backend model.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#050814] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      src/models/threeDModel.ts
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      Function: generate3DOceanTemperature()
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Connect your 3D spatial field generator or NetCDF volumetric interpolation server.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#050814] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      src/models/summaryModel.ts & validationModel.ts
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      Functions: generateSummary() & getARGOValidationData()
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Connect real ARGO float NetCDF observation dataset or metric validation script outputs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#050814] border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-300">
                    ⚙️ Environment Variable Configuration
                  </div>
                  <p className="text-xs text-slate-300">
                    Create a <code className="text-amber-300 font-mono">.env</code> file in <code className="text-amber-300 font-mono">c:\Programming\SIH\Frontend</code>:
                  </p>
                  <pre className="p-3 rounded-lg bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto">
                    VITE_API_BASE_URL=http://localhost:8000
                    {"\n"}VITE_DEMO_MODE=false
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FASTAPI BACKEND CODE */}
          {activeTab === 'fastapi' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Python FastAPI Backend Server Template (main.py):</span>
                <button
                  onClick={() => copyToClipboard(fastApiCode, 'fastapi')}
                  className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono flex items-center gap-1.5"
                >
                  {copiedSection === 'fastapi' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'fastapi' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#050814] border border-cyan-500/30 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {fastApiCode}
              </pre>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
                To start backend: <code className="text-cyan-400 font-mono">pip install fastapi uvicorn torch && uvicorn main:app --reload --port 8000</code>
              </div>
            </div>
          )}

          {/* TAB 3: PYTORCH MODEL */}
          {activeTab === 'pytorch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">PyTorch Model Loading & Weight (.pt) Integration:</span>
                <button
                  onClick={() => copyToClipboard(pytorchCode, 'pytorch')}
                  className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono flex items-center gap-1.5"
                >
                  {copiedSection === 'pytorch' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'pytorch' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#050814] border border-cyan-500/30 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {pytorchCode}
              </pre>
            </div>
          )}

          {/* TAB 4: JSON SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">REST API JSON Request Payload & Response Format:</span>
                <button
                  onClick={() => copyToClipboard(jsonSchemaCode, 'schema')}
                  className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono flex items-center gap-1.5"
                >
                  {copiedSection === 'schema' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'schema' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#050814] border border-cyan-500/30 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {jsonSchemaCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-[#070d1e]/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Need help? Check <code className="text-cyan-300 font-mono">MODEL_INTEGRATION_README.txt</code> in project root</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            Got it, Close
          </button>
        </div>

      </div>
    </div>
  );
};
