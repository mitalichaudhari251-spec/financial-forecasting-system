import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { summary } from '../controllers/dashboard.controller';

const router = Router();
router.use(authMiddleware as never);
router.get('/summary', summary as never);
export default router;
