'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const NOTIFS = [
  { label: 'Training Complete', desc: 'When model training finishes', key: 'training' },
  { label: 'New Forecast Ready', desc: 'When a new prediction is generated', key: 'forecast' },
  { label: 'Risk Alerts', desc: 'High volatility or risk threshold breached', key: 'risk' },
  { label: 'Weekly Report', desc: 'Automated weekly performance summary', key: 'report' },
  { label: 'Model Drift', desc: 'When model accuracy drops below threshold', key: 'drift' },
];

export default function NotificationsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ training: true, forecast: true, risk: true, report: false, drift: true });
  return (
    <DashboardLayout>
      <PageContainer title="Notifications" subtitle="Configure alert preferences and notification channels"
        actions={
          <button onClick={() => {
  localStorage.setItem('fv_notifications', JSON.stringify(enabled));
  toast.success('Notification settings saved!');
}}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-lg">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Alert Types</h3>
            <div className="space-y-3">
              {NOTIFS.map(n => (
                <div key={n.key} className="flex items-center justify-between p-3 rounded-lg border border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <div>
                    <div className="text-xs font-semibold text-[#111827]">{n.label}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{n.desc}</div>
                  </div>
                  <button onClick={() => setEnabled(p => ({ ...p, [n.key]: !p[n.key] }))}
                    className={`w-10 h-6 rounded-full transition-colors ${enabled[n.key] ? 'bg-indigo-600' : 'bg-[#D1D5DB]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${enabled[n.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
