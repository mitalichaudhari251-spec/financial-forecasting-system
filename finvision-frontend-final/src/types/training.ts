export type CNNBackbone = 'ResNet-18' | 'ResNet-50';
export type RLAlgorithm = 'PPO' | 'DQN';
export type TrainingStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface CNNHyperparameters {
  backbone: CNNBackbone;
  learningRate: number;
  batchSize: number;
  epochs: number;
  dropout: number;
  weightDecay: number;
  imageSize: number;
  augmentation: boolean;
}

export interface RLHyperparameters {
  algorithm: RLAlgorithm;
  learningRate: number;
  gamma: number;
  epsilon?: number;          // DQN
  clipRange?: number;        // PPO
  nSteps?: number;           // PPO
  batchSize: number;
  bufferSize?: number;       // DQN
  totalTimesteps: number;
  targetUpdateFreq?: number; // DQN
  entropyCoef?: number;      // PPO
}

export interface TrainingRun {
  id: string;
  name: string;
  status: TrainingStatus;
  cnnConfig: CNNHyperparameters;
  rlConfig: RLHyperparameters;
  startTime: string;
  endTime?: string;
  currentEpoch: number;
  totalEpochs: number;
  metrics: TrainingMetrics;
  gpuUtilization: number;
  memoryUsage: number;
  tags: string[];
}

export interface TrainingMetrics {
  trainLoss: MetricPoint[];
  valLoss: MetricPoint[];
  trainAccuracy: MetricPoint[];
  valAccuracy: MetricPoint[];
  rlReward: MetricPoint[];
  rlEpisodeLength: MetricPoint[];
  learningRate: MetricPoint[];
}

export interface MetricPoint {
  step: number;
  value: number;
  timestamp: string;
}

export interface GPUMetrics {
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerDraw: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
}
