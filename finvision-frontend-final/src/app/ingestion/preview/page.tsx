'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { usePlatform } from '@/providers/PlatformProvider';
import { platformService } from '@/services/platform.service';

const COLUMNS = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];

export default function PreviewPage() {
  const { activeDatasetId, datasets, setActiveDatasetId } = usePlatform();
  const [preview, setPreview] = useState<{
    ticker: string;
    bars: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
    startDate: string;
    endDate: string;
    schema: { rowCount: number };
  } | null>(null);

  useEffect(() => {
    const id = activeDatasetId ?? datasets[0]?.id;
    if (!id) return;
    if (!activeDatasetId) setActiveDatasetId(id);
    platformService.previewDataset(id, 20).then(setPreview).catch(() => setPreview(null));
  }, [activeDatasetId, datasets, setActiveDatasetId]);

  const rows = preview?.bars ?? [];

  return (
    <DashboardLayout>
      <PageContainer title="Data Preview" subtitle="Live preview of uploaded OHLCV datasets">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {datasets.length > 1 && (
            <select
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-2"
              value={activeDatasetId ?? datasets[0]?.id ?? ''}
              onChange={(e) => setActiveDatasetId(e.target.value)}
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Rows', value: preview?.schema.rowCount?.toLocaleString() ?? '—' },
              { label: 'Date Range', value: preview ? `${preview.startDate} → ${preview.endDate}` : '—' },
              { label: 'Asset', value: preview?.ticker ?? '—' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
                <div className="text-lg font-bold text-[#111827]">{s.value}</div>
                <div className="text-xs text-[#6B7280]">{s.label}</div>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#F3F4F6]">
              <h3 className="text-sm font-semibold text-[#111827]">
                OHLCV Data — {preview?.ticker ?? 'No dataset'} (live)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F9FAFB]">
                  <tr>{COLUMNS.map((c) => <th key={c} className="px-4 py-3 text-left font-semibold text-[#374151]">{c}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 font-mono">{row.date}</td>
                      <td className="px-4 py-3 font-mono">{row.open.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono">{row.high.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono">{row.low.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono">{row.close.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono">{row.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
