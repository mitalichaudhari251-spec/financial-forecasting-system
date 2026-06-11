'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import EquityCurveChart from '@/components/analytics/EquityCurveChart';
import TradeDistribution from '@/components/analytics/TradeDistribution';
import { RMSECard, MAECard, SharpeRatioAnalyticsCard, DrawdownCard, WinRateCard } from '@/components/analytics/MetricCards';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePlatform } from '@/providers/PlatformProvider';
import { platformService } from '@/services/platform.service';

export default function BacktestingPage() {
  const { ticker, lastForecast } = usePlatform();
  // Forecast wala ticker use karo — agar forecast hai toh uska, warna platform ticker
  const activeTicker = lastForecast?.asset ?? ticker;
  const [isRunning, setIsRunning] = useState(false);
  const [bt, setBt] = useState<{ metrics: Record<string, number>; equityCurve: unknown[] } | null>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    try {
      const result = await platformService.runBacktest(activeTicker);
      setBt(result);
      toast.success(`Backtest complete for ${activeTicker} (live Yahoo data)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Backtest failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer
        title="Backtesting"
        subtitle={`Historical performance for ${activeTicker} — live API`}
        actions={
          <button onClick={runBacktest} disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors">
            {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Running…' : 'Run Backtest'}
          </button>
        }
      >
        {bt && (
          <p className="text-xs text-[#6B7280] mb-3">
            Return {bt.metrics.totalReturn}% · Sharpe {bt.metrics.sharpeRatio} · Max DD {bt.metrics.maxDrawdown}%
          </p>
        )}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <RMSECard /><MAECard /><SharpeRatioAnalyticsCard /><DrawdownCard /><WinRateCard />
          </motion.div>
          <motion.div variants={fadeInUp}><EquityCurveChart /></motion.div>
          <motion.div variants={fadeInUp}><TradeDistribution /></motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}