# Development, Deployment & Troubleshooting Manual — MedicaLink HMS

Developer environment setup, database seeding, Docker deployment, performance benchmarking, and diagnostics for MedicaLink HMS.

---

## Local Development Setup

### System Requirements
- Node.js 20.x LTS
- pnpm (v9.x)
- MongoDB 6.0+ (local instance or MongoDB Atlas)
- Redis 7.0+ (local TCP instance or Upstash REST)

### Commands

```bash
git clone https://github.com/harisx404/MedicaLink-HMS.git
cd MedicaLink-HMS
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm seed:full
pnpm dev
```

---

## Docker Container Deployment

Build and start the container environment (API, Web Nginx SPA, MongoDB, Redis) using Docker Compose:

```bash
pnpm run deploy:check
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## Verification & Utility Scripts

| Command | Purpose | Output |
|---|---|---|
| `pnpm run deploy:check` | Pre-flight container environment check | `Deployment Check Passed` |
| `pnpm run benchmark` | Redis load test & throughput audit | `1,700+ req/sec` |
| `pnpm run backup:db` | Automated MongoDB dump & backup archive | `Database Backup Completed` |
| `pnpm run check-types` | Strict TypeScript compilation check | `Tasks: 1 successful` |
| `pnpm --filter api lint` | Backend API ESLint audit | `0 errors` |
| `pnpm --filter api test` | Vitest backend integration test suite | `9 passed (9)` |
| `pnpm run build` | Turborepo production build bundle | `2 successful (100%)` |

---

## Troubleshooting & Diagnostics

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

### Common Issues & Solutions

#### 1. Connection Error (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause:** Local MongoDB service is not running.
- **Solution:** Start local MongoDB service (`net start MongoDB`) or supply a valid `MONGO_URI` in `apps/api/.env`.

#### 2. Redis Connection Failed
- **Cause:** Redis server is unavailable on port `6379`.
- **Solution:** The API falls back to in-memory caching if Redis is offline. Provide `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` or launch a local Redis instance.

#### 3. Unauthorized Error (401)
- **Cause:** JWT access token expired.
- **Solution:** The web client automatically calls `POST /api/v1/auth/refresh-token` using the HttpOnly refresh token cookie. Re-authenticate if refresh fails.
