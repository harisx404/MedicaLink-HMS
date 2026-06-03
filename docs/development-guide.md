# Development Guide

## Prerequisites

Ensure the following are installed before starting:

| Tool | Version | Install |
|---|---|---|
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) |
| pnpm | 9.x | `npm install -g pnpm` |
| Docker Desktop | Latest | [docker.com](https://www.docker.com) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/harisx404/MedicaLink-HMS.git
cd MedicaLink-HMS
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for all workspaces (`apps/web`, `apps/api`, `packages/*`) in a single command.

### 3. Configure Environment Variables

Copy the example environment files:

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and fill in the required values (see the `.env.example` for all variables).

### 4. Start the Database Infrastructure

Start MongoDB and Redis locally using Docker:

```bash
docker-compose up -d
```

This spins up:
- **MongoDB** on `localhost:27017`
- **Mongo Express** (DB UI) on `http://localhost:8081` (admin/admin)
- **Redis** on `localhost:6379`
- **RedisInsight** (Redis UI) on `http://localhost:8001`

### 5. Start the Development Servers

```bash
pnpm run dev
```

Turborepo will start both apps concurrently:
- **Frontend:** `http://localhost:3000`
- **API:** `http://localhost:5000`

---

## Project Scripts

Run from the **root** directory:

| Command | Description |
|---|---|
| `pnpm run dev` | Start all apps in development mode |
| `pnpm run build` | Build all packages and apps |
| `pnpm run lint` | Lint all packages |
| `pnpm run test` | Run all tests |

Run for a specific app:

```bash
pnpm --filter web run dev
pnpm --filter api run dev
pnpm --filter api run build
```

---

## Environment Variables

### `apps/api/.env`

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://admin:adminpassword@localhost:27017
MAIN_DB_NAME=medicalink_main

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (optional for development)
STRIPE_SECRET_KEY=sk_test_...

# OpenAI (Phase 14+)
OPENAI_API_KEY=sk-...

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### `apps/web/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=http://localhost:5000
```

---

## Code Architecture Guidelines

### Backend Folder Structure

```
apps/api/src/
├── config/         # Database, Redis, external service configs
├── controllers/    # Route handler functions (thin layer)
├── middlewares/    # Express middleware (auth, tenant, errors)
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── services/       # Business logic (fat layer)
├── utils/          # Helpers, constants, response format
├── jobs/           # Bull background job definitions
├── sockets/        # Socket.io event handlers
├── validators/     # Zod request validation schemas
├── ai/             # AI service integrations
├── app.ts          # Express app setup
└── server.ts       # HTTP server + Socket.io bootstrap
```

### Frontend Folder Structure

```
apps/web/src/
├── app/            # App bootstrap (providers, router)
├── assets/         # Static images, fonts, icons
├── components/
│   ├── ui/         # shadcn/ui base components
│   ├── common/     # Shared components (DataTable, Sidebar, etc.)
│   └── modules/    # Module-specific compound components
├── features/       # Feature-based modules
│   ├── auth/       # Authentication (login, register, 2FA)
│   ├── dashboard/  # Hospital dashboard
│   ├── patients/   # Patient management
│   ├── doctors/    # Doctor management
│   └── ...         # One folder per module
├── hooks/          # Custom React hooks
├── lib/            # Axios client, utility functions
├── store/          # Redux store + slices
├── types/          # TypeScript type definitions
├── constants/      # App-wide constants
└── i18n/           # Translation files
```

---

## Git Workflow

1. All work happens on `main`
2. After each phase is complete: commit → push → update `workdone.md`
3. Use conventional commit messages (see `workdone.md` for format)
4. Never commit `.env` files, `workdone.md`, or `medicalink-hms-blueprint.md`
