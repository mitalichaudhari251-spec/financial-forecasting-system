'use client';

import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  confidence?: number;
  threshold?: number;
}

export default function RiskWarning({ confidence = 84.2, threshold = 70 }: Props) {
  if (confidence >= threshold) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200"
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-amber-800">Low Confidence Warning</p>
        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
          Model confidence ({confidence.toFixed(1)}%) is below threshold ({threshold}%). Exercise caution — prediction reliability may be reduced.
        </p>
      </div>
    </motion.div>
  );
}
