import { SatelliteParameters, DepthPoint, LocationKey } from '../types/ocean';

/**
 * ============================================================================
 * [ CONNECT PREDICTION MODEL HERE ]
 * ============================================================================
 * 
 * Integration layer for Subsurface Temperature Prediction ML Model.
 * 
 * TO CONNECT YOUR TRAINED DEEP LEARNING MODEL:
 * 1. Replace the demo implementation inside `predictSubsurfaceTemperature()`
 * 2. Send `inputData` as JSON POST payload to your Python FastAPI / Flask backend:
 *    `const res = await fetch('http://localhost:8000/api/predict', { method: 'POST', body: JSON.stringify(inputData) });`
 * 3. Ensure your backend model returns depth array and temperature array:
 *    { "depths": [0, 50, 100, 200, 300, 500, 750, 1000], "temperatures": [28.6, 26.2, 22.9, 18.4, 14.7, 11.2, 7.8, 5.1] }
 */

export const DEFAULT_LOCATIONS: Record<LocationKey, { sst: number; sss: number; ssh: number; chlorophyll: number; windSpeed: number; lat: number; lon: number }> = {
  bay_of_bengal: {
    sst: 29.2,
    sss: 33.4,
    ssh: 0.15,
    chlorophyll: 0.42,
    windSpeed: 7.2,
    lat: 15.5,
    lon: 88.0,
  },
  arabian_sea: {
    sst: 28.6,
    sss: 35.8,
    ssh: 0.12,
    chlorophyll: 0.31,
    windSpeed: 6.4,
    lat: 18.5,
    lon: 65.2,
  }
};

/**
 * DEMO MODEL IMPLEMENTATION
 * Calculates a realistic physical thermocline profile based on surface parameters.
 */
export function getInitialPredictionData(locationKey: LocationKey): DepthPoint[] {
  const base = DEFAULT_LOCATIONS[locationKey] || DEFAULT_LOCATIONS.bay_of_bengal;
  const sst = base.sst;

  // Realistic ocean physical decay profile (Mixed Layer -> Thermocline -> Abyssal Deep)
  const profileConfig = [
    { depth: 0, decay: 0, argoDelta: 0.02, confidence: 98.5, zone: 'Surface Layer' as const },
    { depth: 50, decay: 2.4, argoDelta: -0.15, confidence: 96.2, zone: 'Surface Layer' as const },
    { depth: 100, decay: 5.7, argoDelta: 0.32, confidence: 94.8, zone: 'Thermocline' as const },
    { depth: 200, decay: 10.2, argoDelta: -0.41, confidence: 93.1, zone: 'Thermocline' as const },
    { depth: 300, decay: 13.9, argoDelta: 0.28, confidence: 91.5, zone: 'Thermocline' as const },
    { depth: 500, decay: 17.4, argoDelta: -0.18, confidence: 92.4, zone: 'Deep Ocean' as const },
    { depth: 750, decay: 20.8, argoDelta: 0.12, confidence: 95.0, zone: 'Deep Ocean' as const },
    { depth: 1000, decay: 23.5, argoDelta: -0.08, confidence: 96.8, zone: 'Deep Ocean' as const },
  ];

  return profileConfig.map((item) => {
    const predicted = Number(Math.max(4.2, sst - item.decay).toFixed(2));
    const argo = Number((predicted + item.argoDelta).toFixed(2));
    const error = Number(Math.abs(predicted - argo).toFixed(2));
    return {
      depth: item.depth,
      predictedTemp: predicted,
      argoTemp: argo,
      error,
      confidence: item.confidence,
      zone: item.zone,
    };
  });
}

/**
 * Predict Subsurface Temperature function wrapper
 * Performs simulated deep learning inference sequence with asynchronous progress callbacks.
 */
export async function predictSubsurfaceTemperature(
  inputData: SatelliteParameters,
  onProgress?: (step: number, message: string) => void
): Promise<DepthPoint[]> {

  // Step 1: Preprocessing
  onProgress?.(1, 'Preprocessing Satellite Observations (SST, SSS, SSH, Chlorophyll)...');
  await new Promise((r) => setTimeout(r, 600));

  // Step 2: Ocean Embedding
  onProgress?.(2, 'Extracting Spatiotemporal Ocean Embeddings & Latent Features...');
  await new Promise((r) => setTimeout(r, 700));

  // Step 3: AI Inference
  onProgress?.(3, 'Executing Channel-to-Depth ResU-Net AI Inference Engine...');
  await new Promise((r) => setTimeout(r, 800));

  // Step 4: Postprocessing
  onProgress?.(4, 'Reconstructing Vertical Subsurface Thermocline Profile...');
  await new Promise((r) => setTimeout(r, 400));

  // TODO: CONNECT REAL MODEL HERE
  // Replace return below with API response data from your PyTorch/TensorFlow backend
  return getInitialPredictionData(inputData.locationKey);
}
