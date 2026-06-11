'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import EquityCurveChart from '@/components/analytics/EquityCurveChart';
import { RMSECard, MAECard, WinRateCard } from '@/components/analytics/MetricCards';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PortfolioSimulationPage() {
  return (
    <DashboardLayout>
      <PageContainer
        title="Portfolio Simulation"
        subtitle="Monte Carlo simulation and portfolio optimization"
        actions={
          <button onClick={() => toast.success('Simulation started')}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Play className="w-3.5 h-3.5" /> Run Simulation
          </button>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
            <RMSECard /><MAECard /><WinRateCard />
          </motion.div>
          <motion.div variants={fadeInUp}><EquityCurveChart /></motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
