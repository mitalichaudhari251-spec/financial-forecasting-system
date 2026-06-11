'use client';
import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GAFPage() {
  const [type, setType] = useState<'GASF' | 'GADF'>('GASF');
  const [ticker, setTicker] = useState('AAPL');
  const cells = useMemo(() => Array.from({ length: 900 }, (_, i) => {
    const r = Math.floor(i / 30), c = i % 30;
    return Math.cos(((r + c) / 30) * Math.PI + Math.random() * 0.5);
  }), [type]);

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
        body: JSON.stringify({ datasetId: processedId, types: ['gaf'], resolution: 30 }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fv_jobId', data.data.jobId);
        toast.success(`${type} image generated!`);
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch {
      toast.error('Backend se connect nahi ho paya');
    }
  };

  return (
    <DashboardLayout>
      <PageContainer title="GAF Images" subtitle="Gramian Angular Field image generation for time series encoding"
        actions={
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Play className="w-3.5 h-3.5" /> Generate
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827]">{type} Image — {ticker} Window 1</h3>
              <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-lg">
                {(['GASF', 'GADF'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`px-4 py-1 rounded-md text-xs font-semibold transition-all ${type === t ? 'bg-white shadow-sm text-[#111827]' : 'text-[#6B7280]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-0.5 mx-auto" style={{ gridTemplateColumns: 'repeat(30, 1fr)', maxWidth: 300 }}>
              {cells.map((v, i) => {
                const intensity = (v + 1) / 2;
                const r = type === 'GASF' ? Math.round(79 * intensity) : Math.round(13 * intensity);
                const g = type === 'GASF' ? Math.round(70 * intensity) : Math.round(148 * intensity);
                const b = type === 'GASF' ? Math.round(229 * intensity) : Math.round(136 * intensity);
                return <div key={i} className="aspect-square" style={{ backgroundColor: `rgb(${r},${g},${b})` }} />;
              })}
            </div>
            <p className="text-[10px] text-[#9CA3AF] mt-3 text-center">30×30 preview (actual: 224×224px)</p>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}