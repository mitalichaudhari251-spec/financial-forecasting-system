'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Save, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [name, setName] = useState('Quant Researcher');
const [email, setEmail] = useState('quant@finvision.ai');
const [role, setRole] = useState('analyst');

useEffect(() => {
  const stored = localStorage.getItem('fv_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.name) setName(parsed.name);
      if (parsed.email) setEmail(parsed.email);
      if (parsed.role) setRole(parsed.role);
    } catch {}
  }
}, []);
  const ic = "w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all";
  return (
    <DashboardLayout>
      <PageContainer title="Profile Settings" subtitle="Manage your account details and preferences"
        actions={
         <button onClick={() => {
  const existing = JSON.parse(localStorage.getItem('fv_user') || '{}');
  localStorage.setItem('fv_user', JSON.stringify({ ...existing, name, email, role }));
  toast.success('Profile saved!');
}}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        }>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-lg space-y-4">
          <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
  {name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
</div>
              <div>
                <div className="text-sm font-semibold text-[#111827]">{name}</div>
                <div className="text-xs text-[#6B7280]">{role}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className={ic} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className={ic} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className={ic}>
                  <option value="analyst">Analyst</option>
                  <option value="quant">Quant Researcher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
