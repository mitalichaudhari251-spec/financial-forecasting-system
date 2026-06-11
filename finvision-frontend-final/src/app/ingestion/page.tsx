'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Upload, FileText, CheckCircle, AlertTriangle, X, Calendar, Clock, BarChart2, Settings2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const TIMEFRAMES = ['Daily', 'Hourly', 'Weekly'];
const NORM_METHODS = ['Min-Max Scaling', 'Z-Score Standardization', 'Robust Scaler'];
const OUTLIER_METHODS = ['IQR Method', 'Z-Score', 'None'];

interface ValidationResult {
  valid: boolean;
  rowCount: number;
  colCount: number;
  missingValues: number;
  warnings: string[];
  errors: string[];
}

const MOCK_PREVIEW = [
  { date: '2024-01-02', open: 185.23, high: 188.44, low: 184.91, close: 187.15, volume: 55_834_210 },
  { date: '2024-01-03', open: 187.15, high: 189.02, low: 185.83, close: 184.92, volume: 51_234_890 },
  { date: '2024-01-04', open: 184.92, high: 186.77, low: 183.40, close: 185.64, volume: 49_123_400 },
  { date: '2024-01-05', open: 185.64, high: 187.89, low: 185.01, close: 186.78, volume: 48_234_100 },
  { date: '2024-01-08', open: 186.78, high: 191.22, low: 186.45, close: 189.30, volume: 62_384_200 },
];

export default function IngestionPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'upload' | 'ticker'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [ticker, setTicker] = useState('');
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [timeframe, setTimeframe] = useState('Daily');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [windowSize, setWindowSize] = useState(30);
  const [normMethod, setNormMethod] = useState('Min-Max Scaling');
  const [outlierMethod, setOutlierMethod] = useState('IQR Method');
  const [diffOrder, setDiffOrder] = useState(0.4);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    simulateUpload();
  }, []);

  const simulateUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 120));
      setUploadProgress(i);
    }
    setUploading(false);
    setValidation({
      valid: true, rowCount: 1826, colCount: 6, missingValues: 3,
      warnings: ['3 missing values detected — will be forward-filled', 'Volume column has 2 outliers (IQR method)'],
      errors: [],
    });
    setShowPreview(true);
    toast.success('File uploaded and validated');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xlsx'] },
    multiple: false,
  });

  const handleFetchTicker = async () => {
    if (!ticker) { toast.error('Enter a ticker symbol'); return; }
    setUploading(true);
    setUploadProgress(0);
    for (let i = 0; i <= 100; i += 15) {
      await new Promise((r) => setTimeout(r, 100));
      setUploadProgress(Math.min(i, 100));
    }
    setUploading(false);
    setValidation({ valid: true, rowCount: 756, colCount: 6, missingValues: 0, warnings: [], errors: [] });
    setShowPreview(true);
    toast.success(`${ticker} data fetched successfully`);
  };

  const inputCls = "w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all";
  const labelCls = "block text-xs font-semibold text-[#374151] mb-1.5";

  return (
    <DashboardLayout>
      <PageContainer
        title="Data Ingestion"
        subtitle="Upload market data or fetch via ticker symbol"
        actions={
          showPreview && (
            <button
              onClick={() => router.push('/preprocessing')}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Continue to Preprocessing <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">

          {/* Source toggle */}
          <motion.div variants={fadeInUp} className="flex gap-1 p-1 bg-[#F3F4F6] rounded-xl w-fit">
            {(['upload', 'ticker'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  tab === t ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]' : 'text-[#6B7280] hover:text-[#374151]'
                )}>
                {t === 'upload' ? '📁 Upload CSV' : '🔍 Fetch Ticker'}
              </button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Input panel */}
            <div className="lg:col-span-2 space-y-4">

              {/* Upload / Ticker input */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                {tab === 'upload' ? (
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827] mb-4">Upload Market Data (CSV / XLSX)</h3>
                    <div
                      {...getRootProps()}
                      className={cn(
                        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                        isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-[#E5E7EB] hover:border-indigo-300 hover:bg-[#F9FAFB]',
                        file && 'border-green-400 bg-green-50'
                      )}
                    >
                      <input {...getInputProps()} />
                      {file ? (
                        <div className="flex flex-col items-center gap-3">
                          <CheckCircle className="w-10 h-10 text-green-500" />
                          <div>
                            <p className="text-sm font-semibold text-green-700">{file.name}</p>
                            <p className="text-xs text-green-600 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setFile(null); setValidation(null); setShowPreview(false); }}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1">
                            <X className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#374151]">
                              {isDragActive ? 'Drop your file here' : 'Drag & drop or click to browse'}
                            </p>
                            <p className="text-xs text-[#9CA3AF] mt-1">Supports CSV, XLSX · OHLCV format required</p>
                          </div>
                          <div className="text-xs text-[#9CA3AF]">Expected columns: date, open, high, low, close, volume</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827] mb-4">Fetch Market Data via Ticker</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelCls}>Ticker Symbol</label>
                        <div className="relative">
                          <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <input
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            placeholder="e.g. AAPL, MSFT, BTC-USD, SPY"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] font-mono font-semibold placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                          />
                        </div>
                        <p className="text-xs text-[#9CA3AF] mt-1">Powered by Yahoo Finance API</p>
                      </div>
                      <div>
                        <label className={labelCls}>Start Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>End Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Timeframe</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all appearance-none">
                            {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleFetchTicker}
                          disabled={uploading}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          {uploading
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <BarChart2 className="w-4 h-4" />
                          }
                          {uploading ? 'Fetching…' : 'Fetch Data'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <AnimatePresence>
                  {uploading && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-[#6B7280]">Processing…</span>
                        <span className="text-xs font-semibold text-indigo-600">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-[#9CA3AF]">
                        {['Upload', 'Parse', 'Validate', 'Index'].map((step, i) => (
                          <span key={step} className={cn(uploadProgress > i * 25 ? 'text-indigo-600 font-medium' : '')}>
                            {step}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Validation panel */}
              <AnimatePresence>
                {validation && (
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible"
                    className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <h3 className="text-sm font-semibold text-[#111827]">Dataset Validation</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: 'Rows', value: validation.rowCount.toLocaleString() },
                        { label: 'Columns', value: validation.colCount },
                        { label: 'Missing Values', value: validation.missingValues, color: validation.missingValues > 0 ? 'text-amber-600' : 'text-green-600' },
                        { label: 'Schema', value: 'Valid', color: 'text-green-600' },
                      ].map((m) => (
                        <div key={m.label} className="p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6] text-center">
                          <div className="text-xs text-[#9CA3AF]">{m.label}</div>
                          <div className={cn('text-sm font-bold mt-1', m.color || 'text-[#111827]')}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {validation.warnings.map((w, i) => (
                      <div key={i} className="warning-banner mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}

                    {validation.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-2">
                        <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{e}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data preview */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible"
                    className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#6B7280]" />
                        <span className="text-sm font-semibold text-[#111827]">Data Preview</span>
                        <span className="text-xs text-[#9CA3AF]">(first 5 rows)</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                            {['Date', 'Open', 'High', 'Low', 'Close', 'Volume'].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-[#9CA3AF] font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_PREVIEW.map((row, i) => (
                            <tr key={i} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB] transition-colors">
                              <td className="px-4 py-2.5 font-mono text-[#374151]">{row.date}</td>
                              <td className="px-4 py-2.5 font-mono text-[#374151]">{row.open.toFixed(2)}</td>
                              <td className="px-4 py-2.5 font-mono text-green-600 font-medium">{row.high.toFixed(2)}</td>
                              <td className="px-4 py-2.5 font-mono text-red-500 font-medium">{row.low.toFixed(2)}</td>
                              <td className="px-4 py-2.5 font-mono font-semibold text-[#111827]">{row.close.toFixed(2)}</td>
                              <td className="px-4 py-2.5 font-mono text-[#6B7280]">{row.volume.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Preprocessing config */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-4 h-4 text-[#6B7280]" />
                  <h3 className="text-sm font-semibold text-[#111827]">Preprocessing Config</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>
                      Sliding Window Size <span className="text-indigo-600 font-bold">{windowSize}</span>
                    </label>
                    <input type="range" min={10} max={120} step={5} value={windowSize}
                      onChange={(e) => setWindowSize(parseInt(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                      <span>10</span><span>120 days</span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Fractional Differencing (d={diffOrder})
                    </label>
                    <input type="range" min={0} max={1} step={0.05} value={diffOrder}
                      onChange={(e) => setDiffOrder(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                      <span>0 (raw)</span><span>1 (diff)</span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Normalization Method</label>
                    <select value={normMethod} onChange={(e) => setNormMethod(e.target.value)} className={inputCls}>
                      {NORM_METHODS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Outlier Handling</label>
                    <select value={outlierMethod} onChange={(e) => setOutlierMethod(e.target.value)} className={inputCls}>
                      {OUTLIER_METHODS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Timeframe</label>
                    <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={inputCls}>
                      {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {showPreview && (
                  <button
                    onClick={() => { toast.success('Config saved'); router.push('/preprocessing'); }}
                    className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Apply Config <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Pipeline timeline */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <h3 className="text-sm font-semibold text-[#111827] mb-4">Pipeline Steps</h3>
                <div className="space-y-3">
                  {[
                    { step: '1', label: 'Data Ingestion', status: showPreview ? 'done' : 'active' },
                    { step: '2', label: 'Preprocessing', status: showPreview ? 'active' : 'pending' },
                    { step: '3', label: 'Image Generation', status: 'pending' },
                    { step: '4', label: 'CNN Analysis', status: 'pending' },
                    { step: '5', label: 'RL Forecasting', status: 'pending' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        s.status === 'done' ? 'bg-green-500 text-white' :
                          s.status === 'active' ? 'bg-indigo-600 text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                      )}>
                        {s.status === 'done' ? '✓' : s.step}
                      </div>
                      <span className={cn('text-sm', s.status === 'pending' ? 'text-[#9CA3AF]' : 'text-[#374151] font-medium')}>
                        {s.label}
                      </span>
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
