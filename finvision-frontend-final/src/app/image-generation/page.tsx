'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageContainer from '@/components/layout/PageContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animation-utils';
import { Play, ChevronLeft, ChevronRight, ZoomIn, Layers, BarChart2, Settings2, CheckCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PATTERNS = ['Hammer', 'Doji', 'Bullish Engulfing', 'Head and Shoulders', 'Double Bottom'];
const IMAGE_TYPES = ['Candlestick', 'GASF', 'GADF'];
const RESOLUTIONS = [64, 128, 224, 256];

interface GeneratedImage {
  id: string;
  type: string;
  windowIndex: number;
  startDate: string;
  endDate: string;
  patterns: string[];
}

const MOCK_IMAGES: GeneratedImage[] = Array.from({ length: 12 }, (_, i) => ({
  id: `img-${i + 1}`,
  type: i % 3 === 0 ? 'GASF' : i % 3 === 1 ? 'GADF' : 'Candlestick',
  windowIndex: i + 1,
  startDate: `2024-0${(i % 9) + 1}-01`,
  endDate: `2024-0${(i % 9) + 2}-01`,
  patterns: i % 4 === 0 ? ['Hammer', 'Doji'] : i % 4 === 1 ? ['Bullish Engulfing'] : i % 4 === 2 ? ['Head and Shoulders'] : [],
}));

function ImageCard({ img, selected, onClick }: { img: GeneratedImage; selected: boolean; onClick: () => void }) {
  const isGAF = img.type !== 'Candlestick';
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 cursor-pointer transition-all overflow-hidden',
        selected ? 'border-indigo-500 shadow-lg' : 'border-[#E5E7EB] hover:border-indigo-300'
      )}
    >
      {/* Image placeholder */}
      <div className={cn(
        'h-28 flex items-center justify-center relative',
        isGAF
          ? 'bg-gradient-to-br from-indigo-900 via-blue-800 to-teal-700'
          : 'bg-[#0F172A]'
      )}>
        {isGAF ? (
          <div className="absolute inset-2 grid grid-cols-8 grid-rows-6 gap-px opacity-70">
            {Array.from({ length: 48 }).map((_, j) => (
              <div key={j} className="rounded-sm" style={{
                background: `hsl(${200 + Math.sin(j * 0.4 + img.windowIndex) * 80}, 70%, ${25 + Math.abs(Math.sin(j * 0.3)) * 40}%)`
              }} />
            ))}
          </div>
        ) : (
          <div className="w-full h-full px-2 flex items-end gap-px pb-2">
            {Array.from({ length: 20 }).map((_, j) => {
              const h = 20 + Math.abs(Math.sin(j * 0.5 + img.windowIndex)) * 60;
              const isUp = Math.sin(j * 0.7 + img.windowIndex) > 0;
              return (
                <div key={j} className="flex-1 flex flex-col items-center justify-end gap-px">
                  <div className="w-full rounded-sm" style={{ height: `${h}%`, backgroundColor: isUp ? '#16A34A' : '#DC2626' }} />
                </div>
              );
            })}
          </div>
        )}
        {/* Type badge */}
        <div className={cn('absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded',
          img.type === 'GASF' ? 'bg-indigo-600 text-white' :
            img.type === 'GADF' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-white'
        )}>
          {img.type}
        </div>
        {img.patterns.length > 0 && (
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" title={img.patterns.join(', ')} />
        )}
      </div>
      {/* Info */}
      <div className="p-2.5 bg-white">
        <div className="text-[10px] font-semibold text-[#374151]">Window #{img.windowIndex}</div>
        <div className="text-[9px] text-[#9CA3AF]">{img.startDate} → {img.endDate}</div>
        {img.patterns.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {img.patterns.map((p) => (
              <span key={p} className="text-[8px] px-1 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">{p}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ImageGenerationPage() {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage>(MOCK_IMAGES[0]);
  const [imageType, setImageType] = useState<string[]>(['Candlestick', 'GASF']);
  const [resolution, setResolution] = useState(224);
  const [windowSize, setWindowSize] = useState(30);
  const [showVolume, setShowVolume] = useState(true);
  const [currentWindow, setCurrentWindow] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filterType, setFilterType] = useState<string>('All');

  const filteredImages = useMemo(() =>
    filterType === 'All' ? MOCK_IMAGES : MOCK_IMAGES.filter(img => img.type === filterType),
    [filterType]
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(i);
    }
    setIsGenerating(false);
    setGenerated(true);
    toast.success(`Generated ${MOCK_IMAGES.length} images (${imageType.join(' + ')})`);
  };

  const toggleImageType = (type: string) => {
    setImageType(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <DashboardLayout>
      <PageContainer
        title="Image Generation"
        subtitle="Convert OHLCV windows to visual AI representations"
        actions={
          <div className="flex items-center gap-2">
            {generated && (
              <button onClick={() => toast.success('Gallery exported')}
                className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                <Download className="w-3.5 h-3.5" /> Export All
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isGenerating
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Play className="w-3.5 h-3.5" />
              }
              {isGenerating ? `Generating… ${progress}%` : 'Generate Images'}
            </button>
          </div>
        }
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {/* Progress bar */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#374151]">Batch Generation Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-[#9CA3AF]">
                  <span>Processing {Math.floor(progress * 0.12)} / {MOCK_IMAGES.length} windows</span>
                  <span>~{Math.ceil((100 - progress) * 0.08)}s remaining</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* LEFT: Preview panel */}
            <div className="xl:col-span-2 space-y-4">
              {/* Main viewer */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">
                      {selectedImage.type} · Window #{selectedImage.windowIndex}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {selectedImage.startDate} → {selectedImage.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Large preview */}
                <div className={cn(
                  'rounded-xl h-72 flex items-center justify-center relative overflow-hidden',
                  selectedImage.type !== 'Candlestick'
                    ? 'bg-gradient-to-br from-indigo-900 via-blue-800 to-teal-700'
                    : 'bg-[#0F172A]'
                )}>
                  {selectedImage.type !== 'Candlestick' ? (
                    <>
                      <div className="absolute inset-4 grid grid-cols-16 grid-rows-12 gap-px opacity-80"
                        style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
                        {Array.from({ length: 192 }).map((_, j) => (
                          <div key={j} className="rounded-sm" style={{
                            background: `hsl(${180 + Math.sin(j * 0.3 + selectedImage.windowIndex) * 100}, ${60 + Math.cos(j * 0.2) * 20}%, ${20 + Math.abs(Math.sin(j * 0.4)) * 50}%)`
                          }} />
                        ))}
                      </div>
                      <div className="relative z-10 text-center">
                        <div className="text-white/80 text-xs font-semibold">{selectedImage.type}</div>
                        <div className="text-white/50 text-[10px] mt-1">{resolution}×{resolution}px · Window {selectedImage.windowIndex}</div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full px-4 flex items-end gap-1 pb-4">
                      {Array.from({ length: 30 }).map((_, j) => {
                        const bodyH = 10 + Math.abs(Math.sin(j * 0.4 + selectedImage.windowIndex)) * 100;
                        const isUp = Math.sin(j * 0.5 + selectedImage.windowIndex) > 0;
                        return (
                          <div key={j} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                            <div className="w-px bg-gray-500" style={{ height: `${bodyH * 0.3}px` }} />
                            <div className="w-full rounded-sm" style={{ height: `${bodyH * 0.6}px`, backgroundColor: isUp ? '#22C55E' : '#EF4444' }} />
                            <div className="w-px bg-gray-500" style={{ height: `${bodyH * 0.2}px` }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pattern detection */}
                {selectedImage.patterns.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-yellow-600" />
                      <span className="text-xs font-semibold text-yellow-800">Detected Patterns</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.patterns.map(p => (
                        <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 font-medium">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Window carousel navigation */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => setSelectedImage(MOCK_IMAGES[Math.max(0, MOCK_IMAGES.indexOf(selectedImage) - 1)])}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-xs text-[#9CA3AF]">
                    {MOCK_IMAGES.indexOf(selectedImage) + 1} / {MOCK_IMAGES.length}
                  </span>
                  <button
                    onClick={() => setSelectedImage(MOCK_IMAGES[Math.min(MOCK_IMAGES.length - 1, MOCK_IMAGES.indexOf(selectedImage) + 1)])}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Thumbnail gallery */}
              <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#111827]">Image Gallery</h3>
                  <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-lg">
                    {['All', 'Candlestick', 'GASF', 'GADF'].map(type => (
                      <button key={type} onClick={() => setFilterType(type)}
                        className={cn('px-3 py-1 rounded-md text-xs font-medium transition-all',
                          filterType === type ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]' : 'text-[#6B7280] hover:text-[#374151]'
                        )}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredImages.map(img => (
                    <ImageCard
                      key={img.id}
                      img={img}
                      selected={selectedImage.id === img.id}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Controls */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-4 h-4 text-[#6B7280]" />
                  <h3 className="text-sm font-semibold text-[#111827]">Generation Controls</h3>
                </div>

                <div className="space-y-5">
                  {/* Image type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-2">Image Types</label>
                    <div className="space-y-2">
                      {IMAGE_TYPES.map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                          <div
                            onClick={() => toggleImageType(type)}
                            className={cn(
                              'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                              imageType.includes(type)
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-[#D1D5DB] group-hover:border-indigo-400'
                            )}
                          >
                            {imageType.includes(type) && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div>
                            <span className="text-sm text-[#374151] font-medium">{type}</span>
                            <span className="text-xs text-[#9CA3AF] ml-2">
                              {type === 'Candlestick' ? 'OHLCV chart' : type === 'GASF' ? 'Gramian Angular Sum' : 'Gramian Angular Diff'}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Resolution */}
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-2">Resolution</label>
                    <div className="grid grid-cols-2 gap-2">
                      {RESOLUTIONS.map(r => (
                        <button key={r} onClick={() => setResolution(r)}
                          className={cn(
                            'py-2 rounded-lg border text-xs font-semibold transition-all',
                            resolution === r
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                              : 'border-[#E5E7EB] text-[#6B7280] hover:border-indigo-300 hover:text-indigo-600'
                          )}>
                          {r}×{r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Window size */}
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-2">
                      Window Size <span className="text-indigo-600">{windowSize} days</span>
                    </label>
                    <input type="range" min={10} max={90} step={5} value={windowSize}
                      onChange={e => setWindowSize(parseInt(e.target.value))}
                      className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                      <span>10</span><span>90 days</span>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    {[
                      { label: 'Volume Overlay', value: showVolume, onChange: () => setShowVolume(!showVolume) },
                    ].map(toggle => (
                      <div key={toggle.label} className="flex items-center justify-between">
                        <span className="text-sm text-[#374151]">{toggle.label}</span>
                        <button
                          onClick={toggle.onChange}
                          className={cn(
                            'relative w-10 h-5 rounded-full transition-colors',
                            toggle.value ? 'bg-indigo-600' : 'bg-[#D1D5DB]'
                          )}
                        >
                          <div className={cn(
                            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                            toggle.value ? 'translate-x-5' : 'translate-x-0.5'
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pattern legend */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-[#6B7280]" />
                  <h3 className="text-sm font-semibold text-[#111827]">Pattern Detection</h3>
                </div>
                <div className="space-y-2">
                  {PATTERNS.map((p, i) => (
                    <div key={p} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{
                          backgroundColor: ['#16A34A', '#D97706', '#4F46E5', '#DC2626', '#0D9488'][i]
                        }} />
                        <span className="text-xs text-[#374151]">{p}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#9CA3AF]">
                        {[3, 2, 2, 1, 1][i]} found
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
                <h3 className="text-xs font-semibold text-indigo-800 mb-3">Generation Stats</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Total Windows', value: '61' },
                    { label: 'Images Generated', value: `${MOCK_IMAGES.length}` },
                    { label: 'Patterns Detected', value: '9' },
                    { label: 'Resolution', value: `${resolution}×${resolution}px` },
                    { label: 'Avg Gen Time', value: '0.23s/img' },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between">
                      <span className="text-indigo-600">{s.label}</span>
                      <span className="font-semibold text-indigo-800">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </PageContainer>
    </DashboardLayout>
  );
}
