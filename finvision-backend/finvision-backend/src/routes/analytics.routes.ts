import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { backtest, benchmark, risk, portfolio } from '../controllers/analytics.controller';

const router = Router();
router.use(authMiddleware as never);
router.post('/backtest', backtest as never);
router.get('/benchmark', benchmark as never);
router.get('/risk', risk as never);
router.post('/portfolio', portfolio as never);
export default router;
