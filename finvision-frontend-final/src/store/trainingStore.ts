import { create } from 'zustand';
import type { TrainingRun, GPUMetrics, LogEntry, CNNHyperparameters, RLHyperparameters } from '@/types/training';

interface TrainingState {
  activeRun: TrainingRun | null;
  runs: TrainingRun[];
  gpuMetrics: GPUMetrics | null;
  logs: LogEntry[];
  cnnConfig: CNNHyperparameters;
  rlConfig: RLHyperparameters;
  setActiveRun: (r: TrainingRun | null) => void;
  setRuns: (runs: TrainingRun[]) => void;
  setGPUMetrics: (m: GPUMetrics) => void;
  appendLog: (l: LogEntry) => void;
  clearLogs: () => void;
  setCNNConfig: (c: Partial<CNNHyperparameters>) => void;
  setRLConfig: (c: Partial<RLHyperparameters>) => void;
}

const DEFAULT_CNN: CNNHyperparameters = {
  backbone: 'ResNet-18',
  learningRate: 0.001,
  batchSize: 32,
  epochs: 50,
  dropout: 0.3,
  weightDecay: 1e-4,
  imageSize: 224,
  augmentation: true,
};

const DEFAULT_RL: RLHyperparameters = {
  algorithm: 'PPO',
  learningRate: 3e-4,
  gamma: 0.99,
  clipRange: 0.2,
  nSteps: 2048,
  batchSize: 64,
  totalTimesteps: 1_000_000,
  entropyCoef: 0.01,
};

export const useTrainingStore = create<TrainingState>((set) => ({
  activeRun: null,
  runs: [],
  gpuMetrics: null,
  logs: [],
  cnnConfig: DEFAULT_CNN,
  rlConfig: DEFAULT_RL,
  setActiveRun: (activeRun) => set({ activeRun }),
  setRuns: (runs) => set({ runs }),
  setGPUMetrics: (gpuMetrics) => set({ gpuMetrics }),
  appendLog: (l) => set((s) => ({ logs: [...s.logs.slice(-499), l] })),
  clearLogs: () => set({ logs: [] }),
  setCNNConfig: (c) => set((s) => ({ cnnConfig: { ...s.cnnConfig, ...c } })),
  setRLConfig: (c) => set((s) => ({ rlConfig: { ...s.rlConfig, ...c } })),
}));
