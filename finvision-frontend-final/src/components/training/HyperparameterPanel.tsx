'use client';

import { useState } from 'react';
import { useTrainingStore } from '@/store/trainingStore';
import { cn } from '@/lib/utils';

export default function HyperparameterPanel() {
  const { cnnConfig, rlConfig, setCNNConfig, setRLConfig } = useTrainingStore();
  const [tab, setTab] = useState<'cnn' | 'rl'>('cnn');

  const inputClass = "w-full px-3 py-1.5 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all";
  const labelClass = "block text-xs font-medium text-[#374151] mb-1";

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h3 className="text-sm font-semibold text-[#111827] mb-4">Hyperparameters</h3>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-lg mb-4 w-fit">
        {(['cnn', 'rl'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-1.5 rounded-md text-xs font-medium transition-all uppercase',
              tab === t ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]' : 'text-[#6B7280] hover:text-[#374151]'
            )}>
            {t === 'cnn' ? 'CNN' : 'RL Agent'}
          </button>
        ))}
      </div>

      {tab === 'cnn' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Backbone</label>
            <select value={cnnConfig.backbone} onChange={(e) => setCNNConfig({ backbone: e.target.value as 'ResNet-18' | 'ResNet-50' })} className={inputClass}>
              <option>ResNet-18</option>
              <option>ResNet-50</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Learning Rate</label>
            <input type="number" step="0.0001" value={cnnConfig.learningRate}
              onChange={(e) => setCNNConfig({ learningRate: parseFloat(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Batch Size</label>
            <input type="number" value={cnnConfig.batchSize}
              onChange={(e) => setCNNConfig({ batchSize: parseInt(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Epochs</label>
            <input type="number" value={cnnConfig.epochs}
              onChange={(e) => setCNNConfig({ epochs: parseInt(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Dropout</label>
            <input type="number" step="0.05" min="0" max="0.8" value={cnnConfig.dropout}
              onChange={(e) => setCNNConfig({ dropout: parseFloat(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Image Size</label>
            <select value={cnnConfig.imageSize} onChange={(e) => setCNNConfig({ imageSize: parseInt(e.target.value) })} className={inputClass}>
              <option value={112}>112×112</option>
              <option value={224}>224×224</option>
              <option value={256}>256×256</option>
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <input type="checkbox" id="aug" checked={cnnConfig.augmentation}
              onChange={(e) => setCNNConfig({ augmentation: e.target.checked })}
              className="rounded border-[#D1D5DB] text-indigo-600" />
            <label htmlFor="aug" className="text-xs text-[#374151]">Enable Data Augmentation</label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>RL Algorithm</label>
            <select value={rlConfig.algorithm} onChange={(e) => setRLConfig({ algorithm: e.target.value as 'PPO' | 'DQN' })} className={inputClass}>
              <option>PPO</option>
              <option>DQN</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Learning Rate</label>
            <input type="number" step="0.0001" value={rlConfig.learningRate}
              onChange={(e) => setRLConfig({ learningRate: parseFloat(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Gamma (γ)</label>
            <input type="number" step="0.01" min="0.9" max="0.999" value={rlConfig.gamma}
              onChange={(e) => setRLConfig({ gamma: parseFloat(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Batch Size</label>
            <input type="number" value={rlConfig.batchSize}
              onChange={(e) => setRLConfig({ batchSize: parseInt(e.target.value) })} className={inputClass} />
          </div>
          {rlConfig.algorithm === 'PPO' && (
            <>
              <div>
                <label className={labelClass}>Clip Range (ε)</label>
                <input type="number" step="0.05" value={rlConfig.clipRange ?? 0.2}
                  onChange={(e) => setRLConfig({ clipRange: parseFloat(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>N Steps</label>
                <input type="number" value={rlConfig.nSteps ?? 2048}
                  onChange={(e) => setRLConfig({ nSteps: parseInt(e.target.value) })} className={inputClass} />
              </div>
            </>
          )}
          <div className="col-span-2">
            <label className={labelClass}>Total Timesteps</label>
            <input type="number" step="100000" value={rlConfig.totalTimesteps}
              onChange={(e) => setRLConfig({ totalTimesteps: parseInt(e.target.value) })} className={inputClass} />
          </div>
        </div>
      )}
    </div>
  );
}
