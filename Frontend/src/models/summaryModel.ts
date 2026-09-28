import { DepthPoint, DynamicSummary, LocationKey } from '../types/ocean';

/**
 * ============================================================================
 * [ CONNECT SUMMARY MODEL HERE ]
 * ============================================================================
 * 
 * Integration layer for Reconstruction Summary & LLM/AI Insight Generator.
 * 
 * TO CONNECT YOUR SUMMARY MODEL OR LLM BACKEND:
 * 1. Replace `generateSummary()` with your custom AI summary API call.
 * 2. Return JSON object containing metrics and key insight bullet points.
 */

export function generateSummary(
  predictionResults: DepthPoint[],
  locationKey: LocationKey,
  outputUnit: string = '°C'
): DynamicSummary {
  const sorted = [...predictionResults].sort((a, b) => a.depth - b.depth);
  const comparisons = sorted.filter((point) => point.argoTemp != null && point.error != null);
  const rmse = comparisons.length
    ? Number(Math.sqrt(comparisons.reduce((sum, point) => sum + (point.error ?? 0) ** 2, 0) / comparisons.length).toFixed(2))
    : null;
  const mae = comparisons.length
    ? Number((comparisons.reduce((sum, point) => sum + Math.abs(point.error ?? 0), 0) / comparisons.length).toFixed(2))
    : null;
  const observedMean = comparisons.length
    ? comparisons.reduce((sum, point) => sum + (point.argoTemp ?? 0), 0) / comparisons.length
    : 0;
  const totalVariation = comparisons.reduce((sum, point) => sum + ((point.argoTemp ?? 0) - observedMean) ** 2, 0);
  const residualVariation = comparisons.reduce((sum, point) => sum + (point.error ?? 0) ** 2, 0);
  const r2 = comparisons.length && totalVariation > 0
    ? Number((1 - residualVariation / totalVariation).toFixed(3))
    : null;
  const providedConfidence = sorted.filter((point) => point.confidence != null);
  const confidence = providedConfidence.length
    ? Number((providedConfidence.reduce((sum, point) => sum + (point.confidence ?? 0), 0) / providedConfidence.length).toFixed(1))
    : null;

  let thermoclineDepth = 0;
  let steepestGradient = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const depthDelta = sorted[index].depth - sorted[index - 1].depth;
    const gradient = depthDelta > 0
      ? Math.abs((sorted[index].predictedTemp - sorted[index - 1].predictedTemp) / depthDelta)
      : 0;
    if (gradient > steepestGradient) {
      steepestGradient = gradient;
      thermoclineDepth = sorted[index - 1].depth;
    }
  }

  const surfaceTemp = sorted.find((point) => point.depth === 0)?.predictedTemp;
  const locationName = locationKey === 'bay_of_bengal' ? 'Bay of Bengal' : 'Arabian Sea';
  const keyInsights: string[] = sorted.length
    ? [
        `${locationName} model output spans ${Math.min(...sorted.map((point) => point.predictedTemp)).toFixed(2)}–${Math.max(...sorted.map((point) => point.predictedTemp)).toFixed(2)} ${outputUnit} across the configured output channels.`,
        surfaceTemp == null ? 'A surface-depth output channel was not configured.' : `Surface channel output is ${surfaceTemp.toFixed(2)} ${outputUnit}.`,
        `The largest adjacent-channel change begins near ${thermoclineDepth} m.`,
        comparisons.length
          ? `Compared with ${comparisons.length} supplied benchmark points: RMSE ${rmse} °C, MAE ${mae} °C, R² ${r2 ?? 'N/A'}.`
          : 'Validation metrics are unavailable because no matching ARGO or target observations were supplied.',
      ]
    : ['Run a prediction to populate model output and summary statistics.'];

  return {
    thermoclineDepth,
    rmse,
    mae,
    r2,
    confidence,
    keyInsights,
  };
}
