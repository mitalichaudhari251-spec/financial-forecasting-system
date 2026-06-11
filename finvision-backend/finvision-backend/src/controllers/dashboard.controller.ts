import { Response } from 'express';
import { AuthRequest } from '../types';
import { getDashboardSummary } from '../services/dashboard.service';

export async function summary(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId ?? 'demo-user';
  try {
    const data = await getDashboardSummary(userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Dashboard failed' });
  }
}
