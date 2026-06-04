import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { authRateLimiter } from '../middlewares/rateLimiter';
import {
  registerHospitalSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  enable2FASchema,
  verify2FASchema,
  refreshSchema,
} from '../validators/authValidator';
import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// Public Routes (No authentication, no tenant restriction)
router.post('/register-hospital', authRateLimiter, validate(registerHospitalSchema), authController.registerHospital);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', authRateLimiter, authController.verifyEmail);
router.post('/verify-2fa', authRateLimiter, validate(verify2FASchema), authController.verify2FA);

// Protected Routes (Require authentication)
router.use(authenticate);

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.post('/setup-2fa', authController.setup2FA);
router.post('/enable-2fa', validate(enable2FASchema), authController.enable2FA);

export default router;
