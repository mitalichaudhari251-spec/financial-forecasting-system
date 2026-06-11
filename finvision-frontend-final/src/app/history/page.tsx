'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { TrendingUp, TrendingDown, Minus, Search, Filter, Download, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { formatTimestamp, formatConfidence } from '@/lib/formatting';
import type { ForecastCase } from '@/types/forecast';
import { motion } from 'framer-motion';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

type SortKey = 'asset' | 'confidence' | 'sharpeRatio' | 'timestamp';

export default function HistoryPage() {
  const router = useRouter();
  const { history: historyData, refresh, loading } = useRealtimeMetrics();
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<string>('all');
  const [algoFilter, setAlgoFilter] = useState<string>('all');
  const [horizonFilter, setHorizonFilter] = useState<string>('all');
  const [minConf, setMinConf] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const filtered = useMemo(() => {
    let data = historyData.filter((f) => {
      if (search && !f.asset.toLowerCase().includes(search.toLowerCase()) && !f.id.includes(search)) return false;
      if (dirFilter !== 'all' && f.direction !== dirFilter) return false;
      if (algoFilter !== 'all' && f.rlAlgorithm !== algoFilter) return false;
      if (horizonFilter !== 'all' && f.horizon !== horizonFilter) return false;
      if (f.confidence < minConf) return false;
      return true;
    });
    data = [...data].sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
    return data;
  }, [search, dirFilter, algoFilter, horizonFilter, minConf, sortKey, sortAsc, historyData]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  const DIR_BADGE: Record<string, React.ReactNode> = {
    bullish: <span className="badge-bullish"><TrendingUp className="w-3 h-3" />Bullish</span>,
    bearish: <span className="badge-bearish"><TrendingDown className="w-3 h-3" />Bearish</span>,
    neutral: <span className="badge-neutral"><Minus className="w-3 h-3" />Neutral</span>,
  };

  return (
    <DashboardLayout>
      <PageContainer
        title="Case History"
        subtitle="Searchable and filterable forecast history"
        actions={
          <button
  onClick={() => {
    if (filtered.length === 0) { toast.error('No data to export'); return; }
    const headers = ['ID', 'Asset', 'Direction', 'Confidence', 'Sharpe Ratio', 'Horizon', 'Algorithm', 'Model', 'Timestamp'];
    const rows = filtered.map(fc => [
      fc.id, fc.asset, fc.direction, fc.confidence + '%',
      fc.sharpeRatio.toFixed(2), fc.horizon, fc.rlAlgorithm,
      fc.modelVersion, new Date(fc.timestamp).toLocaleString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinVision_History_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} records exported!`);
  }}
  className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        }
      >
        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search asset or ID…"
              className="pl-8 pr-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg bg-white text-[#111827] w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            />
          </div>

          {[
            { label: 'Direction', value: dirFilter, onChange: setDirFilter, options: [['all', 'All Directions'], ['bullish', 'Bullish'], ['bearish', 'Bearish'], ['neutral', 'Neutral']] },
            { label: 'Algorithm', value: algoFilter, onChange: setAlgoFilter, options: [['all', 'All Algorithms'], ['PPO', 'PPO'], ['DQN', 'DQN']] },
            { label: 'Horizon', value: horizonFilter, onChange: setHorizonFilter, options: [['all', 'All Horizons'], ['1d', '1 Day'], ['7d', '7 Days'], ['30d', '30 Days']] },
          ].map((f) => (
            <select
              key={f.label}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Min confidence:</span>
            <input
              type="range" min={0} max={90} step={5} value={minConf}
              onChange={(e) => setMinConf(parseInt(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs font-semibold text-[#374151] w-8">{minConf}%</span>
          </div>

          <div className="ml-auto text-xs text-[#9CA3AF]">{filtered.length} results</div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
                {[
                  { label: 'Forecast ID', key: null },
                  { label: 'Asset', key: 'asset' as SortKey },
                  { label: 'Direction', key: null },
                  { label: 'Confidence', key: 'confidence' as SortKey },
                  { label: 'Sharpe', key: 'sharpeRatio' as SortKey },
                  { label: 'Horizon', key: null },
                  { label: 'Algorithm', key: null },
                  { label: 'Model', key: null },
                  { label: 'Timestamp', key: 'timestamp' as SortKey },
                  { label: 'Actions', key: null },
                ].map((col) => (
                  <th
                    key={col.label}
                    onClick={() => col.key && toggleSort(col.key)}
                    className={cn(
                      'px-4 py-3 text-left text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]',
                      col.key && 'cursor-pointer hover:text-[#374151] select-none'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon k={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((fc) => (
                <tr
                  key={fc.id}
                  className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB] transition-colors group"
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-indigo-600 font-medium">{fc.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-indigo-700">{fc.asset.slice(0, 4)}</span>
                      </div>
                      <span className="font-semibold text-[#111827]">{fc.asset}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">{DIR_BADGE[fc.direction]}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${fc.confidence}%`,
                            backgroundColor: fc.confidence >= 85 ? '#16A34A' : fc.confidence >= 70 ? '#D97706' : '#DC2626',
                          }}
                        />
                      </div>
                      <span className={cn('font-semibold text-xs',
                        fc.confidence >= 85 ? 'text-green-600' : fc.confidence >= 70 ? 'text-amber-600' : 'text-red-500'
                      )}>
                        {formatConfidence(fc.confidence)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-[#374151]">{fc.sharpeRatio.toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
                      {fc.horizon}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      fc.rlAlgorithm === 'PPO' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'
                    )}>
                      {fc.rlAlgorithm}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-[#9CA3AF]">{fc.modelVersion}</td>
                  <td className="px-4 py-3.5 text-xs text-[#6B7280]">{formatTimestamp(fc.timestamp)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/history/${fc.id}`)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        title="Open report"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
  onClick={() => {
    router.push(`/forecasting?ticker=${fc.asset}&algo=${fc.rlAlgorithm}`);
    toast.success(`Re-running ${fc.asset}...`);
  }}
  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-green-50 hover:text-green-600 transition-colors"
  title="Re-run inference"
>
  <RefreshCw className="w-3.5 h-3.5" />
</button>
                      <button
  onClick={() => {
    const rows = [
      ['Field', 'Value'],
      ['Forecast ID', fc.id],
      ['Asset', fc.asset],
      ['Direction', fc.direction],
      ['Confidence', fc.confidence + '%'],
      ['Sharpe Ratio', fc.sharpeRatio.toFixed(2)],
      ['Horizon', fc.horizon],
      ['Algorithm', fc.rlAlgorithm],
      ['Model Version', fc.modelVersion],
      ['Timestamp', new Date(fc.timestamp).toLocaleString()],
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinVision_${fc.asset}_${fc.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  }}
  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-gray-50 hover:text-gray-700 transition-colors"
  title="Export data"
>
  <Download className="w-3.5 h-3.5" />
</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-[#9CA3AF]">
                    No forecasts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
