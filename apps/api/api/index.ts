import { createApp } from '../src/app';

/**
 * ☁️ Vercel Serverless Function Adapter
 * 
 * - Vercel Cloud Mode: Exports the Express `app` instance for Vercel Serverless Function execution.
 * - Local / Docker Mode: `apps/api/src/server.ts` handles `httpServer.listen()` directly.
 * 
 * Both runtimes coexist cleanly without conflict.
 */
const app = createApp();

export default app;
