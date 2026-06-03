import { Router, Request, Response } from 'express';
import { APP_VERSION } from '../utils/constants';
import { sendSuccess } from '../utils/apiResponse';

const router: Router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, 'MedicaLink HMS API is healthy', {
    status: 'healthy',
    version: APP_VERSION,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API Info ─────────────────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, 'MedicaLink HMS API', {
    name: 'MedicaLink HMS',
    version: APP_VERSION,
    documentation: '/api/docs',
    health: '/api/v1/health',
  });
});

// ─── Module Routes ────────────────────────────────────────────────────────────
// Phase 1+: routes will be registered here as modules are built
// Example:
// import authRouter from './auth.routes';
// router.use('/auth', authRouter);

export default router;
