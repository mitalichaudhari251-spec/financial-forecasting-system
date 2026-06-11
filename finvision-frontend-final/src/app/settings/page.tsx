'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { useSettingsStore } from '@/store/settingsStore';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Save, User, Bell, Sliders, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TIMEFRAMES = ['daily', 'hourly', 'weekly'];
const HORIZONS = ['1d', '7d', '30d'];
const RL_ALGOS = ['PPO', 'DQN'];

export default function SettingsPage() {
  const { preferences, setPreferences } = useSettingsStore();
  const [profile, setProfile] = useState({ name: 'Quant Researcher', email: 'researcher@finvision.ai', org: 'FinVision Research', timezone: 'UTC' });

useEffect(() => {
  const stored = localStorage.getItem('fv_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      setProfile(p => ({ ...p, name: parsed.name || p.name, email: parsed.email || p.email }));
    } catch {}
  }
}, []);

  const inputCls = "w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all";
  const labelCls = "block text-xs font-semibold text-[#374151] mb-1.5";

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
      <span className="text-sm text-[#374151]">{label}</span>
      <button onClick={onChange}
        className={cn('relative w-10 h-5 rounded-full transition-colors', value ? 'bg-indigo-600' : 'bg-[#D1D5DB]')}>
        <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', value ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <PageContainer
        title="Settings"
        subtitle="Platform preferences and configuration"
        actions={
          <button onClick={() => {
  const existing = JSON.parse(localStorage.getItem('fv_user') || '{}');
  localStorage.setItem('fv_user', JSON.stringify({ ...existing, name: profile.name, email: profile.email }));
  toast.success('Settings saved!');
}}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl space-y-4">

          {/* Profile */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">Profile</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
               <span className="text-xl font-bold text-indigo-700">{profile.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-[#111827]">{profile.name}</div>
                <div className="text-xs text-[#6B7280]">{profile.email}</div>
                <div className="text-xs text-indigo-600 mt-1 cursor-pointer hover:underline">Change avatar</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Organization</label>
                <input type="text" defaultValue="FinVision Research" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Timezone</label>
                <select className={inputCls} defaultValue="UTC">
                  {['UTC', 'America/New_York', 'America/Chicago', 'Europe/London', 'Asia/Tokyo'].map(tz => (
                    <option key={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Analysis Preferences */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">Analysis Preferences</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Default Timeframe</label>
                <select value={preferences.defaultTimeframe}
                  onChange={e => setPreferences({ defaultTimeframe: e.target.value as 'daily' | 'hourly' | 'weekly' })}
                  className={inputCls}>
                  {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Default Forecast Horizon</label>
                <select value={preferences.defaultHorizon}
                  onChange={e => setPreferences({ defaultHorizon: e.target.value as '1d' | '7d' | '30d' })}
                  className={inputCls}>
                  {HORIZONS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Default RL Algorithm</label>
                <select value={preferences.defaultRLAlgorithm}
                  onChange={e => setPreferences({ defaultRLAlgorithm: e.target.value as 'PPO' | 'DQN' })}
                  className={inputCls}>
                  {RL_ALGOS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Confidence Threshold <span className="text-indigo-600">{preferences.confidenceThreshold}%</span>
                </label>
                <input type="range" min={50} max={95} step={5} value={preferences.confidenceThreshold}
                  onChange={e => setPreferences({ confidenceThreshold: parseInt(e.target.value) })}
                  className="w-full mt-2 accent-indigo-600" />
                <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                  <span>50%</span><span>95%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Display & Notifications */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">Display & Features</h3>
            </div>
            <div className="space-y-1">
              <Toggle
                label="Enable 3D Visualizations"
                value={preferences.enable3D}
                onChange={() => setPreferences({ enable3D: !preferences.enable3D })}
              />
              <Toggle
                label="Push Notifications"
                value={preferences.enableNotifications}
                onChange={() => setPreferences({ enableNotifications: !preferences.enableNotifications })}
              />
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-semibold text-[#111827]">Notification Preferences</h3>
            </div>
            <div className="space-y-1">
              {[
                'Forecast completed',
                'Low confidence alert (below threshold)',
                'Training completed',
                'Backtest finished',
                'Model version update',
              ].map(label => (
                <Toggle key={label} label={label} value={true} onChange={() => {}} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
