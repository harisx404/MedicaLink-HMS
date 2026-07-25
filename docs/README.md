# 📚 MedicaLink HMS — Documentation Center

Welcome to the official technical and operational documentation hub for **MedicaLink HMS**, an enterprise-grade, multi-tenant B2B SaaS Hospital Management System.

---

## 🗺️ Documentation Directory

| Document | Description | Key Topics |
|---|---|---|
| 📐 [**Architecture Guide**](./ARCHITECTURE.md) | Technical system architecture & design patterns | Multi-tenant DB isolation, Monorepo topology, Redis caching, Security & AI pipeline |
| 📖 [**User Guide**](./USER_GUIDE.md) | Operations manual for all 25+ hospital modules | Patient portal, EHR, Pharmacy FEFO, Lab delta checks, Emergency triage, Telemedicine |
| 🔌 [**API Reference**](./API_REFERENCE.md) | REST routes & real-time WebSocket events | Endpoint schemas, Authentication headers, Response envelopes, Socket.io events |
| 🛠️ [**Development & Troubleshooting**](./DEVELOPMENT_AND_TROUBLESHOOTING.md) | Onboarding, deployment & diagnostic guide | Local setup, Database seeding, Docker Compose, Common errors, Backup & Recovery |

---

## 🏗️ Monorepo Topology Overview

```
MedicaLink-HMS/
├── apps/
│   ├── api/                 # Node.js 20 + Express TypeScript Backend REST API & WebSockets
│   ├── web/                 # React 18 + Vite SPA Frontend (TailwindCSS, RTK Query)
│   └── mobile/              # React Native / Expo Mobile Client
├── packages/
│   ├── shared/              # Shared Zod Schemas, TypeScript Interfaces, Constants
│   ├── ui/                  # Shared React UI Component Library
│   ├── eslint-config/       # Unified ESLint Configurations
│   └── typescript-config/   # Strict TypeScript Compiler Options
├── docs/                    # Complete Engineering & Operational Documentation Suite
├── scripts/                 # Pre-flight deployment check, Redis load test, DB backup
├── docker-compose.prod.yml  # Multi-container production deployment orchestration
└── RELEASE_NOTES.md         # Release history and milestone logs
```

---

## 🚀 Key Engineering Pillars

1. **Strict Multi-Tenancy:** Dynamic database connection routing per tenant (`x-tenant-id`) providing complete data isolation at the MongoDB connection level.
2. **High Throughput Caching:** Dual-mode Redis caching layer (ioredis TCP / Upstash HTTP REST) delivering sub-20ms latency and 1,800+ req/sec throughput.
3. **AI Clinical Decision Support:** Integrated Google Gemini 1.5 Flash LLM for automated ICD-10 medical coding, drug interaction warnings, and patient symptom triage.
4. **HIPAA Security & Auditability:** PII data field-level encryption (AES-256-GCM), HttpOnly refresh token rotation, TOTP 2FA, and granular audit trail logging.
