'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/config/charts';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

interface EpochLog {
  epoch: number;
  trainLoss: number;
  valLoss: number;
}

export default function TrainingCurves() {
  const { aiOnline } = useRealtimeMetrics();
  const [data, setData] = useState<EpochLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!aiOnline) {
      setLoading(false);
      return;
    }
    fetch('http://localhost:8000/training/history')
      .then((r) => r.json())
      .then((json) => {
        const rows: EpochLog[] = (json ?? []).map((d: any) => ({
          epoch:     d.epoch,
          trainLoss: d.train_loss ?? 0,
          valLoss:   d.val_loss   ?? 0,
        }));
        setData(rows);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [aiOnline]);

  const best = data.reduce(
    (acc, d) => (d.valLoss < acc.bestValLoss ? { bestValLoss: d.valLoss, bestEpoch: d.epoch } : acc),
    { bestValLoss: Infinity, bestEpoch: 0 }
  );

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Loss Curves</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">CNN training and validation loss</p>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280]">
              Best val loss: <span className="font-semibold text-green-600">{best.bestValLoss.toFixed(4)}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
              Epoch {best.bestEpoch}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[220px] text-xs text-[#9CA3AF]">
          Loading training history...
        </div>
      ) : !aiOnline ? (
        <div className="flex items-center justify-center h-[220px] text-xs text-[#9CA3AF]">
          AI server offline — loss history unavailable
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-xs text-[#9CA3AF]">
          Training history not found — Train CNN model again. 
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="epoch" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, name: string) => [v.toFixed(4), name === 'trainLoss' ? 'Train Loss' : 'Val Loss']}
            />
            <Legend formatter={(v) => (v === 'trainLoss' ? 'Train' : 'Validation')} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="trainLoss" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="valLoss" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}