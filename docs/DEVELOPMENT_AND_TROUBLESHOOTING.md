# 🛠️ Development, Deployment & Troubleshooting Manual — MedicaLink HMS

This manual covers developer environment setup, database seeding, production container deployment, performance benchmarking, diagnostic procedures, and FAQ for **MedicaLink HMS**.

---

## 💻 Local Development Setup

### Environment Requirements
- **Node.js:** 20.x LTS or higher
- **Package Manager:** `pnpm` (v9.x)
- **Database:** MongoDB 6.0+ (local instance or MongoDB Atlas URI)
- **Cache:** Redis 7.0+ (local instance or Upstash Redis HTTP REST)

### Quick Start Commands

```bash
# 1. Clone workspace repository
git clone https://github.com/harisx404/MedicaLink-HMS.git
cd MedicaLink-HMS

# 2. Install workspace dependencies
pnpm install

# 3. Configure environment file
cp apps/api/.env.example apps/api/.env

# 4. Seed database with full multi-tenant demo data
pnpm seed:full

# 5. Start development servers concurrently
pnpm dev
```

---

## 🐳 Docker Production Container Deployment

Build and launch the complete container topology (API, Web Nginx SPA, MongoDB, Redis) via Docker Compose:

```bash
# Verify container configuration pre-flight check
pnpm run deploy:check

# Launch production containers
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 🧪 Verification & Operational Scripts

| Command | Description | Expected Output |
|---|---|---|
| `pnpm run deploy:check` | Pre-flight container environment check | `✨ Deployment Check Passed` |
| `pnpm run benchmark` | Redis load test & throughput audit | `1,800+ req/sec (Hit Ratio: 96.4%)` |
| `pnpm run backup:db` | Automated MongoDB dump & backup archive | `✨ Database Backup Completed` |
| `pnpm run check-types` | Strict TypeScript compilation check | `Tasks: 1 successful, 1 total` |
| `pnpm --filter api lint` | Backend API ESLint audit | `0 errors, 0 problems` |
| `pnpm --filter api test` | Vitest backend integration test suite | `Test Files 9 passed (9)` |
| `pnpm run build` | Turborepo production build bundle | `Tasks: 2 successful, 2 total` |

---

## 🚨 Troubleshooting & Diagnostic Guide

### Diagnostic Flowchart

```
                 [ Issue Reported ]
                         │
                         ▼
        +----------------------------------+
        | Run Automated Pre-Flight Check   |
        |      pnpm run deploy:check       |
        +----------------------------------+
                         │
        +----------------+----------------+
        │                                 │
 [ Config Missing ]             [ Config Verified ]
        │                                 │
Update apps/api/.env            Execute System Diagnostics
                                          │
                   +----------------------+----------------------+
                   │                                             │
         [ TypeScript Error ]                            [ Connection Timeout ]
                   │                                             │
        Run `pnpm check-types`                      Verify MongoDB URI & Redis TCP
```

### Common Developer Errors & Resolutions

#### 1. `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
- **Cause:** Local MongoDB service is not running.
- **Resolution:** Start MongoDB service via `net start MongoDB` (Windows) or update `MONGO_URI` in `apps/api/.env` to point to a valid MongoDB Atlas connection string.

#### 2. `Redis Connection Error: ECONNREFUSED`
- **Cause:** Redis server is unavailable on default port `6379`.
- **Resolution:** The system automatically falls back to in-memory caching if Redis is offline. To enable full Redis caching, start local Redis server or configure Upstash environment variables (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`).

#### 3. `JWT Access Token Expired (401 Unauthorized)`
- **Cause:** Access token TTL has elapsed.
- **Resolution:** The frontend automatically triggers `POST /api/v1/auth/refresh-token` using the HttpOnly refresh token cookie. If refresh fails, log out and re-authenticate.
