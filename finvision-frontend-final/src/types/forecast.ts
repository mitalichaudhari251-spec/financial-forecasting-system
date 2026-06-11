export type ForecastDirection = 'bullish' | 'bearish' | 'neutral';
export type RLAction = 'buy' | 'hold' | 'sell';
export type ForecastHorizon = '1d' | '7d' | '30d';
export type ModelVersion = string;
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ForecastProbabilities {
  bullish: number;
  bearish: number;
  neutral: number;
}

export interface PatternDetection {
  name: string;
  confidence: number;
  region?: { x: number; y: number; width: number; height: number };
}

export interface RLRecommendation {
  action: RLAction;
  expectedReward: number;
  riskAdjustedConfidence: number;
  rationale: string;
  marketRiskFactors: string[];
  patternCorrelation: string;
}

export interface ForecastResult {
  id: string;
  asset: string;
  direction: ForecastDirection;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  probabilities: ForecastProbabilities;
  rlRecommendation: RLRecommendation;
  detectedPatterns: PatternDetection[];
  forecastHorizon: ForecastHorizon;
  rationale: string;
  timestamp: string;
  modelVersion: ModelVersion;
  gradCamUrl?: string;
  candlestickUrl?: string;
  gafUrl?: string;
  sharpeRatio?: number;
}

export interface ForecastCase {
  id: string;
  asset: string;
  direction: ForecastDirection;
  confidence: number;
  sharpeRatio: number;
  timestamp: string;
  modelVersion: ModelVersion;
  rlAlgorithm: 'PPO' | 'DQN';
  horizon: ForecastHorizon;
  status: 'completed' | 'running' | 'failed';
}

export interface ForecastFilters {
  assetType?: string;
  dateRange?: { from: Date; to: Date };
  confidenceThreshold?: number;
  rlAlgorithm?: 'PPO' | 'DQN';
  horizon?: ForecastHorizon;
  direction?: ForecastDirection;
}
