'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import BenchmarkComparison from '@/components/analytics/BenchmarkComparison';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { usePlatform } from '@/providers/PlatformProvider';

export default function BenchmarkComparisonPage() {
  const { lastForecast, ticker } = usePlatform();
  const activeTicker = lastForecast?.asset ?? ticker;

  return (
    <DashboardLayout>
      <PageContainer
        title="Benchmark Comparison"
        subtitle={`Compare ${activeTicker} strategy performance against market benchmarks`}
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeInUp}>
            <BenchmarkComparison ticker={activeTicker} />
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}