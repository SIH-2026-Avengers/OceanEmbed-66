import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { LocationKey, LocationInfo, ModelInputValues, ParameterType, DepthPoint } from '../types/ocean';
import { getInitialPredictionData, predictSubsurfaceTemperature } from '../models/predictionModel';

export type PageType = 'overview' | 'ocean3d' | 'summary';

export const LOCATION_DETAILS: Record<LocationKey, LocationInfo> = {
  arabian_sea: {
    key: 'arabian_sea',
    name: 'Arabian Sea',
    nativeName: 'अरब सागर / അറേബ്യൻ കടൽ',
    latitude: 18.5,
    longitude: 65.2,
    latStr: '18.5° N',
    lonStr: '65.2° E',
    description: 'Northwestern Indian Ocean region, marked by high surface evaporation, intense seasonal upwelling, and high surface salinity.',
    surfaceTemp: 28.6,
    sss: 34.8,
    ssh: 0.12,
    chlorophyll: 0.31,
    windSpeed: 6.4,
    surfaceCurrent: 1.2,
    bounds: [[8.0, 55.0], [25.0, 77.0]],
  },
  bay_of_bengal: {
    key: 'bay_of_bengal',
    name: 'Bay of Bengal',
    nativeName: 'বঙ্গোপসাগর / बंगाल की खाड़ी',
    latitude: 15.5,
    longitude: 88.0,
    latStr: '15.5° N',
    lonStr: '88.0° E',
    description: 'Northeastern part of the Indian Ocean, characterized by high freshwater discharge, strong salinity stratification, and monsoon variability.',
    surfaceTemp: 29.2,
    sss: 33.4,
    ssh: 0.15,
    chlorophyll: 0.42,
    windSpeed: 7.2,
    surfaceCurrent: 1.4,
    bounds: [[5.0, 78.0], [22.0, 96.0]],
  },
};

const getDefaultModelInputs = (location: LocationInfo): ModelInputValues => ({
  analysed_sst: location.surfaceTemp,
  sos: location.sss,
  sla: location.ssh,
  u: location.surfaceCurrent,
  v: 0,
  uwnd: location.windSpeed,
  vwnd: 0,
});

interface OceanContextType {
  selectedLocation: LocationKey;
  setSelectedLocation: (loc: LocationKey) => void;
  currentLocation: LocationInfo;
  modelInputs: ModelInputValues;
  setModelInputs: (inputs: ModelInputValues) => void;
  selectedParameter: ParameterType;
  setSelectedParameter: (param: ParameterType) => void;
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  predictionData: DepthPoint[];
  isPredicting: boolean;
  predictionStep: number;
  predictionMessage: string;
  predictionError: string | null;
  runPrediction: () => Promise<void>;
  selectedDepth: number;
  setSelectedDepth: (depth: number) => void;
  lastUpdated: string;
}

const OceanContext = createContext<OceanContextType | undefined>(undefined);

export const OceanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<LocationKey>('arabian_sea');
  const [selectedParameter, setSelectedParameter] = useState<ParameterType>('sst');
  const [activePage, setActivePage] = useState<PageType>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [selectedDepth, setSelectedDepth] = useState<number>(200);
  const [modelInputs, setModelInputs] = useState<ModelInputValues>(() => getDefaultModelInputs(LOCATION_DETAILS.arabian_sea));

  const [predictionData, setPredictionData] = useState<DepthPoint[]>(() =>
    isDemoMode ? getInitialPredictionData('arabian_sea') : []
  );

  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionStep, setPredictionStep] = useState<number>(0);
  const [predictionMessage, setPredictionMessage] = useState<string>('');
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const requestSequence = useRef(0);
  const lastAutomaticRequest = useRef<string | null>(null);
  const modelInputsRef = useRef(modelInputs);
  modelInputsRef.current = modelInputs;

  const currentLocation = LOCATION_DETAILS[selectedLocation];

  const setSelectedLocation = (locationKey: LocationKey) => {
    setSelectedLocationState(locationKey);
    setModelInputs(getDefaultModelInputs(LOCATION_DETAILS[locationKey]));
  };

  const executePrediction = useCallback(async (
    locationKey: LocationKey,
    inputs: ModelInputValues,
    demoMode: boolean
  ) => {
    const sequence = ++requestSequence.current;
    const location = LOCATION_DETAILS[locationKey];
    setIsPredicting(true);
    setPredictionError(null);
    setPredictionStep(1);

    try {
      const results = await predictSubsurfaceTemperature(
        {
          sst: inputs.analysed_sst,
          sss: inputs.sos,
          ssh: location.ssh,
          chlorophyll: location.chlorophyll,
          windSpeed: location.windSpeed,
          surfaceCurrent: location.surfaceCurrent,
          modelInputs: inputs,
          latitude: location.latitude,
          longitude: location.longitude,
          date: new Date().toISOString().split('T')[0],
          locationKey,
        },
        (step, msg) => {
          if (sequence !== requestSequence.current) return;
          setPredictionStep(step);
          setPredictionMessage(msg);
        },
        demoMode
      );

      if (sequence === requestSequence.current) setPredictionData(results);
    } catch (err) {
      if (sequence === requestSequence.current) {
        console.error('Prediction failed', err);
        setPredictionError(err instanceof Error ? err.message : 'Prediction failed. Check that the model API is running.');
      }
    } finally {
      if (sequence === requestSequence.current) {
        setIsPredicting(false);
        setPredictionStep(0);
        setPredictionMessage('');
      }
    }
  }, []);

  const runPrediction = () => executePrediction(selectedLocation, modelInputs, isDemoMode);

  useEffect(() => {
    const requestKey = `${selectedLocation}:${isDemoMode ? 'demo' : 'live'}`;
    if (lastAutomaticRequest.current === requestKey) return;
    lastAutomaticRequest.current = requestKey;
    setPredictionError(null);

    if (isDemoMode) {
      requestSequence.current += 1;
      setIsPredicting(false);
      setPredictionStep(0);
      setPredictionMessage('');
      setPredictionData(getInitialPredictionData(selectedLocation));
      return;
    }

    setPredictionData([]);
    void executePrediction(selectedLocation, modelInputsRef.current, false);
  }, [selectedLocation, isDemoMode, executePrediction]);

  const lastUpdated = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <OceanContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        currentLocation,
        modelInputs,
        setModelInputs,
        selectedParameter,
        setSelectedParameter,
        activePage,
        setActivePage,
        isDemoMode,
        setIsDemoMode,
        predictionData,
        isPredicting,
        predictionStep,
        predictionMessage,
        predictionError,
        runPrediction,
        selectedDepth,
        setSelectedDepth,
        lastUpdated,
      }}
    >
      {children}
    </OceanContext.Provider>
  );
};

export const useOcean = () => {
  const context = useContext(OceanContext);
  if (!context) {
    throw new Error('useOcean must be used within an OceanProvider');
  }
  return context;
};
