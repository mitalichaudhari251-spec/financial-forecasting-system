'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import ExplainabilityPanel from '@/components/forecasting/ExplainabilityPanel';
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

export default function ExplainabilityPage() {
  const [ticker, setTicker] = useState('AAPL');
  const [isRunning, setIsRunning] = useState(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'yahoo' | 'csv'>('yahoo');

  const { datasets, activeDatasetId, setLastForecast } = usePlatform();
  const activeDataset = datasets.find((d: { id: string }) => d.id === activeDatasetId);

  useEffect(() => {
    if (dataSource === 'csv' && activeDataset) {
      setTicker(activeDataset.ticker);
    }
  }, [dataSource, activeDataset]);

  const run = async () => {
    setIsRunning(true); setError(null); setForecast(null);
    try {
      const healthy = await checkBackendHealth();
      if (!healthy) throw new Error('AI Backend offline — port 8000 check karo');
      const sym = dataSource === 'csv' && activeDataset ? activeDataset.ticker : ticker;
      const rows = await fetchYahooOHLCV(sym, 365);
      const result = await runFullForecast(sym, rows, 'PPO');
      setForecast(result);
      setLastForecast(result);
      toast.success(`${sym} explainability ready!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      setError(msg); toast.error(msg);
    } finally { setIsRunning(false); }
  };

  const activeTicker = dataSource === 'csv' && activeDataset ? activeDataset.ticker : ticker;

  return (
    <DashboardLayout>
      <PageContainer title="Explainability" subtitle="Feature importance and model decision explanations"
        actions={
          <div className="flex items-center gap-2">
            <input
              value={activeTicker}
              onChange={e => { if (dataSource === 'yahoo') setTicker(e.target.value.toUpperCase()); }}
              onKeyDown={e => e.key === 'Enter' && run()}
              readOnly={dataSource === 'csv'}
              className={cn('w-24 px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                dataSource === 'csv' ? 'bg-indigo-50 text-indigo-700 cursor-not-allowed' : 'bg-white')}
              placeholder="AAPL" />
            <button onClick={run} disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors">
              {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Analyzing…' : 'Explain'}
            </button>
          </div>
        }>

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
            <button key={s} onClick={() => { if (dataSource === 'yahoo') setTicker(s); }}
              className={cn('px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition-colors',
                activeTicker === s ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-indigo-200',
                dataSource === 'csv' ? 'opacity-50 cursor-not-allowed' : '')}>
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
            <p className="text-sm font-semibold text-[#374151] mb-1">Choose a symbol</p>
            <p className="text-xs text-[#9CA3AF]">Select a symbol and click Explain</p>
          </div>
        )}

        {forecast && !isRunning && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeInUp}>
              <ExplainabilityPanel
                text={forecast.rationale}
                patternCorrelation={forecast.rlRecommendation.patternCorrelation}
              />
            </motion.div>
          </motion.div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}