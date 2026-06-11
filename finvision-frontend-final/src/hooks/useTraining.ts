'use client';

import { useEffect, useCallback } from 'react';
import { useTrainingStore } from '@/store/trainingStore';
import { wsService } from '@/services/websocket';
import type { LogEntry, GPUMetrics } from '@/types/training';
import toast from 'react-hot-toast';

export function useTraining() {
  const { appendLog, setGPUMetrics, setActiveRun, activeRun } = useTrainingStore();

  useEffect(() => {
    const unsubLog = wsService.on('training.log', (data) => appendLog(data as LogEntry));
    const unsubGPU = wsService.on('training.gpu', (data) => setGPUMetrics(data as GPUMetrics));
    const unsubEpoch = wsService.on('training.epoch', (data) => {
      const run = data as { epoch: number; totalEpochs: number; loss: number };
      if (activeRun) {
        setActiveRun({ ...activeRun, currentEpoch: run.epoch });
      }
    });
    const unsubComplete = wsService.on('training.complete', () => {
      toast.success('Training completed!');
    });

    return () => {
      unsubLog();
      unsubGPU();
      unsubEpoch();
      unsubComplete();
    };
  }, [appendLog, setGPUMetrics, setActiveRun, activeRun]);

  const startTraining = useCallback(() => {
    wsService.send('training.start', {});
    toast.loading('Starting training...', { id: 'training-start' });
  }, []);

  const stopTraining = useCallback(() => {
    wsService.send('training.stop', {});
    toast.dismiss('training-start');
  }, []);

  return { startTraining, stopTraining };
}
