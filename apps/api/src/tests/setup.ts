/**
 * Global test setup for the API test suite.
 * Uses a dedicated test database on the local MongoDB instance (Docker).
 * No mongodb-memory-server needed — faster and more reliable.
 */
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Set test environment variables before any module imports env
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_must_be_32_chars_long_enough';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_must_be_32_chars_long_enough';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.ENCRYPTION_KEY = 'test_encryption_key_must_be_32_chars_long_enough';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicalink_test';
process.env.MAIN_DB_NAME = 'medicalink_test';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.API_URL = 'http://localhost:5001';
process.env.EMAIL_FROM = 'test@medicalink.app';

// Disable buffering to prevent 10000ms timeouts when MongoDB is offline
mongoose.set('bufferCommands', false);

// Mock Redis to avoid needing a Redis server during tests
vi.mock('../config/redis', () => ({
  getRedisClient: () => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue([]),
    status: 'ready',
  }),
  getRedisPubClient: () => ({
    on: vi.fn(),
  }),
  getRedisSubClient: () => ({
    on: vi.fn(),
  }),
  connectRedis: vi.fn().mockResolvedValue(undefined),
  disconnectRedis: vi.fn().mockResolvedValue(undefined),
}));

// Mock logger to suppress log output during tests
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, { serverSelectionTimeoutMS: 500 });
  } catch {
    // Graceful fallback if local MongoDB is not running
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
