import { Router } from 'express';
import { getOHLCV } from '../controllers/market.controller';

const router = Router();

router.get('/ohlcv/:ticker', getOHLCV);

export default router;
