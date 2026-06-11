'use client';
import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function MiniCandlestick({ bullish }: { bullish: boolean }) {
  return (
    <svg viewBox="0 0 20 40" className="w-full h-full">
      <line x1="10" y1="2" x2="10" y2="12" stroke={bullish ? '#16A34A' : '#DC2626'} strokeWidth="1.5" />
      <rect x="4" y="12" width="12" height="16" fill={bullish ? '#16A34A' : '#DC2626'} rx="1" />
      <line x1="10" y1="28" x2="10" y2="38" stroke={bullish ? '#16A34A' : '#DC2626'} strokeWidth="1.5" />
    </svg>
  );
}

export default function CandlestickPage() {
  const [windowIdx, setWindowIdx] = useState(1);
  const [ticker, setTicker] = useState('AAPL');
  const candles = useMemo(() => Array.from({ length: 30 }, () => Math.random() > 0.48), [windowIdx]);

  useEffect(() => {
    const t = localStorage.getItem('fv_ticker');
    if (t) setTicker(t);
  }, []);

  const handleGenerate = async () => {
    const processedId = localStorage.getItem('fv_processedId') || localStorage.getItem('fv_datasetId');
    if (!processedId) { toast.error('Pehle upload aur preprocessing karo!'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/data/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('fv_token=')[1]?.split(';')[0] || 'demo-token'}`,
        },
        body: JSON.stringify({ datasetId: processedId, types: ['candlestick'], resolution: 30 }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fv_jobId', data.data.jobId);
        toast.success(`Window ${windowIdx} generated!`);
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch {
      toast.error('Backend se connect nahi ho paya');
    }
  };

  return (
    <DashboardLayout>
      <PageContainer title="Candlestick Charts" subtitle="224×224 candlestick chart images for CNN input"
        actions={
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Play className="w-3.5 h-3.5" /> Generate
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">Window {windowIdx} — {ticker} Candlestick</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setWindowIdx(p => Math.max(1, p - 1))} className="p-1 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs text-[#6B7280]">W{windowIdx}</span>
                <button onClick={() => setWindowIdx(p => p + 1)} className="p-1 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="bg-[#0F172A] rounded-xl p-4 flex items-end gap-1" style={{ height: 220 }}>
              {candles.map((bull, i) => (
                <div key={i} className="flex-1" style={{ height: `${40 + Math.random() * 60}%` }}>
                  <MiniCandlestick bullish={bull} />
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[10px] text-[#6B7280]">
              <span>Resolution: 224×224px</span><span>Window: 30 days</span><span>Pattern: Bullish Engulfing</span>
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}