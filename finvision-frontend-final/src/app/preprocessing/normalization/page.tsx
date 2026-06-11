'use client';
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NormalizationPage() {
  const [method, setMethod] = useState('minmax');
  const [applied, setApplied] = useState(false);
  const data = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    i, raw: 150 + Math.sin(i * 0.3) * 20 + i * 0.5 + Math.random() * 3,
    normalized: Math.tanh(Math.sin(i * 0.3) * 0.8 + i * 0.018),
  })), []);

  const ic = "w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  const handleApply = async () => {
    const datasetId = localStorage.getItem('fv_datasetId');
    if (!datasetId) { toast.error('Please upload the CSV file first'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/data/preprocess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('fv_token=')[1]?.split(';')[0] || 'demo-token'}`,
        },
        body: JSON.stringify({ datasetId, config: { normalize: true, method } }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fv_processedId', data.data.processedId ?? datasetId);
        setApplied(true);
        toast.success('Normalization applied!');
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch {
      toast.error('Could not connect to the backend');
    }
  };

  return (
    <DashboardLayout>
      <PageContainer title="Normalization" subtitle="Configure and apply data normalization to the pipeline"
        actions={
          <button onClick={handleApply}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Settings2 className="w-3.5 h-3.5" /> Apply
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">Normalization Config</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Method</label>
                  <select value={method} onChange={e => setMethod(e.target.value)} className={ic}>
                    <option value="minmax">Min-Max Scaling</option>
                    <option value="zscore">Z-Score Standardization</option>
                    <option value="robust">Robust Scaler</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Min', value: method === 'minmax' ? '0.0' : 'N/A' },
                    { label: 'Max', value: method === 'minmax' ? '1.0' : 'N/A' },
                    { label: 'Mean', value: '0.523' }, { label: 'Std', value: '0.187' },
                  ].map(s => (
                    <div key={s.label} className="p-2 bg-[#F9FAFB] rounded-lg border border-[#F3F4F6] text-center">
                      <div className="text-[10px] text-[#9CA3AF]">{s.label}</div>
                      <div className="text-xs font-bold text-[#374151]">{s.value}</div>
                    </div>
                  ))}
                </div>
                {applied && <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <span className="text-xs text-green-700 font-medium">✓ Normalization applied</span>
                </div>}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">Raw vs Normalized</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="i" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="raw" stroke="#9CA3AF" strokeWidth={1.5} dot={false} name="Raw" />
                  <Line type="monotone" dataKey="normalized" stroke="#4F46E5" strokeWidth={2} dot={false} name="Normalized" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}