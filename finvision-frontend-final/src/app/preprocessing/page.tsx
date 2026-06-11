'use client';
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings2, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PreprocessingPage() {
  const router = useRouter();
  const [windowSize, setWindowSize] = useState(30);
  const [diffOrder, setDiffOrder] = useState(0.4);
  const [normMethod, setNormMethod] = useState('minmax');
  const [outlierMethod, setOutlierMethod] = useState('iqr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const data = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    i,
    raw: 150 + Math.sin(i * 0.3) * 20 + i * 0.5 + Math.random() * 3,
    normalized: Math.tanh(Math.sin(i * 0.3) * 0.8 + i * 0.018),
    differenced: Math.sin(i * 0.3) * 0.8 + (Math.random() - 0.5) * 0.3,
  })), []);

  const handleApply = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setDone(true);
    toast.success('Preprocessing complete — 61 windows generated');
  };

  const ic = "w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all";

  return (
    <DashboardLayout>
      <PageContainer title="Preprocessing Pipeline" subtitle="Normalization, fractional differencing, and sliding windows"
        actions={
          <div className="flex gap-2">
            <button onClick={handleApply} disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors">
              {isProcessing ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Settings2 className="w-3.5 h-3.5" />}
              {isProcessing ? 'Processing…' : 'Apply Pipeline'}
            </button>
            {done && (
              <button onClick={() => router.push('/image-generation')}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
                <ArrowRight className="w-3.5 h-3.5" /> Generate Images
              </button>
            )}
          </div>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">Pipeline Config</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Window Size <span className="text-indigo-600">{windowSize} days</span></label>
                  <input type="range" min={10} max={90} step={5} value={windowSize} onChange={e => setWindowSize(parseInt(e.target.value))} className="w-full accent-indigo-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Fractional Diff d={diffOrder.toFixed(2)}</label>
                  <input type="range" min={0} max={1} step={0.05} value={diffOrder} onChange={e => setDiffOrder(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Normalization</label>
                  <select value={normMethod} onChange={e => setNormMethod(e.target.value)} className={ic}>
                    <option value="minmax">Min-Max Scaling</option>
                    <option value="zscore">Z-Score</option>
                    <option value="robust">Robust Scaler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Outlier Handling</label>
                  <select value={outlierMethod} onChange={e => setOutlierMethod(e.target.value)} className={ic}>
                    <option value="iqr">IQR Method</option>
                    <option value="zscore">Z-Score</option>
                    <option value="none">None</option>
                  </select>
                </div>
                {done && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-700 font-medium">61 windows generated</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="text-sm font-semibold text-[#111827] mb-4">Raw vs Normalized Price Series</h3>
                <ResponsiveContainer width="100%" height={160}>
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
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="text-sm font-semibold text-[#111827] mb-4">Fractionally Differenced (d={diffOrder.toFixed(2)})</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="i" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="differenced" stroke="#0D9488" strokeWidth={2} dot={false} name="Differenced" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <h3 className="text-xs font-semibold text-[#374151] mb-3">Pipeline Statistics</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Windows', value: String(Math.floor(1826 / windowSize)) },
                    { label: 'Window Size', value: `${windowSize}` },
                    { label: 'Stationary', value: 'ADF ✓' },
                    { label: 'Outliers', value: '5 removed' },
                    { label: 'Missing', value: '3 filled' },
                    { label: 'Method', value: normMethod },
                  ].map(s => (
                    <div key={s.label} className="p-2 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                      <div className="text-[10px] text-[#9CA3AF]">{s.label}</div>
                      <div className="text-xs font-bold text-[#374151] mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
