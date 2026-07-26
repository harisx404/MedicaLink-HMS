# 🚀 Vercel Production Deployment & Dual-Environment Guide — MedicaLink HMS

This guide provides step-by-step instructions for deploying **MedicaLink HMS** to [Vercel](https://vercel.com) as a serverless monorepo, while preserving local Docker and standalone Node.js server compatibility.

---

## ⚙️ Architecture: Dual-Environment Compatibility

MedicaLink HMS is engineered with **dual-environment compatibility**:

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

Both deployment modes exist in the codebase without conflict:
- **Serverless Vercel Mode:** Utilizes `apps/api/api/index.ts` (exports Express app instance) and `apps/web/vercel.json` (SPA routing).
- **Standalone Docker Mode:** Utilizes `apps/api/src/server.ts` (`httpServer.listen()`) and `docker-compose.prod.yml`.

---

## 📋 Vercel Step-by-Step Deployment Instructions

### Project 1: Deploying the Frontend Web SPA (`apps/web`)

1. Log in to [Vercel Dashboard](https://vercel.com) and click **Add New > Project**.
2. Select your GitHub repository (`harisx404/MedicaLink-HMS`).
3. Set **Root Directory** to `apps/web`.
4. Framework Preset: **Vite**.
5. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-api-project.vercel.app/api/v1`
6. Click **Deploy**. Vercel will automatically build and serve the React SPA with client-side routing support (`apps/web/vercel.json`).

---

### Project 2: Deploying the Backend API (`apps/api`)

1. In Vercel Dashboard, click **Add New > Project**.
2. Select the same GitHub repository (`harisx404/MedicaLink-HMS`).
3. Set **Root Directory** to `apps/api`.
4. Framework Preset: **Other** (Node.js).
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://user:pass@cluster.mongodb.net/MedicaLink-HMS`
   - `JWT_ACCESS_SECRET`: `<YOUR_STRONG_RANDOM_ACCESS_SECRET>`
   - `JWT_REFRESH_SECRET`: `<YOUR_STRONG_RANDOM_REFRESH_SECRET>`
   - `UPSTASH_REDIS_REST_URL`: `https://your-redis-instance.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN`: `<YOUR_UPSTASH_REST_TOKEN>`
   - `GEMINI_API_KEY`: `<YOUR_GEMINI_API_KEY>`
6. Click **Deploy**. Vercel will deploy the Express serverless function via `apps/api/api/index.ts`.

---

## 🛠️ Switching Between Local Docker & Vercel Serverless

| Operation Mode | Web Entrypoint | API Entrypoint | Command |
|---|---|---|---|
| **Local Development** | `apps/web/src/main.tsx` | `apps/api/src/server.ts` | `pnpm dev` |
| **Docker Container Run** | `apps/web/nginx.conf` | `apps/api/Dockerfile` | `docker-compose -f docker-compose.prod.yml up --build` |
| **Vercel Cloud Deploy** | `apps/web/vercel.json` | `apps/api/api/index.ts` | Connected automatically via Git push |

> [!NOTE]
> All Docker and Vercel configurations are co-located cleanly. No code needs to be modified or commented out when switching deployment targets.
