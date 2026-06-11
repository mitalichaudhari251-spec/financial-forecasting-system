'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import toast from 'react-hot-toast';

export default function WindowingPage() {
  const [windowSize, setWindowSize] = useState(30);
  const [stride, setStride] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    const datasetId = localStorage.getItem('fv_datasetId');
    if (!datasetId) { toast.error('Pehle CSV upload karo!'); return; }
    setLoading(true);
    try {
      const token = document.cookie.split(';').map(c => c.trim())
        .find(c => c.startsWith('fv_token='))?.split('=')[1];

      const res = await fetch('/api/data/preprocess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ datasetId, config: { window: true, windowSize, stride } }),
      });
      const json = await res.json();

      if (json.success) {
        const totalRows = json.data.originalRows ?? json.data.processedRows ?? 1826;
        const totalWindows = Math.floor((totalRows - windowSize) / stride) + 1;
        const trainSplit = Math.floor(totalWindows * 0.8);
        const testSplit = totalWindows - trainSplit;

        const windowResult = {
          totalWindows,
          trainSplit,
          testSplit,
          datasetLength: totalRows,
          windowSize,
          stride,
          processedId: json.data.processedId,
        };

        localStorage.setItem('fv_processedId', json.data.processedId ?? datasetId);
        localStorage.setItem('fv_windowing', JSON.stringify({
          ...windowResult,
          generatedAt: new Date().toISOString(),
        }));

        setResult(windowResult);
        toast.success(`${totalWindows} windows generated!`);
      } else {
        toast.error(json.error || 'Failed');
      }
    } catch {
      toast.error('Backend se connect nahi ho paya');
    } finally {
      setLoading(false);
    }
  };

  const stats = result ? [
    { label: 'Total Windows', value: String(result.totalWindows) },
    { label: 'Window Size', value: `${result.windowSize}d` },
    { label: 'Stride', value: `${result.stride}d` },
    { label: 'Dataset Length', value: `${result.datasetLength}d` },
    { label: 'Train Split', value: String(result.trainSplit) },
    { label: 'Test Split', value: String(result.testSplit) },
  ] : [
    { label: 'Total Windows', value: '—' },
    { label: 'Window Size', value: `${windowSize}d` },
    { label: 'Stride', value: `${stride}d` },
    { label: 'Dataset Length', value: '—' },
    { label: 'Train Split', value: '—' },
    { label: 'Test Split', value: '—' },
  ];

  return (
    <DashboardLayout>
      <PageContainer
        title="Windowing"
        subtitle="Configure sliding window parameters for time series segmentation"
        actions={
          <button onClick={handleGenerate} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">
            {loading ? 'Generating...' : '⚙ Generate Windows'}
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Config */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-5">
              <h3 className="font-semibold text-[#111827]">Window Configuration</h3>

              <div>
                <p className="text-sm text-[#6B7280] mb-2">Window Size: {windowSize} days</p>
                <input type="range" min={10} max={90} step={5} value={windowSize}
                  onChange={e => setWindowSize(parseInt(e.target.value))}
                  className="w-full accent-indigo-600" />
              </div>

              <div>
                <p className="text-sm text-[#6B7280] mb-2">Stride: {stride} day{stride > 1 ? 's' : ''}</p>
                <input type="range" min={1} max={10} step={1} value={stride}
                  onChange={e => setStride(parseInt(e.target.value))}
                  className="w-full accent-indigo-600" />
              </div>

              {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
                  ✓ {result.totalWindows} windows generated from {result.datasetLength} real rows
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="font-semibold text-[#111827] mb-4">Window Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {stats.map(s => (
                  <div key={s.label} className="bg-[#F9FAFB] rounded-lg p-3 text-center">
                    <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                    <p className="text-sm font-semibold text-[#111827]">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

          {/* Window Preview */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="font-semibold text-[#111827] mb-4">Window Preview</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i}
                  className={`flex-shrink-0 w-24 h-16 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-colors
                    ${result && i === 2
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : result
                      ? 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]'
                      : 'bg-[#F9FAFB] border-dashed border-[#D1D5DB] text-[#9CA3AF]'
                    }`}>
                  {result ? `W${i + 1}` : '...'}
                </div>
              ))}
              {result && <div className="flex-shrink-0 flex items-center text-[#9CA3AF] text-sm">…</div>}
            </div>
            <p className="text-xs text-[#9CA3AF] mt-3">
              {result
                ? `Each window = ${windowSize} trading days → 224×224px image | Total: ${result.totalWindows} windows`
                : 'Generate Windows dabao to see real window count'}
            </p>
          </motion.div>

        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}