import { Response } from 'express';
import { AuthRequest } from '../types';
import { listReports, generateReport, getReport } from '../services/reports.service';

import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId ?? 'demo-user';
  res.json({ success: true, data: listReports(userId) });
}

export async function generate(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId ?? 'demo-user';
  const forecastId = String(req.body?.forecastId || req.body?.id || '');
  const report = generateReport(userId, forecastId);
  res.json({ success: true, data: report });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId ?? 'demo-user';
  const report = getReport(String(req.params['id']), userId);
  if (!report) {
    res.status(404).json({ success: false, error: 'Report not found' });
    return;
  }
  res.json({ success: true, data: report });
}

export async function templates(_req: AuthRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    data: [
      { id: 'tpl-forecast', name: 'Forecast Summary', type: 'forecast' },
      { id: 'tpl-backtest', name: 'Backtest Report', type: 'backtest' },
      { id: 'tpl-risk', name: 'Risk Assessment', type: 'risk' },
    ],
  });
}

export async function exportCSV(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId ?? 'demo-user';

  const reports = listReports(userId);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Reports');

  sheet.columns = [
    { header: 'Ticker', key: 'ticker', width: 15 },
    { header: 'Direction', key: 'direction', width: 15 },
    { header: 'Confidence', key: 'confidence', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 30 },
  ];

  reports.forEach(r => {
    sheet.addRow({
      ticker: r.ticker,
      direction: r.direction,
      confidence: r.confidence,
      createdAt: r.createdAt,
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader(
    'Content-Disposition',
    'attachment; filename=reports.xlsx'
  );

  await workbook.xlsx.write(res);
  res.end();
}

export async function exportPDF(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId ?? 'demo-user';

  const reports = listReports(userId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=report.pdf'
  );

  const doc = new PDFDocument({
    margin: 50
  });

  doc.pipe(res);

  doc.fontSize(20).text('Forecast Reports', {
    align: 'center'
  });

  doc.moveDown();

  reports.forEach((r, index) => {
    doc.fontSize(14).text(`Report #${index + 1}`);

    doc.fontSize(12).text(`Ticker: ${r.ticker}`);
    doc.text(`Direction: ${r.direction}`);
    doc.text(`Confidence: ${r.confidence}%`);
    doc.text(`Created At: ${r.createdAt}`);

    doc.moveDown();
  });

  doc.end();
}