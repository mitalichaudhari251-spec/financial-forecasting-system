'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, LayoutDashboard, Upload, Settings2, Image, Brain, Bot, Dumbbell, LineChart, FileText, Clock, Settings, BarChart2, Layers, Grid, Cpu, Map, Crosshair, Target, Shield, Lightbulb, Info, Zap, Network, Award, ClipboardCheck, FlaskConical, Terminal, Gauge, Sliders, History, BarChart, AlertTriangle, PieChart, FileUp, Eye, CheckCircle, Activity, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SIDEBAR_SECTIONS } from '@/config/sidebar';
import { useSettingsStore } from '@/store/settingsStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Upload, Settings2, Image, Brain, TrendingUp, Bot, Dumbbell, LineChart,
  FileText, Clock, Settings, BarChart2, Layers, Grid, Cpu, Map, Crosshair, Target, Shield,
  Lightbulb, Info, Zap, Network, Award, ClipboardCheck, FlaskConical, Terminal, Gauge, Sliders,
  History, BarChart, AlertTriangle, PieChart, FileUp, Eye, CheckCircle, Activity, Grid3x3,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useSettingsStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] flex flex-col z-30 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#111827] leading-none tracking-tight">FinVision</div>
              <div className="text-[10px] text-indigo-500 font-semibold tracking-widest uppercase leading-none mt-0.5">RL Platform</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 no-scrollbar">
        {SIDEBAR_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.title && !sidebarCollapsed && (
              <div className="px-2 mb-1 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon];
                const active = isActive(item.href);
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openSections[item.label];

                return (
                  <div key={item.href}>
                    {hasChildren ? (
                      <button
                        onClick={() => toggleSection(item.label)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors',
                          active
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                        )}
                      >
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={cn('w-3.5 h-3.5 transition-transform text-[#9CA3AF]', isOpen && 'rotate-180')}
                            />
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors',
                          active
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                        )}
                      >
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    )}

                    <AnimatePresence>
                      {hasChildren && isOpen && !sidebarCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 mt-0.5 space-y-0.5 pl-2 border-l border-[#E5E7EB]">
                            {item.children!.map((child) => {
                              const ChildIcon = ICON_MAP[child.icon];
                              const childActive = isActive(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors',
                                    childActive
                                      ? 'text-indigo-700 font-medium bg-indigo-50'
                                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                                  )}
                                >
                                  {ChildIcon && <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom disclaimer */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-[#E5E7EB]">
          <p className="text-[10px] text-[#9CA3AF] leading-relaxed italic">
            For research purposes only. Not financial advice.
          </p>
        </div>
      )}
    </aside>
  );
}
