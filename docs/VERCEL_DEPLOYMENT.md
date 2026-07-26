# Vercel Deployment & Dual-Environment Guide — MedicaLink HMS

Step-by-step instructions for deploying MedicaLink HMS to Vercel while maintaining compatibility with local development and Docker Compose environments.

---

## Dual-Environment Architecture

MedicaLink HMS supports both cloud serverless deployment and containerized / standalone server execution:

```
                                  MedicaLink HMS Codebase
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               ▼                                                           ▼
   [ Environment 1: Vercel Cloud ]                             [ Environment 2: Docker / Local ]
   - Web: Vercel Static CDN (apps/web)                         - Web: Nginx Container (apps/web/Dockerfile)
   - API: Vercel Serverless Function (apps/api/api/index.ts)   - API: Node.js HTTP Server (apps/api/src/server.ts)
   - Database: MongoDB Atlas                                   - Database: Local MongoDB / Docker
   - Cache: Upstash Redis (HTTP REST)                          - Cache: Local Redis (TCP / ioredis)
```

Configuration files for both runtimes coexist without requiring code modifications:
- **Serverless Mode:** Uses `apps/api/api/index.ts` (exports Express app instance) and `apps/web/vercel.json` (SPA client routing).
- **Standalone Mode:** Uses `apps/api/src/server.ts` (`httpServer.listen()`) and `docker-compose.prod.yml`.

---

## Vercel Deployment Instructions

### Project 1: Deploying the Web Frontend (`apps/web`)

1. In Vercel Dashboard, select **Add New > Project**.
2. Select repository (`harisx404/MedicaLink-HMS`).
3. Set **Root Directory** to `apps/web`.
4. Framework Preset: **Vite**.
5. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-api-project.vercel.app/api/v1`
6. Deploy project.

---

### Project 2: Deploying the Backend API (`apps/api`)

1. In Vercel Dashboard, select **Add New > Project**.
2. Select repository (`harisx404/MedicaLink-HMS`).
3. Set **Root Directory** to `apps/api`.
4. Framework Preset: **Other** (Node.js).
5. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://user:pass@cluster.mongodb.net/MedicaLink-HMS`
   - `JWT_ACCESS_SECRET`: `<YOUR_ACCESS_SECRET>`
   - `JWT_REFRESH_SECRET`: `<YOUR_REFRESH_SECRET>`
   - `UPSTASH_REDIS_REST_URL`: `https://your-instance.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN`: `<YOUR_TOKEN>`
   - `GEMINI_API_KEY`: `<YOUR_GEMINI_KEY>`
6. Deploy project. Vercel will deploy the Express serverless adapter at `apps/api/api/index.ts`.

---

## Deployment Mode Matrix

| Operation Mode | Web Entrypoint | API Entrypoint | Command |
|---|---|---|---|
| **Local Development** | `apps/web/src/main.tsx` | `apps/api/src/server.ts` | `pnpm dev` |
| **Docker Container Run** | `apps/web/nginx.conf` | `apps/api/Dockerfile` | `docker-compose -f docker-compose.prod.yml up --build` |
| **Vercel Cloud Deploy** | `apps/web/vercel.json` | `apps/api/api/index.ts` | Automated via Git push |
