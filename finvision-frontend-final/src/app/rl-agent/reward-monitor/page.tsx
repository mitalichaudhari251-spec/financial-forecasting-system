'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { api } from '@/services/api';

interface RewardStats {
  bestEpisode: number;
  avgLast100: number;
  sharpeRatio: number;
}

interface EpisodeData {
  episode: number;
  ppo: number;
  dqn: number;
}

export default function RewardMonitorPage() {
  const { aiOnline } = useRealtimeMetrics();
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchRewardHistory() {
      setLoading(true);
      try {
        const json: any = await api.get('/training/reward-history');
        if (json.success) {
          setEpisodes(json.data.episodes ?? []);
          setStats(json.data.stats ?? null);
          setIsLive(json.data.isLive ?? false);
        }
      } catch {
        console.error('Reward history fetch failed');
      } finally {
        setLoading(false);
      }
    }
    fetchRewardHistory();
  }, []);

  return (
    <DashboardLayout>
      <PageContainer title="Reward Monitor" subtitle="Live episode rewards, Sharpe ratio and cumulative returns">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">

          <motion.div variants={fadeInUp}
            className={`rounded-lg px-4 py-2 text-sm flex items-center gap-2 border ${isLive
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
            <span>{isLive ? '🟢 Live AI training data' : '🟡 Training history — AI model se real-time data milne pe update hoga'}</span>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
            {[
              { label: 'Best Episode', value: stats ? `${stats.bestEpisode >= 0 ? '+' : ''}${stats.bestEpisode.toFixed(2)}` : '—', color: 'text-green-600' },
              { label: 'Avg (Last 100)', value: stats ? `${stats.avgLast100 >= 0 ? '+' : ''}${stats.avgLast100.toFixed(2)}` : '—', color: 'text-indigo-600' },
              { label: 'Sharpe Ratio', value: stats ? stats.sharpeRatio.toFixed(2) : '—', color: 'text-teal-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
                <div className={`text-xl font-bold mb-1 font-mono ${s.color}`}>
                  {loading ? <span className="text-[#D1D5DB]">...</span> : s.value}
                </div>
                <div className="text-xs text-[#6B7280]">{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">PPO vs DQN Reward Comparison</h3>
              <div className="flex gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-[10px] text-[#6B7280]">PPO</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-teal-600" />
                  <span className="text-[10px] text-[#6B7280]">DQN</span>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-[#9CA3AF]">
                Loading reward history...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={episodes} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="episode" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                    formatter={(val: any, name: string) => [parseFloat(val).toFixed(3), name.toUpperCase()]}
                    labelFormatter={(l) => `Episode ${l}`} />
                  <Line type="monotone" dataKey="ppo" stroke="#4F46E5" strokeWidth={2} dot={false} name="ppo" />
                  <Line type="monotone" dataKey="dqn" stroke="#0D9488" strokeWidth={2} dot={false} name="dqn" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}