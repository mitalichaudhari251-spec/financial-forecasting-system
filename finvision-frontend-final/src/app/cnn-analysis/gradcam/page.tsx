'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Crosshair, TrendingUp, Info } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';

export default function GradCAMPage() {
  const { lastForecast, aiOnline } = useRealtimeMetrics();

  const direction  = lastForecast?.direction ?? null;
  const confidence = lastForecast?.confidence ?? null;
  const patterns   = lastForecast?.detectedPatterns ?? [];

  return (
    <DashboardLayout>
      <PageContainer title="Grad-CAM Visualization" subtitle="Gradient-weighted Class Activation Mapping — real CNN results">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">

          <motion.div variants={fadeInUp} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700">
              <span className="font-semibold"> For Grad-CAM:</span>in AI backend{' '}
              <code className="bg-amber-100 px-1 rounded">POST /gradcam</code> add endpoint.
              The result of last forecast is currently showing the real CNN prediction result.
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crosshair className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-[#111827]">Last CNN Prediction</h3>
            </div>

            {!lastForecast ? (
              <div className="text-center py-10 text-xs text-[#9CA3AF]">
                Run a forecast to see real CNN prediction results.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs text-[#6B7280]">Prediction Details</p>
                  {[
                    {
                      label: 'Direction',
                      value: direction?.toUpperCase() ?? '—',
                      color: direction === 'bullish' ? '#16A34A' : direction === 'bearish' ? '#DC2626' : '#6B7280',
                    },
                    {
                      label: 'CNN Confidence',
                      value: confidence != null ? `${confidence.toFixed(2)}%` : '—',
                      color: '#4F46E5',
                    },
                    {
                      label: 'Bullish Probability',
                      value: `${((lastForecast.probabilities?.bullish ?? 0) * 100).toFixed(1)}%`,
                      color: '#16A34A',
                    },
                    {
                      label: 'Bearish Probability',
                      value: `${((lastForecast.probabilities?.bearish ?? 0) * 100).toFixed(1)}%`,
                      color: '#DC2626',
                    },
                    {
                      label: 'Neutral Probability',
                      value: `${((lastForecast.probabilities?.neutral ?? 0) * 100).toFixed(1)}%`,
                      color: '#6B7280',
                    },
                    {
                      label: 'Ticker',
                      value: lastForecast.asset,
                      color: '#374151',
                    },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#F3F4F6]">
                      <span className="text-xs text-[#6B7280]">{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-[#6B7280]">Detected Patterns</p>
                  {patterns.length > 0 ? (
                    patterns.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#F3F4F6]">
                        <span className="text-xs text-[#374151] font-medium">{p.name}</span>
                        <span className="text-xs font-bold text-indigo-600">{(p.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#9CA3AF]">No patterns detected</p>
                  )}
                  {lastForecast.rationale && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-xs text-indigo-600 font-medium">Rationale</p>
                      <p className="text-xs text-[#374151] mt-1 leading-relaxed">{lastForecast.rationale}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-[#111827]">CNN Output Summary</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: 'Bullish Prob',
                  value: lastForecast ? `${((lastForecast.probabilities?.bullish ?? 0) * 100).toFixed(1)}%` : '—',
                  sub: 'CNN output',
                },
                {
                  label: 'Bearish Prob',
                  value: lastForecast ? `${((lastForecast.probabilities?.bearish ?? 0) * 100).toFixed(1)}%` : '—',
                  sub: 'CNN output',
                },
                {
                  label: 'Neutral Prob',
                  value: lastForecast ? `${((lastForecast.probabilities?.neutral ?? 0) * 100).toFixed(1)}%` : '—',
                  sub: 'CNN output',
                },
                {
                  label: 'Prediction',
                  value: direction?.toUpperCase() ?? '—',
                  sub: `${confidence?.toFixed(1) ?? '—'}% confidence`,
                },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                  <div className="text-lg font-bold text-indigo-700">{s.value}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">{s.label}</div>
                  <div className="text-[10px] text-indigo-500">{s.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}