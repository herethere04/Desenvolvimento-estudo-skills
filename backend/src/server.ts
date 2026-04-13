import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './interfaces/routes/authRoutes';
import boardRoutes from './interfaces/routes/boardRoutes';
import cardRoutes from './interfaces/routes/cardRoutes';
import { errorHandler } from './interfaces/middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiter);

// Auth endpoints get stricter rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.' },
});

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards', cardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
