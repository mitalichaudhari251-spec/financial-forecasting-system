'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateEquityCurve } from '@/lib/chart-utils';
import { formatDate } from '@/lib/date-utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function PerformanceChart() {
  const { equityCurve, seed } = useRealtimeMetrics();
  const data = useMemo(
    () => (equityCurve.length ? equityCurve : generateEquityCurve(60, 100_000, seed)),
    [equityCurve, seed]
  );
  const days = data.length;

  const pctReturn = (((data[data.length - 1]?.value ?? 100_000) / 100_000) - 1) * 100;
  const isPositive = pctReturn >= 0;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Backtesting Performance</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">CNN + RL Hybrid vs Benchmark ({days} days)</p>
        </div>
        <div className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{pctReturn.toFixed(2)}%
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatDate(v, 'MMM d')} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === 'value' ? 'Portfolio' : 'Benchmark']}
          />
          <Area type="monotone" dataKey="benchmark" stroke="#9CA3AF" strokeWidth={1.5}
            fill="url(#benchmarkGrad)" strokeDasharray="4 4" dot={false} />
          <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2}
            fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 text-xs text-[#6B7280]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-indigo-500 rounded" />
          CNN + RL Hybrid
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-gray-400 rounded" style={{ borderTop: '1px dashed #9CA3AF' }} />
          Benchmark
        </div>
      </div>
    </div>
  );
}
