'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import TrainingCurves from '@/components/training/TrainingCurves';
import GPUUsageMonitor from '@/components/training/GPUUsageMonitor';
import TrainingLogs from '@/components/training/TrainingLogs';
import HyperparameterPanel from '@/components/training/HyperparameterPanel';
import EpochProgress from '@/components/training/EpochProgress';
import ExperimentTracker from '@/components/training/ExperimentTracker';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function TrainingPage() {
  const { train, aiOnline } = useRealtimeMetrics();
  const exp = train?.experiments?.[0];

  return (
    <DashboardLayout>
      <PageContainer
        title="Model Training"
        subtitle={aiOnline ? 'AI model server online — live status' : 'AI model offline — start npm run dev'}
        actions={
          <span className={`text-xs px-2 py-1 rounded-lg border ${aiOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {aiOnline ? 'Model Ready' : 'Model Offline'}
          </span>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {exp && (
            <p className="text-xs text-[#6B7280]">
              {exp.name}: epoch {exp.epoch}/{exp.totalEpochs} · val acc {exp.valAccuracy}%
            </p>
          )}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <TrainingCurves />
              <TrainingLogs />
            </div>
            <div className="space-y-4">
              <EpochProgress />
              <GPUUsageMonitor />
              <HyperparameterPanel />
            </div>
          </motion.div>
          <motion.div variants={fadeInUp}><ExperimentTracker /></motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
