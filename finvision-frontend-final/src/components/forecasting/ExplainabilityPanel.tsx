'use client';

import { Info, Eye, Layers } from 'lucide-react';

interface Props {
  text?: string;
  patternCorrelation?: string;
}

const DEFAULT_TEXT = 'The CNN backbone (ResNet-18) identified strong upward momentum signals in the GAF image representation. Activation maps highlight key pattern drivers consistent with a bullish breakout scenario.';
const DEFAULT_PATTERN = 'Bullish Engulfing and Hammer patterns detected with 89% and 76% confidence respectively. Historical backtests show 74% win rate for this combination on AAPL.';

export default function ExplainabilityPanel({ text = DEFAULT_TEXT, patternCorrelation = DEFAULT_PATTERN }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Info className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-semibold text-[#374151]">Explainability (Grad-CAM + Rationale)</span>
      </div>
      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex items-start gap-2">
          <Eye className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-semibold text-indigo-700 mb-1">Grad-CAM Analysis</p>
            <p className="text-xs text-indigo-700 leading-relaxed">{text}</p>
          </div>
        </div>
      </div>
      {patternCorrelation && (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
          <div className="flex items-start gap-2">
            <Layers className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-teal-700 mb-1">Pattern Correlation</p>
              <p className="text-xs text-teal-700 leading-relaxed">{patternCorrelation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
