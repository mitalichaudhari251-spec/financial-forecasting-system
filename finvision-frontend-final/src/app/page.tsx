'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Brain,
  Bot,
  Shield,
  BarChart2,
  Zap,
  ArrowRight,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

const STATS = [
  { label: 'Forecast Accuracy', value: '76.3%', color: '#10B981' },
  { label: 'Sharpe Ratio (CNN+RL)', value: '1.87', color: '#6366F1' },
  { label: 'Directional Accuracy', value: '71.4%', color: '#14B8A6' },
  { label: 'Assets Tracked', value: '2,400+', color: '#F59E0B' },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'CNN Pattern Recognition',
    desc: 'ResNet-18 trained on GAF visual representations detects candlestick patterns with 89% precision.'
  },
  {
    icon: Bot,
    title: 'RL Agent Recommendations',
    desc: 'PPO & DQN agents generate risk-adjusted trade signals with expected reward forecasting.'
  },
  {
    icon: BarChart2,
    title: 'Advanced Analytics',
    desc: 'Backtesting, portfolio simulation, risk analysis, and benchmark comparison in one platform.'
  },
  {
    icon: Shield,
    title: 'Explainable AI',
    desc: 'Grad-CAM visualizations and pattern attribution make every prediction fully interpretable.'
  },
  {
    icon: Zap,
    title: 'Real-Time Inference',
    desc: 'Sub-second forecasting pipeline from raw OHLCV data to actionable trade recommendations.'
  },
  {
    icon: TrendingUp,
    title: 'Multi-Horizon Forecasting',
    desc: '1D, 3D, 7D, 14D, and 30D prediction horizons with calibrated confidence intervals.'
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const hasToken = document.cookie
      .split(';')
      .some((c) => c.trim().startsWith('fv_token='));

    setLoggedIn(hasToken);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#111827] overflow-x-hidden">

      {/* Background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #111827 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Soft institutional glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="text-sm font-bold leading-none text-[#111827]">
              FinVision-RL
            </div>

            <div className="text-[10px] text-[#5B5FEF] font-semibold tracking-widest uppercase leading-none mt-0.5">
              Research Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                Sign in
              </button>

              <button
                onClick={() => router.push('/register')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Get Access
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-20 pb-16 text-center">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#5B5FEF] text-xs font-medium mb-6">

            <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF] animate-pulse" />

            CNN + Reinforcement Learning · Institutional Grade
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6 text-[#111827]">

            AI-Powered Financial
            <br />

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B5FEF] to-[#7C3AED]">
              Forecasting Platform
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10">

            Combining CNN-based visual market pattern recognition with
            Reinforcement Learning agents to deliver institutional-grade
            market intelligence.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">

            {loggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/register')}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-sm"
                >
                  Start Research
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] font-medium rounded-xl transition-all shadow-sm"
                >
                  Sign In
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >

          {STATS.map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm"
            >
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: s.color }}
              >
                {s.value}
              </div>

              <div className="text-xs text-[#6B7280]">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-16">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-[#111827]">
            Everything you need to forecast markets
          </h2>

          <p className="text-[#6B7280] text-sm">
            Built for quantitative researchers and ML engineers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors shadow-sm"
            >

              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">

                <f.icon className="w-5 h-5 text-[#5B5FEF]" />
              </div>

              <h3 className="text-sm font-semibold text-[#111827] mb-2">
                {f.title}
              </h3>

              <p className="text-xs text-[#6B7280] leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 py-16 text-center">

        <div className="p-10 rounded-3xl bg-white border border-[#E5E7EB] shadow-xl">

          <h2 className="text-3xl font-bold mb-3 text-[#111827]">
            Ready to start forecasting?
          </h2>

          <p className="text-[#6B7280] text-sm mb-8">
            Join researchers using FinVision-RL for quantitative market analysis.
          </p>

          <div className="flex items-center justify-center gap-4">

            {loggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-sm"
              >
                Open Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/register')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-sm"
                >
                  Request Access
                </button>

                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] font-medium rounded-xl transition-all shadow-sm"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-[11px] text-[#9CA3AF] italic">
          For research and informational purposes only. Not financial advice.
        </p>
      </section>
    </div>
  );
}