'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PreferencesPage() {
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [defaultAsset, setDefaultAsset] = useState('AAPL');
  const ic = "w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all";
  return (
    <DashboardLayout>
      <PageContainer title="Preferences" subtitle="Customize your FinVision-RL experience"
        actions={
          <button onClick={() => {
  localStorage.setItem('fv_preferences', JSON.stringify({ theme, currency, timezone, defaultAsset }));
  toast.success('Preferences saved!');
}}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-lg">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Theme</label>
                <select value={theme} onChange={e => setTheme(e.target.value)} className={ic}>
                  <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Default Asset</label>
                <select value={defaultAsset} onChange={e => setDefaultAsset(e.target.value)} className={ic}>
                  <option>AAPL</option><option>MSFT</option><option>GOOGL</option><option>TSLA</option><option>AMZN</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Currency Display</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className={ic}>
                  <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Timezone</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} className={ic}>
                  <option>UTC</option><option>US/Eastern</option><option>US/Pacific</option><option>Asia/Kolkata</option><option>Europe/London</option>
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
