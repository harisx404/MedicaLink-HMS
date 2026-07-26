# MedicaLink HMS — Documentation Index

Technical and operational documentation index for MedicaLink HMS, an enterprise multi-tenant B2B SaaS Hospital Management System.

---

## Documentation Directory

| Document | Description | Key Topics |
|---|---|---|
| [Architecture Guide](./ARCHITECTURE.md) | System architecture & technical patterns | Multi-tenant DB isolation, monorepo topology, Redis caching, security safeguards, AI pipeline |
| [User Guide](./USER_GUIDE.md) | Operations manual for clinical & admin modules | Patient portal, EHR, pharmacy FEFO, lab delta checks, emergency triage, telemedicine |
| [API Reference](./API_REFERENCE.md) | REST routes & WebSocket events | Endpoint schemas, headers, response format envelopes, Socket.io event schemas |
| [Development & Troubleshooting](./DEVELOPMENT_AND_TROUBLESHOOTING.md) | Onboarding, deployment & diagnostics | Setup, DB seeding, Docker Compose, error diagnostics, backup & recovery |
| [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) | Cloud serverless deployment guide | Monorepo Vercel project configuration, environment variables, serverless vs Docker runtime |

---

## Monorepo Directory Layout

```
MedicaLink-HMS/
├── apps/
│   ├── api/                 # Node.js 20 + Express TypeScript REST API & WebSockets
│   ├── web/                 # React 18 + Vite SPA Frontend (TailwindCSS, RTK Query)
│   └── mobile/              # React Native / Expo Mobile Client
├── packages/
│   ├── shared/              # Shared Zod Schemas, TypeScript Interfaces, Constants
│   ├── ui/                  # Shared React UI Component Library
│   ├── eslint-config/       # Shared ESLint Configurations
│   └── typescript-config/   # Strict TypeScript Compiler Options
├── docs/                    # Architecture, API, User Guide, and Deployment Docs
├── scripts/                 # Deployment check, Redis benchmark, and DB backup scripts
├── docker-compose.prod.yml  # Multi-container production compose file
└── RELEASE_NOTES.md         # Version release history
```

---

## Architectural Principles

1. **Database-per-Tenant Multi-Tenancy:** Dynamic database connection routing per tenant (`x-tenant-id`) providing complete data isolation at the MongoDB connection level.
2. **Dual-Mode Caching:** Layered Redis caching (ioredis TCP / Upstash HTTP REST) supporting high-concurrency read operations.
3. **AI Clinical Decision Support:** Integrated Google Gemini 1.5 Flash API for automated ICD-10 medical coding, drug interaction warnings, and patient triage.
4. **Security & Auditability:** PII data field-level encryption (AES-256-GCM), HttpOnly refresh token rotation, TOTP 2FA, and structured audit logging.
