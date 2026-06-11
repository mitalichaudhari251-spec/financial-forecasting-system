'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Upload, FileText, CheckCircle, X, Loader2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseOHLCVCSV, formatFileSize } from '@/lib/csv-parser';
import { uploadService } from '@/services/upload.service';
import { usePlatform } from '@/providers/PlatformProvider';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  rowCount: number;
  ticker: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { datasets, refresh, setActiveDatasetId } = usePlatform();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploaded, setLastUploaded] = useState<UploadedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (datasets.length) {
      setFiles(
        datasets.map((d) => ({
          id: d.id,
          name: d.name,
          size: `${(d.sizeBytes / 1024).toFixed(1)} KB`,
          rowCount: d.rowCount,
          ticker: d.ticker,
        }))
      );
    }
  }, [datasets]);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList).filter(
      (f) => f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv'
    );

    if (selected.length === 0) {
      toast.error('Please select a CSV file (OHLCV format)');
      return;
    }

    setIsUploading(true);

    for (const file of selected) {
      try {
        const { bars, ticker, errors } = await parseOHLCVCSV(file);
        if (errors.length > 0 && bars.length === 0) {
          toast.error(errors[0]);
          continue;
        }

        const res = await uploadService.uploadCSV({
          filename: file.name,
          ticker,
          bars,
        });

        const dataset = res.dataset;
        const entry: UploadedFile = {
          id: res.datasetId,
          name: file.name,
          size: formatFileSize(file.size),
          rowCount: dataset.schema.rowCount,
          ticker: dataset.ticker,
        };

        setFiles((prev) => [...prev, entry]);
        setLastUploaded(entry);
        setActiveDatasetId(res.datasetId);
        await refresh();
        toast.success(`${file.name} uploaded (${dataset.schema.rowCount} rows)`);
      } catch (err: unknown) {
        const ax = err as { response?: { data?: { error?: string } }; message?: string };
        const msg = ax.response?.data?.error || ax.message || 'Upload failed';
        toast.error(`${file.name}: ${msg}`);
      }
    }

    setIsUploading(false);
  }, [refresh, setActiveDatasetId]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) void processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const onBrowse = () => {
    if (!isUploading) inputRef.current?.click();
  };

  const handleRunForecast = (file: UploadedFile) => {
    router.push(`/forecasting/predictions?source=csv&ticker=${file.ticker}`);
  };

  return (
    <DashboardLayout>
      <PageContainer title="Upload Data" subtitle="Upload CSV files or connect to market data sources">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void processFiles(e.target.files);
              e.target.value = '';
            }}
          />

          <motion.div
            variants={fadeInUp}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={onBrowse}
            className={`bg-white rounded-xl border-2 border-dashed p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
              isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-[#E5E7EB] hover:border-indigo-300 hover:bg-[#F9FAFB]'
            } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-indigo-600" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#111827]">
                {isUploading ? 'Processing CSV…' : 'Drop CSV files here'}
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                or click to browse — columns: Date, Open, High, Low, Close, Volume
              </p>
            </div>
          </motion.div>

          {/* Last uploaded — Run Forecast button */}
          {lastUploaded && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-indigo-800">
                    {lastUploaded.name} uploaded successfully!
                  </p>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    {lastUploaded.ticker} · {lastUploaded.rowCount.toLocaleString()} rows · Ready for forecast
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRunForecast(lastUploaded)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                Run Forecast
              </button>
            </motion.div>
          )}

          {files.length > 0 && (
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-3">Uploaded Files</h3>
              <div className="space-y-2">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <FileText className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[#111827] block truncate">{f.name}</span>
                      <span className="text-[10px] text-[#6B7280]">
                        {f.ticker} · {f.rowCount.toLocaleString()} rows
                      </span>
                    </div>
                    <span className="text-xs text-[#6B7280]">{f.size}</span>
                    <button
                      onClick={() => handleRunForecast(f)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Forecast
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                      className="text-[#9CA3AF] hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}