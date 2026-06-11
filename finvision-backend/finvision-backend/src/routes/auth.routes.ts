import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register as any);
router.post('/login',    login as any);

// Protected routes
router.get('/profile', authMiddleware as any, getProfile as any);

export default router;
