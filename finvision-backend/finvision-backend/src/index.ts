import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes     from './routes/auth.routes';
import forecastRoutes from './routes/forecast.routes';
import marketRoutes    from './routes/market.routes';
import dataRoutes      from './routes/data.routes';
import analyticsRoutes from './routes/analytics.routes';
import reportsRoutes   from './routes/reports.routes';
import dashboardRoutes from './routes/dashboard.routes';
import trainingRoutes  from './routes/training.routes';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,
  message:  { success: false, error: 'Too many requests, please try again later' },
});
app.use(limiter);

// ── General middleware ────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success:   true,
    service:   'FinVision-RL Node.js Backend',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/market',    marketRoutes);
app.use('/api/data',      dataRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports',   reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/training',  trainingRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 FinVision-RL Node.js Backend');
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Health:    http://localhost:${PORT}/health`);
  console.log(`✅ Auth:      http://localhost:${PORT}/api/auth`);
  console.log(`✅ Forecast:  http://localhost:${PORT}/api/forecast`);
  console.log('');
});

export default app;
