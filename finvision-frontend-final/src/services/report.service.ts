import { api } from './api';
import type { ReportData, ReportTemplate } from '@/types/reports';

export const reportService = {
  listReports: (page = 1, limit = 20) =>
    api.get<{ items: ReportData[]; total: number }>('/reports', { params: { page, limit } }),

  getReport: (id: string) =>
    api.get<ReportData>(`/reports/${id}`),

  generateReport: (forecastId: string, templateId?: string, notes?: string) =>
    api.post<ReportData>('/reports/generate', { forecastId, templateId, notes }),

  exportPDF: (id: string) =>
    api.get<Blob>(`/reports/${id}/pdf`, { responseType: 'blob' } as never),

  exportCSV: (id: string) =>
    api.get<Blob>(`/reports/${id}/csv`, { responseType: 'blob' } as never),

  getTemplates: () => api.get<ReportTemplate[]>('/reports/templates'),

  deleteReport: (id: string) => api.delete(`/reports/${id}`),
};
