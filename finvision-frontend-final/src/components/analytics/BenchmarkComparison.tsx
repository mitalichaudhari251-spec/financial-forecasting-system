'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const BENCHMARK_DATA = [
  { strategy: 'CNN+RL Hybrid', sharpe: 1.87, return: 34.7, drawdown: -14.2, winRate: 58.3, directional: 71.4, color: '#4F46E5' },
  { strategy: 'CNN Only', sharpe: 1.43, return: 22.1, drawdown: -18.6, winRate: 52.1, directional: 65.8, color: '#0D9488' },
  { strategy: 'RL Only', sharpe: 1.21, return: 18.4, drawdown: -21.3, winRate: 49.7, directional: 61.2, color: '#7C3AED' },
  { strategy: 'LSTM', sharpe: 0.94, return: 12.8, drawdown: -24.1, winRate: 46.3, directional: 57.4, color: '#D97706' },
  { strategy: 'ARIMA', sharpe: 0.71, return: 8.3, drawdown: -19.8, winRate: 42.1, directional: 52.3, color: '#9CA3AF' },
  { strategy: 'Buy & Hold', sharpe: 0.58, return: 14.2, drawdown: -31.4, winRate: 100, directional: 0, color: '#6B7280' },
];

const METRIC_CONFIG = [
  { key: 'sharpe', label: 'Sharpe Ratio', suffix: '', decimals: 2 },
  { key: 'return', label: 'Total Return (%)', suffix: '%', decimals: 1 },
  { key: 'winRate', label: 'Win Rate (%)', suffix: '%', decimals: 1 },
  { key: 'directional', label: 'Directional Acc. (%)', suffix: '%', decimals: 1 },
];

export default function BenchmarkComparison() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Strategy Benchmark Comparison</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">CNN+RL vs LSTM, ARIMA, and Buy & Hold</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          CNN+RL Best
        </span>
      </div>

      {/* Sharpe ratio chart */}
      <div>
        <p className="text-xs font-semibold text-[#374151] mb-3">Sharpe Ratio Comparison</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={BENCHMARK_DATA} margin={{ top: 4, right: 0, left: -16, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="strategy" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [v.toFixed(2), 'Sharpe Ratio']}
            />
            <Bar dataKey="sharpe" radius={[4, 4, 0, 0]}>
              {BENCHMARK_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3F4F6]">
              <th className="text-left px-3 py-2 text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]">Strategy</th>
              <th className="text-right px-3 py-2 text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]">Sharpe</th>
              <th className="text-right px-3 py-2 text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]">Return</th>
              <th className="text-right px-3 py-2 text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]">Max DD</th>
              <th className="text-right px-3 py-2 text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]">Win Rate</th>
              <th className="text-right px-3 py-2 text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]">Dir. Acc.</th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARK_DATA.map((d, i) => (
              <tr key={i} className={`border-b border-[#F9FAFB] ${i === 0 ? 'bg-indigo-50' : 'hover:bg-[#F9FAFB]'} transition-colors`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className={`font-medium ${i === 0 ? 'text-indigo-700' : 'text-[#374151]'}`}>{d.strategy}</span>
                    {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">BEST</span>}
                  </div>
                </td>
                <td className={`px-3 py-2.5 text-right font-semibold ${i === 0 ? 'text-indigo-700' : 'text-[#111827]'}`}>{d.sharpe.toFixed(2)}</td>
                <td className={`px-3 py-2.5 text-right font-semibold ${d.return >= 0 ? 'text-green-600' : 'text-red-500'}`}>+{d.return.toFixed(1)}%</td>
                <td className="px-3 py-2.5 text-right text-red-500 font-medium">{d.drawdown.toFixed(1)}%</td>
                <td className="px-3 py-2.5 text-right text-[#374151]">{d.winRate.toFixed(1)}%</td>
                <td className="px-3 py-2.5 text-right text-[#374151]">{d.directional.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
