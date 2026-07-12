# MedicaLink HMS — Local Development Guide

> Complete step-by-step instructions to run, seed, and test the entire MedicaLink HMS application on your local machine.

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | v20+ LTS | JavaScript runtime |
| [pnpm](https://pnpm.io/) | v9+ | Package manager (mandatory — do NOT use npm or yarn) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Runs MongoDB & Redis containers |
| [Git](https://git-scm.com/) | Latest | Version control |

---

## Step 1 — Clone & Install Dependencies

```bash
git clone https://github.com/harisx404/MedicaLink-HMS.git
cd MedicaLink-HMS

# Install all workspace packages
pnpm install
```

---

## Step 2 — Start Infrastructure (MongoDB + Redis)

The project uses Docker Compose to run MongoDB and Redis locally:

```bash
docker-compose up -d
```

This starts 4 containers:

| Container | URL | Purpose |
|-----------|-----|---------|
| `medicalink_mongodb` | `localhost:27017` | MongoDB database |
| `medicalink_mongo_express` | `http://localhost:8081` | Web-based MongoDB admin (user: `admin` / pass: `admin`) |
| `medicalink_redis` | `localhost:6379` | Redis cache & BullMQ queues |
| `medicalink_redis_insight` | `http://localhost:8001` | Web-based Redis admin |

**Verify containers are running:**
```bash
docker ps
```
You should see all 4 containers with status `Up`.

---

## Step 3 — Configure Environment Variables

Create a `.env` file in `apps/api/`:

```bash
# From the project root:
cp .env.example apps/api/.env
```

Then edit `apps/api/.env` and set the JWT secrets (must be 32+ characters each):

```env
NODE_ENV=development
PORT=5000

# MongoDB (Docker default — no auth needed for local dev)
MONGO_URI=mongodb://localhost:27017/medicalink
MAIN_DB_NAME=medicalink_main

# Redis
REDIS_URL=redis://localhost:6379

# JWT & Crypto — replace with your own random strings (32+ chars)
JWT_ACCESS_SECRET=change_me_to_a_random_32_char_string_abc123
JWT_REFRESH_SECRET=change_me_to_another_random_32_char_string_xyz
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
ENCRYPTION_KEY=change_me_encryption_key_32_chars_min

# URLs
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000

# Optional services (leave empty for local dev — the app gracefully handles missing keys)
GEMINI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

> **Important:** The MongoDB URI does NOT use the Docker auth credentials. The `docker-compose.yml` MongoDB credentials are only for `mongo-express` admin access. For local development, MongoDB accepts unauthenticated connections on `localhost:27017`.

---

## Step 4 — Seed the Database

Run the full seed script to populate the database with demo data:

```bash
cd apps/api
pnpm run seed:full
```

This creates:
- 1 Super Admin account
- 1 Demo Tenant ("City Hospital") with its own isolated database
- 8+ staff users with different roles (Doctor, Nurse, Receptionist, Pharmacist, etc.)
- Departments, Wards, Beds
- Sample Patients, Appointments, Consultations, Prescriptions
- Drug Inventory, Lab Tests, Blood Bank data
- Bills and Financial records

When complete, you will see: `🎉 ALL PHASES FULLY SEEDED SUCCESSFULLY!`

---

## Step 5 — Start the Development Servers

From the **project root** directory:

```bash
pnpm run dev
```

Turborepo starts both servers simultaneously:

| Application | URL | Description |
|-------------|-----|-------------|
| **Frontend (Web)** | `http://localhost:3000` | React SPA (Vite dev server) |
| **Backend (API)** | `http://localhost:5000` | Express REST API |
| **API Health Check** | `http://localhost:5000/api/v1/health` | Verify API is running |

---

## Step 6 — Login & Test

Open `http://localhost:3000` in your browser. You will see the login page.

### Login Credentials

All passwords default to: **`Password123!`**

| Role | Email | What to Test |
|------|-------|--------------|
| **Super Admin** | `superadmin@medicalink.com` | Tenant management, system monitoring, global audit logs |
| **Hospital Admin** | `admin@cityhospital.com` | Hospital dashboard, departments, staff, wards, analytics |
| **Doctor** | `doctor.smith@cityhospital.com` | Schedule, consultations, EHR, prescriptions, telemedicine |
| **Nurse** | `nurse.joy@cityhospital.com` | Ward management, vitals logging, emergency triage |
| **Receptionist** | `reception.front@cityhospital.com` | Patient registration, appointment booking, queue board |
| **Pharmacist** | `pharmacy.head@cityhospital.com` | Drug inventory, dispensing workstation, purchase orders |
| **Lab Technician** | `lab.tech@cityhospital.com` | Sample collection, result entry, verification |
| **Cashier/Billing** | `finance.manager@cityhospital.com` | Create bills, payments, financial reports |
| **ICU Doctor** | `icu.doctor@cityhospital.com` | ICU patient detail, fluid balance, ventilator charts |

> **Multi-Tenant Note:** When logging in as any City Hospital staff, the system automatically detects their tenant. Super Admin logs in without a tenant context and sees the global SaaS management panel.

---

## Testing Workflows

### Flow 1: Complete OPD Patient Lifecycle
1. **Login as Receptionist** → Register a new patient → Book an appointment with Dr. Smith
2. **Login as Doctor** → Go to Dashboard → Start consultation → Fill SOAP notes → Prescribe medication
3. **Login as Pharmacist** → Dispensing Workstation → Search patient → Dispense prescribed drugs
4. **Login as Cashier** → Create Bill → Pull pending charges → Finalize and pay

### Flow 2: Emergency & Critical Care
1. **Login as Nurse** → Emergency Dashboard → Add triage patient (set MLAS severity)
2. **Login as ICU Doctor** → ICU Dashboard → Open patient → Log vitals → Check charts

### Flow 3: Hospital Administration
1. **Login as Hospital Admin** → Dashboard (KPIs, charts)
2. Navigate to **Departments** → Create/edit departments
3. Navigate to **Wards** → Create wards and generate beds
4. Navigate to **Analytics > Executive** → View revenue, appointment volume charts

### Flow 4: Super Admin (SaaS Management)
1. **Login as Super Admin** → Dashboard (tenant count, MRR)
2. Navigate to **Hospitals** → View/edit City Hospital details
3. Navigate to **System Monitor** → Check MongoDB, Redis, BullMQ health
4. Navigate to **Audit Logs** → View all administrative actions

### Flow 5: Laboratory
1. **Login as Lab Tech** → Lab Dashboard → View pending orders
2. Navigate to **Sample Collection** → Assign barcodes
3. Navigate to **Result Entry** → Enter test parameters
4. Navigate to **Verification** → Approve results (pathologist review)

### Flow 6: Pharmacy Management
1. **Login as Pharmacist** → Pharmacy Dashboard → View pending prescriptions
2. Navigate to **Drug Inventory** → Check stock levels, expiry dates
3. Navigate to **Purchase Orders** → Create new order to supplier
4. Navigate to **Narcotics Register** → Review schedule H/X drugs

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start both frontend and backend in development mode |
| `pnpm run build` | Build both packages (verify TypeScript compilation) |
| `cd apps/api && pnpm run seed` | Seed basic data (Super Admin + 1 tenant) |
| `cd apps/api && pnpm run seed:full` | Seed comprehensive demo data (all modules) |
| `docker-compose up -d` | Start infrastructure containers |
| `docker-compose down` | Stop infrastructure containers |
| `docker-compose down -v` | Stop and delete all data volumes (fresh start) |

---

## Troubleshooting

### "MONGO_URI is required" or Zod validation error on startup
→ Make sure `apps/api/.env` exists and has all required fields. Copy from `.env.example`.

### "Connection refused" on MongoDB
→ Docker containers are not running. Run `docker-compose up -d` first.

### Build fails with TypeScript errors
→ Run `pnpm run build` from the project root to see the exact error. The project should compile with 0 errors.

### Login page appears but login fails
→ Database is not seeded. Run `cd apps/api && pnpm run seed:full` to populate test data.

### Frontend shows blank page
→ The API server might not be running. Check that both `web:dev` and `api:dev` are shown in the terminal output after `pnpm run dev`.

---

## Architecture Overview

```
MedicaLink-HMS/
├── apps/
│   ├── api/          → Express.js REST API (TypeScript)
│   │   ├── src/
│   │   │   ├── config/       → Zod-validated env, database connections
│   │   │   ├── controllers/  → Route handlers (one per module)
│   │   │   ├── middlewares/  → Auth, tenant isolation, rate limiting, XSS
│   │   │   ├── models/       → Mongoose schemas (database-per-tenant)
│   │   │   ├── routes/       → Express routers
│   │   │   ├── services/     → Business logic layer
│   │   │   ├── sockets/      → Socket.io real-time events
│   │   │   └── utils/        → Logger, API response helpers, encryption
│   │   └── package.json
│   ├── web/          → React SPA (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── app/          → Router, Redux store
│   │   │   ├── components/   → Shared UI components (layout, auth, common)
│   │   │   └── features/     → Feature modules (patients, doctors, pharmacy, etc.)
│   │   └── package.json
│   └── mobile/       → React Native Expo app (Phase 16)
├── packages/
│   ├── shared/       → Shared TypeScript types between frontend & backend
│   ├── eslint-config/ → Shared ESLint configuration
│   └── typescript-config/ → Shared tsconfig
├── docker-compose.yml  → MongoDB + Redis infrastructure
├── turbo.json          → Turborepo pipeline configuration
└── pnpm-workspace.yaml → Monorepo workspace definitions
```
