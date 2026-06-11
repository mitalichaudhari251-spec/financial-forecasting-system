import { Router } from 'express';
import { forecast, history, aiHealth } from '../controllers/forecast.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All forecast routes require auth
router.post('/',          authMiddleware as any, forecast  as any);
router.post('/run',       authMiddleware as any, forecast  as any);
router.get('/history',    authMiddleware as any, history   as any);
router.get('/ai-health',  authMiddleware as any, aiHealth  as any);

export default router;
