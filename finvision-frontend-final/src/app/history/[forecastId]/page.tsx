'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { ArrowLeft, Download, RefreshCw, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfidenceGauge from '@/components/forecasting/ConfidenceGauge';
import PredictionSummary from '@/components/forecasting/PredictionSummary';
import RecommendationCard from '@/components/forecasting/RecommendationCard';
import ExplainabilityPanel from '@/components/forecasting/ExplainabilityPanel';
import CandlestickChart from '@/components/charts/CandlestickChart';
import type { ForecastResult } from '@/types/forecast';
import { forecastService } from '@/services/forecast.service';
import { usePlatform } from '@/providers/PlatformProvider';

export default function ForecastDetailPage() {
  const { forecastId } = useParams();
  const router = useRouter();
  const { lastForecast } = usePlatform();
  const [forecast, setForecast] = useState<ForecastResult | null>(null);

  useEffect(() => {
    const id = String(forecastId);
    if (lastForecast?.id === id) {
      setForecast(lastForecast);
      return;
    }
    forecastService.getForecastById(id).then(setForecast).catch(() => setForecast(lastForecast));
  }, [forecastId, lastForecast]);

  if (!forecast) {
    return (
      <DashboardLayout>
        <PageContainer title="Loading…" subtitle="">
          <p className="text-sm text-[#6B7280]">Loading forecast…</p>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageContainer
        title={`Forecast Detail — ${forecast.asset}`}
        subtitle="Full forecast report with explainability"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button onClick={() => {
  const rows = [
    ['Field', 'Value'],
    ['Forecast ID', forecast.id],
    ['Asset', forecast.asset],
    ['Direction', forecast.direction],
    ['Confidence', forecast.confidence + '%'],
    ['RL Action', forecast.rlRecommendation?.action ?? ''],
    ['Expected Reward', forecast.rlRecommendation?.expectedReward ?? ''],
    ['Rationale', forecast.rationale],
    ['Generated At', new Date().toISOString()],
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinVision_${forecast.asset}_${forecast.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Exported!');
}} className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB]">
  <Download className="w-3.5 h-3.5" /> Export
</button>
            <button onClick={() => {
  router.push(`/forecasting?ticker=${forecast.asset}&algo=${forecast.rlRecommendation?.algorithm ?? 'PPO'}`);
  toast.success(`Re-running ${forecast.asset}...`);
}} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">
  <RefreshCw className="w-3.5 h-3.5" /> Rerun
</button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <PredictionSummary forecast={forecast} />
            <CandlestickChart asset={forecast.asset} />
            <ExplainabilityPanel />
          </div>
          <div className="space-y-4">
            <ConfidenceGauge confidence={forecast.confidence} />
            <RecommendationCard recommendation={forecast.rlRecommendation} />
            <div className="p-4 bg-white rounded-xl border border-[#E5E7EB]">
              <FileText className="w-4 h-4 text-indigo-600 mb-2" />
              <p className="text-xs text-[#6B7280]">{forecast.rationale}</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
