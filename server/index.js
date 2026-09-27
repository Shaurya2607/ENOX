import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { optionalAuth } from './middleware/auth.js';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Support a comma-separated list of allowed origins (useful when the frontend
// runs on a different port than the default, e.g. Vite's configured port).
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, server-to-server, mobile apps).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(optionalAuth); // attaches req.user if a valid JWT is present, doesn't block anything

// Light rate limiting to prevent abuse. Generous enough not to interfere with
// normal dashboard usage, but enough to blunt brute-force / scraping attempts.
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter, routes);

// Anything under /api that didn't match a route.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Centralized error handler — makes sure clients always get JSON back,
// including for malformed request bodies caught by express.json().
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ENOX backend listening on http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY is not set — ENOX AI features (Ask ENOX, file explain/review/modify) will be degraded or unavailable until it is configured in server/.env.');
  }
});
