'use client';

import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animation-utils';
import { DISCLAIMER } from '@/lib/constants';

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  showDisclaimer?: boolean;
}

export default function PageContainer({ title, subtitle, actions, children, showDisclaimer = true }: Props) {
  return (
    <motion.div
      {...pageTransition}
      className="min-h-[calc(100vh-56px)] flex flex-col"
    >
      {/* Page header */}
      <div className="px-6 py-5 bg-white border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#111827] leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {children}
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="px-6 py-3 border-t border-[#E5E7EB]">
          <p className="disclaimer">{DISCLAIMER}</p>
        </div>
      )}
    </motion.div>
  );
}
