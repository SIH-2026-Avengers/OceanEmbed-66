================================================================================
                           OCEANEMBED (SIH PS 26066)
                  MODEL INTEGRATION & API DOCUMENTATION GUIDE
================================================================================

Ministry of Earth Sciences (MoES) — Government of India
Project Title: Satellite Embedding-Based Deep Learning Framework for Reconstruction 
               of Subsurface Ocean Temperature from Surface Satellite Observations

--------------------------------------------------------------------------------
1. PROJECT ARCHITECTURE OVERVIEW
--------------------------------------------------------------------------------
The OceanEmbed frontend is structured with an isolated Model Integration Layer. 
UI components DO NOT contain hardcoded ML logic; instead, they call modular functions 
inside the `src/models/` directory.

Architecture Flow:
[ Satellite Data / Location UI ]
              ↓
  [ src/models/predictionModel.ts ]  <--->  [ Python FastAPI / Flask Backend ]
              ↓
  [ Subsurface Temp Array (0-1000m) ]
              ↓
  [ src/models/threeDModel.ts ]      <--->  [ 3D Volumetric Grid Generator ]
              ↓
  [ src/models/summaryModel.ts ]     <--->  [ Metric & Insight Generator ]
              ↓
  [ src/models/validationModel.ts ]  <--->  [ ARGO Float Benchmark Dataset ]


--------------------------------------------------------------------------------
2. WHERE TO ADD PREDICTION MODEL
--------------------------------------------------------------------------------
File to modify: `src/models/predictionModel.ts`
Function to replace: `predictSubsurfaceTemperature(inputData)`

In `predictSubsurfaceTemperature()`, replace the demo data return with an HTTP 
`fetch()` call to your ML model REST endpoint.


--------------------------------------------------------------------------------
3. WHERE TO ADD 3D GENERATION MODEL
--------------------------------------------------------------------------------
File to modify: `src/models/threeDModel.ts`
Function to replace: `generate3DOceanTemperature(predictionData, locationKey)`

Replace the simulated 3D voxel generator with calls to your 3D spatial field model 
or NetCDF volumetric interpolation backend.


--------------------------------------------------------------------------------
4. WHERE TO ADD SUMMARY MODEL
--------------------------------------------------------------------------------
File to modify: `src/models/summaryModel.ts`
Function to replace: `generateSummary(predictionResults, locationKey)`

Connect your LLM summary agent or statistical rule engine to automatically output 
natural language scientific key insights.


--------------------------------------------------------------------------------
5. WHERE TO ADD ARGO VALIDATION LOGIC
--------------------------------------------------------------------------------
File to modify: `src/models/validationModel.ts`
Function to replace: `getARGOValidationData(locationKey, selectedDepth)`

Connect real ARGO profiling float NetCDF dataset or observation API endpoints.


--------------------------------------------------------------------------------
6. HOW FRONTEND COMMUNICATES WITH MODELS
--------------------------------------------------------------------------------
The frontend communicates via standard HTTP JSON REST requests or WebSocket connections 
from the browser client.


--------------------------------------------------------------------------------
7. EXPECTED INPUT FORMAT (JSON Payload to ML Model API)
--------------------------------------------------------------------------------
{
  "locationKey": "bay_of_bengal",
  "latitude": 15.5,
  "longitude": 88.0,
  "sst": 29.2,          // Sea Surface Temperature (°C)
  "sss": 33.4,          // Sea Surface Salinity (PSU)
  "ssh": 0.15,          // Sea Surface Height (m)
  "chlorophyll": 0.42,  // Chlorophyll-a (mg/m³)
  "wind_speed": 7.2,    // Wind Speed (m/s)
  "date": "2026-09-11"
}


--------------------------------------------------------------------------------
8. EXPECTED OUTPUT FORMAT (JSON Response from ML Model API)
--------------------------------------------------------------------------------
{
  "depths": [0, 50, 100, 200, 300, 500, 750, 1000],
  "temperatures": [29.2, 26.8, 23.1, 18.5, 14.8, 11.2, 7.8, 5.1],
  "argo_benchmarks": [29.2, 26.65, 23.42, 18.09, 15.08, 11.02, 7.92, 5.02],
  "confidences": [98.5, 96.2, 94.8, 93.1, 91.5, 92.4, 95.0, 96.8]
}


--------------------------------------------------------------------------------
9. EXAMPLE API ENDPOINTS (Python FastAPI)
--------------------------------------------------------------------------------
POST http://localhost:8000/api/v1/predict
POST http://localhost:8000/api/v1/3d-reconstruction
GET  http://localhost:8000/api/v1/argo-validation?location=bay_of_bengal&depth=500


--------------------------------------------------------------------------------
10. EXAMPLE REQUEST (JavaScript fetch call)
--------------------------------------------------------------------------------
const response = await fetch('http://localhost:8000/api/v1/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    locationKey: 'bay_of_bengal',
    sst: 29.2,
    sss: 33.4,
    ssh: 0.15,
    chlorophyll: 0.42,
    wind_speed: 7.2,
    latitude: 15.5,
    longitude: 88.0
  })
});
const data = await response.json();


--------------------------------------------------------------------------------
11. EXAMPLE RESPONSE HANDLING
--------------------------------------------------------------------------------
return data.depths.map((depth, idx) => ({
  depth: depth,
  predictedTemp: data.temperatures[idx],
  argoTemp: data.argo_benchmarks[idx],
  error: Math.abs(data.temperatures[idx] - data.argo_benchmarks[idx]),
  confidence: data.confidences[idx],
  zone: depth < 100 ? 'Surface Layer' : depth <= 300 ? 'Thermocline' : 'Deep Ocean'
}));


--------------------------------------------------------------------------------
12. HOW TO REPLACE DEMO DATA
--------------------------------------------------------------------------------
1. In the application header, toggle the mode from [DEMO MODE] to [LIVE MODEL MODE].
2. Set `VITE_API_BASE_URL` in your `.env` file to your backend server.


--------------------------------------------------------------------------------
13. HOW TO RUN PYTHON MODELS LOCALLY
--------------------------------------------------------------------------------
1. Create a Python virtualenv: `python -m venv venv`
2. Activate environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install fastapi uvicorn torch numpy netCDF4 scipy`
4. Run server: `uvicorn main:app --reload --port 8000`


--------------------------------------------------------------------------------
14. HOW TO CONNECT FASTAPI / FLASK
--------------------------------------------------------------------------------
Example `main.py` FastAPI template:

from fastapi import FastAPI
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

@app.post("/api/v1/predict")
def predict_subsurface(data: SatelliteInput):
    # Run PyTorch/TensorFlow Model Inference here
    # temperatures = my_model(data.dict())
    return {
        "depths": [0, 50, 100, 200, 300, 500, 750, 1000],
        "temperatures": [29.2, 26.8, 23.1, 18.5, 14.8, 11.2, 7.8, 5.1]
    }


--------------------------------------------------------------------------------
15. HOW TO CONNECT ONNX MODELS (In-Browser Execution)
--------------------------------------------------------------------------------
If you export your PyTorch model to ONNX (`model.onnx`), you can execute inference 
directly in the browser client using `onnxruntime-web`:
1. `npm i onnxruntime-web`
2. Load session: `const session = await ort.InferenceSession.create('/models/oceanembed.onnx');`
3. Run inference on input tensor.


--------------------------------------------------------------------------------
16. HOW TO CONNECT PYTORCH / TENSORFLOW MODELS
--------------------------------------------------------------------------------
Save your trained weights as `oceanembed_resnet.pt` or `oceanembed_unet.h5`. Load them 
in your Python FastAPI backend on startup and pass input tensors:
```python
import torch
model = torch.load("oceanembed_resnet.pt")
model.eval()
with torch.no_grad():
    predictions = model(input_tensor)
```


--------------------------------------------------------------------------------
17. EXACT FILES / FUNCTIONS TO MODIFY
--------------------------------------------------------------------------------
1. `src/models/predictionModel.ts` -> `predictSubsurfaceTemperature()`
2. `src/models/threeDModel.ts`     -> `generate3DOceanTemperature()`
3. `src/models/summaryModel.ts`    -> `generateSummary()`
4. `src/models/validationModel.ts` -> `getARGOValidationData()`


--------------------------------------------------------------------------------
18. ENVIRONMENT VARIABLES REQUIRED
--------------------------------------------------------------------------------
Create `.env` file in project root:
VITE_API_BASE_URL=http://localhost:8000
VITE_DEMO_MODE=true
VITE_MAPBOX_TOKEN=your_optional_mapbox_token_here


--------------------------------------------------------------------------------
19. LOCAL DEVELOPMENT INSTRUCTIONS
--------------------------------------------------------------------------------
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open browser at: `http://localhost:3000`


--------------------------------------------------------------------------------
20. PRODUCTION DEPLOYMENT NOTES
--------------------------------------------------------------------------------
1. Build production bundle: `npm run build`
2. Output files will be generated in `dist/` folder.
3. Serve using Nginx, Vercel, Netlify, or Docker container.
================================================================================
