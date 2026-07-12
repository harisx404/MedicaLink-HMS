import { createApp } from '../src/app';

/**
 * Vercel Serverless Function adapter.
 * Exports the Express app instance for Vercel's Node.js runtime.
 * In local development, server.ts handles app.listen() directly.
 */
const app = createApp();

export default app;
