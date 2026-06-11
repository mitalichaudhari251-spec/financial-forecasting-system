'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DISTRIBUTION_DATA = [
  { range: '-5%+', count: 3, color: '#7F1D1D' },
  { range: '-3–5%', count: 8, color: '#DC2626' },
  { range: '-2–3%', count: 14, color: '#EF4444' },
  { range: '-1–2%', count: 22, color: '#FCA5A5' },
  { range: '0–1%', count: 31, color: '#BBF7D0' },
  { range: '1–2%', count: 28, color: '#86EFAC' },
  { range: '2–3%', count: 19, color: '#4ADE80' },
  { range: '3–5%', count: 11, color: '#16A34A' },
  { range: '5%+', count: 5, color: '#14532D' },
];

export default function TradeDistribution() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Trade P&L Distribution</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">156 total trades</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-green-500" /> Winning</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-400" /> Losing</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={DISTRIBUTION_DATA} margin={{ top: 4, right: 0, left: -16, bottom: 0 }} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [v, 'Trades']} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {DISTRIBUTION_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
