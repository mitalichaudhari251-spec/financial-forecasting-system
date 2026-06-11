import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  uploadDataset,
  listUploaded,
  previewDataset,
  fetchTicker,
  validateData,
  preprocess,
  generateImagesJob,
  getImageJob,
} from '../controllers/data.controller';

const router = Router();

router.use(authMiddleware as never);

router.post('/upload', uploadDataset as never);
router.post('/fetch-ticker', fetchTicker as never);
router.get('/datasets', listUploaded as never);
router.post('/preprocess', preprocess as never);
router.post('/generate-images', generateImagesJob as never);
router.get('/jobs/:jobId', getImageJob as never);
router.get('/:id/validate', validateData as never);
router.get('/:id/preview', previewDataset as never);

export default router;
