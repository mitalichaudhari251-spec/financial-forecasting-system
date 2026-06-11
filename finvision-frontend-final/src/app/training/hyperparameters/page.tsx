'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import HyperparameterPanel from '@/components/training/HyperparameterPanel';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTrainingStore } from '@/store/trainingStore';

export default function HyperparametersPage() {
  const { cnnConfig, rlConfig } = useTrainingStore();
  return (
    <DashboardLayout>
      <PageContainer
        title="Hyperparameters"
        subtitle="Configure CNN and RL agent training parameters"
        actions={
          <button onClick={() => {
            const config = {
              savedAt: new Date().toISOString(),
              cnn: cnnConfig,
              rl: rlConfig,
            };
            const json = JSON.stringify(config, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FinVision_Config_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Config saved!');
          }}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save className="w-3.5 h-3.5" /> Save Config
          </button>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeInUp}>
            <HyperparameterPanel />
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
