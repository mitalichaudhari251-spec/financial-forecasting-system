'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? 'GASF' : i % 3 === 1 ? 'GADF' : 'Candlestick',
  pattern: ['Bullish Engulfing', 'Hammer', 'Doji', 'Head & Shoulders'][i % 4],
  window: i + 1,
  label: i % 2 === 0 ? 'Bullish' : 'Bearish',
}));

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const types = ['All', 'Candlestick', 'GASF', 'GADF'];
  const filtered = filter === 'All' ? MOCK : MOCK.filter(m => m.type === filter);

  return (
    <DashboardLayout>
      <PageContainer title="Image Gallery" subtitle="Browse and export generated chart images"
        actions={
          <button onClick={() => {
  if (filtered.length === 0) { toast.error('No images to export'); return; }
  const rows = [
    ['Window', 'Type', 'Pattern', 'Label'],
    ...filtered.map(img => [
      `W${img.window}`, img.type, img.pattern, img.label
    ])
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinVision_Images_${filter}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filtered.length} images exported!`);
}}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> Export All
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="flex gap-2">
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>
                {t}
              </button>
            ))}
          </motion.div>
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(img => (
              <div key={img.id} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-indigo-300 transition-colors">
                <div className={`h-32 flex items-center justify-center text-[10px] font-mono text-white ${img.type === 'Candlestick' ? 'bg-[#0F172A]' : img.type === 'GASF' ? 'bg-indigo-900' : 'bg-teal-900'}`}>
                  <div className="text-center opacity-60">
                    <div>{img.type}</div>
                    <div>224×224px</div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-[#111827]">W{img.window}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{img.pattern}</div>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${img.label === 'Bullish' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {img.label}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
