'use client';

import { useRouter } from 'next/navigation';
import { Upload, BarChart2, Play, Cpu, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { ROUTES } from '@/config/routes';

const ACTIONS = [
  { label: 'Upload CSV', icon: Upload, href: ROUTES.INGESTION.UPLOAD, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', description: 'Import market data' },
  { label: 'Enter Ticker', icon: Search, href: ROUTES.INGESTION.ROOT, color: 'bg-teal-50 text-teal-700 hover:bg-teal-100', description: 'Fetch live data' },
  { label: 'Start Training', icon: Play, href: ROUTES.TRAINING.ROOT, color: 'bg-green-50 text-green-700 hover:bg-green-100', description: 'Train CNN + RL' },
  { label: 'Run Inference', icon: Cpu, href: ROUTES.FORECASTING.ROOT, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', description: 'Generate forecast' },
  { label: 'Backtest', icon: BarChart2, href: ROUTES.ANALYTICS.BACKTESTING, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', description: 'Evaluate strategy' },
  { label: 'Generate Report', icon: FileText, href: ROUTES.REPORTS.ROOT, color: 'bg-rose-50 text-rose-700 hover:bg-rose-100', description: 'Export analysis' },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h3 className="text-sm font-semibold text-[#111827] mb-4">Quick Actions</h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-2"
      >
        {ACTIONS.map((action) => (
          <motion.button
            key={action.label}
            variants={fadeInUp}
            onClick={() => router.push(action.href)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2.5 p-3 rounded-lg transition-colors text-left ${action.color}`}
          >
            <action.icon className="w-4 h-4 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold">{action.label}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{action.description}</div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
