'use client';

import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import AccuracyCard from '@/components/dashboard/AccuracyCard';
import { RLRewardCard, SharpeRatioCard, PortfolioCard } from '@/components/dashboard/RLRewardCard';
import ForecastCard from '@/components/dashboard/ForecastCard';
import RLRewardChart from '@/components/dashboard/RLRewardChart';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ForecastChart from '@/components/dashboard/ForecastChart';
import RecentForecasts from '@/components/dashboard/RecentForecasts';
import QuickActions from '@/components/dashboard/QuickActions';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Target, Activity, Layers, CheckCircle } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function DashboardPage() {
  const { metrics, dashboard, loading } = useRealtimeMetrics();

  return (
    <DashboardLayout>
      <PageContainer
        title="Dashboard"
        subtitle="Live AI financial forecasting operations overview"
        actions={
          <div className="flex items-center gap-2">
            <div
              className={
                metrics.systemOk
                  ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-medium text-green-700'
                  : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700'
              }
            >
              <span
                className={
                  metrics.systemOk
                    ? 'w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse'
                    : 'w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'
                }
              />
              {metrics.systemOk ? 'System Operational' : 'System Degraded'}
            </div>
            {dashboard?.updatedAt && (
              <span className="text-[10px] text-[#9CA3AF]">
                Updated {new Date(dashboard.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        }
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
        >
          <AccuracyCard
            title="Forecast Accuracy"
            value={`${metrics.forecastAccuracy.toFixed(1)}%`}
            trend={metrics.totalReturn}
            trendLabel="live from API"
            icon={<Target className="w-4 h-4" />}
            color="indigo"
            delay={0}
          />
          <AccuracyCard
            title="Directional Acc."
            value={`${metrics.directionalAccuracy.toFixed(1)}%`}
            trend={metrics.winRate}
            trendLabel="win rate"
            icon={<Activity className="w-4 h-4" />}
            color="teal"
            delay={0.05}
          />
          <SharpeRatioCard />
          <RLRewardCard />
          <PortfolioCard />
          <AccuracyCard
            title="Active Assets"
            value={metrics.totalAssets}
            subtitle={`${metrics.bullish} bullish · ${metrics.bearish} bearish`}
            icon={<Layers className="w-4 h-4" />}
            color="default"
            delay={0.5}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <ForecastChart />
          </div>
          <div>
            <ForecastCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <RLRewardChart />
          <PerformanceChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentForecasts />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        <motion.div variants={fadeInUp} className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-indigo-800">
              Sharpe {metrics.sharpeRatio.toFixed(2)} · {dashboard?.datasetsCount ?? 0} datasets · {dashboard?.forecastsCount ?? 0} forecasts
            </span>
            <span className="text-xs text-indigo-600 ml-2">
              {loading ? 'Syncing…' : 'Auto-refresh every 5s'}
            </span>
          </div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
