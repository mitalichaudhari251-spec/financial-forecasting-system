'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import GPUUsageMonitor from '@/components/training/GPUUsageMonitor';
import TrainingCurves from '@/components/training/TrainingCurves';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';

export default function GPUMonitorPage() {
  return (
    <DashboardLayout>
      <PageContainer
        title="GPU Monitor"
        subtitle="Real-time GPU utilization, memory and power metrics"
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp}>
            <GPUUsageMonitor />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TrainingCurves />
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
