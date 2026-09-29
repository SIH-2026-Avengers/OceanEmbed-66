import { SatelliteParameters, DepthPoint, LocationKey } from '../types/ocean';

/** Frontend adapter for the local FastAPI/Keras service and illustrative demo profile. */

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

export function interpolatePredictionProfile(
  predictionData: DepthPoint[],
  startDepth: number,
  endDepth: number,
  interval: number
): DepthPoint[] {
  const sorted = [...predictionData].sort((a, b) => a.depth - b.depth);
  if (!sorted.length || interval <= 0) return [];

  const minimumDepth = Math.max(startDepth, sorted[0].depth);
  const maximumDepth = Math.min(endDepth, sorted[sorted.length - 1].depth);
  if (minimumDepth > maximumDepth) return [];

  const depths: number[] = [];
  for (let depth = minimumDepth; depth <= maximumDepth; depth += interval) {
    depths.push(depth);
  }

  return depths.map((depth): DepthPoint => {
    const exact = sorted.find((point) => point.depth === depth);
    if (exact) return exact;

    const rightIndex = sorted.findIndex((point) => point.depth > depth);
    const left = sorted[rightIndex - 1];
    const right = sorted[rightIndex];
    const fraction = (depth - left.depth) / (right.depth - left.depth);
    const interpolate = (leftValue: number | null, rightValue: number | null): number | null => {
      if (leftValue == null || rightValue == null) return null;
      return Number((leftValue + (rightValue - leftValue) * fraction).toFixed(2));
    };

    return {
      depth,
      predictedTemp: interpolate(left.predictedTemp, right.predictedTemp) ?? left.predictedTemp,
      argoTemp: interpolate(left.argoTemp, right.argoTemp),
      error: interpolate(left.error, right.error),
      confidence: interpolate(left.confidence, right.confidence),
      zone: depth < 100 ? 'Surface Layer' : depth <= 300 ? 'Thermocline' : 'Deep Ocean',
    };
  });
}

/**
 * Predict Subsurface Temperature function wrapper
 * Performs simulated deep learning inference sequence with asynchronous progress callbacks.
 */
export async function predictSubsurfaceTemperature(
  inputData: SatelliteParameters,
  onProgress?: (step: number, message: string) => void,
  isDemoMode: boolean = true
): Promise<DepthPoint[]> {
  if (isDemoMode) {
    onProgress?.(1, 'Preparing demo profile...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    onProgress?.(2, 'Generating illustrative profile...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getInitialPredictionData(inputData.locationKey);
  }

  onProgress?.(1, 'Preparing the seven model input channels...');
  onProgress?.(2, 'Sending a 68 × 80 constant-grid prototype to the Keras API...');

  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  const apiBaseUrl = (
    configuredUrl !== undefined && configuredUrl !== ''
      ? configuredUrl
      : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')
  ).replace(/\/$/, '');
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/v1/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationKey: inputData.locationKey,
        latitude: inputData.latitude,
        longitude: inputData.longitude,
        date: inputData.date,
        inputs: inputData.modelInputs,
      }),
    });
  } catch {
    throw new Error(`Cannot reach the model API at ${apiBaseUrl}. Start the app with "npm --prefix Frontend run dev".`);
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || `Model API request failed (${response.status})`);
  }
  if (!Array.isArray(result.predictions) || result.predictions.length !== 7) {
    throw new Error('Model API returned an unexpected prediction profile.');
  }

  onProgress?.(3, 'Running the trained Keras convolutional model...');
  onProgress?.(4, 'Reducing output maps to the configured depth profile...');

  return result.predictions.map((point: { depth: number; temperature: number }) => ({
    depth: point.depth,
    predictedTemp: Number(point.temperature.toFixed(2)),
    argoTemp: null,
    error: null,
    confidence: null,
    zone: point.depth < 100 ? 'Surface Layer' : point.depth <= 300 ? 'Thermocline' : 'Deep Ocean',
  }));
}
