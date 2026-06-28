<div align="center">
  <img src="https://img.shields.io/badge/MedicaLink-HMS-4F46E5?style=for-the-badge&logo=health&logoColor=white" alt="MedicaLink Logo" />
  <h1>MedicaLink HMS</h1>
  <p><strong>Enterprise-Grade Multi-Tenant Hospital Management System (SaaS)</strong></p>
  
  <p>
    <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-Monorepo-blue?style=flat-square" alt="Monorepo" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-Strict-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript Strict" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Frontend-React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 18" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Backend-Express.js-404D59?style=flat-square&logo=nodedotjs" alt="Express.js" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Database-MongoDB_Atlas-4EA94B?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB Atlas" /></a>
  </p>
</div>

---

## 🚀 Overview

MedicaLink HMS is a state-of-the-art, **cloud-native Hospital Management System** engineered for high scalability, real-time clinical workflows, and strict data isolation. Built with a Turborepo architecture, it serves as a robust B2B SaaS platform allowing multiple hospitals to manage their entire operations seamlessly.

## ✨ Core Highlights

- **Complete Data Isolation**: True multi-tenant architecture utilizing a Database-Per-Tenant strategy.
- **Enterprise Security**: Hardened authentication (JWT HttpOnly cookies), RBAC, automated data sanitization, and strict Zod validation.
- **Real-Time Clinical Engine**: Live queues, instant notifications, and WebSockets powered by Socket.io and Redis.
- **AI-Powered Workflows**: Gemini 1.5 Flash integration for automated clinical summaries and patient triage.
- **Bespoke UI/UX**: Premium aesthetic featuring glassmorphism, Framer Motion animations, and custom Radix/Tailwind components.
- **Zero-Error Guarantee**: Strict TypeScript configurations across the monorepo ensuring zero build errors or warnings.

---

## 🏗️ Modules & Phases

The system is built in distinct, fully functional phases:

### Phase 1: Core Architecture & Auth
- Advanced multi-tenant Mongoose connection factory.
- Hardened JWT lifecycle management with silent refreshes.
- 2FA integration and robust role-based access control.

### Phase 2: Super Admin Operations (SaaS)
- Tenant lifecycle management and subscription billing.
- System-wide performance monitoring (Redis, BullMQ, DB health).
- Impersonation mechanics for rapid hospital support.

### Phase 3: Hospital Admin & Infrastructure
- Department, ward, and bed hierarchy management.
- Live hospital KPI dashboards with Recharts visualizations.
- Granular staff permission matrices.

### Phase 4: Patient Lifecycle & Portal
- Complete patient registration, deduplication, and deep profiling.
- Segregated Patient Portal ecosystem for self-service.
- Asynchronous Twilio WhatsApp webhooks for patient engagement.

### Phase 5: Doctor & Staff Ecosystem
- Doctor availability and shift block generation.
- Dynamic staff directories with specialty indexing.
- Live, websocket-driven schedule grids.

### Phase 6: Appointments & Smart Queues
- Redis distributed locks (NX flag) to prevent slot double-booking.
- Real-time TV-optimized Queue Boards for reception areas.
- Beautiful `react-big-calendar` drag-and-drop scheduling.

### Phase 7: Electronic Health Records (EHR)
- Interactive Timeline showing all historical clinical visits.
- Advanced SOAP (Subjective, Objective, Assessment, Plan) consultation forms.
- AI-Assisted Clinical Summary Generation.
- Integrated Prescription Builder with real-time drug search and PDF generation.

### Phase 8-12: Clinical & Financial Operations
- **Pharmacy & Lab**: FEFO batch management, delta-checks, Barcode generation.
- **Billing**: Multi-currency, insurance panels, service charge masters.
- **Emergency & ICU**: MLAS triage, real-time ambulance tracking, ventilator charts.
- **OT & Blood Bank**: Surgical scheduling, blood stock matrices.

### Phase 13-19: Advanced Ecosystem
- **Telemedicine & Mobile**: React Native Expo app for patients and doctors, WebRTC.
- **HR & Comms**: Payroll processing, attendance terminals, internal messaging hub.
- **Security & Performance**: OWASP A01-A10 compliance, AES-256-GCM encryption, Redis caching.

---

## 💻 Tech Stack

### Frontend (`apps/web`)
**Core**: React 18, Vite, TypeScript 5, React Router v7  
**State**: Redux Toolkit, RTK Query  
**Styling**: Tailwind CSS v3, shadcn/ui (Radix), Framer Motion  
**Data**: React Hook Form, Zod, Recharts, TanStack Table  

### Backend (`apps/api`)
**Core**: Node.js 20 LTS, Express 4, TypeScript 5  
**Data**: Mongoose 8 (Database-per-tenant), Redis, BullMQ  
**Real-Time**: Socket.io  
**Security**: Helmet, bcryptjs, JWT  
**Integrations**: Twilio, NodeMailer, Cloudinary, Gemini AI  

### DevOps & Monorepo
**Tooling**: Turborepo, pnpm workspaces, ESLint 9 (Flat Config), Husky + lint-staged  
**Infrastructure**: Docker Compose, GitHub Actions  

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v20+)
- [pnpm](https://pnpm.io/) (v9+)
- Docker & Docker Compose

### 1. Start Infrastructure Services
Boot up the local MongoDB and Redis instances:
```bash
docker-compose up -d
```

### 2. Configure Environment
Copy `.env.example` to `.env` in both `apps/web` and `apps/api`.
*Note: Ensure your MongoDB Atlas / Local URI is correctly formatted.*

### 3. Install & Start
Run the following from the root directory:
```bash
pnpm install
pnpm run dev
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`

---
*MedicaLink HMS — Engineering the future of healthcare operations.*
