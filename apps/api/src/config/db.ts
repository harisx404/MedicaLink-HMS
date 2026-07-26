import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

// Cache of tenant DB connections keyed by slug
const tenantConnections = new Map<string, mongoose.Connection>();
let mainConnection: mongoose.Connection | null = null;

/**
 * Connects to the main MedicaLink database (stores tenants, subscriptions, global audit).
 */
export async function connectMainDb(): Promise<mongoose.Connection> {
  if (mainConnection && mainConnection.readyState === 1) {
    return mainConnection;
  }

  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: env.MAIN_DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (primaryErr: any) {
    logger.warn(`⚠️ Cloud MONGO_URI connection failed (${primaryErr.message}). Attempting local fallback: mongodb://127.0.0.1:27017...`);
    await mongoose.connect('mongodb://127.0.0.1:27017/medicalink', {
      dbName: env.MAIN_DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  mainConnection = mongoose.connection;

  mainConnection.on('error', (err) => {
    logger.error('Main DB connection error:', err);
  });

  mainConnection.on('disconnected', () => {
    logger.warn('Main DB disconnected. Attempting reconnect...');
  });

  logger.info(`✅ Connected to main database: ${env.MAIN_DB_NAME}`);
  return mainConnection;
}

/**
 * Returns (or creates) a dedicated database connection for a specific hospital tenant.
 * Each tenant gets an isolated MongoDB database for data security.
 *
 * @param tenantSlug - Unique hospital identifier (e.g. "citygeneral", "royalcare")
 */
export async function getTenantDb(tenantSlug: string): Promise<mongoose.Connection> {
  if (tenantConnections.has(tenantSlug)) {
    const existing = tenantConnections.get(tenantSlug)!;
    if (existing.readyState === 1) return existing;
    // Connection dropped — remove and reconnect
    tenantConnections.delete(tenantSlug);
  }

  const dbName = `medicalink_${tenantSlug}`;

  // Create a new connection on the same MongoDB cluster, different database
  const conn = mongoose.createConnection(env.MONGO_URI, {
    dbName,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await conn.asPromise();

  conn.on('error', (err) => {
    logger.error(`Tenant DB [${tenantSlug}] connection error:`, err);
    tenantConnections.delete(tenantSlug);
  });

  conn.on('disconnected', () => {
    logger.warn(`Tenant DB [${tenantSlug}] disconnected.`);
    tenantConnections.delete(tenantSlug);
  });

  tenantConnections.set(tenantSlug, conn);
  logger.info(`✅ Connected to tenant database: ${dbName}`);
  return conn;
}

/**
 * Gracefully close all database connections on shutdown.
 */
export async function disconnectAll(): Promise<void> {
  const closes: Promise<void>[] = [];

  for (const [slug, conn] of tenantConnections) {
    closes.push(
      conn.close().then(() => { logger.info(`Closed tenant DB: ${slug}`); })
    );
  }

  if (mainConnection) {
    closes.push(mongoose.disconnect().then(() => { logger.info('Closed main DB'); }));
  }

  await Promise.all(closes);
  tenantConnections.clear();
}
