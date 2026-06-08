import http from 'http';
import fs from 'fs';
import path from 'path';
import { createApp } from './app';
import { env } from './config/env';
import { connectMainDb, disconnectAll } from './config/db';
import { connectRedis, disconnectRedis } from './config/redis';
import { initCloudinary } from './config/cloudinary';
import { initSocketServer } from './sockets/index';
import { logger } from './utils/logger';
import './jobs/appointmentReminders';

const logFile = fs.createWriteStream(path.join(__dirname, '../debug.log'), { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;
console.log = function(...args) { logFile.write('[LOG] ' + args.join(' ') + '\n'); originalLog.apply(console, args); };
console.error = function(...args) { logFile.write('[ERR] ' + args.join(' ') + '\n'); originalError.apply(console, args); };

async function bootstrap(): Promise<void> {
  try {
    // ── Infrastructure Connections ──────────────────────────────────────────
    logger.info('Connecting to infrastructure...');
    await connectMainDb();
    
    try {
      await connectRedis();
    } catch {
      logger.warn('Redis connection failed. Running without Redis caching/queues. Please ensure Redis is running locally on port 6379.');
    }
    
    initCloudinary();

    // ── Create App and HTTP Server ──────────────────────────────────────────
    const app = createApp();
    const httpServer = http.createServer(app);

    // ── Initialize Socket.io ────────────────────────────────────────────────
    initSocketServer(httpServer);

    // ── Start Listening ─────────────────────────────────────────────────────
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 MedicaLink HMS API running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`   API base: http://localhost:${env.PORT}/api/v1`);
      logger.info(`   Health:   http://localhost:${env.PORT}/api/v1/health`);
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);

      httpServer.close(async () => {
        await Promise.all([disconnectAll(), disconnectRedis()]);
        logger.info('Server shut down cleanly.');
        process.exit(0);
      });

      // Force shutdown after 15 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 15s timeout.');
        process.exit(1);
      }, 15_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
