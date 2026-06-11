import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { status, rewardHistory, policyStats } from '../controllers/training.controller';

const router = Router();
router.use(authMiddleware as never);
router.get('/status', status as never);
router.get('/reward-history', rewardHistory as never);
router.get('/policy-stats', policyStats as never);
export default router;