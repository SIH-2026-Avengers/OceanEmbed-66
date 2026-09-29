export type LocationKey = 'bay_of_bengal' | 'arabian_sea';

export interface LocationInfo {
  key: LocationKey;
  name: string;
  nativeName: string;
  latitude: number;
  longitude: number;
  latStr: string;
  lonStr: string;
  description: string;
  surfaceTemp: number; // °C
  sss: number;         // PSU
  ssh: number;         // meters
  chlorophyll: number; // mg/m³
  windSpeed: number;   // m/s
  surfaceCurrent: number; // m/s
  bounds: [[number, number], [number, number]]; // Leaflet map bounds
}

export type ParameterType = 'sst' | 'sss' | 'ssh' | 'chlorophyll' | 'wind_speed';

export interface ParameterInfo {
  key: ParameterType;
  label: string;
  fullTitle: string;
  unit: string;
  description: string;
  range: [number, number];
}

export interface SatelliteParameters {
  sst: number;
  sss: number;
  ssh: number;
  chlorophyll: number;
  windSpeed: number;
  surfaceCurrent: number;
  modelInputs: ModelInputValues;
  latitude: number;
  longitude: number;
  date: string;
  locationKey: LocationKey;
}

export interface ModelInputValues {
  analysed_sst: number;
  sos: number;
  sla: number;
  u: number;
  v: number;
  uwnd: number;
  vwnd: number;
}

export interface DepthPoint {
  depth: number;           // Depth in meters (0, 50, 100, 200, 300, 500, 750, 1000)
  predictedTemp: number;   // °C
  argoTemp: number | null; // °C (Observed benchmark, when available)
  error: number | null;    // ΔT (°C), when benchmark data is available
  confidence: number | null;
  zone: 'Surface Layer' | 'Thermocline' | 'Deep Ocean';
}

export interface ModelMetrics {
  rmse: number;            // °C
  mae: number;             // °C
  r2: number;              // coefficient of determination
  confidence: number;      // %
  spatialCoverage: number; // %
}

export interface DynamicSummary {
  thermoclineDepth: number; // Depth range start/end in meters
  rmse: number | null;
  mae: number | null;
  r2: number | null;
  confidence: number | null;
  keyInsights: string[];
}

export interface ARGOValidationGrid {
  depth: number;
  argoObserved: number[][];    // 2D grid matrix
  aiReconstructed: number[][]; // 2D grid matrix
  errorMap: number[][];        // Residual error 2D grid
}

export interface Voxel3D {
  x: number;
  y: number;
  z: number;
  depth: number;
  temperature: number;
}
