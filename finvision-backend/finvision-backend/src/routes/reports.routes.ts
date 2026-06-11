import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  list,
  generate,
  getById,
  templates,
  exportCSV,
  exportPDF
} from '../controllers/reports.controller';

const router = Router();
router.use(authMiddleware as never);
router.get('/', list as never);
router.get('/templates', templates as never);

router.get('/export/csv', exportCSV as never);
router.get('/export/pdf', exportPDF as never);

router.post('/generate', generate as never);
router.get('/:id', getById as never);
export default router;
