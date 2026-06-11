'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import EquityCurveChart from '@/components/analytics/EquityCurveChart';
import BenchmarkComparison from '@/components/analytics/BenchmarkComparison';
import RiskAnalysisChart from '@/components/analytics/RiskAnalysisChart';
import TradeDistribution from '@/components/analytics/TradeDistribution';
import { RMSECard, MAECard, SharpeRatioAnalyticsCard, DrawdownCard, WinRateCard } from '@/components/analytics/MetricCards';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Play, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const STRATEGIES = ['CNN + RL Hybrid', 'CNN Only', 'RL Only'] as const;

export default function AnalyticsPage() {
  const [strategy, setStrategy] = useState<string>('CNN + RL Hybrid');
  const [asset, setAsset] = useState('AAPL');
  const [isRunning, setIsRunning] = useState(false);

  const runBacktest = async () => {
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsRunning(false);
    toast.success('Backtest complete');
  };

  return (
    <DashboardLayout>
      <PageContainer
        title="Backtesting & Analytics"
        subtitle="Quantitative performance evaluation and risk analysis"
        actions={
          <div className="flex items-center gap-2">
            <input
              value={asset}
              onChange={(e) => setAsset(e.target.value.toUpperCase())}
              className="w-24 px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white text-[#111827] font-mono font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="AAPL"
            />
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {STRATEGIES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button
              onClick={runBacktest}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Running…' : 'Run Backtest'}
            </button>
            <button
              onClick={() => toast.success('Export started')}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {/* Metric cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <RMSECard />
            <MAECard />
            <SharpeRatioAnalyticsCard />
            <DrawdownCard />
            <WinRateCard />
          </motion.div>

          {/* Equity curve */}
          <motion.div variants={fadeInUp}>
            <EquityCurveChart strategy={strategy} />
          </motion.div>

          {/* Risk + Trade distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={fadeInUp}>
              <RiskAnalysisChart />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <TradeDistribution />
            </motion.div>
          </div>

          {/* Benchmark comparison */}
          <motion.div variants={fadeInUp}>
            <BenchmarkComparison />
          </motion.div>

          {/* Additional stats */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Detailed Trade Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Trades', value: '156', sub: 'Backtest period' },
                { label: 'Winning Trades', value: '91 (58.3%)', sub: 'Avg profit +1.84%', color: 'text-green-600' },
                { label: 'Losing Trades', value: '65 (41.7%)', sub: 'Avg loss -1.06%', color: 'text-red-500' },
                { label: 'Profit Factor', value: '1.73', sub: 'Gross profit / loss', color: 'text-indigo-600' },
                { label: 'Annualized Return', value: '+22.1%', sub: 'CAGR', color: 'text-green-600' },
                { label: 'Volatility', value: '18.4%', sub: 'Annualized std dev' },
                { label: 'Sortino Ratio', value: '2.61', sub: 'Downside-adjusted', color: 'text-indigo-600' },
                { label: 'Calmar Ratio', value: '2.44', sub: 'Return / max drawdown', color: 'text-teal-600' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xs text-[#9CA3AF] mb-0.5">{stat.label}</div>
                  <div className={`text-sm font-bold ${stat.color || 'text-[#111827]'}`}>{stat.value}</div>
                  <div className="text-xs text-[#6B7280]">{stat.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
