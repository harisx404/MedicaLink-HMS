# System Architecture

## Overview

MedicaLink HMS is a **multi-tenant, cloud-native Hospital Management SaaS** built on a high-performance Turborepo monorepo. The architecture is designed for enterprise scalability, data isolation per hospital, and real-time clinical workflows.

---

## Monorepo Structure

```
MedicaLink-HMS/
├── apps/
│   ├── web/              # React 18 + Vite + TypeScript — Hospital staff web app
│   └── api/              # Node.js + Express + TypeScript — REST API + WebSocket server
├── packages/
│   ├── shared/           # Shared TypeScript types, enums, and interfaces
│   ├── ui/               # Shared React component library (shadcn/ui based)
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared tsconfig base files
├── docs/                 # This documentation folder
├── docker-compose.yml    # Local development infrastructure
├── turbo.json            # Turborepo pipeline configuration
├── pnpm-workspace.yaml   # pnpm workspace definition
└── package.json          # Root package with Turbo scripts
```

---

## Tech Stack

### Frontend (`apps/web`)

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Strict type safety |
| Vite | 5.x | Lightning-fast build tool |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | Accessible component library (Radix UI) |
| Redux Toolkit | 2.x | Global state management |
| RTK Query | 2.x | Server state, caching, API calls |
| React Router | 7.x | Client-side routing |
| React Hook Form | 7.x | Performant form management |
| Zod | 3.x | Schema validation |
| Recharts | 2.x | Data visualization |
| Socket.io Client | 4.x | Real-time WebSocket features |
| Framer Motion | 11.x | Animations and transitions |
| Axios | 1.x | HTTP client |
| i18next | Latest | Internationalization (EN/AR/ES/FR) |
| @tanstack/react-table | 8.x | Advanced data tables |
| date-fns | 3.x | Date manipulation |
| Lucide React | Latest | Icon system |

### Backend (`apps/api`)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | JavaScript runtime |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Mongoose | 8.x | MongoDB ODM |
| ioredis | 5.x | Redis client |
| Socket.io | 4.x | WebSocket server |
| JWT | 9.x | Authentication tokens |
| bcryptjs | 2.x | Password hashing |
| BullMQ | 5.x | Background job queues |
| Winston | 3.x | Application logging |
| Helmet | 7.x | Security HTTP headers |
| Multer + Cloudinary | 1.x | File upload handling |
| Nodemailer | 6.x | Email service |
| Stripe | 12.x | Payment processing |
| PDFKit | 0.x | PDF generation |

### Infrastructure

| Service | Purpose |
|---|---|
| MongoDB Atlas | Primary database (per-tenant databases) |
| Redis | Caching, sessions, pub/sub, job queues |
| Cloudinary | Image and document storage |
| AWS S3 | DICOM and large file storage |
| Docker | Local development containerization |
| GitHub Actions | CI/CD pipeline |
| AWS ECS Fargate | Production container orchestration |

---

## Multi-Tenancy Architecture

### Strategy: Database-Per-Tenant

Each hospital (tenant) gets its own isolated MongoDB database:

```
Main Database (medicalink_main)
├── tenants          → Hospital metadata, plan, settings
├── subscriptions    → Billing records
└── audit_logs       → Global audit trail

Tenant Database (medicalink_{slug})
├── users            → Hospital staff accounts
├── patients         → Patient records
├── appointments     → Scheduling data
├── consultations    → EHR / clinical notes
├── prescriptions    → Drug orders
├── bills            → Financial records
└── ... (all hospital-specific collections)
```

### Tenant Identification

Tenants are identified by subdomain in production:
```
citygeneral.medicalink.app  → hospital slug: "citygeneral"
royalcare.medicalink.app    → hospital slug: "royalcare"
```

The tenant middleware extracts the slug from the `Host` header, looks up the tenant in the main database, and connects to the correct tenant database. This connection is cached in a Redis pool for performance.

---

## API Architecture

### Response Format

All API responses follow a consistent format:

```typescript
// Success
{
  "success": true,
  "message": "Patient registered successfully",
  "data": { ... },
  "pagination": {           // on list endpoints only
    "total": 250,
    "page": 1,
    "limit": 20,
    "pages": 13
  }
}

// Error
{
  "success": false,
  "message": "Email already in use",
  "errors": [               // validation errors only
    { "field": "email", "message": "Email already in use" }
  ]
}
```

### Authentication Flow

```
Client → POST /auth/login → { accessToken, refreshToken in httpOnly cookie }
Client → API requests with: Authorization: Bearer {accessToken}
Token expires (15 min) → Client → POST /auth/refresh → { new accessToken }
Logout → POST /auth/logout → invalidates refresh token in Redis
```

### Versioning

All endpoints are prefixed with `/api/v1/`.

---

## Design System

### Color Palette

```css
/* Brand Colors */
--primary-500: #4F46E5;    /* Indigo — main brand */
--secondary-500: #14B8A6;  /* Teal — healthcare trust */

/* Application Backgrounds */
--bg-app:     #F0F4F8;     /* Main content area */
--bg-sidebar: #0A1628;     /* Dark navy sidebar */
--bg-card:    #FFFFFF;     /* Cards and panels */

/* Semantic Colors */
--success: #10B981;        /* Green — success states */
--warning: #F59E0B;        /* Amber — warnings */
--danger:  #EF4444;        /* Red — errors, critical */
--info:    #3B82F6;        /* Blue — informational */
```

### Typography

- **Body Text:** `Inter` (Google Fonts)
- **Headings:** `Plus Jakarta Sans` (Google Fonts)
- **Monospace/Numbers:** `JetBrains Mono`

### Layout

- **Sidebar:** 240px width, dark navy (`#0A1628`)
- **Header:** 64px height, white
- **Content Area:** Full remaining width, `#F0F4F8` background
- **Cards:** White, 8px border-radius, `1px #E2E8F0` border, subtle shadow

---

## Real-Time Architecture

Socket.io powers all real-time features:

| Feature | Socket Event | Room |
|---|---|---|
| Patient queue update | `queue-updated` | `queue-{doctorId}-{date}` |
| Emergency alert | `code-blue` | `emergency-{tenantId}` |
| Lab critical value | `critical-value` | `lab-{tenantId}` |
| ICU vital alert | `vital-alert` | `icu-{wardId}` |
| Notification | `notification` | `user-{userId}` |
| Doctor availability | `doctor-status` | `hospital-{tenantId}` |

---

*This document is updated after each phase is completed.*
