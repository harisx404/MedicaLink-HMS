import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { API_PREFIX } from './utils/constants';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { publicRateLimiter } from './middlewares/rateLimiter';
import router from './routes/index';

export function createApp(): Application {
  const app = express();

  // ── Security Headers ───────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = [env.CLIENT_URL];
        if (!origin || allowed.some((o) => origin.startsWith(o))) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin not allowed — ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
    })
  );

  // ── Body Parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── NoSQL Injection Prevention ────────────────────────────────────────────
  app.use(mongoSanitize());

  // ── HTTP Request Logging ──────────────────────────────────────────────────
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
        skip: (req) => req.url === `${API_PREFIX}/health`,
      })
    );
  }

  // ── Trust Proxy (for AWS ALB / NGINX) ─────────────────────────────────────
  app.set('trust proxy', 1);

  // ── Public Rate Limit ──────────────────────────────────────────────────────
  app.use(publicRateLimiter);

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use(API_PREFIX, router);

  // ── 404 Handler ───────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found`,
    });
  });

  // ── Global Error Handler ──────────────────────────────────────────────────
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });

  return app;
}
