import { create } from 'zustand';
import type { ReportData } from '@/types/reports';

interface ReportState {
  reports: ReportData[];
  currentReport: ReportData | null;
  isGenerating: boolean;
  setReports: (r: ReportData[]) => void;
  setCurrentReport: (r: ReportData | null) => void;
  setGenerating: (g: boolean) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  currentReport: null,
  isGenerating: false,
  setReports: (reports) => set({ reports }),
  setCurrentReport: (currentReport) => set({ currentReport }),
  setGenerating: (isGenerating) => set({ isGenerating }),
}));
