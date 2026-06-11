'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import RiskAnalysisChart from '@/components/analytics/RiskAnalysisChart';
import { DrawdownCard, SharpeRatioAnalyticsCard } from '@/components/analytics/MetricCards';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { usePlatform } from '@/providers/PlatformProvider';

export default function RiskAnalysisPage() {
  const { lastForecast, ticker } = usePlatform();
  const activeTicker = lastForecast?.asset ?? ticker;

  return (
    <DashboardLayout>
      <PageContainer
        title="Risk Analysis"
        subtitle={`${activeTicker} — Portfolio risk metrics, drawdown analysis and VaR`}
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">
            <DrawdownCard /><SharpeRatioAnalyticsCard />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <RiskAnalysisChart ticker={activeTicker} />
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}