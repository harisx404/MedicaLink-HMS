import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { getUserModel } from '../../models/User';

// Mock auditService and emailService to prevent side effects
vi.mock('../../services/auditService', () => ({
  auditService: {
    logAuthEvent: vi.fn().mockResolvedValue(undefined),
    logEvent: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../services/emailService', () => ({
  emailService: {
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Authentication Integration', () => {
  // Use the main test connection as a "tenant" db
  const getTestDb = () => mongoose.connection;

  beforeEach((context) => {
    if (mongoose.connection.readyState !== 1) {
      context.skip();
    }
  });

  describe('User Model — Password Security', () => {
    it('hashes the password on user creation (never stores plaintext)', async () => {
      const User = getUserModel(getTestDb());
      const user = await User.create({
        tenantId: 'test-tenant',
        email: 'doctor@test.com',
        password: 'Password123!',
        role: 'DOCTOR',
        firstName: 'Test',
        lastName: 'Doctor',
      });

      // Password in DB must NOT be plaintext
      expect(user.password).not.toBe('Password123!');
      // Must be a bcrypt hash (starts with $2a$ or $2b$)
      expect(user.password).toMatch(/^\$2[ab]\$/);
    });

    it('comparePassword() returns true for correct password', async () => {
      const User = getUserModel(getTestDb());
      const user = await User.create({
        tenantId: 'test-tenant',
        email: 'nurse@test.com',
        password: 'SecurePass456!',
        role: 'NURSE',
        firstName: 'Test',
        lastName: 'Nurse',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isValid = await userWithPassword!.comparePassword('SecurePass456!');
      expect(isValid).toBe(true);
    });

    it('comparePassword() returns false for wrong password', async () => {
      const User = getUserModel(getTestDb());
      const user = await User.create({
        tenantId: 'test-tenant',
        email: 'admin@test.com',
        password: 'CorrectPassword!',
        role: 'HOSPITAL_ADMIN',
        firstName: 'Test',
        lastName: 'Admin',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isValid = await userWithPassword!.comparePassword('WrongPassword!');
      expect(isValid).toBe(false);
    });

    it('locks account after maximum login attempts', async () => {
      const User = getUserModel(getTestDb());
      const user = await User.create({
        tenantId: 'test-tenant',
        email: 'locktest@test.com',
        password: 'Password123!',
        role: 'RECEPTIONIST',
        firstName: 'Lock',
        lastName: 'Test',
        loginAttempts: 4,
      });

      // Increment one more time (5th attempt = lock)
      await user.incrementLoginAttempts();
      const updated = await User.findById(user._id);
      expect(updated!.isLocked()).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    it('generates a valid access token with correct payload', () => {
      const payload = {
        userId: 'user-123',
        role: 'DOCTOR',
        tenantId: 'tenant-abc',
        tenantSlug: 'city-hospital',
      };

      const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '15m',
        algorithm: 'HS256',
      });

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
      expect(decoded.userId).toBe('user-123');
      expect(decoded.role).toBe('DOCTOR');
      expect(decoded.tenantId).toBe('tenant-abc');
      expect(decoded.tenantSlug).toBe('city-hospital');
    });

    it('rejects tokens signed with a different secret', () => {
      const token = jwt.sign({ userId: '123' }, 'wrong-secret', { expiresIn: '15m' });

      expect(() => jwt.verify(token, process.env.JWT_ACCESS_SECRET!)).toThrow();
    });

    it('rejects expired tokens', () => {
      const token = jwt.sign(
        { userId: '123' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '0s' }
      );

      expect(() => jwt.verify(token, process.env.JWT_ACCESS_SECRET!)).toThrow();
    });
  });

  describe('User Email Uniqueness', () => {
    it('prevents duplicate email registration within same tenant', async () => {
      const User = getUserModel(getTestDb());

      // Ensure indexes are built before testing uniqueness
      await User.ensureIndexes();

      await User.create({
        tenantId: 'test-tenant',
        email: 'unique@test.com',
        password: 'Password123!',
        role: 'DOCTOR',
        firstName: 'First',
        lastName: 'User',
      });

      await expect(
        User.create({
          tenantId: 'test-tenant',
          email: 'unique@test.com',
          password: 'Password456!',
          role: 'NURSE',
          firstName: 'Second',
          lastName: 'User',
        })
      ).rejects.toThrow();
    });
  });
});
