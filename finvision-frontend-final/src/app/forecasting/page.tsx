'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import RecommendationCard from '@/components/forecasting/RecommendationCard';
import SignalCard from '@/components/forecasting/SignalCard';
import RiskWarning from '@/components/forecasting/RiskWarning';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Play, AlertCircle } from 'lucide-react';
import { fetchYahooOHLCV } from '@/lib/yahoo';
import { runFullForecast, checkBackendHealth } from '@/lib/finvision-api';
import type { ForecastResult } from '@/types/forecast';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { usePlatform } from '@/providers/PlatformProvider';

const POPULAR = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'RELIANCE.NS', 'TCS.NS', 'BTC-USD'];

export default function RecommendationsPage() {
  const [ticker, setTicker]       = useState('AAPL');
  const [algo, setAlgo]           = useState<'PPO' | 'DQN'>('PPO');
  const [isRunning, setIsRunning] = useState(false);
  const [forecast, setForecast]   = useState<ForecastResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'yahoo' | 'csv'>('yahoo');

  const { datasets, activeDatasetId, setLastForecast } = usePlatform();
  const activeDataset = datasets.find((d: { id: string }) => d.id === activeDatasetId);

  const run = async () => {
    setIsRunning(true); setError(null); setForecast(null);
    try {
      const healthy = await checkBackendHealth();
      if (!healthy) throw new Error('AI Backend offline — port 8000 check karo');

      const sym = dataSource === 'csv' && activeDataset ? activeDataset.ticker : ticker;
      const rows = await fetchYahooOHLCV(sym, 365);
      const result = await runFullForecast(sym, rows, algo);
      setForecast(result);
      setLastForecast(result);
      toast.success(`${sym} — ${result.rlRecommendation.action.toUpperCase()} recommendation ready!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      setError(msg); toast.error(msg);
    } finally { setIsRunning(false); }
  };

  return (
    <DashboardLayout>
      <PageContainer title="Recommendations" subtitle="AI-generated trade recommendations and risk alerts"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-0.5 bg-[#F3F4F6] rounded-lg">
              {(['PPO', 'DQN'] as const).map(a => (
                <button key={a} onClick={() => setAlgo(a)}
                  className={cn('px-3 py-1 rounded-md text-xs font-semibold transition-all',
                    algo === a ? 'bg-white text-indigo-700 shadow-sm' : 'text-[#6B7280]')}>{a}</button>
              ))}
            </div>
            <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && run()}
              className="w-24 px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="AAPL" />
            <button onClick={run} disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors">
              {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Running…' : 'Get Recommendation'}
            </button>
          </div>
        }>

        {/* Data Source Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-[#6B7280] font-medium">Data Source:</span>
          <div className="flex gap-1 p-0.5 bg-[#F3F4F6] rounded-lg">
            <button onClick={() => setDataSource('yahoo')}
              className={cn('px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                dataSource === 'yahoo' ? 'bg-white text-indigo-700 shadow-sm' : 'text-[#6B7280]')}>
              📡 Yahoo Finance
            </button>
            <button onClick={() => setDataSource('csv')} disabled={!activeDataset}
              className={cn('px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                dataSource === 'csv' ? 'bg-white text-indigo-700 shadow-sm' : 'text-[#6B7280]',
                !activeDataset ? 'opacity-40 cursor-not-allowed' : '')}>
              📂 {activeDataset ? `CSV (${activeDataset.ticker})` : 'No CSV uploaded'}
            </button>
          </div>
          {dataSource === 'csv' && activeDataset && (
            <span className="text-xs text-green-600 font-medium">✓ {activeDataset.name} — {activeDataset.rowCount} rows</span>
          )}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {POPULAR.map(s => (
            <button key={s} onClick={() => setTicker(s)}
              className={cn('px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition-colors',
                ticker === s ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-indigo-200')}>
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {isRunning && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}

        {!forecast && !isRunning && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-[#374151] mb-1">Please choose the symbol</p>
            <p className="text-xs text-[#9CA3AF]">Choose PPO or DQN algorithm, enter the symbol, and click Get Recommendation</p>
          </div>
        )}

        {forecast && !isRunning && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={fadeInUp}>
              <RecommendationCard recommendation={forecast.rlRecommendation} algorithm={algo} />
            </motion.div>
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SignalCard signal={{ direction: forecast.direction, strength: forecast.confidence, asset: forecast.asset, timeframe: '7 days', price: 0, targetPrice: 0, stopLoss: 0 }} />
              <RiskWarning confidence={forecast.confidence} threshold={70} />
            </motion.div>
          </motion.div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}