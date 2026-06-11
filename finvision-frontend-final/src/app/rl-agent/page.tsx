'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { generateRewardCurve } from '@/lib/chart-utils';
import { Bot, TrendingUp, TrendingDown, Minus, Zap, Brain, BarChart2, Activity, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import { useMemo } from 'react';

type RLAlgo = 'PPO' | 'DQN';

const OHLCV_STATE = [
  { label: 'Open', value: 185.23, change: null },
  { label: 'High', value: 188.44, change: +1.73 },
  { label: 'Low', value: 184.91, change: -0.17 },
  { label: 'Close', value: 187.15, change: +1.04 },
  { label: 'Volume', value: 55_834_210, change: +12.3 },
  { label: 'RSI (14)', value: 58.4, change: +2.1 },
  { label: 'MACD', value: 1.23, change: +0.34 },
  { label: 'BB Width', value: 0.042, change: -0.003 },
];

const EMBEDDING_LABELS = ['trend', 'momentum', 'volatility', 'volume', 'gap', 'pattern', 'reversal', 'breakout'];

export default function RLAgentPage() {
  const { history, metrics, ohlcv, rewardCurve, equityCurve, lastForecast, ticker, aiOnline, train, refresh } = useRealtimeMetrics(); const seed = ohlcv.length;
  const [algo, setAlgo] = useState<RLAlgo>('PPO');
  const rewardData = useMemo(() => generateRewardCurve(200, seed), [seed]);
  const [currentAction, setCurrentAction] = useState<'buy' | 'sell' | 'hold'>('buy');
  const [exploration, setExploration] = useState(18.4);
  const [embedding, setEmbedding] = useState(() =>
    EMBEDDING_LABELS.map(() => Math.random())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setExploration(prev => Math.max(5, Math.min(40, prev + (Math.random() - 0.5) * 2)));
      setEmbedding(prev => prev.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.1))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const ACTION_CFG = {
    buy: { label: 'BUY', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: TrendingUp, badge: 'bg-green-600' },
    sell: { label: 'SELL', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: TrendingDown, badge: 'bg-red-600' },
    hold: { label: 'HOLD', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: Minus, badge: 'bg-gray-500' },
  };
  const cfg = ACTION_CFG[currentAction];
  const ActionIcon = cfg.icon;

  return (
    <DashboardLayout>
      <PageContainer
        title="RL Agent Decision Panel"
        subtitle="Reinforcement Learning policy status and action analysis"
        actions={
          <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-lg">
            {(['PPO', 'DQN'] as RLAlgo[]).map(a => (
              <button key={a} onClick={() => setAlgo(a)}
                className={cn('px-5 py-1.5 rounded-md text-sm font-semibold transition-all',
                  algo === a ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]' : 'text-[#6B7280] hover:text-[#374151]'
                )}>
                {a}
              </button>
            ))}
          </div>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {/* Top stats row */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Policy Status', value: 'Active', sub: `${algo} trained`, color: 'text-green-600', icon: <Bot className="w-4 h-4" /> },
              { label: 'Avg Reward', value: (rewardData.slice(-100).reduce((a, b) => a + b.reward, 0) / 100).toFixed(2), sub: 'Last 100 episodes', color: 'text-indigo-600', icon: <Zap className="w-4 h-4" /> },
              { label: 'Exploration Rate', value: `${exploration.toFixed(1)}%`, sub: 'ε-greedy / entropy', color: 'text-amber-600', icon: <Activity className="w-4 h-4" /> },
              { label: 'Policy Entropy', value: '0.143', sub: 'bits — converging', color: 'text-teal-600', icon: <Brain className="w-4 h-4" /> },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280] font-medium">{s.label}</span>
                  <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">{s.icon}</div>
                </div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">{s.sub}</div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* LEFT: Action + Explanation */}
            <div className="xl:col-span-1 space-y-4">
              {/* Current action */}
              <motion.div variants={fadeInUp}
                className={cn('bg-white rounded-xl border-2 p-5', cfg.border)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm font-semibold text-[#374151]">{algo} Recommendation</span>
                  </div>
                  <span className={cn('text-white text-xs font-bold px-3 py-1.5 rounded-lg', cfg.badge)}>
                    {cfg.label}
                  </span>
                </div>

                <div className={cn('rounded-xl p-4 mb-4 flex items-center gap-4', cfg.bg)}>
                  <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', cfg.badge)}>
                    <ActionIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7280]">Current Action</div>
                    <div className={`text-2xl font-bold ${cfg.color}`}>{cfg.label}</div>
                    <div className="text-xs text-[#9CA3AF]">AAPL · 7-day horizon</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(['buy', 'hold', 'sell'] as const).map(action => (
                    <button key={action}
                      onClick={() => setCurrentAction(action)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-bold uppercase border transition-all',
                        currentAction === action
                          ? action === 'buy' ? 'bg-green-600 text-white border-green-600'
                            : action === 'sell' ? 'bg-red-600 text-white border-red-600'
                              : 'bg-gray-500 text-white border-gray-500'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-indigo-300'
                      )}>
                      {action}
                    </button>
                  ))}
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  {[
                    { label: 'Expected Reward', value: `${(rewardData[rewardData.length - 1]?.reward ?? 0) >= 0 ? '+' : ''}${(rewardData[rewardData.length - 1]?.reward ?? 0).toFixed(2)}`, color: 'text-green-600' },
                    { label: 'Risk-Adj. Confidence', value: `${(65 + (seed % 300) / 10).toFixed(1)}%`, color: 'text-indigo-600' },
                    { label: 'Q-Value / Value Est.', value: (2 + (seed % 220) / 100).toFixed(3), color: 'text-[#374151]' },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center py-1.5 border-b border-[#F3F4F6] last:border-0">
                      <span className="text-xs text-[#6B7280]">{m.label}</span>
                      <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Exploration vs Exploitation */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="text-sm font-semibold text-[#111827] mb-3">Exploration vs Exploitation</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#6B7280]">Exploration (ε)</span>
                      <span className="font-semibold text-amber-600">{exploration.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${exploration}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#6B7280]">Exploitation</span>
                      <span className="font-semibold text-indigo-600">{(100 - exploration).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${100 - exploration}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-3 leading-relaxed">
                  {algo === 'PPO' ? 'PPO entropy coefficient controls exploration. Currently converging towards optimal policy.' :
                    'DQN ε-greedy exploration. Epsilon decaying linearly from 1.0 → 0.05 over 1M steps.'}
                </p>
              </motion.div>

              {/* RL Explanation */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-[#111827]">RL Explanation</h3>
                </div>
                <div className="space-y-3 text-xs text-[#6B7280] leading-relaxed">
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                    <p className="font-semibold text-indigo-800 mb-1">Why this action?</p>
                    <p className="text-indigo-700">The {algo} agent processed the CNN embedding (512-dim) and detected a high-confidence Bullish Engulfing pattern. The Q-value for BUY significantly exceeds HOLD and SELL, indicating the agent has learned strong upward momentum signals.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="font-semibold text-amber-800 mb-1">Market Risk Factors</p>
                    <ul className="text-amber-700 space-y-0.5 list-disc list-inside">
                      <li>Earnings announcement in 6 days</li>
                      <li>VIX elevated at 18.4</li>
                      <li>Fed rate decision pending</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Charts + state */}
            <div className="xl:col-span-2 space-y-4">
              {/* Reward chart */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Reward Progression</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">{algo} agent — 200 training episodes</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{(rewardData.slice(-50).reduce((a, b) => a + b.reward, 0) / 50).toFixed(2)} avg</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={rewardData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rewardGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="episode" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [v.toFixed(3), 'Reward']} />
                    <Area type="monotone" dataKey="reward" stroke="#4F46E5" strokeWidth={2} fill="url(#rewardGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* CNN Embedding visualization */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">CNN Embedding State</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">512-dim vector compressed to 8 key features</p>
                  </div>
                  <span className="text-xs text-[#9CA3AF]">Live updating</span>
                </div>
                <div className="space-y-2">
                  {EMBEDDING_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-[#6B7280] w-20 flex-shrink-0">{label}</span>
                      <div className="flex-1 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${embedding[i] * 100}%`,
                            backgroundColor: embedding[i] > 0.7 ? '#4F46E5' : embedding[i] > 0.4 ? '#0D9488' : '#9CA3AF'
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[#374151] w-12 text-right flex-shrink-0">
                        {embedding[i].toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* OHLCV state */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-[#6B7280]" />
                  <h3 className="text-sm font-semibold text-[#111827]">Environment State Snapshot — AAPL</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {OHLCV_STATE.map(s => (
                    <div key={s.label} className="p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                      <div className="text-[10px] text-[#9CA3AF] mb-1">{s.label}</div>
                      <div className="text-sm font-bold font-mono text-[#111827]">
                        {s.label === 'Volume' ? s.value.toLocaleString() : s.value.toFixed(s.label === 'BB Width' ? 4 : 2)}
                      </div>
                      {s.change !== null && (
                        <div className={cn('text-[10px] font-medium mt-0.5',
                          s.change > 0 ? 'text-green-600' : 'text-red-500'
                        )}>
                          {s.change > 0 ? '+' : ''}{s.change.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}

