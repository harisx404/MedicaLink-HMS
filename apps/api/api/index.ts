import { createApp } from '../src/app';

/**
 * Exports the Express app instance for Vercel Serverless Function execution.
 * Standalone Node.js server and Docker runtimes use apps/api/src/server.ts directly.
 */
const app = createApp();

export default app;
