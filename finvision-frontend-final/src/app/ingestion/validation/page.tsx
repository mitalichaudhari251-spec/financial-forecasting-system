'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { usePlatform } from '@/providers/PlatformProvider';
import { platformService } from '@/services/platform.service';

export default function ValidationPage() {
  const { activeDatasetId, datasets, setActiveDatasetId } = usePlatform();
  const [result, setResult] = useState<{
    valid: boolean;
    rowCount: number;
    warnings: string[];
    errors: string[];
  } | null>(null);

  useEffect(() => {
    const id = activeDatasetId ?? datasets[0]?.id;
    if (!id) return;
    if (!activeDatasetId) setActiveDatasetId(id);
    platformService.validateDataset(id).then(setResult).catch(() => setResult(null));
  }, [activeDatasetId, datasets, setActiveDatasetId]);

  const checks = [
    { label: 'Row count', ok: (result?.rowCount ?? 0) >= 50, msg: `${result?.rowCount ?? 0} rows` },
    { label: 'Schema valid', ok: result?.valid ?? false, msg: result?.valid ? 'OHLCV columns OK' : 'Validation failed' },
    { label: 'Missing values', ok: (result?.warnings?.length ?? 0) < 3, msg: `${result?.warnings?.length ?? 0} warnings` },
    { label: 'Errors', ok: (result?.errors?.length ?? 0) === 0, msg: `${result?.errors?.length ?? 0} errors` },
  ];

  return (
    <DashboardLayout>
      <PageContainer title="Data Validation" subtitle="Live validation of ingested datasets">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeInUp} className="space-y-2">
            {checks.map((c) => (
              <div key={c.label} className={`flex items-center gap-3 p-4 rounded-xl border ${c.ok ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                {c.ok ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#111827]">{c.label}</p>
                  <p className="text-xs text-[#6B7280]">{c.msg}</p>
                </div>
              </div>
            ))}
          </motion.div>
          {result?.errors.map((e, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <XCircle className="w-4 h-4" /> {e}
            </div>
          ))}
          {result?.warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <AlertTriangle className="w-4 h-4" /> {w}
            </div>
          ))}
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
