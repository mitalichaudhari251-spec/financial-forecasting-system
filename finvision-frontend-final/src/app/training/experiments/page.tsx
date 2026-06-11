'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import TrainingCurves from '@/components/training/TrainingCurves';
import EpochProgress from '@/components/training/EpochProgress';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExperimentsPage() {
  return (
    <DashboardLayout>
      <PageContainer
        title="Experiment Tracker"
        subtitle="Compare and analyze training experiments"
        actions={
          <button onClick={() => {
  const experiment = {
    id: `EXP-${Date.now()}`,
    savedAt: new Date().toISOString(),
    currentEpoch: 34,
    totalEpochs: 50,
    loss: (0.3241 - 34 * 0.004).toFixed(4),
    accuracy: (0.5 + 34 * 0.006).toFixed(4),
  };
  const json = JSON.stringify(experiment, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinVision_Experiment_${experiment.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Experiment ${experiment.id} saved!`);
}}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save className="w-3.5 h-3.5" /> Save Experiment
          </button>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp}>
            <EpochProgress currentEpoch={34} totalEpochs={50} loss={0.3241 - 34 * 0.004} accuracy={0.5 + 34 * 0.006} />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TrainingCurves />
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
