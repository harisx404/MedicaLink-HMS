# Changelog

All notable changes to MedicaLink HMS are documented in this file. This project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-07-12

### Added — Phase 20 & 21: Deployment & Testing
- Vercel serverless adapters for API and Web
- Upstash Redis integration for serverless environments
- GitHub Actions CI/CD pipeline (build, lint, test)
- Vitest test infrastructure for API and Web workspaces
- 41 backend tests (unit + integration) covering auth, billing, pharmacy
- 5 frontend tests covering Redux state management

## [0.19.0] — 2026-06-26

### Added — Phase 18 & 19: Notifications & Security
- Multi-channel notification hub (email, SMS, push, in-app)
- Internal messaging system with real-time delivery
- OWASP A01-A10 compliance hardening
- AES-256-GCM encryption for sensitive patient data (PII)
- Redis cache-aside implementation with granular TTLs
- Compound database indexes for query optimization

## [0.17.0] — 2026-06-19

### Added — Phase 16 & 17: Mobile & HR
- React Native Expo mobile app (patient, doctor views)
- HR management module (attendance, payroll, scheduling)
- Staff directory with shift management

## [0.15.0] — 2026-06-14

### Added — Phase 13-15: Telemedicine, AI & Analytics
- WebRTC video consultation with virtual waiting room
- AI clinical decision support (Gemini integration)
- Voice-to-SOAP transcription pipeline
- Drug interaction checker
- Advanced analytics and BI dashboards with Recharts
- Custom report builder

## [0.12.0] — 2026-06-14

### Added — Phase 11 & 12: Emergency, OT & Blood Bank
- Emergency triage interface (Manchester Triage System)
- Real-time ambulance GPS tracking
- ICU monitoring with ventilator parameter charts
- Operation theater scheduling board
- Blood bank inventory and cross-match management

## [0.10.0] — 2026-06-12

### Added — Phase 8-10: Pharmacy, Lab & Billing
- Pharmacy dispensing workstation with FEFO batch logic
- Drug inventory management and procurement (PO/GRN)
- Narcotics register for controlled substance compliance
- Laboratory information system (orders, collection, results, verification)
- Billing engine with multi-currency support
- Insurance claims management
- Financial reporting suite

## [0.7.0] — 2026-06-10

### Added — Phase 7: Electronic Health Records
- SOAP consultation workspace with tabbed interface
- Prescription writer with drug search
- AI clinical summaries (Gemini 1.5 Flash)
- ICD-10 diagnosis coding integration

## [0.6.0] — 2026-06-08

### Added — Phase 5 & 6: Staff & Appointments
- Doctor directory with specialty indexing
- Schedule management with shift blocks
- Appointment booking wizard with slot selection
- Redis distributed locks preventing double-booking
- Real-time queue board for waiting rooms
- Reception dashboard for check-in workflows

## [0.4.0] — 2026-06-07

### Added — Phase 4: Patient Management
- Multi-step patient registration with UHID generation
- Patient profile with visit history and medical records
- Patient portal with OTP login and AI chatbot
- QR code generation for patient identification
- Duplicate detection (name + DOB + phone matching)

## [0.3.0] — 2026-06-05

### Added — Phase 3: Hospital Admin
- Hospital admin dashboard with KPI metrics
- Department and ward CRUD management
- Bulk bed generator
- Multi-tab hospital settings (General, Appearance, Financial)

## [0.2.0] — 2026-06-04

### Added — Phase 2: Super Admin Panel
- SaaS tenant management dashboard
- Hospital onboarding and subscription management
- System health monitoring (CPU, Memory, Redis, MongoDB)
- Platform-wide audit logging
- Analytics with MRR/ARR/LTV/Churn metrics

## [0.1.0] — 2026-06-04

### Added — Phase 0 & 1: Foundation & Authentication
- Turborepo monorepo with pnpm workspaces
- Multi-tenant database-per-tenant architecture
- JWT authentication with HttpOnly cookie refresh tokens
- Two-factor authentication (TOTP)
- Role-based access control (15 roles)
- Design system (Indigo/Teal/Dark-Navy palette)
- Component library (DataTable, StatsCard, PageHeader, etc.)
- Docker Compose development environment
