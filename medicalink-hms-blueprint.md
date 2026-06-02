# 🏥 MedicaLink HMS SaaS — Complete International Hospital Management System
## Full Development Blueprint | MERN Stack + React Native

> **Project Vision**: A world-class, AI-powered, multi-tenant Hospital Management SaaS that rivals Epic Systems, Oracle Health, and Medscape in scope — built to showcase elite BSIT-level engineering capability.

---

## TABLE OF CONTENTS
1. Executive Summary & Project Identity
2. Complete Tech Stack (Every Tool Explained)
3. System Architecture Overview
4. User Roles & Permission Matrix
5. Complete Module List (25+ Modules)
6. Functional Requirements (Module-by-Module)
7. Non-Functional Requirements
8. UI/UX Design System Specification
9. Complete Pages & Screens List (160+ Pages)
10. AI Integration Points (Where AI Lives)
11. Database Architecture
12. Development Phases 0–25 with Full Prompts

---

## 1. EXECUTIVE SUMMARY & PROJECT IDENTITY

**Product Name**: MedicaLink HMS  
**Tagline**: "The Future of Healthcare Management — AI-Powered. Cloud-Native. World-Class."  
**Type**: Multi-Tenant B2B SaaS  
**Target Market**: International hospitals, clinic chains, healthcare networks, private hospitals  
**Languages**: English (primary), Arabic, Spanish, French (i18n ready)  
**Compliance**: HIPAA-ready, HL7 FHIR compatible, GDPR-ready  

### What Makes This Stand Out
- AI embedded in every clinical workflow (not bolted on)
- True multi-tenant with per-hospital customization
- Real-time everything (live bed tracking, live queue, live vitals)
- Mobile-first (React Native apps for doctors, nurses, patients)
- Offline-capable for critical functions
- Full DICOM/medical imaging support
- WebRTC video consultation built-in
- Predictive analytics and clinical decision support
- Complete financial management with insurance integration

---

## 2. COMPLETE TECH STACK

### Frontend (Web App)
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool (Lightning Fast) |
| Tailwind CSS | 3.x | Utility-First Styling |
| shadcn/ui | Latest | Component Library |
| Redux Toolkit | 2.x | State Management |
| RTK Query | 2.x | API Data Fetching & Caching |
| React Router | 6.x | Client-Side Routing |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation |
| Recharts | 2.x | Data Visualization |
| Socket.io Client | 4.x | Real-time Features |
| Framer Motion | 11.x | Animations |
| React Query | 5.x | Server State Management |
| date-fns | 3.x | Date Manipulation |
| Lucide React | Latest | Icon System |
| React PDF | Latest | PDF Generation |
| @tanstack/table | 8.x | Advanced Data Tables |
| React Big Calendar | Latest | Calendar/Scheduling |
| OpenLayers / Leaflet | Latest | Maps (Ambulance Tracking) |
| i18next | Latest | Internationalization |

### Backend (API Server)
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Express.js | 4.x | Web Framework |
| TypeScript | 5.x | Type Safety |
| Mongoose | 8.x | MongoDB ODM |
| Redis (ioredis) | 4.x | Caching + Sessions + Queues |
| Socket.io | 4.x | WebSocket Server |
| JWT (jsonwebtoken) | 9.x | Authentication |
| bcryptjs | 2.x | Password Hashing |
| Multer | 1.x | File Upload Handling |
| Cloudinary | 1.x | Media Storage (Images, Documents) |
| AWS SDK | 3.x | S3 (DICOM, large files) |
| Stripe | 12.x | Payment Processing |
| Twilio | 4.x | SMS + Voice |
| Nodemailer | 6.x | Email Service |
| Bull/BullMQ | 5.x | Job Queues |
| Express Validator | 7.x | Request Validation |
| Helmet | 7.x | Security Headers |
| Morgan | 1.x | Request Logging |
| Winston | 3.x | Application Logging |
| Agenda | 5.x | Job Scheduling (Cron) |
| Sharp | 0.x | Image Processing |
| PDFKit | 0.x | PDF Generation |
| ExcelJS | 4.x | Excel Reports |
| dotenv | 16.x | Environment Variables |
| cors | 2.x | CORS Handling |
| express-rate-limit | 7.x | Rate Limiting |

### Database
| Database | Purpose |
|---------|---------|
| MongoDB Atlas | Primary Database (All clinical/app data) |
| Redis | Caching, Sessions, Real-time pub/sub, Queues |
| MongoDB GridFS | Large file storage (backup) |

### AI & ML
| Tool | Purpose |
|------|---------|
| OpenAI API (GPT-4o) | Clinical Assistant, NLP, Summaries |
| Anthropic Claude API | Complex clinical reasoning |
| LangChain.js | AI Orchestration & RAG |
| Pinecone | Vector Database (medical knowledge base) |
| TensorFlow.js | Client-side ML predictions |
| OpenAI Whisper | Voice-to-text (clinical notes) |

### Mobile App
| Tool | Purpose |
|------|---------|
| React Native | Cross-platform (iOS + Android) |
| Expo SDK 51 | Development Platform |
| NativeWind | Tailwind for React Native |
| React Navigation | Mobile Routing |
| React Native Reanimated | Animations |
| Expo Camera | Medical photo capture |
| Expo Notifications | Push Notifications |
| React Native Paper | Material Design components |
| WatermelonDB | Offline local database |
| @react-native-async-storage | Persistent storage |

### DevOps & Infrastructure
| Tool | Purpose |
|------|---------|
| Docker + Docker Compose | Containerization |
| GitHub Actions | CI/CD Pipeline |
| AWS ECS/Fargate | Container Orchestration |
| AWS S3 | File Storage |
| AWS CloudFront | CDN |
| AWS ElastiCache | Redis in production |
| AWS SES | Email Service |
| NGINX | Reverse Proxy + Load Balancer |
| Certbot | SSL/TLS Certificates |
| Datadog | Monitoring & APM |
| Sentry | Error Tracking |
| Jest + Vitest | Unit & Integration Testing |
| Playwright | E2E Testing |
| ESLint + Prettier | Code Quality |
| Husky + Commitlint | Git Hooks |

---

## 3. SYSTEM ARCHITECTURE

### Monorepo Structure
```
MedicaLink-hms/
├── apps/
│   ├── web/                 # React + TypeScript web app
│   ├── mobile/              # React Native mobile app
│   └── admin/               # Super Admin portal
├── packages/
│   ├── api/                 # Express.js backend
│   ├── shared/              # Shared types, utils, constants
│   ├── ui/                  # Shared UI components
│   └── config/              # Shared configs (eslint, tsconfig)
├── docker/                  # Docker files
├── docs/                    # Documentation
├── scripts/                 # Build & deploy scripts
├── .github/                 # GitHub Actions
├── docker-compose.yml
├── package.json             # Root package.json (workspaces)
└── turbo.json               # Turborepo config
```

### Backend Folder Structure
```
packages/api/
├── src/
│   ├── config/              # DB, Redis, env config
│   ├── controllers/         # Route handlers
│   ├── middlewares/         # Auth, validation, error handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── services/            # Business logic
│   ├── utils/               # Helpers, constants
│   ├── jobs/                # Background jobs
│   ├── sockets/             # Socket.io handlers
│   ├── ai/                  # AI service integrations
│   ├── validators/          # Zod/express-validator schemas
│   └── app.ts               # Express app
├── tests/
├── Dockerfile
└── package.json
```

### Frontend Folder Structure
```
apps/web/
├── src/
│   ├── app/                 # App entry, providers, routing
│   ├── assets/              # Images, fonts, icons
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── common/          # Shared components (Header, Sidebar, etc.)
│   │   └── modules/         # Module-specific components
│   ├── features/            # Feature-based modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── appointments/
│   │   ├── ehr/
│   │   ├── pharmacy/
│   │   ├── laboratory/
│   │   ├── radiology/
│   │   ├── billing/
│   │   ├── inventory/
│   │   ├── emergency/
│   │   ├── icu/
│   │   ├── ot/
│   │   ├── bloodbank/
│   │   ├── telemedicine/
│   │   ├── hr/
│   │   ├── ai/
│   │   └── analytics/
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # API clients, utilities
│   ├── store/               # Redux store
│   ├── types/               # TypeScript types
│   ├── constants/           # App constants
│   └── i18n/                # Translations
├── public/
├── vite.config.ts
└── tailwind.config.ts
```

### Multi-Tenancy Architecture
- **Strategy**: Database-per-tenant (maximum isolation)
- Each hospital gets its own MongoDB database
- Tenant identified by subdomain: `hospitalname.MedicaLink.app`
- Shared infrastructure, isolated data
- Tenant context injected via middleware
- Tenant-specific settings, branding, feature flags

### API Architecture
- RESTful APIs with consistent response format
- WebSocket for real-time features
- API versioning: `/api/v1/...`
- JWT access tokens (15min) + Refresh tokens (30 days)
- Rate limiting per tenant and per user

---

## 4. USER ROLES & PERMISSION MATRIX

| Role | Access Level | Key Permissions |
|------|-------------|----------------|
| **Super Admin** | SaaS Level | Everything across all tenants |
| **Hospital Admin** | Tenant Level | Full hospital management |
| **Doctor** | Clinical | Patient care, prescriptions, orders |
| **Senior Doctor** | Clinical+ | All doctor + approve juniors' orders |
| **Nurse** | Clinical | Vitals, MAR, nursing notes |
| **Pharmacist** | Pharmacy | Dispensing, inventory, verification |
| **Lab Technician** | Laboratory | Sample processing, result entry |
| **Radiologist** | Radiology | Image reading, reporting |
| **Receptionist** | Front Desk | Registration, appointments, billing view |
| **Billing Staff** | Finance | Bills, payments, insurance |
| **Inventory Manager** | Supply Chain | Stock, purchases, vendors |
| **HR Manager** | Human Resources | Staff, payroll, attendance |
| **Blood Bank Officer** | Blood Bank | Donors, inventory, issue |
| **Emergency Staff** | Emergency | Triage, emergency registration |
| **Patient** | Self-Service | Own records, appointments, bills |

---

## 5. COMPLETE MODULE LIST (25 Modules)

### Clinical Modules (Core)
1. Patient Management & Registration
2. Electronic Health Records (EHR)
3. Appointment & Scheduling
4. Doctor Management
5. Nursing & Ward Management
6. Pharmacy Management
7. Laboratory & Diagnostics
8. Radiology & Medical Imaging
9. Emergency Department
10. ICU Management
11. Operation Theater (OT)
12. Blood Bank

### Administrative Modules
13. Hospital Admin & Settings
14. HR & Staff Management
15. Inventory & Supply Chain
16. Billing & Finance
17. Insurance Management
18. Document Management

### Digital Health Modules
19. Telemedicine & Virtual Care
20. Patient Portal (Self-Service)

### Intelligence & Analytics Modules
21. AI Clinical Decision Support
22. Analytics & Business Intelligence
23. Real-time Monitoring Dashboard

### Platform Modules
24. Notification & Communication Hub
25. Super Admin (SaaS Management)

---

## 6. FUNCTIONAL REQUIREMENTS

### MODULE 1: Patient Management
- **Registration**: OPD/IPD registration, auto UHID generation, QR code patient card
- **Profile**: Demographics, contact, emergency contacts, insurance info
- **Search**: Real-time search by name, UHID, phone, email
- **History**: Complete visit history, chronic conditions, surgical history
- **Documents**: Upload reports, ID documents, insurance cards
- **Portal**: Self-service portal for patients (see own records, book appointments)

### MODULE 2: Electronic Health Records (EHR)
- **Clinical Notes**: SOAP format (Subjective, Objective, Assessment, Plan)
- **Vitals**: BP, Temperature, Pulse, SpO2, Weight, Height, BMI tracking
- **Allergies**: Drug, food, environmental allergies with severity
- **Medications**: Current medications, dosage, frequency, prescriber
- **Problems**: Active/inactive problem list (ICD-10 coding)
- **Immunizations**: Vaccination history and schedule
- **Family History**: Hereditary conditions tracking
- **Social History**: Lifestyle factors (smoking, alcohol, occupation)
- **AI Summarization**: Auto-generate visit summary using AI
- **AI Predictions**: Risk scoring for common conditions

### MODULE 3: Appointment & Scheduling
- **Multi-doctor scheduling** with specialty filtering
- **Time slot management** per doctor with custom durations
- **Online booking** by patients (portal/mobile)
- **Walk-in** registration at reception
- **Queue management**: Real-time token system with display
- **Reminders**: SMS/Email/WhatsApp 24h and 1h before
- **Recurring appointments**: For chronic patients
- **AI optimization**: Intelligent slot suggestion based on history

### MODULE 4: Pharmacy Management
- **Prescription processing**: Digital prescription receipt
- **Drug dispensing**: Barcode/QR scanning, quantity tracking
- **Inventory**: Drug stock with batch, expiry, rack management
- **Purchase orders**: Auto-reorder when below minimum stock
- **Returns**: Patient returns and vendor returns
- **Drug interaction check**: AI-powered real-time checking
- **Formulary management**: Hospital drug formulary
- **Narcotic register**: Controlled substance tracking

### MODULE 5: Laboratory Management
- **Order workflow**: Doctor → Sample Collection → Processing → Result → Report
- **Test catalog**: Comprehensive test library with reference ranges
- **Sample management**: Barcode labels, chain of custody
- **Critical values**: Automatic alerting for critical results
- **Interface**: HL7 integration with analyzers
- **Quality control**: Levy-Jennings charts, Westgard rules
- **Report templates**: Auto-generate professional PDF reports

### MODULE 6: Billing & Finance
- **Billing types**: OPD, IPD, Emergency, Package, Corporate
- **Discount management**: Role-based discount limits
- **Insurance claims**: TPA management, pre-authorization, claim submission
- **Packages**: Package billing (delivery, surgery, etc.)
- **Payment modes**: Cash, card, UPI, insurance, credit
- **Receipts**: Professional PDF receipt generation
- **Daily closing**: Day-end cash collection reports
- **Debtor management**: Outstanding balances, follow-ups
- **Financial reports**: P&L, collections, outstanding, aging analysis

### MODULE 7: Emergency Department
- **Triage**: 5-level Manchester triage system (color-coded)
- **Fast registration**: 30-second emergency patient registration
- **Bed board**: Real-time emergency bed availability
- **Ambulance tracking**: GPS tracking of hospital ambulances
- **Critical alerts**: Code Blue, Code Red real-time notifications
- **Mass casualty**: MCI (Mass Casualty Incident) management

### MODULE 8: ICU Management
- **ICU bed board**: Real-time occupancy and status
- **Vital monitoring**: Hourly vital entry with trend graphs
- **APACHE score**: ICU severity scoring
- **Ventilator management**: Ventilator settings and weaning records
- **Fluid balance**: Input/output charts
- **ICU nursing notes**: Shift-by-shift documentation

### MODULE 9: Operation Theater
- **OT scheduling**: Multi-theater scheduling board
- **Pre-op checklist**: WHO surgical safety checklist
- **Surgical records**: Intraoperative findings, complications
- **Anesthesia**: Anesthesia records and monitoring
- **Post-op notes**: Recovery room notes
- **Team assignment**: Surgeon, anesthetist, scrub nurse assignment
- **Instrument count**: Surgical instrument tracking

### MODULE 10: Telemedicine
- **Video consultation**: WebRTC peer-to-peer HD video
- **Virtual waiting room**: Queue management for online consultations
- **Digital prescription**: E-prescriptions with digital signature
- **Follow-up scheduling**: Post-consultation scheduling
- **Consultation recording**: Optional session recording with consent
- **Chat**: In-consultation messaging

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Page load time: < 2 seconds (LCP)
- API response time: < 200ms (p95)
- Real-time latency: < 100ms (WebSocket)
- Concurrent users: 10,000+ per tenant
- Database queries: Indexed, < 50ms

### Security
- OWASP Top 10 compliance
- AES-256 encryption for data at rest
- TLS 1.3 for data in transit
- JWT with RS256 signing
- 2FA support (TOTP)
- IP whitelisting for admin
- Comprehensive audit logs
- HIPAA-ready data handling
- SQL/NoSQL injection prevention
- XSS/CSRF protection

### Scalability
- Horizontal scaling via Docker/Kubernetes
- Database connection pooling
- Redis caching for frequently accessed data
- CDN for static assets
- Background job processing (Bull queues)
- Microservice-ready architecture

### Reliability
- 99.9% uptime SLA
- Automated backups (hourly incremental, daily full)
- Disaster recovery < 4 hours RTO
- Health check endpoints
- Circuit breaker pattern
- Graceful degradation

### Compliance
- HIPAA (US healthcare)
- GDPR (European patients)
- HL7 FHIR R4 API compatibility
- ICD-10 / SNOMED CT coding
- DICOM for medical imaging

---

## 8. UI/UX DESIGN SYSTEM

### Color Palette
```css
/* Primary Colors */
--primary-50:  #EEF2FF;
--primary-500: #4F46E5;   /* Indigo - Main brand */
--primary-600: #4338CA;
--primary-700: #3730A3;
--primary-900: #1E1B4B;

/* Secondary Colors */
--secondary-400: #2DD4BF;  /* Teal - Healthcare trust */
--secondary-500: #14B8A6;
--secondary-600: #0D9488;

/* Semantic Colors */
--success: #10B981;        /* Emerald */
--warning: #F59E0B;        /* Amber */
--danger:  #EF4444;        /* Red */
--info:    #3B82F6;        /* Blue */

/* Neutrals */
--gray-50:  #F8FAFC;
--gray-100: #F1F5F9;
--gray-200: #E2E8F0;
--gray-500: #64748B;
--gray-700: #334155;
--gray-900: #0F172A;

/* Backgrounds */
--bg-app:      #F0F4F8;    /* Main app background */
--bg-sidebar:  #0A1628;    /* Dark navy sidebar */
--bg-card:     #FFFFFF;
--bg-header:   #FFFFFF;
```

### Typography
```css
/* Font Family */
font-family: 'Inter', system-ui, sans-serif;  /* Body text */
font-family: 'Plus Jakarta Sans', sans-serif;  /* Headings */
font-family: 'JetBrains Mono', monospace;      /* Code/numbers */

/* Scale */
--text-xs:   12px;
--text-sm:   14px;
--text-base: 16px;
--text-lg:   18px;
--text-xl:   20px;
--text-2xl:  24px;
--text-3xl:  30px;
--text-4xl:  36px;
```

### Component Standards
- **Cards**: White background, 8px border-radius, subtle shadow, 1px #E2E8F0 border
- **Buttons**: Primary (indigo), Secondary (outline), Ghost, Danger
- **Inputs**: 40px height, gray-200 border, focus ring indigo-500
- **Tables**: Striped rows, sticky header, sortable columns
- **Sidebar**: 240px width, dark navy, white icons and text
- **Header**: 64px height, white, tenant logo
- **Badges**: Role and status badges with semantic colors
- **Charts**: Recharts, consistent color scheme

### Layout Patterns
- **Dashboard**: Sidebar (240px) + Header (64px) + Content Area
- **Data Entry**: Two-column form layout with labels on left
- **Lists**: Full-width data tables with action columns
- **Detail Pages**: Master-detail layout
- **Mobile**: Bottom navigation + drawer menu

---

## 9. COMPLETE PAGES & SCREENS LIST (160+ Pages)

### Super Admin Portal (12 pages)
1. Super Admin Dashboard
2. Hospital/Tenant List & Management
3. Add/Edit Hospital (Onboarding)
4. Subscription Plans Management
5. Billing & Revenue Dashboard
6. Feature Flags Management
7. System Health Monitor
8. Global Analytics
9. Support Ticket Management
10. System Settings
11. Audit Logs
12. API Keys & Webhooks

### Hospital Admin Portal (15 pages)
13. Admin Dashboard (KPI Overview)
14. Department Management
15. Ward & Bed Management
16. Staff User Management
17. Role & Permission Management
18. Hospital Profile Settings
19. Branding & Customization
20. Integration Settings
21. Notification Templates
22. Fee Schedule Management
23. Insurance Panel Management
24. Compliance & Accreditation
25. System Activity Logs
26. Financial Overview Dashboard
27. Hospital Reports Center

### Patient Management (15 pages)
28. Patient Search/Directory
29. New Patient Registration (OPD)
30. New Patient Registration (IPD)
31. Patient Profile Overview
32. Patient Medical History
33. Patient Documents
34. Patient Insurance Details
35. Patient Visit History
36. Patient Ledger (Financial)
37. Patient Portal - Login/Signup
38. Patient Portal - Dashboard
39. Patient Portal - Appointment Booking
40. Patient Portal - Medical Records
41. Patient Portal - Prescriptions
42. Patient Portal - Bills & Payments

### Doctor & Staff Management (10 pages)
43. Doctor Directory
44. Doctor Profile / Details
45. Add/Edit Doctor
46. Doctor Schedule Management
47. Doctor Availability Calendar
48. Staff Directory
49. Staff Profile
50. Staff Schedule
51. Credential & License Management
52. Department Staff View

### Appointment & Queue (10 pages)
53. Appointment Calendar View
54. Appointment List View
55. New Appointment Booking
56. Appointment Detail
57. Walk-in Token Generation
58. Queue Display Board (TV Screen)
59. Receptionist Queue Management
60. Appointment Reports
61. Cancellation & Rescheduling
62. Appointment Reminders Management

### Electronic Health Records (14 pages)
63. Consultation/Visit Start
64. SOAP Notes Entry
65. Vital Signs Entry & History
66. Physical Examination
67. Diagnosis (ICD-10 Search)
68. Prescription Writing
69. Lab Order Entry
70. Radiology Order Entry
71. Discharge Summary Writing
72. Discharge Summary View
73. EHR Timeline View
74. Allergy Management
75. Chronic Condition Management
76. Immunization Records

### Nursing Module (9 pages)
77. Nurse Dashboard (Ward Overview)
78. Patient Ward Allocation
79. Vital Signs Charting
80. Medication Administration Record (MAR)
81. Nursing Notes
82. Shift Handover Notes
83. IV & Drip Management
84. Fluid Balance Chart
85. Bed Management

### Pharmacy (10 pages)
86. Pharmacy Dashboard
87. Prescription Queue
88. Drug Dispensing Interface
89. Drug Inventory List
90. Add/Edit Drug
91. Purchase Orders
92. Drug Returns
93. Expiry & Batch Management
94. Supplier Management
95. Pharmacy Reports

### Laboratory (11 pages)
96. Lab Dashboard
97. Test Order Queue
98. Sample Collection Interface
99. Sample Processing
100. Result Entry
101. Result Approval & Verification
102. Lab Report Generation & View
103. Test Catalog Management
104. Critical Values Management
105. Quality Control Dashboard
106. Lab Reports Archive

### Radiology (9 pages)
107. Radiology Dashboard
108. Radiology Orders Queue
109. Radiology Scheduling
110. DICOM Image Viewer
111. Radiology Report Writing
112. Report Approval
113. Report Archive
114. Equipment Management
115. Radiology Analytics

### Billing & Finance (12 pages)
116. Billing Dashboard
117. Create New Bill (OPD)
118. Create New Bill (IPD/Final)
119. Bill List & Management
120. Payment Collection Interface
121. Insurance Claims List
122. Insurance Claim Detail & Submission
123. Credit Notes & Refunds
124. Patient Financial Ledger
125. Daily Collection Report
126. Revenue Analytics Dashboard
127. Debtor Management

### Inventory (9 pages)
128. Inventory Dashboard
129. Stock List
130. Create Purchase Order
131. Goods Receipt Note
132. Stock Adjustment
133. Vendor Management
134. Low Stock Alerts
135. Inventory Reports
136. Asset Management

### Emergency & ICU (10 pages)
137. Emergency Dashboard (Real-time)
138. Triage Interface
139. Emergency Registration
140. Emergency Bed Board
141. ICU Dashboard
142. ICU Patient Detail
143. ICU Vital Charting
144. ICU Nursing Notes
145. Ambulance Tracking Map
146. Critical Alert Dashboard

### Operation Theater & Blood Bank (12 pages)
147. OT Scheduling Board
148. OT Case Sheet
149. Pre-Operative Checklist
150. Intraoperative Notes
151. Anesthesia Record
152. Post-Operative Notes
153. Blood Bank Dashboard
154. Donor Registration
155. Blood Collection
156. Blood Inventory
157. Blood Issue
158. Cross-match Management

### HR & Staff Management (8 pages)
159. HR Dashboard
160. Attendance Management
161. Leave Management
162. Payroll Processing
163. Staff Performance Review
164. Training & Certification Records
165. Staff Scheduling
166. Payslip Management

### Telemedicine (7 pages)
167. Telemedicine Dashboard
168. Virtual Waiting Room
169. Video Consultation Interface
170. Post-Consultation Notes
171. Telemedicine History
172. E-Prescription (Telemedicine)
173. Telemedicine Scheduling

### AI & Analytics (8 pages)
174. AI Clinical Assistant Interface
175. Predictive Analytics Dashboard
176. Executive KPI Dashboard
177. Clinical Analytics
178. Operational Analytics
179. Financial Analytics
180. Custom Report Builder
181. Audit & Compliance Report

**TOTAL: 181+ Web Pages**

---

## 10. AI INTEGRATION POINTS

### Where AI Lives in MedicaLink HMS

| Module | AI Feature | Technology |
|--------|-----------|-----------|
| EHR | Auto-generate SOAP summary from voice notes | Whisper + GPT-4o |
| EHR | Risk stratification score for chronic diseases | Custom ML model |
| Pharmacy | Real-time drug-drug interaction alerts | LangChain + medical KB |
| Diagnosis | ICD-10 code suggestion from symptoms | GPT-4o fine-tuned |
| Radiology | AI-assisted reading notes (X-ray findings) | OpenAI Vision |
| Appointment | Optimal slot suggestion based on patient history | GPT-4o + history |
| Lab | Abnormal pattern detection in lab trends | Trend analysis ML |
| Billing | Fraud detection in claims | Anomaly detection |
| Nursing | Deterioration alert (NEWS score auto-calc) | Predictive model |
| Analytics | Natural language querying of reports | LangChain + MongoDB |
| Chat | 24/7 AI health assistant for patients | GPT-4o |
| Notes | Voice-to-text clinical note dictation | Whisper API |
| Records | AI summarization of long clinical records | GPT-4o |
| Emergency | Sepsis alert based on vitals pattern | ML prediction |

---

## 11. DATABASE ARCHITECTURE

### Core Collections (MongoDB)

```javascript
// Tenant (Hospital) - stored in main DB
{
  _id, name, slug, plan, features, settings,
  branding, createdAt, status
}

// Per-tenant database contains all these collections:

// Users
{
  _id, email, password, role, staffId,
  firstName, lastName, phone, isActive,
  lastLogin, twoFactorEnabled
}

// Patients
{
  _id, uhid, firstName, lastName, dob, gender,
  bloodGroup, phone, email, address, emergencyContact,
  insurance[], allergies[], chronicConditions[],
  documents[], photo, registeredBy, createdAt
}

// Appointments
{
  _id, patientId, doctorId, departmentId,
  appointmentDate, timeSlot, type, status,
  reason, notes, tokenNumber, createdAt
}

// Consultations (EHR)
{
  _id, patientId, doctorId, appointmentId,
  visitDate, chiefComplaint, subjective, objective,
  assessment, plan, diagnoses[], vitals{},
  prescriptions[], labOrders[], radiologyOrders[],
  followUpDate, aiSummary, status
}

// Prescriptions
{
  _id, consultationId, patientId, doctorId,
  medications[{drug, dose, frequency, duration, route}],
  instructions, pharmacyStatus, dispensedAt
}

// Drugs (Pharmacy)
{
  _id, name, genericName, brand, category,
  form, strength, unit, hsnCode, batchNumber,
  expiryDate, quantity, reorderLevel, rackLocation,
  purchaseRate, sellingRate, taxCategory
}

// Lab Orders / Results
{
  _id, patientId, doctorId, consultationId,
  tests[{testId, status, results{}, reportUrl}],
  urgency, sampleCollectedAt, reportedAt, verifiedBy
}

// Bills
{
  _id, billNumber, patientId, consultationId,
  visitType, items[], grossAmount, discount,
  taxAmount, netAmount, paidAmount, balance,
  paymentMode, insuranceClaim{}, status
}
```

---

## 12. DEVELOPMENT PHASES WITH PROMPTS

---

### PHASE 0: PROJECT FOUNDATION & ARCHITECTURE SETUP

**Duration**: Week 1  
**Goal**: Set up the complete project foundation, folder structure, build tools, design system, and development environment.

**What to Build**:
- Turborepo monorepo setup
- Frontend (Vite + React + TypeScript + Tailwind + shadcn/ui)
- Backend (Node.js + Express + TypeScript)
- Shared packages
- Design system tokens
- Base component library
- ESLint + Prettier + Husky
- Environment configuration
- Docker Compose for local dev

---

#### 🤖 PHASE 0 PROMPT — Paste into AI Coding Assistant

```
You are an expert full-stack engineer. I am building "MedicaLink HMS" — an international Hospital Management SaaS using MERN stack (MongoDB, Express, React, Node.js) with TypeScript. Create the complete project foundation following these exact specifications:

## Project Structure (Turborepo Monorepo)
Create a turborepo monorepo with this structure:
MedicaLink-hms/
├── apps/
│   ├── web/          # React + TypeScript + Vite frontend
│   └── api/          # Express + TypeScript backend
├── packages/
│   ├── shared/       # Shared TypeScript types, constants, utils
│   ├── ui/           # Shared React component library
│   └── config/       # Shared configs (ESLint, TypeScript, Tailwind)
├── docker-compose.yml
├── turbo.json
└── package.json      # Root with workspaces

## Frontend Setup (apps/web)
- React 18 + TypeScript 5 + Vite 5
- Tailwind CSS 3 with custom theme
- shadcn/ui component library (initialize it)
- React Router v6
- Redux Toolkit + RTK Query
- React Hook Form + Zod
- Framer Motion
- Lucide React icons
- Recharts
- axios
- Socket.io-client
- date-fns
- i18next + react-i18next
- @tanstack/react-table

Configure tailwind.config.ts with this custom theme:
- Primary color: Indigo (#4F46E5)
- Secondary: Teal (#14B8A6)
- App background: #F0F4F8
- Sidebar: #0A1628
- Card: white with subtle shadow
- Font: 'Inter' + 'Plus Jakarta Sans' from Google Fonts

Create these base components in src/components/ui/:
1. Layout/AppLayout.tsx — sidebar + header + main content layout
2. Layout/Sidebar.tsx — dark navy sidebar with navigation
3. Layout/Header.tsx — top header with tenant logo, notifications, user menu
4. Layout/PageWrapper.tsx — page container with breadcrumb
5. common/DataTable.tsx — full-featured table with sort, filter, pagination
6. common/StatsCard.tsx — KPI metric card with icon, value, trend
7. common/SearchInput.tsx — debounced search with loading state
8. common/StatusBadge.tsx — status badges (Active, Inactive, Pending, etc.)
9. common/PageHeader.tsx — page title + breadcrumb + action button
10. common/EmptyState.tsx — empty state illustration component
11. common/LoadingSpinner.tsx — loading states
12. common/ConfirmDialog.tsx — confirmation modal dialog
13. common/DateRangePicker.tsx — date range selection
14. common/FileUpload.tsx — drag-and-drop file upload

Create src/app/router.tsx with lazy-loaded routes for all future modules.
Create src/app/App.tsx with providers (Redux, Router, Theme, i18n).
Create src/store/store.ts with Redux Toolkit setup.
Create src/lib/api.ts — Axios instance with base URL, interceptors for JWT auth, refresh token logic, error handling.
Create src/types/ folder with these TypeScript files:
- user.types.ts, patient.types.ts, appointment.types.ts, common.types.ts

## Backend Setup (apps/api)
- Node.js + Express 4 + TypeScript 5
- Mongoose 8 for MongoDB
- Redis (ioredis)
- Socket.io 4
- JWT + bcryptjs
- Express Validator + Helmet + Morgan + CORS
- Winston logger
- Bull for job queues
- Multer + Cloudinary
- dotenv
- express-rate-limit
- compression

Create this folder structure:
src/
├── config/         # db.ts, redis.ts, cloudinary.ts, env.ts
├── controllers/    # (empty, per-module)
├── middlewares/    # auth.ts, tenant.ts, errorHandler.ts, rateLimiter.ts, upload.ts
├── models/         # (empty, per-module)
├── routes/         # index.ts, (per-module)
├── services/       # (empty, per-module)
├── utils/          # helpers.ts, constants.ts, apiResponse.ts, logger.ts
├── jobs/           # (empty)
├── sockets/        # index.ts
├── validators/     # (empty)
└── app.ts, server.ts

Implement these in detail:
1. src/config/db.ts — Multi-tenant MongoDB connection manager (connect to different DB per tenant using subdomain)
2. src/config/redis.ts — Redis connection with pub/sub setup
3. src/config/env.ts — Strongly typed environment variables with Zod validation
4. src/middlewares/auth.ts — JWT verification middleware with role checking
5. src/middlewares/tenant.ts — Extract tenant from subdomain, attach tenant DB connection to request
6. src/middlewares/errorHandler.ts — Global error handler with proper HTTP status codes
7. src/utils/apiResponse.ts — Consistent API response format: { success, message, data, pagination }
8. src/utils/logger.ts — Winston logger with daily rotation
9. src/app.ts — Express app with all middleware
10. src/server.ts — HTTP server with Socket.io setup

## Shared Package (packages/shared)
Create TypeScript interfaces/types shared between frontend and backend:
- All entity types (User, Patient, Doctor, Appointment, etc.)
- API response types
- Enum values (Roles, Status, BloodGroups, etc.)
- Utility types
- Constants (API routes, pagination defaults)

## Docker Setup
Create docker-compose.yml for local development with:
- MongoDB (port 27017)
- Redis (port 6379)
- MongoDB Express (for DB management)
- RedisInsight (for Redis management)

## Quality Tools
- ESLint + Prettier configs in packages/config
- Husky pre-commit hooks
- Commitlint for conventional commits
- .env.example files for both apps

## Important Requirements:
- Every file must have full TypeScript types, no `any`
- All async functions use try-catch or error boundaries
- Frontend components use React.FC with proper prop types
- Backend uses async/await throughout
- No placeholder comments — write actual implementation code
- Include barrel exports (index.ts) in each folder
- Backend runs on port 5000, frontend on port 3000

Generate all files with complete, production-quality code. Start with package.json files, then configs, then the implementation files.
```

---

### PHASE 1: AUTHENTICATION & MULTI-TENANT SYSTEM

**Duration**: Week 1-2  
**Goal**: Complete authentication system with multi-tenancy, RBAC, and tenant management.

**What to Build**:
- Register/Login/Logout with JWT
- Refresh token rotation
- 2FA (TOTP with QR code)
- Password reset via email
- Multi-tenant middleware (subdomain-based)
- Role-Based Access Control (RBAC)
- Tenant onboarding flow
- Session management with Redis

---

#### 🤖 PHASE 1 PROMPT

```
Building on the MedicaLink HMS foundation from Phase 0. Implement the complete Authentication & Multi-Tenant system.

## Backend: Authentication API

### MongoDB Models to Create:
1. models/User.ts:
{
  _id, tenantId, email, password (hashed), role (enum: see roles),
  firstName, lastName, phone, staffId, department, isActive,
  isEmailVerified, twoFactorSecret, twoFactorEnabled,
  refreshTokens [{ token, device, ip, createdAt, expiresAt }],
  lastLogin, passwordResetToken, passwordResetExpires,
  loginAttempts, lockUntil, avatar, createdAt, updatedAt
}

Roles enum: SUPER_ADMIN, HOSPITAL_ADMIN, DOCTOR, SENIOR_DOCTOR, NURSE, PHARMACIST, LAB_TECHNICIAN, RADIOLOGIST, RECEPTIONIST, BILLING_STAFF, INVENTORY_MANAGER, HR_MANAGER, BLOOD_BANK_OFFICER, EMERGENCY_STAFF, PATIENT

2. models/Tenant.ts (in main DB, not per-tenant):
{
  _id, name, slug (unique, used for subdomain), plan, status,
  adminEmail, phone, address, country, logo, primaryColor,
  features: { pharmacy, lab, radiology, telemedicine, bloodBank, ai },
  subscription: { planId, startDate, endDate, status },
  database: { name, connectionString },
  settings: { currency, timezone, dateFormat, language },
  createdAt, updatedAt
}

### API Routes (/api/v1/auth):
POST /auth/register-hospital  — Super admin creates new hospital tenant
POST /auth/login              — Login (email + password), returns access + refresh tokens
POST /auth/refresh            — Refresh access token using refresh token
POST /auth/logout             — Invalidate refresh token
POST /auth/forgot-password    — Send reset email
POST /auth/reset-password     — Reset with token
POST /auth/verify-email       — Email verification
POST /auth/setup-2fa          — Generate 2FA QR code and secret
POST /auth/enable-2fa         — Enable 2FA after verifying TOTP code
POST /auth/verify-2fa         — Verify TOTP code during login
GET  /auth/me                 — Get current user profile

### Implementation Details:
1. JWT: Access token (15 min, RS256), Refresh token (30 days, stored in Redis + DB)
2. Refresh token rotation: new refresh token on each refresh, old one invalidated
3. Rate limiting: 5 login attempts per 15 min per IP, then lockout
4. Redis keys: 
   - `auth:refresh:{tokenHash}` = { userId, tenantId, device }
   - `auth:blacklist:{tokenHash}` = 1 (for invalidated tokens)
   - `auth:lockout:{ip}` = attempt count
5. Email service: Use Nodemailer with HTML email templates for verification and reset
6. Password: bcryptjs with 12 salt rounds
7. 2FA: Use speakeasy library for TOTP, qrcode library for QR generation

### Middleware:
1. authenticate.ts — Verify JWT, attach user + tenant to request
2. authorize(...roles) — Check if user has required role
3. tenantMiddleware.ts — Extract tenant from subdomain (host header), get tenant from DB, connect to tenant-specific MongoDB database, attach tenantDb to request
4. multipleAuthStrategies.ts — Handle both cookie and header tokens

## Frontend: Authentication Pages

### Pages to Create:
1. /login — Login form with email/password, remember me, 2FA step
2. /forgot-password — Forgot password form
3. /reset-password/:token — Reset password form
4. /verify-email/:token — Email verification page
5. /2fa-setup — 2FA setup with QR code display

### Components:
1. features/auth/LoginPage.tsx — Full login page with:
   - Email/password inputs with validation
   - Show/hide password
   - "Remember me" checkbox
   - "Forgot password" link
   - 2FA code input step (shown after valid credentials)
   - Loading states on button
   - Error messages from API
   - Redirect to dashboard after success
   - Hospital subdomain displayed in header

2. features/auth/ForgotPasswordPage.tsx
3. features/auth/ResetPasswordPage.tsx
4. features/auth/TwoFactorSetupPage.tsx — QR code display + verification

### Redux Auth State:
store/slices/authSlice.ts:
{
  user: UserType | null,
  tenant: TenantType | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}

Actions: login, logout, refreshToken, updateUser

### Protected Route:
Create components/auth/ProtectedRoute.tsx — wrapper that checks authentication and role, redirects to login if not authenticated.
Create components/auth/RoleGuard.tsx — hides/shows content based on user role.

### Auth Hooks:
hooks/useAuth.ts — returns { user, isAuthenticated, login, logout, hasRole, hasAnyRole, isSuperAdmin }
hooks/useTenant.ts — returns { tenant, tenantSlug, features }

### RTK Query API:
Create features/auth/authApi.ts with all auth endpoints using RTK Query.

## Super Admin: Tenant Management

### Super Admin Routes (/api/v1/super-admin):
GET    /super-admin/tenants          — List all hospitals
POST   /super-admin/tenants          — Create new hospital tenant (creates DB, admin user)
GET    /super-admin/tenants/:id      — Get hospital details
PUT    /super-admin/tenants/:id      — Update hospital
DELETE /super-admin/tenants/:id      — Deactivate hospital
POST   /super-admin/tenants/:id/feature-flags — Update feature flags

### Tenant Creation Flow:
When creating a tenant:
1. Validate slug uniqueness
2. Create tenant record in main DB
3. Create new MongoDB database for tenant: `MedicaLink_{slug}`
4. Seed initial data (roles, default settings, department templates)
5. Create admin user in tenant DB
6. Send welcome email to admin

## Requirements:
- All inputs sanitized and validated with express-validator
- HIPAA-compliant: audit log every authentication event
- Passwords never logged
- Access tokens stored in memory (not localStorage), refresh tokens in httpOnly cookies
- CORS configured for subdomain pattern: *.MedicaLink.app
- All error messages are user-friendly but don't expose system details
- Complete TypeScript types throughout
- Unit tests for auth controller using Jest + supertest
```

---

### PHASE 2: SUPER ADMIN PANEL — SAAS MANAGEMENT

**Duration**: Week 2  
**Goal**: Build the complete Super Admin portal for managing hospitals, subscriptions, and the SaaS platform.

---

#### 🤖 PHASE 2 PROMPT

```
Building on Phase 1. Create the complete Super Admin Panel for MedicaLink HMS SaaS management.

## Super Admin Features to Build:

### 1. Super Admin Dashboard (/)
Key metrics to display:
- Total hospitals (tenants), active vs inactive
- Monthly Recurring Revenue (MRR)
- Total patients across all hospitals (from aggregated stats)
- Active users today
- System health status (uptime, API latency, DB status)
- Revenue chart (last 12 months)
- New hospital signups this month
- Support tickets pending

### 2. Hospital Management (/hospitals)
Full CRUD for hospital tenants:
- List view: data table with columns: Hospital Name, Plan, Status, Admin Email, Created Date, Actions
- Search and filter by plan, status, country
- Detail view: hospital info, feature flags, usage stats, subscription info
- Create Hospital form (comprehensive):
  * Hospital name, slug (auto-generated + manual edit)
  * Admin email + password
  * Subscription plan selection
  * Features to enable
  * Hospital address, country, phone
  * Upload logo
  * Timezone and currency settings
- Edit Hospital: update info, change plan, toggle features
- Activate/Deactivate hospital
- Impersonate Hospital Admin (login as them for support)
- View hospital's activity logs

### 3. Subscription Plans (/plans)
Manage SaaS pricing plans:
- Plan list: Basic, Professional, Enterprise
- Plan features: which modules are included
- Pricing: monthly/annual with discount
- Hospital-plan assignment
- Usage limits per plan (users, storage, API calls)

### 4. Analytics Dashboard (/analytics)
- Revenue analytics: MRR, ARR, churn rate, LTV
- Usage analytics: active hospitals, DAU, feature usage
- Geographic distribution of hospitals
- Growth charts

### 5. System Monitor (/system)
- API server health (CPU, Memory, Response times)
- MongoDB status per tenant
- Redis status
- Queue depths (Bull queues)
- Recent errors (from Sentry)
- Deployment info (version, build date)

### 6. Audit Logs (/audit)
- All super admin actions logged
- Filter by action type, date, actor

## Backend APIs (already covered in Phase 1, expand with):
GET /super-admin/stats          — Dashboard stats
GET /super-admin/analytics      — Revenue + usage analytics
GET /super-admin/system-health  — Server health metrics
GET /super-admin/audit-logs     — Audit trail

## Frontend Implementation:
Use a separate layout for super admin (different sidebar, different branding).

Create features/super-admin/:
- SuperAdminDashboard.tsx (with 6 metric cards + 2 charts)
- HospitalList.tsx (data table with bulk actions)
- HospitalDetail.tsx (tabbed detail view)
- HospitalForm.tsx (create/edit with multi-step form)
- SubscriptionPlans.tsx (plan management)
- SystemMonitor.tsx (health dashboard with auto-refresh)
- Analytics.tsx (revenue + usage charts using Recharts)
- AuditLogs.tsx (filterable log table)

## Design for Super Admin:
- Different color scheme: pure dark (background: #0F172A, sidebar: #020817)
- Accent color: emerald (#10B981) for super admin to distinguish from hospital admin
- Power user density: compact tables, information-rich cards
- Real-time updates via WebSocket for system health

## Required Components:
- TenantCard.tsx — clickable hospital card with key stats
- HealthIndicator.tsx — green/yellow/red status dot with tooltip
- RevenueChart.tsx — MRR chart with Recharts
- UsageBar.tsx — usage vs limit progress bar
- ImpersonateButton.tsx — "Login as Admin" button that creates impersonation token

All data should use realistic mock data if APIs aren't ready, then connect to real APIs.
Include proper loading states, error states, and empty states for every view.
```

---

### PHASE 3: HOSPITAL ADMIN DASHBOARD & SETTINGS

**Duration**: Week 2-3  
**Goal**: Complete hospital administration with settings, user management, department management, and bed management.

---

#### 🤖 PHASE 3 PROMPT

```
Building on Phase 2. Create the Hospital Admin module for MedicaLink HMS.

## Hospital Admin Dashboard (/admin/dashboard)
Show these KPI cards (pulled from real-time data):
Row 1: Total Patients Today | OPD Patients | IPD Patients | Surgeries Today
Row 2: Available Beds | Occupied Beds | Emergency Cases | Appointments Today
Row 3: Revenue Today | Pharmacy Sales | Lab Tests Ordered | Pending Bills

Below KPIs show:
1. Appointment trend chart (last 7 days, line chart)
2. Revenue vs Expense chart (last 30 days, bar chart)
3. Department-wise OPD load (current day, horizontal bar chart)
4. Top 10 diagnoses this month (pie chart)
5. Real-time activity feed (last 20 actions: "Dr. Smith registered patient...", "Payment received...", etc.)
6. Bed occupancy by ward (occupancy grid visualization)

## Department Management (/admin/departments)
- Create departments: Emergency, OPD, IPD, ICU, OT, Pharmacy, Laboratory, Radiology, Cardiology, Orthopedics, etc.
- Department fields: name, code, head doctor, description, floor, extension number, is_active
- Department list with number of staff and patient count
- Assign head of department

## Ward & Bed Management (/admin/wards)
Ward model: { name, code, type (GENERAL/ICU/HDU/MATERNITY/PEDIATRIC), floor, capacity, department }
Bed model: { bedNumber, ward, type (STANDARD/ICU/HDU/ISOLATION), status (AVAILABLE/OCCUPIED/MAINTENANCE/RESERVED), currentPatient, floor, features }

- Ward list with occupancy meters
- Add/Edit wards
- Bed grid view — visual grid showing all beds with color coding:
  * Green = Available
  * Red = Occupied (shows patient name on hover)
  * Yellow = Reserved
  * Gray = Maintenance
- Bulk bed creation (ward has 20 beds: generate them)
- Bed assignment to patients
- Bed cleaning/maintenance status

## User Management (/admin/users)
For managing all hospital staff users:
- User list: name, role, department, status, last login
- Create user form (detailed):
  * Personal info: name, DOB, gender, photo
  * Contact: email, phone, address
  * Work info: employee ID, department, designation, join date
  * Role selection (dropdown of all roles except Super Admin)
  * If Doctor role: specialization, registration number, degree, experience
  * Credentials: set password or send invite email
- Edit user
- Activate/Deactivate user
- Change user role
- View user activity
- Reset user password

## Role & Permission Management (/admin/roles)
- Visual permission matrix: rows = roles, columns = features/actions
- Toggle permissions per role
- Create custom roles
- Clone existing role and modify
- Audit permission changes

## Hospital Settings (/admin/settings)
Create tabbed settings page:
Tab 1 - General Settings:
  - Hospital name, logo, tagline
  - Address, contact numbers, email
  - GST/Tax number, license number
  - Working hours (per day of week)
  - Holiday management

Tab 2 - Appearance:
  - Primary color picker (updates whole theme)
  - Upload header logo
  - Upload favicon
  - Footer text for reports/bills

Tab 3 - Financial Settings:
  - Default currency
  - Tax rates (GST slabs or single rate)
  - Payment modes accepted
  - Insurance panel list

Tab 4 - Notification Settings:
  - SMS provider config (Twilio keys)
  - Email config (SMTP settings)
  - WhatsApp integration
  - Notification templates (editable with variables)

Tab 5 - Integration Settings:
  - Lab analyzer HL7 integration
  - DICOM server config
  - Insurance API integration
  - EMR/EHR data export settings

## Backend Models and APIs:
Create these models:
- models/Department.ts
- models/Ward.ts
- models/Bed.ts
- models/HospitalSettings.ts

Create these controllers:
- controllers/departmentController.ts (CRUD)
- controllers/wardController.ts (CRUD + bed management)
- controllers/userController.ts (CRUD for staff)
- controllers/settingsController.ts (get/update settings)
- controllers/dashboardController.ts (admin dashboard stats)

Dashboard stats endpoint aggregates from:
- Total patients registered today (new Patients collection query)
- OPD: consultations today, IPD: admitted patients
- Beds: count by status from Bed collection
- Revenue: sum from Bills today

## Frontend Components to Create:
1. features/admin/Dashboard/ — admin dashboard with charts
2. features/admin/Departments/ — department management
3. features/admin/Wards/ — ward + visual bed grid
4. features/admin/Users/ — staff user management
5. features/admin/Settings/ — tabbed settings page
6. components/common/BedGrid.tsx — interactive bed visualization
7. components/common/OccupancyMeter.tsx — circular progress for bed occupancy

All components fully typed, with loading/error/empty states.
RTK Query endpoints for all API calls.
Real-time bed status updates via Socket.io subscription.
```

---

### PHASE 4: PATIENT MANAGEMENT MODULE

**Duration**: Week 3  
**Goal**: Complete patient registration, profiles, search, and patient portal.

---

#### 🤖 PHASE 4 PROMPT

```
Building on Phase 3. Create the complete Patient Management module for MedicaLink HMS.

## Patient Model (Full Schema)
models/Patient.ts:
{
  _id, uhid (auto: HMS-2024-000001), tenantId,
  // Personal Info
  firstName, lastName, middleName, dateOfBirth, gender,
  bloodGroup, maritalStatus, religion, nationality,
  photo, // Cloudinary URL
  
  // Contact
  phone (primary), altPhone, email,
  address: { street, city, state, country, pincode },
  
  // Emergency Contact
  emergencyContact: { name, relationship, phone, address },
  
  // Medical Info
  allergies: [{ allergen, type, severity, reaction, addedBy }],
  chronicConditions: [{ condition, icdCode, diagnosedDate, status }],
  currentMedications: [{ drug, dose, frequency, prescribedBy }],
  immunizations: [{ vaccine, date, nextDue, batchNumber }],
  
  // Insurance
  insurances: [{
    provider, policyNumber, memberName, validFrom, validTo,
    cardImage, preauthRequired, tpaName
  }],
  
  // Registration
  registrationType: OPD | IPD | EMERGENCY,
  referredBy: { type: DOCTOR|HOSPITAL|SELF, name },
  createdBy, registrationDate, isActive,
  
  // Patient Portal
  portalUserId, isPortalEnabled,
  
  // Analytics
  totalVisits, lastVisitDate, totalBilled, outstandingBalance
}

## UHID Generation:
Auto-generate UHID in format: HMS-YYYY-NNNNNN (e.g., HMS-2024-000001)
Maintain per-tenant counter for UHID sequences.

## API Endpoints (/api/v1/patients):
POST   /patients           — Register new patient
GET    /patients           — List patients (paginated, searchable)
GET    /patients/:id       — Get patient profile
PUT    /patients/:id       — Update patient info
DELETE /patients/:id       — Soft delete (deactivate)
GET    /patients/:id/visits        — Patient visit history
GET    /patients/:id/bills         — Patient billing history
GET    /patients/:id/prescriptions — Prescription history
GET    /patients/:id/lab-results   — Lab results history
POST   /patients/:id/documents     — Upload documents
GET    /patients/search            — Advanced search
GET    /patients/:id/qr-code       — Generate patient QR code
POST   /patients/:id/portal/enable — Enable patient portal

## Frontend Pages:

### 1. Patient Registration Page (/patients/register)
Multi-step form (stepper with progress):
Step 1 - Basic Info:
  - Photo upload (webcam or file)
  - First, Middle, Last name
  - Date of birth (age auto-calculated)
  - Gender, Blood group, Marital status
  - Nationality
  
Step 2 - Contact Details:
  - Primary phone (with country code)
  - Alternate phone, Email
  - Full address with country/state/city dropdown
  - Emergency contact (name, relationship, phone)
  
Step 3 - Medical Info:
  - Allergies (add multiple with severity: MILD/MODERATE/SEVERE)
  - Current medications (add multiple)
  - Chronic conditions (with ICD-10 search)
  - Previous surgeries
  
Step 4 - Insurance:
  - Add insurance cards (multiple)
  - Scan insurance card via camera (OCR with AI to auto-fill)
  - Policy details
  
Step 5 - Review & Submit:
  - Summary of all entered data
  - Confirm and register
  - Print patient card with QR code

After registration: Show success screen with UHID, option to:
  - Print patient card
  - Book appointment
  - Add to IPD admission

### 2. Patient Directory (/patients)
- Search bar: real-time search by name, UHID, phone
- Filters: gender, blood group, registration date range, registration type
- Data table: Photo | UHID | Name | Age | Phone | Last Visit | Balance | Actions
- Quick actions: View | Appointment | Bill
- Bulk actions: Export to Excel
- Total count display
- "New Patient" primary button

### 3. Patient Profile (/patients/:id)
Tabbed detail view:

Tab 1 - Overview:
  - Patient card (photo, UHID, name, age, blood group, phone)
  - Allergies highlighted in red banner
  - Chronic conditions
  - Insurance info
  - Emergency contact
  - Quick stats: Total Visits | Last Visit | Outstanding Balance

Tab 2 - Visit History:
  - Timeline of all visits
  - Each visit shows: date, doctor, diagnosis, prescription count, bill amount
  - Click to expand visit details
  - Filter by date range, doctor, department

Tab 3 - Medical Records:
  - Lab results with PDF download
  - Radiology reports
  - Uploaded documents
  - Sorted by date, filterable by type

Tab 4 - Prescriptions:
  - All prescriptions in timeline
  - Prescription detail modal
  - Print prescription button

Tab 5 - Financial:
  - All bills with status (PAID/PARTIAL/PENDING)
  - Total charged, total paid, outstanding balance
  - Payment history
  - Receipt download

Tab 6 - Documents:
  - Document gallery (ID cards, insurance cards, consent forms, reports)
  - Upload new document with category
  - View/Download/Delete

### 4. Patient Portal (/portal)
Separate login for patients:
- Patient login with phone + OTP (no password)
- Patient Dashboard showing upcoming appointments, recent results
- Book appointment (show available doctors by specialty)
- View medical records
- View/Pay bills online (Stripe integration)
- Download prescriptions
- Telemedicine button (for virtual consultations)

## Key Components:
1. PatientCard.tsx — compact patient info card used across modules
2. AllergyBadge.tsx — red badge showing allergy with severity
3. UHIDDisplay.tsx — formatted UHID with copy and QR button
4. PatientSearchCombobox.tsx — type-ahead search used across the app
5. PatientQRCode.tsx — QR code for patient card printing
6. InsuranceCard.tsx — insurance info display
7. VisitTimeline.tsx — chronological visit history
8. PatientPortalLayout.tsx — patient-facing portal layout (different from staff UI)

## Smart Features:
1. Duplicate patient detection: Before creating, check if same name + DOB + phone exists, show warning
2. Age calculation: Auto-calculate from DOB, handle newborns (show days/months)
3. QR Code: Patient QR code encodes UHID, scan to instantly load patient profile
4. WhatsApp integration: Send welcome message with UHID after registration
5. Patient AI assistant: "Ask about your health" chatbot in patient portal (GPT-4o)

Complete TypeScript types, RTK Query, error handling, and responsive design throughout.
```

---

### PHASE 5: DOCTOR & STAFF MANAGEMENT

**Duration**: Week 3-4  
**Goal**: Complete doctor profiles, specialties, scheduling templates, and staff directory.

---

#### 🤖 PHASE 5 PROMPT

```
Building on Phase 4. Create the complete Doctor & Staff Management module for MedicaLink HMS.

## Doctor Model (Full Schema)
models/Doctor.ts (extends User with doctor-specific fields):
{
  userId: ref('User'),
  // Professional Info
  registrationNumber (Medical Council Number, unique),
  specializations: [{ specialty, subSpecialty, isPrimary }],
  qualifications: [{ degree, institution, year, certificate }],
  experience: (years),
  
  // Schedule Template
  weeklySchedule: [{
    day: (MON-SUN),
    isWorking: boolean,
    shifts: [{ startTime, endTime, appointmentDuration, maxPatients, type: OPD|IPD|EMERGENCY }]
  }],
  
  // Fees
  consultationFee: { opd, ipd, emergency, followUp, telemedicine },
  
  // Profile
  biography, languages, awards, publications,
  photo (cloudinary),
  
  // Performance
  avgRating, totalRatings, totalConsultations,
  
  // Status
  isAvailableToday, currentStatus: AVAILABLE|IN_CONSULTATION|ON_LEAVE|OFFLINE
}

## API Endpoints:
GET    /doctors              — List doctors (filter by specialty, department, availability)
POST   /doctors              — Create doctor profile
GET    /doctors/:id          — Doctor profile
PUT    /doctors/:id          — Update profile
GET    /doctors/:id/schedule — Get schedule for week/month
PUT    /doctors/:id/schedule — Update weekly schedule template
GET    /doctors/:id/availability?date= — Get available slots for a date
GET    /doctors/:id/patients — Doctor's patient list
GET    /doctors/:id/stats    — Performance statistics
POST   /doctors/:id/leave    — Apply for leave (affects scheduling)
PUT    /doctors/:id/status   — Update current availability status

## Frontend Pages:

### 1. Doctor Directory (/doctors)
- Grid view (default): Doctor cards showing photo, name, specialty, rating, status badge
- List view: table with all details
- Filter sidebar: specialty, department, availability
- Search by name, registration number
- "Add Doctor" button
- Each card: photo, name, specialty, degree, experience, rating stars, status (AVAILABLE/BUSY/OFFLINE), Book Appointment button

### 2. Doctor Profile (/doctors/:id)
Tabs:
Tab 1 - Overview: Photo, bio, qualifications, specialties, languages, awards
Tab 2 - Schedule: Weekly schedule grid, edit schedule button
Tab 3 - Patients: List of doctor's patients with filter
Tab 4 - Statistics: Consultations chart, rating breakdown, revenue generated
Tab 5 - Leaves: Leave calendar and history

### 3. Doctor Schedule Management (/doctors/:id/schedule)
Visual weekly schedule editor:
- 7-day grid (Mon-Sun)
- For each day: toggle working/non-working
- Add multiple shifts per day
- Set appointment duration (15/20/30/45/60 min)
- Set max patients per shift
- Visual preview of how slots will appear to patients
- "Apply for Leave" button that blocks dates
- Holiday sync with hospital settings

### 4. Staff Directory (/staff)
- List all non-doctor staff
- Filter by role, department
- Staff card: photo, name, role, department, employee ID, phone
- Quick actions: view profile, edit, activate/deactivate

## Key Components:
1. DoctorCard.tsx — card with doctor info, specialty chips, rating stars
2. AvailabilityStatus.tsx — real-time availability badge
3. ScheduleGrid.tsx — interactive weekly schedule builder
4. RatingStars.tsx — star rating display
5. SpecialtyBadge.tsx — colored specialty chip
6. DoctorStats.tsx — performance metrics panel

## Realtime Features:
- Doctor status updates in real-time via Socket.io
- "Doctor available" / "Doctor in consultation" status changes broadcast to all connected clients
- Reception can see which doctors are available right now on their dashboard

All with proper TypeScript, RTK Query, loading states, and responsive design.
```

---

### PHASE 6: APPOINTMENT & SCHEDULING ENGINE

**Duration**: Week 4  
**Goal**: Complete appointment booking system with calendar, queue management, and reminders.

---

#### 🤖 PHASE 6 PROMPT

```
Building on Phase 5. Create the complete Appointment & Scheduling Engine for MedicaLink HMS.

## Appointment Model:
{
  _id, appointmentNumber (auto: APT-2024-00001),
  patient: ref('Patient'), doctor: ref('Doctor'), department: ref('Department'),
  appointmentDate, timeSlot: { start, end },
  type: OPD | IPD | EMERGENCY | TELEMEDICINE | FOLLOWUP,
  status: SCHEDULED | CONFIRMED | CHECKED_IN | IN_CONSULTATION | COMPLETED | CANCELLED | NO_SHOW,
  tokenNumber (daily sequence per doctor),
  reasonForVisit, notes, priority: NORMAL|URGENT|EMERGENCY,
  bookedBy: ref('User'), bookedAt,
  checkedInAt, consultationStartAt, consultationEndAt,
  reminders: [{ type, sentAt, status }],
  cancellation: { reason, cancelledBy, cancelledAt, refundStatus },
  createdAt, updatedAt
}

## Scheduling Service (Critical Business Logic):
services/schedulingService.ts:
1. getAvailableSlots(doctorId, date):
   - Get doctor's weekly schedule template for that day
   - Get all booked appointments for that date
   - Check doctor leave for that date
   - Check hospital holidays
   - Return array of available time slots with slot details
   
2. bookAppointment(data):
   - Validate slot is still available (race condition: use Redis lock)
   - Create appointment with sequential token number
   - Send confirmation SMS/Email
   - Schedule reminder job (via Bull queue: run 24h and 1h before)
   
3. queueManagement:
   - getQueueForDoctor(doctorId, date): returns ordered queue with estimated wait time
   - estimateWaitTime(doctorId): avg consultation time × patients before
   - callNextPatient(doctorId): updates status to IN_CONSULTATION

## API Endpoints (/api/v1/appointments):
POST   /appointments              — Book appointment
GET    /appointments              — List (filter: doctor, date, status, patient)
GET    /appointments/:id          — Appointment detail
PUT    /appointments/:id          — Update appointment
DELETE /appointments/:id          — Cancel appointment
POST   /appointments/:id/check-in — Patient check-in (generates token)
POST   /appointments/:id/start    — Start consultation (doctor marks)
POST   /appointments/:id/complete — Complete consultation
GET    /doctors/:id/slots?date=   — Get available slots for date
GET    /doctors/:id/queue         — Live queue for today
POST   /doctors/:id/queue/next    — Move to next patient
POST   /doctors/:id/availability  — Toggle doctor availability

## Frontend Pages:

### 1. Appointment Calendar (/appointments/calendar)
- Full calendar view using React Big Calendar
- Month/Week/Day views
- Color-coded by status
- Click slot to see appointment details
- Drag-and-drop to reschedule (with confirmation)
- Filter by doctor, department
- Print schedule

### 2. Appointment List (/appointments)
Data table with:
- Filters: date range, doctor, department, status, type
- Columns: Token | Time | Patient | Doctor | Type | Status | Actions
- Quick status updates (right-click context menu)
- Export to Excel
- Statistics bar: Total | Scheduled | Completed | Cancelled | No-Show

### 3. Book Appointment (/appointments/book)
Step 1: Find Doctor
  - Department selection
  - Doctor cards with real-time availability
  - Doctor filter by specialty

Step 2: Select Date & Time
  - Calendar to pick date
  - Grid of available time slots (colored by availability)
  - Selected slot highlighted

Step 3: Patient Selection
  - Search existing patient by name/UHID/phone
  - Or register new patient (inline mini-form)
  - Reason for visit input
  - Priority selection
  - Insurance to use for this visit

Step 4: Confirm
  - Summary: Doctor | Date | Time | Patient | Type
  - Estimated wait time
  - Notification preferences (SMS, Email)
  - Confirm & Book button
  - Success: Show appointment card with token number

### 4. Queue Management Board (/queue) — TV Display Mode
Full-screen display for waiting area TV:
- Hospital logo + date/time
- Current patients:
  * NOW: "Token 5 - Mr. Ahmad Khan - Room 2"
  * NEXT: "Token 6 - Ms. Fatima Ali"
  * WAITING: List of next 5 tokens
- Running ticker with appointment reminders
- Auto-refresh every 30 seconds via Socket.io

### 5. Receptionist Queue Dashboard (/appointments/queue)
- Multi-doctor queue view (all doctors' queues side by side)
- Call next patient button
- Mark no-show
- Emergency override (jump patient to front)
- Queue statistics: avg wait time, patients remaining

## Reminder System (Background Jobs):
jobs/appointmentReminders.ts:
- Bull queue: 'appointment-reminders'
- Job scheduled at: appointment_time - 24h and appointment_time - 1h
- On job execution:
  * Verify appointment is still active
  * Get patient contact info
  * Send SMS via Twilio: "Reminder: Your appointment with Dr. [X] is at [time] today. Token: [N]. [Hospital name]"
  * Send Email via Nodemailer with appointment card
  * Mark reminder as sent

## Real-time Features (Socket.io):
- Room: `queue-{doctorId}-{date}`
- Events:
  * 'patient-checked-in': broadcast when patient checks in
  * 'consultation-started': when doctor starts with patient
  * 'consultation-ended': when consultation completes
  * 'queue-updated': full queue state update
- Reception screen auto-updates via socket
- Queue display TV auto-updates via socket
- Doctor's dashboard shows live queue count

## Smart Features:
1. Slot conflict prevention: Redis distributed lock when booking to prevent double-booking
2. Estimated wait time: calculated from avg consultation duration (rolling 7-day average per doctor)
3. Late arrival handling: auto-reschedule to next available slot with patient notification
4. No-show tracking: after 30min past appointment time with no check-in, auto-flag as no-show
5. AI slot suggestion: "Best appointment for this patient" based on patient history and doctor specialty match

All components fully typed, real-time via Socket.io, responsive design.
```

---

### PHASE 7: ELECTRONIC HEALTH RECORDS (EHR)

**Duration**: Week 5  
**Goal**: Complete clinical documentation system with SOAP notes, prescriptions, lab/radiology orders.

---

#### 🤖 PHASE 7 PROMPT

```
Building on Phase 6. Create the complete Electronic Health Records (EHR) module — the core clinical documentation system.

## Data Models:

### Consultation Model:
{
  _id, consultationNumber, patient, doctor, appointment,
  visitDate, visitType: OPD|IPD|EMERGENCY|TELEMEDICINE,
  department,
  
  // SOAP Notes
  chiefComplaint: string,
  historyOfPresentIllness: string,
  
  subjective: {
    symptoms: [{ symptom, duration, severity, notes }],
    reviewOfSystems: { cardiovascular, respiratory, gastrointestinal, ... }
  },
  
  objective: {
    vitals: { 
      bp: { systolic, diastolic }, 
      pulse, temperature, respRate, spO2, 
      weight, height, bmi (auto-calc),
      painScore (0-10), bloodGlucose 
    },
    physicalExam: { general, cvs, respiratory, abdomen, cns, skin, notes },
    anthropometry: { waistCircumference, hipCircumference }
  },
  
  assessment: {
    diagnoses: [{ 
      icdCode, description, type: PRIMARY|SECONDARY|COMORBIDITY,
      severity, status: PROVISIONAL|CONFIRMED|DIFFERENTIAL 
    }],
    clinicalNotes: string,
    aiSummary: string (generated by AI)
  },
  
  plan: {
    prescriptions: [ref('Prescription')],
    labOrders: [ref('LabOrder')],
    radiologyOrders: [ref('RadiologyOrder')],
    procedures: [{ name, notes, scheduledDate }],
    referrals: [{ speciality, doctorName, urgency, notes }],
    instructions: string,
    followUpDate, followUpReason,
    sickLeave: { days, fromDate, toDate, reason }
  },
  
  // Billing
  consultationFee, 
  
  status: DRAFT | COMPLETED | SIGNED,
  signedAt, signedBy,
  createdAt, updatedAt
}

### Vitals Model (for nursing chart, separate from consultation):
{
  patient, ward, bed, recordedBy,
  bp, pulse, temp, respRate, spO2, weight, height,
  bloodGlucose, urine, pain,
  timestamp, notes
}

### Prescription Model:
{
  _id, prescriptionNumber, consultation, patient, doctor,
  medications: [{
    drugId, drugName, genericName, strength, form,
    dose, doseUnit,
    frequency: { times, period, instructions },
    route: ORAL|IV|IM|SC|TOPICAL|INHALED|...,
    duration, quantity,
    whenToTake: BEFORE_MEALS|AFTER_MEALS|WITH_MEALS|AT_BEDTIME|...,
    instructions, isSubstitutable
  }],
  generalInstructions, followUpDate,
  digitalSignature, qrCode,
  pharmacyStatus: PENDING|DISPENSED|PARTIAL,
  createdAt
}

## Frontend Pages:

### 1. Consultation Start (/consultation/new?appointmentId=)
When doctor starts consultation:
- Auto-loaded with patient info and appointment details
- Split layout: Patient summary on left (compact), SOAP form on right
- Real-time save (auto-save every 30 seconds)

SOAP Form Layout:
[Chief Complaint] — text input, prominent at top

[Subjective Tab]:
  - Symptoms builder: search symptom, add duration/severity
  - Review of systems checklist (expandable)
  - Previous visit summary (AI-generated, collapsible)

[Objective Tab]:
  - Vitals panel: BP, Pulse, Temp, SpO2, RR, Weight, Height (BMI auto-calc)
  - Pain score: 0-10 slider with face icons
  - Physical examination: structured form with body system tabs
  
[Assessment Tab]:
  - Diagnosis search: Type to search ICD-10 codes (pre-loaded database of 10k+ codes)
  - Add multiple diagnoses with primary/secondary selection
  - AI suggestion button: "Suggest diagnosis based on symptoms" (calls GPT-4o)
  - Clinical notes text area

[Plan Tab]:
  - Prescription writer (see below)
  - Lab order creator
  - Radiology order creator
  - Follow-up date picker
  - Instructions to patient

### 2. Prescription Writer (embedded in consultation)
Smart prescription interface:
- Drug search: type drug name, shows brand + generic options with strength
- Selected drug shows: standard dosing suggestions
- Drug interaction checker: real-time alert if added drug interacts with existing medications
- Dosing calculator: weight-based dosing for pediatric patients
- Print-ready prescription: show preview of how it'll look
- e-Signature: digital signature pad or click-to-sign
- Prescription QR code generated for verification

### 3. ICD-10 Search Component
- Pre-load ICD-10 codes database (into MongoDB or Elasticsearch)
- Fuzzy search by code or description
- Common diagnoses quick-select (per specialty)
- Recent diagnoses for this doctor (quick re-use)
- AI suggestion: "Based on symptoms, consider: [code list]"

### 4. Visit History / EHR Timeline (/patients/:id/ehr)
Timeline view of all visits:
- Each visit: date, doctor, chief complaint, diagnoses (chips), actions
- Expand to see full SOAP notes
- Download as PDF
- Print button
- Filter by: date range, doctor, department, diagnosis

### 5. Vital Signs Chart (/patients/:id/vitals)
- Trend charts for each vital (BP, pulse, temp, SpO2)
- Recharts line graphs
- Date range selector
- Table view option
- Add vitals button (for nurses)
- Normal range reference lines on charts

## AI Features in EHR:
1. aiService.ts functions:
   
   generateVisitSummary(consultation):
   - Input: chief complaint + symptoms + vitals + examination + diagnoses
   - Output: 2-3 sentence clinical summary for referring doctors
   - Uses GPT-4o with medical system prompt
   
   suggestDiagnosis(symptoms, vitals, patientHistory):
   - Returns top 5 differential diagnoses with ICD-10 codes and reasoning
   - Include confidence percentage
   
   checkDrugInteractions(drugList):
   - Check against medical interaction database
   - Flag MAJOR, MODERATE, MINOR interactions
   - Return specific interaction description
   
   voiceToSoapNotes(audioBlob):
   - Send to OpenAI Whisper for transcription
   - Send transcript to GPT-4o with prompt to structure as SOAP
   - Return structured SOAP object
   
   generateDischargeInstructions(consultation, diagnosis):
   - Generate patient-friendly discharge instructions
   - In patient's language

2. Voice Input Button:
   - Click to record
   - Whisper transcription in real-time
   - AI structures the transcript into SOAP fields
   - Doctor reviews and confirms

## Backend APIs:
POST   /consultations             — Start/create consultation
GET    /consultations/:id         — Get consultation
PUT    /consultations/:id         — Update (auto-save)
POST   /consultations/:id/sign    — Sign and finalize
GET    /patients/:id/consultations — Patient's consultation history

POST   /prescriptions             — Create prescription
GET    /prescriptions/:id         — Get prescription
GET    /prescriptions/:id/pdf     — Download prescription PDF

GET    /icd10/search?q=           — Search ICD-10 codes
GET    /drugs/search?q=           — Search drug database
GET    /drugs/interactions        — Check drug interactions

POST   /ai/suggest-diagnosis      — AI diagnosis suggestion
POST   /ai/transcribe             — Voice transcription
POST   /ai/generate-summary       — Generate visit summary

## PDF Generation:
Use PDFKit to generate:
1. Prescription PDF: hospital letterhead, doctor signature, QR code, professional layout
2. Visit Summary PDF: clinical notes formatted document
3. Discharge Summary PDF: comprehensive discharge document

All with complete TypeScript, RTK Query, auto-save functionality, and responsive layout.
```

---

### PHASE 8: PHARMACY MANAGEMENT

**Duration**: Week 5-6  
**Goal**: Complete pharmacy module with dispensing, inventory, and purchase management.

---

#### 🤖 PHASE 8 PROMPT

```
Building on Phase 7. Create the complete Pharmacy Management module for MedicaLink HMS.

## Data Models:

### Drug (Formulary) Model:
{
  _id, tenantId,
  name, genericName, brand,
  category: (TABLET|CAPSULE|SYRUP|INJECTION|TOPICAL|INHALER|DROPS|...),
  therapeuticClass, form, strength, unit,
  hsnCode, barcode, drugSchedule: (H/H1/X/OTC/NARCOTIC),
  
  // Pricing
  purchaseRate, sellingRate, mrp, taxCategory,
  
  // Inventory
  currentStock, minimumStock, maximumStock, reorderLevel,
  
  // Active
  isFormulary, isActive,
  
  // Regulatory
  manufacturer, importerName
}

### Drug Batch Model:
{
  drug: ref('Drug'), batchNumber, expiryDate,
  manufacturingDate, purchaseDate,
  quantity, remainingQuantity,
  purchaseRate, mrp,
  rackLocation, supplierId,
  purchaseOrderId
}

### Drug Dispensing Record:
{
  _id, dispensingNumber,
  prescription: ref('Prescription'), patient, dispensedBy,
  items: [{
    drug, batch, quantity, dose,
    unitPrice, totalPrice, instructions
  }],
  totalAmount, paidAmount,
  dispensedAt, returnedAt,
  status: PENDING|PARTIAL|COMPLETED|RETURNED
}

### Purchase Order:
{
  _id, poNumber, supplier,
  items: [{ drug, quantity, rate, total }],
  totalAmount, status: DRAFT|ORDERED|RECEIVED|PARTIAL,
  orderedBy, orderedAt, expectedDelivery,
  goodsReceiptNote: [ref]
}

### Supplier Model:
{
  _id, name, contactPerson, phone, email,
  address, gstNumber, licenseNumber,
  drugs: [ref('Drug')], isActive
}

## API Endpoints:
// Pharmacy
GET    /pharmacy/queue              — Pending prescription queue
POST   /pharmacy/dispense           — Dispense drugs against prescription
GET    /pharmacy/dispensing/:id     — Dispensing record
POST   /pharmacy/return             — Drug return

// Drug Inventory
GET    /drugs                       — Drug list with stock levels
POST   /drugs                       — Add drug to formulary
PUT    /drugs/:id                   — Update drug
GET    /drugs/:id/batches           — Drug batches with expiry
GET    /drugs/low-stock             — Drugs below reorder level
GET    /drugs/expiring?days=30      — Drugs expiring soon
POST   /drugs/:id/adjust-stock      — Manual stock adjustment

// Purchase Management
GET    /pharmacy/purchase-orders    — PO list
POST   /pharmacy/purchase-orders    — Create PO
PUT    /pharmacy/purchase-orders/:id — Update PO
POST   /pharmacy/purchase-orders/:id/receive — Goods received (GRN)
GET    /pharmacy/suppliers          — Supplier list
POST   /pharmacy/suppliers          — Add supplier

// Analytics
GET    /pharmacy/reports/sales?period= — Sales report
GET    /pharmacy/reports/inventory     — Stock valuation
GET    /pharmacy/reports/expiry        — Expiry report

## Frontend Pages:

### 1. Pharmacy Dashboard (/pharmacy)
4 metric cards:
- Pending Prescriptions | Today's Dispensed | Low Stock Items | Expiring This Month

2 charts:
- Daily dispensing trend (7 days) 
- Top 10 dispensed drugs this month (bar chart)

Alert section:
- Critical: Drugs expired today (red)
- Warning: Expiring in 7 days (amber)
- Warning: Below minimum stock (amber)

Pending prescription queue table (real-time, updates via socket)

### 2. Prescription Queue & Dispensing (/pharmacy/dispense)
This is the main pharmacist workflow:

Left Panel — Prescription Queue:
- Real-time queue of pending prescriptions
- Each row: Patient name, Doctor, Time, Priority badge
- Click to load in dispensing interface

Right Panel — Dispensing Interface:
When a prescription is selected:
- Patient info header (name, UHID, allergies alert)
- Prescription items list
- For each drug:
  * Drug name, prescribed dose/frequency
  * Stock available (with batch selection)
  * Quantity input
  * Rate auto-filled
  * Instructions input
  * Substitution button (show generic alternatives)
- Drug interaction alert if any
- Total price calculation
- Dispense partially or fully
- Payment collection
- Print label button
- Complete dispensing button

### 3. Drug Inventory (/pharmacy/inventory)
- Full drug list with columns: Drug Name, Category, Generic, Stock, Minimum, Status, Actions
- Status badges: IN_STOCK (green), LOW_STOCK (amber), OUT_OF_STOCK (red)
- Filter by: category, therapeutic class, stock status
- Search by drug name or generic name
- Add Drug button (comprehensive form)
- Bulk import via Excel

Batch Management:
- Per drug: view all batches, quantity per batch, expiry dates
- Visual expiry indicator (color by urgency)
- Merge batches of same drug

### 4. Purchase Orders (/pharmacy/purchase-orders)
- PO list with status tracking
- Create PO flow:
  * Supplier selection
  * Add items (search drug, enter quantity, rate)
  * Auto-calculate totals
  * Preview and confirm
  
Goods Receipt Note (GRN):
- Select PO to receive against
- For each item: enter received quantity, batch number, expiry date, location
- Discrepancy flagging
- Auto-update stock on completion
- Print GRN

### 5. Narcotics Register (/pharmacy/narcotics)
Separate secure module for Schedule H/X drugs:
- Controlled substance log
- Mandatory double signature
- Daily balance verification
- Printable register
- Access restricted to pharmacist + supervisor

## Smart Features:
1. Drug Interaction Checker: 
   - Maintain drug interaction database in MongoDB
   - Real-time check when prescriptions arrive
   - Color-coded severity: MAJOR (red), MODERATE (orange), MINOR (yellow)
   - Show interaction description

2. Expiry Management:
   - FEFO dispensing: First Expiry First Out (automatically select earliest expiry batch)
   - Auto-alerts when drugs expire or near expiry

3. Auto-Reorder:
   - Bull queue job runs daily
   - For drugs below reorder level: create draft PO automatically
   - Email pharmacy manager

4. Barcode Scanning:
   - Drug barcode scanning for fast dispensing
   - Patient wristband scan to auto-load prescription

All components fully typed, real-time queue via Socket.io, comprehensive PDF reports.
```

---

### PHASE 9: LABORATORY MANAGEMENT

**Duration**: Week 6  
**Goal**: Complete laboratory information system with order workflow, results, and reports.

---

#### 🤖 PHASE 9 PROMPT

```
Building on Phase 8. Create the complete Laboratory Management module for MedicaLink HMS.

## Data Models:

### Test Catalog:
{
  _id, code, name, shortName, category: (HEMATOLOGY|BIOCHEMISTRY|MICROBIOLOGY|SEROLOGY|..),
  sampleType: (BLOOD|URINE|STOOL|SPUTUM|FLUID|SWAB|...),
  container, volume, instructions, turnaroundTime,
  parameters: [{
    name, unit, 
    referenceRanges: [{
      ageMin, ageMax, gender, minValue, maxValue, normalText
    }],
    criticalLow, criticalHigh, dataType: NUMERIC|TEXT|OPTION
  }],
  preparation: (FASTING|RANDOM|2HR_POSTPRANDIAL|..),
  price, isActive
}

### Lab Order:
{
  _id, orderNumber,
  patient, doctor, consultation,
  tests: [{ testId, testName, status, priority }],
  urgency: ROUTINE|URGENT|STAT,
  clinicalInfo, orderDate,
  sampleBarcode, collectedBy, collectedAt,
  status: ORDERED|SAMPLE_COLLECTED|IN_PROGRESS|COMPLETED|REPORTED
}

### Lab Result:
{
  _id, labOrder, test: ref('TestCatalog'),
  parameters: [{
    name, value, unit,
    isAbnormal, isCritical,
    referenceRange: { min, max, normalText }
  }],
  interpretation, comments,
  performedBy, verifiedBy,
  performedAt, verifiedAt, reportedAt,
  reportPdfUrl, status: PENDING|ENTERED|VERIFIED|REPORTED
}

## API Endpoints:
POST   /lab/orders            — Create lab order
GET    /lab/orders            — Orders list (filter by status, date)
GET    /lab/orders/:id        — Order detail
POST   /lab/orders/:id/collect — Mark sample collected
PUT    /lab/results/:id       — Enter/update results
POST   /lab/results/:id/verify — Verify results
POST   /lab/results/:id/report — Generate and send report
GET    /lab/reports/:id       — Get report PDF
GET    /lab/tests             — Test catalog
POST   /lab/tests             — Add test to catalog
GET    /lab/tests/:id         — Test detail with reference ranges
GET    /lab/dashboard/stats   — Lab dashboard stats
GET    /lab/reports/workload  — Lab workload report

## Frontend Pages:

### 1. Lab Dashboard (/lab)
- Pending orders by urgency (STAT vs URGENT vs ROUTINE)
- Real-time order count: Ordered | Collected | In Progress | Completed
- TAT (Turnaround Time) monitoring: chart showing avg TAT vs target
- Critical values pending notification
- Equipment status (manual status update)
- Top tests by volume today

### 2. Sample Collection Workstation (/lab/collection)
- Queue of orders awaiting sample collection
- Patient search to find order
- Print barcode label button
- Collect sample: mark collected, enter collector name, time
- Print multiple labels for different tubes
- Verification: show patient name/DOB confirmation

### 3. Result Entry Workstation (/lab/results)
- Queue of collected samples awaiting results
- For each test:
  * Auto-fill reference ranges from test catalog
  * Enter each parameter value
  * System auto-flags if abnormal or critical
  * Critical values: mandatory acknowledge + auto-alert to doctor
  * Text/option results for microbiology
  * Culture & sensitivity drug panel
- Save as draft or submit for verification

### 4. Result Verification (/lab/verify)
- List of results pending verification
- Senior lab officer workflow
- Review entered results
- Compare with previous results for same patient
- Override abnormal flag if needed
- Verify and release report
- Batch verification for routine tests

### 5. Lab Report View & Print (/lab/reports/:id)
Professional lab report PDF:
- Hospital letterhead
- Patient info (Name, Age, UHID, Gender)
- Referring doctor
- Test date, report date
- For each test: parameters in table
- Reference ranges column
- Abnormal values highlighted (bold red)
- Critical values marked (★)
- Lab director digital signature
- QR code for report verification

### 6. Test Catalog Management (/lab/catalog)
- All tests list with categories
- Add/Edit test: name, code, sample type, parameters, reference ranges
- Reference ranges: age/gender-based ranges
- Price management
- Bundle tests (profiles: CBC, LFT, KFT, Lipid Profile, etc.)

## Key Features:
1. Critical Value Management:
   - When a critical value entered, instant alert sent to:
     * Ordering doctor (SMS + in-app notification)
     * Duty nurse if patient is admitted
   - Acknowledgement required before report released
   - Audit trail of critical value communication

2. Delta Check:
   - Compare result with previous result for same parameter
   - Flag if change exceeds configurable threshold (possible error check)

3. Auto-report Generation:
   - When all results verified, auto-generate PDF report
   - Upload to Cloudinary, store URL
   - Send to doctor and patient portal automatically

4. TAT Monitoring:
   - For each order, track: ordered_at, collected_at, result_at, reported_at
   - Calculate TAT at each stage
   - Alert if TAT exceeds target for STAT/URGENT orders
   - Daily TAT compliance report

5. Quality Control:
   - Levy-Jennings chart for equipment QC
   - Westgard rule violations flagged
   - QC log maintenance

All components fully typed, real-time updates via Socket.io for critical values.
```

---

### PHASE 10: BILLING, INSURANCE & FINANCE

**Duration**: Week 7  
**Goal**: Complete billing system with insurance claims, payment processing, and financial reports.

---

#### 🤖 PHASE 10 PROMPT

```
Building on Phase 9. Create the complete Billing, Insurance & Finance module for MedicaLink HMS.

## Data Models:

### Bill Model:
{
  _id, billNumber (BILL-2024-000001),
  patient, encounter,
  billType: OPD|IPD|EMERGENCY|DAY_CARE|PACKAGE,
  billDate,
  
  // Line Items
  items: [{
    category: CONSULTATION|PROCEDURE|LAB|RADIOLOGY|PHARMACY|ROOM|SERVICE|PACKAGE,
    description, quantity, unitPrice, discount%, taxRate,
    amount, taxAmount, total,
    refId, performedBy, date
  }],
  
  // Totals
  grossAmount, discountAmount, discountReason,
  taxableAmount, taxAmount, roundOff, netAmount,
  
  // Payments
  payments: [{
    mode: CASH|CARD|UPI|NEFT|INSURANCE|CREDIT|WALLET,
    amount, reference, date, receivedBy
  }],
  totalPaid, balance,
  
  // Insurance
  insuranceClaim: {
    insuranceId, policyNumber, tpaName,
    preAuthNumber, preAuthDate, preAuthAmount,
    claimNumber, claimDate, claimedAmount,
    approvedAmount, settledAmount, rejectionReason,
    status: PENDING|PRE_AUTH_PENDING|PRE_AUTH_APPROVED|SUBMITTED|APPROVED|REJECTED|SETTLED
  },
  
  // Status
  status: DRAFT|GENERATED|PARTIAL|PAID|VOID|REFUNDED,
  voidReason, createdBy, updatedBy,
  creditNote: ref (if refunded),
  createdAt
}

### Service Charge Master:
{
  name, category, code, price,
  taxCategory, isPackageable,
  department, isActive
}

### Insurance Panel:
{
  name, type: TPA|GOVERNMENT|CORPORATE,
  contactPerson, phone, email,
  empanelledSpecialties, discountRate,
  billingFormat, claimSubmissionMethod,
  isActive
}

## API Endpoints:
POST   /billing/bills           — Generate bill
GET    /billing/bills           — Bills list
GET    /billing/bills/:id       — Bill detail
PUT    /billing/bills/:id       — Update bill (draft stage only)
POST   /billing/bills/:id/void  — Void bill
POST   /billing/bills/:id/payment — Record payment
GET    /billing/bills/:id/pdf   — Download bill PDF
POST   /billing/bills/:id/credit-note — Issue credit note/refund

GET    /billing/insurance-claims — Claims list
POST   /billing/insurance-claims/:id/submit — Submit claim
PUT    /billing/insurance-claims/:id — Update claim status

GET    /billing/reports/daily-collection — Daily collection report
GET    /billing/reports/revenue          — Revenue analytics
GET    /billing/reports/outstanding      — Outstanding balances
GET    /billing/reports/insurance        — Insurance claims report

GET    /billing/services        — Service charge master
POST   /billing/services        — Add service

## Frontend Pages:

### 1. Billing Dashboard (/billing)
KPI Cards:
- Today's Collection | Today's Bills | Pending Bills | Insurance Pending

Charts:
- Revenue trend (30 days)
- Payment mode split (pie chart: Cash/Card/Insurance)
- Department revenue breakdown

Quick Actions:
- Create New Bill button
- Pending bill alerts
- Insurance claims due for submission

### 2. Create Bill (/billing/new?patientId=)
This is the most complex page — OPD/IPD billing:

Patient Header: Photo, Name, UHID, Age, Insurance info

Bill Items Section:
- Service search: type to search charge master
- Add items by category tabs:
  * Consultation fees (auto-added from appointment)
  * Lab tests (linked from lab orders)
  * Pharmacy (linked from dispensing)
  * Radiology
  * Room charges (for IPD)
  * Procedures
  * Packages
- Per item: quantity, rate, discount%, tax%
- Real-time totals

Bill Summary:
- Subtotal, discount, tax, net payable
- Insurance deduction (if applicable)
- Patient payable amount

Insurance Section (if patient has insurance):
- Insurance panel selection
- Pre-authorization status
- Claim amount vs patient responsibility

Payment Collection:
- Multiple payment modes
- Split payment (partial insurance + partial cash)
- Stripe card payment integration
- Change calculation for cash

Generate + Print button → PDF immediately

### 3. Bill List (/billing/bills)
Data table: Bill# | Patient | Date | Amount | Paid | Balance | Status | Actions
- Quick filter: today, this week, this month
- Status filter
- Patient search
- Export to Excel/PDF

### 4. Bill Detail (/billing/bills/:id)
- View complete bill with all items
- Payment history
- Print/Email bill
- Collect payment button (if balance due)
- Issue credit note button
- Insurance claim section

### 5. Insurance Claims Management (/billing/insurance)
- Claims list by status
- Pre-authorization requests
- Claim submission (generate TPA format)
- Follow-up tracking
- Settlement recording
- Rejection management and resubmission

### 6. Financial Reports (/billing/reports)

Daily Collection Report:
- Summary by payment mode
- Bill-wise collection list
- Cashier-wise summary
- Closing balance

Revenue Analytics Dashboard:
- Revenue by department (bar chart)
- Revenue trend (line chart)
- Revenue by doctor
- Revenue by service category
- Comparison: this month vs last month

Outstanding Report:
- Patient-wise outstanding balance
- Ageing analysis: 0-30 days, 31-60, 61-90, 90+
- Corporate/Insurance outstanding
- Follow-up notes

## Key Features:
1. Package Billing:
   - Define procedure packages (e.g., "Normal Delivery Package: ₹25,000")
   - Package includes defined services
   - Single bill line for package
   - Additional charges billed separately

2. Corporate Billing:
   - Corporate clients with credit terms
   - Monthly invoice generation
   - TDS deduction support

3. Bill Voiding with Reason:
   - Audit trail for voided bills
   - Mandatory void reason
   - Controller/Admin approval for large amounts

4. Auto-Fetch Services:
   - When creating bill, auto-fetch from:
     * Completed consultations (doctor fees)
     * Lab reports generated
     * Pharmacy dispensing records
     * Radiology reports
   - One-click add all pending charges

5. GST Calculation:
   - Tax code per service (0%, 5%, 12%, 18%)
   - GST invoice generation (CGST + SGST or IGST)
   - GST reports for monthly filing

6. Payment Gateway:
   - Stripe integration for card payments
   - Generate payment link for patient (send via SMS/WhatsApp)
   - QR code for UPI payment
   - Auto-reconciliation of online payments

All components fully typed, comprehensive PDF reports with hospital letterhead.
```

---

### PHASE 11: EMERGENCY DEPARTMENT & ICU

**Duration**: Week 8  
**Goal**: Real-time emergency management, ICU monitoring, and critical care features.

---

#### 🤖 PHASE 11 PROMPT

```
Building on Phase 10. Create the Emergency Department and ICU modules for MedicaLink HMS — real-time critical care systems.

## Emergency Department:

### Models:
EmergencyPatient extends Patient with:
{
  triageLevel: 1-5 (1=RESUSCITATION, 2=EMERGENCY, 3=URGENT, 4=SEMI_URGENT, 5=NON_URGENT),
  triageColor: RED|ORANGE|YELLOW|GREEN|BLUE,
  triageTime, triageBy,
  chiefComplaint, arrivalMode: AMBULANCE|WALK_IN|REFERRED|POLICE,
  arrivalTime,
  mlasScore, gcsScore, // severity scores
  primarySurvey: { airway, breathing, circulation, disability },
  interventions: [{ intervention, time, by, notes }],
  disposition: ADMITTED|DISCHARGED|TRANSFERRED|DECEASED|LEFT_WITHOUT_TREATMENT,
  dispositionTime, dispositionDoctor
}

Ambulance:
{
  vehicleNumber, driverName, driverPhone, paramedic,
  currentStatus: AVAILABLE|DISPATCHED|ON_SCENE|TRANSPORTING|RETURNING,
  location: { lat, lng, updatedAt },
  currentCallId
}

### Emergency Dashboard (/emergency) — REAL-TIME:
Live emergency board:
- Color-coded patient cards by triage level
- Auto-refresh every 30 seconds OR Socket.io real-time
- Columns: Resuscitation | Emergency | Urgent | Semi-Urgent | Non-Urgent
- Each card: Patient name, age, chief complaint, time in ED, assigned doctor
- Drag cards to change triage level
- Click to open patient detail

Bed Status Board:
- Emergency bays with visual grid
- Available (green) / Occupied (red) / Cleaning (yellow)
- Patient name on occupied bays

Alert System:
- Code Blue button (cardiac arrest — broadcast alarm)
- Code Red button (fire/disaster)
- MCI button (Mass Casualty Incident activation)
- Real-time alerts broadcast to all connected clients

### Triage Interface (/emergency/triage):
Fast 30-second registration:
- Patient identity (or Unknown if unconscious)
- Vital signs quick entry (touch-friendly, large inputs)
- Triage score calculation
- Chief complaint selection (common ED complaints)
- Auto-assign triage level based on vitals + complaint
- Print triage tag option

## ICU Module:

### ICU Patient Model:
{
  patient, ward, bed,
  admittedAt, admittedBy, admissionDiagnosis,
  apacheScore, sofaScore,
  
  ventilator: {
    isOnVentilator, mode, FiO2, PEEP, TV, RR, settings
  },
  
  // 24hr monitoring
  hourlyVitals: [{
    time, bp, hr, temp, spO2, rr, cvp, map
  }],
  
  fluidBalance: {
    date,
    input: { oral, IV, blood },
    output: { urine, drain, nasogastric },
    balance
  },
  
  lines: [{ type: CENTRAL|ARTERIAL|PERIPHERAL|FOLEY, insertedAt, site, status }],
  
  infusions: [{ drug, concentration, rate, startTime, endTime }]
}

### ICU Dashboard (/icu):
Multi-patient overview:
- Grid of ICU beds (6-12 per screen)
- Each bed tile shows:
  * Patient name, admission day
  * Current vitals (last entry): HR/BP/SpO2/Temp
  * Ventilator status (if on vent)
  * Alert count
  * SOFA score
- Color coding by stability (stable/warning/critical)
- Clicking opens detailed patient view
- Full-screen TV mode for monitoring station

### ICU Patient Detail (/icu/patients/:id):
Tab 1 - Monitoring:
- Real-time vital trend charts (HR, BP, SpO2, Temp)
- Waveform simulation (visual, not actual monitor feed)
- Hourly vital entry form (large, touch-friendly)
- Alert thresholds per parameter

Tab 2 - Ventilator:
- Current ventilator settings
- Update settings form
- Vent settings history

Tab 3 - Fluid Balance:
- 24-hour intake/output chart
- Running balance calculation
- Add input/output entries

Tab 4 - Medications:
- Current infusions with rates
- PRN medications
- Drug-time chart (Gantt-style)

Tab 5 - Clinical:
- ICU nursing notes (8-hourly)
- Doctor rounds notes
- Consult notes

## Ambulance Tracking (/emergency/ambulances):
- Map view (Leaflet) with ambulance positions
- Real-time location updates via Socket.io
- Ambulance dispatch interface
- ETA calculation
- Patient handover documentation
- Communication log

## Alert System (Backend + Socket.io):
services/alertService.ts:
- Critical vital alert: when vital entered outside critical range
- Broadcast to: attending doctor, charge nurse, supervisor
- Audio alert on receiving browser/mobile
- Acknowledgement required
- Escalation if not acknowledged in 5 minutes

Code Blue simulation:
- Press Code Blue → broadcast to all emergency staff sockets
- Show countdown timer
- Resuscitation checklist
- Log all team members who responded

All real-time features via Socket.io, all components touch-friendly for clinical use.
```

---

### PHASE 12: OPERATION THEATER & BLOOD BANK

**Duration**: Week 8-9  
**Goal**: OT scheduling, surgical records, blood bank management.

---

#### 🤖 PHASE 12 PROMPT

```
Building on Phase 11. Create the Operation Theater and Blood Bank modules.

## Operation Theater Module:

### OT Case Model:
{
  _id, caseNumber, patient,
  procedure: { name, icdProcCode, type: ELECTIVE|EMERGENCY|URGENT },
  surgeon: [ref('Doctor')], assistant: [ref('Doctor')],
  anesthesiologist: ref('Doctor'), anesthesiaType,
  scrubNurse, circulatingNurse,
  theater: ref('OperationTheater'), scheduledDate, scheduledTime,
  estimatedDuration,
  
  preOp: {
    checklist: [{item, status, checkedBy, time}],
    consentSigned, consentBy, consentDate,
    bloodOrdered, bloodCrossmatched,
    anesthesiaAssessment: {...}
  },
  
  intraOp: {
    actualStartTime, actualEndTime,
    findings, complications,
    implants: [{name, lot, expiry, size}],
    sutures: [{material, size, manufacturer}],
    specimens: [{description, disposition}],
    estimatedBloodLoss, fluidGiven,
    surgeonNotes
  },
  
  anesthesiaRecord: {
    induction, maintenance, reversal,
    drugs: [{drug, dose, time}],
    vitalsIntraOp: [{time, bp, hr, spO2}],
    complications
  },
  
  postOp: {
    recoveryStartTime, recoveryEndTime,
    aldretteScore, // recovery scoring
    instructions, complications,
    transferTo: ref('Ward/ICU')
  },
  
  status: SCHEDULED|IN_PREP|IN_PROGRESS|COMPLETED|CANCELLED
}

### OT Scheduling Board (/ot/schedule):
- Horizontal timeline view for each theater
- Date navigation (default: today)
- Each theater: horizontal bars for scheduled cases
- Case bar shows: time | procedure | surgeon | duration
- Color: SCHEDULED(blue), IN_PREP(yellow), IN_PROGRESS(green), COMPLETED(gray)
- Click to open case detail
- "Schedule New Case" button
- Emergency case override (jump to next available slot)

### OT Case Management (/ot/cases/:id):
Tab workflow (enable sequentially as case progresses):

Tab 1 - Scheduling: Procedure, team, theater, date/time, estimated duration

Tab 2 - Pre-Op (enable when scheduled):
  - WHO Surgical Safety Checklist (interactive checkboxes)
  - Consent documentation
  - Pre-anesthesia assessment form
  - Required blood products
  - Special equipment needs
  - Patient preparation instructions

Tab 3 - Intra-Op (enable when case starts):
  - Start case timer (large digital clock)
  - Intraoperative findings text
  - Real-time vitals entry (anesthetist view)
  - Specimens logged
  - Implants used
  - Complications
  - Drug log

Tab 4 - Post-Op (enable when completed):
  - Aldrete recovery score calculator
  - Post-op instructions
  - Transfer destination
  - Surgeon post-op notes
  - Anesthesia recovery notes

## Blood Bank Module:

### Models:
Donor:
{
  _id, donorId, name, age, gender, bloodGroup, rhFactor,
  phone, address, weight, lastDonationDate,
  healthHistory, eligibilityStatus,
  donations: [ref('BloodUnit')]
}

BloodUnit:
{
  _id, unitNumber (auto), bloodGroup, rhFactor,
  componentType: WHOLE_BLOOD|PACKED_RBC|FFP|PLATELETS|CRYOPRECIPITATE,
  collectedFrom: ref('Donor') | EXTERNAL_SOURCE,
  collectedDate, expiryDate, volume, bagType,
  
  tests: {
    hiv, hbsag, hcv, vdrl, malaria, // all must be NEGATIVE to use
    testedAt, testedBy
  },
  
  status: AVAILABLE|RESERVED|ISSUED|DISCARDED|EXPIRED,
  issuedTo: ref('Patient'), issuedFor: ref('Procedure'),
  crossmatchDone, crossmatchBy, issuedAt, returnedAt
}

BloodRequest:
{
  patient, doctor, procedure,
  bloodGroup, component, quantityRequested,
  urgency: ROUTINE|URGENT|EMERGENCY,
  clinicalHistory,
  status: PENDING|CROSS_MATCHING|RESERVED|ISSUED|COMPLETED|CANCELLED
}

### Blood Bank Dashboard (/bloodbank):
Inventory board:
- Table: Blood Group × Component Type = Current Stock
- Color: green(safe), amber(low), red(critical)
- Expiring units count

Pending requests queue
Recent donations list
Expiring units alert (next 3 days)

### Pages:
- Donor registration and history
- Blood collection workflow
- Blood testing results entry  
- Blood issue against request
- Cross-match interface
- Inventory management
- Blood bank reports

## Key Features for Both Modules:

OT Features:
1. Theater utilization tracking (actual vs planned time)
2. On-call team assignment for emergency cases
3. Sterilization tracking (instrument sets)
4. Post-op complication tracking (30-day follow-up)

Blood Bank Features:
1. Blood group compatibility matrix
2. Cross-match result entry
3. Component preparation tracking
4. Blood request approval workflow
5. Transfusion reaction reporting

All fully typed, real-time OT status board via Socket.io.
```

---

### PHASE 13: TELEMEDICINE MODULE

**Duration**: Week 9-10  
**Goal**: Complete video consultation, virtual waiting room, and e-prescriptions.

---

#### 🤖 PHASE 13 PROMPT

```
Building on Phase 12. Create the complete Telemedicine module for MedicaLink HMS using WebRTC.

## Technical Architecture:

### WebRTC Video System:
Use simple-peer library for WebRTC peer connections.
Use Socket.io as signaling server.

Flow:
1. Patient books telemedicine appointment → gets appointment ID
2. Patient joins virtual waiting room (pre-appointment)
3. Doctor starts consultation → triggers call invitation
4. WebRTC peer connection established
5. Video + audio + optional screen share
6. During call: chat, share files, vital entry
7. After call: prescription, follow-up scheduling

### Models:

TeleconsultationSession:
{
  _id, appointment,
  patient: { userId, name, token },
  doctor: { userId, name },
  scheduledAt, actualStartAt, actualEndAt,
  duration, // minutes
  techStats: { quality, issues },
  consultation: ref('Consultation'), // EHR entry
  recordingUrl, // if recorded
  status: WAITING|ACTIVE|COMPLETED|MISSED|CANCELLED
}

### Backend Services:
services/webrtcService.ts:
- Session creation and management
- Token generation for rooms
- Recording management (optional, with consent)
- Session analytics

Socket.io events for signaling:
- 'join-room': patient/doctor joins virtual room
- 'offer': WebRTC offer from initiator
- 'answer': WebRTC answer from receiver
- 'ice-candidate': ICE candidates exchange
- 'call-end': terminate session
- 'patient-arrived': notify doctor
- 'doctor-ready': notify patient

## Frontend Pages:

### 1. Telemedicine Dashboard (/telemedicine):
Doctor view:
- Today's teleconsultations
- Upcoming virtual appointments
- Patient waiting alert (real-time)
- Past telemedicine sessions

### 2. Virtual Waiting Room (/telemedicine/waiting/:appointmentId):
Patient-facing page:
- "You are in the waiting room" status
- Estimated wait time
- System check: camera, microphone, internet speed test
- Camera preview (let patient see themselves)
- Chat with receptionist while waiting
- Doctor profile card (reassuring)
- Tips for good consultation

### 3. Video Consultation Interface (/telemedicine/session/:sessionId):
Full-screen video interface:

Main video: Doctor view (or patient in self-view)
Picture-in-picture: Patient/Doctor smaller view
Controls bar (bottom):
  - Mute/Unmute microphone
  - Camera on/off
  - Screen share (doctor can share medical images)
  - Chat toggle
  - Vitals input toggle (patient can enter vitals)
  - Record toggle (with consent dialog)
  - End call button

Right sidebar (collapsible):
  - Chat panel (text messages)
  - Patient vitals entry panel
  - Quick notes pad

After call ends → redirect to consultation notes form

### 4. Session Notes (/telemedicine/session/:id/notes):
Post-consultation:
- Same EHR consultation form (SOAP notes)
- Auto-populated with any notes taken during call
- Write prescription
- Schedule follow-up
- Send summary to patient via email

### 5. Telemedicine History (/telemedicine/history):
- List of past sessions with duration, patient, diagnosis summary
- Video recording access (if enabled)
- Re-consultation button

## Patient Portal Telemedicine:
/portal/telemedicine:
- Book telemedicine appointment (filter doctors offering virtual)
- Join virtual waiting room
- Video call interface (same as above, patient-themed)

## Payment for Telemedicine:
- Stripe payment before joining waiting room
- Auto-invoice generation after session
- Insurance claim for teleconsultation (where applicable)

## Technical Requirements:
1. Browser compatibility: Chrome, Firefox, Safari, Edge
2. Fallback: if WebRTC fails, offer phone consultation
3. Network quality indicator during call
4. Auto-reconnect on connection drop
5. Mobile responsive (works on tablet for doctors on rounds)

## Notifications:
- 15 min before: "Your teleconsultation starts in 15 minutes" (SMS + email)
- "Patient is in waiting room" (push notification to doctor)
- Post-session: "Your prescription is ready" (to patient)

All components fully typed, WebRTC implemented with simple-peer.
```

---

### PHASE 14: AI INTEGRATION & CLINICAL DECISION SUPPORT

**Duration**: Week 10-11  
**Goal**: Deep AI integration across all modules — clinical assistant, predictions, NLP, voice.

---

#### 🤖 PHASE 14 PROMPT

```
Building on Phase 13. Implement comprehensive AI integration across MedicaLink HMS.

## AI Architecture:

### AI Service Layer (services/ai/):

aiService.ts — Main orchestrator:
All AI functions must be:
- Async with proper error handling
- Timeout after 10 seconds (don't block UI)
- Cached in Redis (same input = same output, TTL 1 hour)
- Logged for monitoring and cost tracking

### 1. Clinical Assistant (Chat Interface):
services/ai/clinicalAssistant.ts

System prompt context:
- Hospital context (specialty, common cases)
- Patient context (if viewing a patient: demographics, diagnoses, meds)
- Role context (doctor vs nurse vs admin gets different depth)
- Medical knowledge base (RAG from Pinecone)

Functions:
answerClinicalQuestion(question, patientContext, userRole):
- GPT-4o with medical system prompt
- Context window includes: patient current meds, allergies, recent vitals, diagnoses
- Structured response: answer + citations + disclaimer

Features:
- Multi-turn conversation memory
- Suggested questions (contextual chips)
- "Ask about this patient" mode (pre-loads patient context)
- Drug dosage calculator queries
- Clinical guidelines reference

### 2. Diagnosis Assistance:
services/ai/diagnosisAI.ts

suggestDifferentialDiagnosis(input):
Input: { symptoms[], vitals{}, patientAge, gender, history }
Process:
  1. Format as structured clinical query
  2. Send to GPT-4o with medical reasoning prompt
  3. Parse response into structured differentials
Output: [{
  diagnosis, icdCode,
  probability: HIGH|MEDIUM|LOW,
  reasoning, supportingFindings, againstFindings,
  suggestedTests
}]

Risk Stratification:
  - Sepsis risk (based on SIRS criteria from vitals)
  - Cardiac event risk (HEART score)
  - DVT risk (Wells score)
  - Auto-calculate and display

### 3. Drug Intelligence:
services/ai/drugAI.ts

checkDrugInteractions(medications[]):
  - Local drug interaction DB + OpenAI verification for complex cases
  - Return: severity, mechanism, management recommendation

dosageCalculator(drug, weight, age, renalFunction, hepaticFunction):
  - Weight-based dosing for children and critical care
  - Renal dose adjustment (eGFR-based)
  - Return: recommended dose, frequency, max dose, monitoring

getDrugInfo(drugName):
  - Full drug monograph summary
  - Common side effects
  - Contraindications
  - Monitoring parameters

### 4. Voice-to-SOAP Notes:
services/ai/voiceAI.ts

transcribeAndStructure(audioBlob):
  Step 1: OpenAI Whisper transcription
  Step 2: GPT-4o structured extraction prompt:
    "Extract SOAP components from: [transcript]
     Return JSON: { subjective, objective, assessment, plan }"
  Step 3: Map to our consultation schema
  Step 4: Return for doctor review before saving

### 5. Report Summarization:
services/ai/summarizationAI.ts

summarizePatientHistory(patientId):
  - Fetch last 5 consultations
  - Summarize into 1-paragraph clinical summary
  - Highlight changes in condition, current medications

summarizeLabTrends(patientId):
  - Analyze lab values over time
  - Identify trends (improving/worsening)
  - Flag concerning patterns

generateDischargeSummary(consultationId):
  - Input: full consultation data + hospitalization course
  - Output: professional discharge summary template
  - Doctor reviews and approves

### 6. Predictive Analytics:
services/ai/predictiveAI.ts

patientRiskScore(patientId):
  - 30-day readmission risk (based on diagnosis + comorbidities)
  - Length of stay prediction (IPD)
  - Mortality risk (for ICU: APACHE II score auto-calculation)

appointmentNoShowPredictor(appointmentId):
  - Based on patient history, appointment time, weather, etc.
  - Alert reception to call and confirm if high no-show risk

### 7. Natural Language Reports:
services/ai/analyticsAI.ts

naturalLanguageQuery(question, tenantId):
  - "How many patients were admitted this month?"
  - "What's the revenue trend for cardiology department?"
  - Translate NL to MongoDB aggregation pipeline
  - Execute and return structured result + narrative explanation

## Frontend Components:

### 1. AI Clinical Assistant Widget:
components/ai/AIAssistant.tsx
- Floating button (bottom right, on clinical pages)
- Opens as side panel
- Chat interface with message history
- Context pill showing what context is loaded
- Voice input button (calls voice transcription)
- Suggested quick questions
- Model indicator (GPT-4o badge)
- "This is AI assistance, verify clinical decisions" disclaimer

### 2. AI Diagnosis Suggester:
components/ai/DiagnosisSuggestions.tsx
- In consultation form, after symptoms entered
- "AI Suggestions" button
- Loading state with animation
- Differential diagnosis cards (by probability)
- Each card: diagnosis, ICD code, reasoning, supporting tests
- One-click add to diagnosis list
- "Thinking..." animation while loading

### 3. Drug Interaction Alert:
components/ai/DrugInteractionAlert.tsx
- Banner component for prescription form
- Real-time check as drugs are added
- Severity-based styling
- Expand to see mechanism and management
- "Acknowledge and Continue" button for minor interactions
- "High Alert" blocking modal for major interactions

### 4. AI Dashboard (/ai/insights):
Admin/Doctor view:
- Insights generated by AI for this hospital
- "Unusual pattern detected: 30% increase in respiratory cases this week"
- Disease surveillance alerts
- Staff performance insights (not punitive, helpful)
- Cost optimization suggestions

### 5. Voice Input Component:
components/ai/VoiceInput.tsx
- Microphone button in consultation forms
- Recording indicator (pulsing animation)
- Live transcription display (streams tokens)
- Confidence score
- Edit transcription before applying
- "Fill SOAP notes" button

## API Endpoints:
POST /ai/chat           — Clinical assistant message
POST /ai/diagnose       — Diagnosis suggestions
POST /ai/drug-check     — Drug interaction check
POST /ai/transcribe     — Voice transcription
POST /ai/summarize      — Generate summary
POST /ai/discharge      — Draft discharge summary
POST /ai/predict/risk   — Patient risk score
POST /ai/nl-query       — Natural language analytics query

## Cost Management:
- Track tokens used per tenant per month
- Rate limit AI endpoints to prevent abuse
- Cache identical queries (Redis TTL 1 hour)
- Monthly AI cost report per tenant
- Configurable AI usage limits per plan

All with proper error handling, fallbacks if AI is unavailable, and user-friendly loading states.
```

---

### PHASE 15: ADVANCED ANALYTICS & BI DASHBOARD

**Duration**: Week 11  
**Goal**: Comprehensive analytics with executive dashboards, financial analytics, and custom reports.

---

#### 🤖 PHASE 15 PROMPT

```
Building on Phase 14. Create the complete Analytics & Business Intelligence module.

## Analytics Pages:

### 1. Executive Dashboard (/analytics/executive):
C-suite level overview. KPI summary cards:
Row 1: Total Revenue MTD | Revenue vs Target | Bed Occupancy | ALOS (Avg Length of Stay)
Row 2: OPD Patients MTD | IPD Admissions | Surgeries | Patient Satisfaction Score

Charts (all using Recharts, fully interactive):
1. Revenue Trend (12 months, area chart with target line)
2. Department Revenue Split (donut chart)
3. Patient Volume Trend (bar chart, OPD vs IPD)
4. Bed Occupancy by Ward (stacked bar)
5. Top 10 Procedures This Month (horizontal bar)
6. Revenue by Doctor (leaderboard table with sparklines)

Insights section:
- AI-generated text insights: "Revenue is up 15% vs last month, driven by cardiology."
- Anomaly detection: "Pharmacy stock costs spiked 40% this week — review POs."
- Trend callouts with arrows

### 2. Clinical Analytics (/analytics/clinical):
- Disease prevalence (ICD-10 codes frequency, treemap)
- Readmission rates (30-day, 60-day, 90-day)
- Average length of stay by department
- Discharge destination breakdown
- Medication usage patterns
- Lab TAT compliance
- Mortality rates by department/diagnosis
- Sepsis management compliance
- Surgical outcome metrics

### 3. Operational Analytics (/analytics/operations):
- Staff productivity (consultations per doctor)
- OT utilization (used time vs available time)
- Bed turnover rate
- Emergency door-to-doctor time
- Lab TAT by test type
- Appointment no-show rate
- Queue wait time trends
- Equipment utilization

### 4. Financial Analytics (/analytics/financial):
- Revenue by payer (cash/insurance/corporate)
- Collection efficiency (billed vs collected)
- Claims denial rate and reasons
- Revenue per bed day
- Department profitability
- Pharmacy margin analysis
- Cost per patient (operational cost tracking)

### 5. Custom Report Builder (/analytics/custom):
- Drag-and-drop report builder interface
- Available dimensions: date, department, doctor, patient type, etc.
- Available measures: revenue, patients, TAT, satisfaction, etc.
- Chart type selection: table, bar, line, pie, area
- Filter builder
- Schedule report (daily/weekly email)
- Save as template
- Export: PDF, Excel, CSV

## Backend Analytics Service:
services/analyticsService.ts

All analytics use MongoDB aggregation pipelines:

getRevenueAnalytics(tenantDb, filters):
  - Group by department/period/doctor
  - Calculate totals, averages, trends
  - Return structured data for charts

getClinicalMetrics(tenantDb, filters):
  - Aggregation across consultations, diagnoses, outcomes
  - Statistical calculations

generateReport(reportConfig):
  - Execute user-defined aggregations
  - Format for PDF/Excel export using ExcelJS

Caching strategy:
  - Redis cache with key: `analytics:{tenantId}:{reportType}:{dateRange}:{hash}`
  - TTL: 15 minutes for dashboards, 1 hour for reports
  - Background refresh for executive dashboard

## API Endpoints:
GET /analytics/executive       — Executive dashboard data
GET /analytics/clinical        — Clinical metrics
GET /analytics/operational     — Operational metrics
GET /analytics/financial       — Financial analytics
POST /analytics/custom         — Custom report execution
POST /analytics/export/excel   — Export to Excel
POST /analytics/export/pdf     — Export to PDF
POST /analytics/schedule       — Schedule recurring report

## Components:
1. MetricCard.tsx — enhanced KPI card with trend arrow, sparkline
2. RevenueChart.tsx — Recharts area/bar chart with period selector
3. DepartmentBreakdown.tsx — donut chart with legend
4. LeaderboardTable.tsx — ranked table with sparklines
5. CustomReportBuilder.tsx — drag-and-drop report builder
6. DateRangeSelector.tsx — preset ranges (Today, Week, Month, Quarter, Year, Custom)
7. ChartContainer.tsx — wrapper with download and fullscreen options
8. InsightCard.tsx — AI insight text card with icon

All charts responsive, downloadable as PNG, data exportable as CSV.
```

---

### PHASE 16: REACT NATIVE MOBILE APP

**Duration**: Week 12-14  
**Goal**: Cross-platform mobile app for patients, doctors, and nurses.

---

#### 🤖 PHASE 16 PROMPT

```
Building on Phase 15. Create the React Native mobile app for MedicaLink HMS with three user personas.

## Tech Stack for Mobile:
- React Native + Expo SDK 51
- NativeWind (Tailwind for RN)
- React Navigation v6 (Stack + Tab + Drawer)
- React Native Reanimated 3
- Expo Camera, Notifications, ImagePicker
- WatermelonDB for offline storage
- React Native Paper for some components
- React Query for server state

## App Structure:
apps/mobile/
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx    (root)
│   │   ├── PatientNavigator.tsx
│   │   ├── DoctorNavigator.tsx
│   │   └── NurseNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   ├── patient/
│   │   ├── doctor/
│   │   └── nurse/
│   ├── components/
│   │   └── (shared mobile components)
│   ├── hooks/
│   ├── store/
│   └── services/

## Navigation Structure:
After login, show role-appropriate navigator:

PATIENT app (tab navigator):
- Home | Appointments | Records | Bills | Profile

DOCTOR app (tab navigator):
- Today | Patients | Schedule | Consult | Profile

NURSE app (tab navigator):
- Ward | Vitals | Tasks | Meds | Profile

## PATIENT APP Screens:

### Home Screen:
- Welcome banner: "Good morning, [Name]"
- Next appointment card (prominent, tap to see details)
- Recent test results (last 2, tap to view)
- Pending bills alert
- Quick actions: Book Appointment | View Records | Contact Doctor | Telemedicine

### Appointment Screens:
- Appointment list (upcoming + past)
- Book appointment flow:
  * Doctor specialty selection (scrollable chips)
  * Doctor list with availability indicators
  * Date selection (horizontal date picker)
  * Time slot grid (tap to select)
  * Confirm screen
  * Success screen with QR code for check-in
- Appointment detail (with cancel/reschedule)

### Medical Records:
- Timeline of visits
- Each visit: expandable with diagnosis, prescription, lab results
- Download PDF reports
- Document gallery (reports, scans)

### Video Consultation:
- Join waiting room
- Video call interface (optimized for mobile)
- Chat during call
- Post-call prescription view

### Bills:
- Bill list with status badges
- Bill detail with line items
- Pay online (Stripe) — integrated payment sheet
- Receipt download

## DOCTOR APP Screens:

### Today Screen:
- Date header
- My appointment queue for today (pull-to-refresh)
- Patient token cards in order
- Tap patient → quick consultation summary
- Mark as seen / skip button
- Real-time queue updates (Socket.io)

### Quick Consultation (from today screen):
Mobile-optimized consultation form:
- Patient info header (tap for full profile)
- Chief complaint input
- Quick vitals entry (large input fields)
- Diagnosis selection (ICD-10 search)
- Prescription writing:
  * Drug search
  * Dose/frequency selection (preset options)
  * Duration
  * Add multiple drugs
- Lab/Radiology orders
- Voice note input (auto-transcribe to notes)
- Save & Complete button

### My Patients:
- Search patients
- Patient list with last visit date
- Patient profile (mobile-optimized)

### Schedule:
- Weekly view calendar
- Appointment details tap
- Mark unavailable slots
- Set leave

## NURSE APP Screens:

### Ward Overview:
- Bed grid for assigned ward
- Each bed: patient name, diagnosis, admission day
- Color coding by status
- Search patient

### Vitals Entry:
- Patient selection (QR scan or search)
- Large touch-friendly vital entry form
- Normal range indicators
- Alert if outside range
- Saves to EHR

### Medication Administration (MAR):
- Patient's current medications
- Mark each as given/held/refused with time
- Notes field
- Barcode scan verification

### Tasks:
- My pending tasks for the shift
- Assigned from doctor orders
- Mark complete with timestamp

## Offline Support:
Using WatermelonDB:
- Cache: own schedule, own patient assignments, pending tasks
- Sync when online
- Conflict resolution (server wins for clinical data)
- Visual indicator: "You are offline — showing cached data"

## Push Notifications (Expo):
- Appointment reminders
- Lab results ready
- Doctor calls patient (for queue)
- Critical value alerts (nurse app)
- New prescription (patient app)

## Design for Mobile:
- Minimum touch target: 44px
- Large, readable font sizes (16px minimum for clinical data)
- High contrast for clinical environments
- Dark mode support
- Bottom navigation (thumb-friendly)
- Haptic feedback on important actions
- No complex gestures for clinical functions

All screens with proper loading states, error handling, and offline indicators.
```

---

### PHASE 17: HR & STAFF MANAGEMENT

**Duration**: Week 14  
**Goal**: Complete human resources module with attendance, payroll, and scheduling.

---

#### 🤖 PHASE 17 PROMPT

```
Building on Phase 16. Create the HR & Staff Management module for MedicaLink HMS.

## Models:

Employee:
{
  userId: ref('User'), employeeId,
  department, designation, reportingTo,
  employment: { type: FULL_TIME|PART_TIME|CONTRACT, joinDate, probationEnd, confirmationDate },
  documents: [{ type: ID|DEGREE|LICENSE|CONTRACT, url, verified }],
  bank: { accountNumber, bankName, ifsc, accountType },
  payroll: { basicSalary, allowances: {HRA, DA, transport}, deductions: {PF, ESI} },
  performance: { lastReview, rating, kpi: [] },
  isActive
}

Attendance:
{
  employee, date,
  checkIn: { time, location, method: BIOMETRIC|MANUAL|APP },
  checkOut: { time, location, method },
  workingHours, overtimeHours,
  status: PRESENT|ABSENT|HALF_DAY|LEAVE|HOLIDAY,
  notes
}

Leave:
{
  employee, leaveType: CASUAL|SICK|EARNED|MATERNITY|COMPENSATORY,
  fromDate, toDate, totalDays,
  reason, status: PENDING|APPROVED|REJECTED,
  approvedBy, appliedAt
}

Payroll (monthly):
{
  employee, month, year,
  earnings: { basic, hra, da, transport, overtime, bonus },
  deductions: { pf, esi, tax, advance, loan },
  grossPay, totalDeductions, netPay,
  status: DRAFT|APPROVED|PAID,
  payslipUrl, processedBy, processedAt
}

## Pages:

### 1. HR Dashboard (/hr):
- Total staff count by department
- Attendance today: Present | Absent | Leave
- Leave requests pending approval
- Payroll status this month
- Staff birthday/anniversary widget
- Recent hires

### 2. Attendance Management (/hr/attendance):
- Daily attendance view: table with all staff, mark present/absent
- Monthly attendance calendar per employee
- Bulk mark attendance from Excel
- Late arrivals and early departures highlighted
- Overtime calculation
- Attendance regularization requests (employees can explain absences)
- Export: monthly attendance report

### 3. Leave Management (/hr/leaves):
Leave Types Configuration:
- Define leave types with annual quota
- Carry-forward rules, encashment policies

Leave Request Form (Employee):
- Leave type, dates, reason
- Check balance before applying
- Submit → notify manager via email

Leave Approval (Manager/HR):
- Pending requests list
- One-click approve/reject with comment
- Calendar to see team availability before approving
- Leave balance check

Leave Register:
- Employee-wise leave taken vs balance
- Department-wise leave summary

### 4. Payroll Processing (/hr/payroll):
Monthly payroll workflow:
Step 1: Review attendance (this month)
Step 2: Calculate overtime, deductions
Step 3: Apply pending loan/advance deductions
Step 4: Generate payroll draft
Step 5: Review and approve
Step 6: Generate payslips + bank file
Step 7: Mark as paid

Payslip generation:
- PDF payslip with hospital letterhead
- All earnings and deductions detailed
- Digital signature
- Email to employee automatically

### 5. Staff Scheduling (/hr/schedule):
Shift roster creation:
- Define shifts: Morning (6am-2pm), Evening (2pm-10pm), Night (10pm-6am)
- Monthly roster grid: rows = staff, columns = dates
- Drag to assign shift type
- Minimum staff per ward/shift validation
- Swap shift requests between employees
- Schedule export/print

### 6. Performance Management (/hr/performance):
- Annual/semi-annual review forms
- KPI tracking
- 360-degree feedback (from peers, juniors, supervisors)
- Performance history

## Key Features:
1. Biometric Integration (placeholder):
   - API endpoint ready for biometric device integration
   - Fallback: manual entry or app-based check-in with GPS

2. Staff Self-Service Portal:
   - Employees can view their own:
     * Attendance
     * Leave balance + apply
     * Payslips
     * Shift schedule
   - Accessible via main login with limited scope

3. Compliance:
   - PF/ESI compliance reports
   - Form 16 generation (India-specific) — template based
   - Labor law compliance tracking

All fully typed, with reports exportable to Excel/PDF.
```

---

### PHASE 18: NOTIFICATION & COMMUNICATION HUB

**Duration**: Week 15  
**Goal**: Complete notification system, internal messaging, and communication templates.

---

#### 🤖 PHASE 18 PROMPT

```
Building on Phase 17. Create the Notification & Communication Hub for MedicaLink HMS.

## Notification Architecture:

### Channels:
1. In-App (real-time via Socket.io)
2. Email (Nodemailer + AWS SES)
3. SMS (Twilio)
4. Push Notification (Expo for mobile)
5. WhatsApp (Twilio WhatsApp API — optional)

### Notification Model:
{
  _id, tenantId, userId,
  type: (enum: 60+ notification types),
  category: CLINICAL|ADMINISTRATIVE|BILLING|SYSTEM|REMINDER,
  title, body, data: {}, // action data for deeplink
  channels: [INAPP|EMAIL|SMS|PUSH],
  status: {
    inApp: { sent, readAt },
    email: { sent, deliveredAt, openedAt },
    sms: { sent, deliveredAt }
  },
  priority: LOW|NORMAL|HIGH|CRITICAL,
  isRead, readAt,
  expiresAt,
  createdAt
}

### Notification Types (examples):
APPOINTMENT_BOOKED, APPOINTMENT_REMINDER_24H, APPOINTMENT_REMINDER_1H,
APPOINTMENT_CANCELLED, APPOINTMENT_RESCHEDULED,
PATIENT_REGISTERED, PATIENT_DISCHARGED,
LAB_RESULT_READY, CRITICAL_LAB_VALUE,
PRESCRIPTION_READY, PRESCRIPTION_DISPENSED,
BILL_GENERATED, PAYMENT_RECEIVED, PAYMENT_OVERDUE,
DOCTOR_AVAILABLE, CONSULTATION_STARTED,
INSURANCE_CLAIM_APPROVED, INSURANCE_CLAIM_REJECTED,
BLOOD_REQUEST, LOW_STOCK_ALERT, DRUG_EXPIRY_ALERT,
CODE_BLUE, CODE_RED, EMERGENCY_ALERT,
SHIFT_REMINDER, LEAVE_APPROVED, LEAVE_REJECTED,
TELEMEDICINE_SESSION_START

### Notification Templates:
Template per notification type + channel:
{
  notificationType, channel,
  subject, // email subject
  body, // with {{variable}} placeholders
  smsTemplate,
  pushTitle, pushBody
}

Hospital admin can customize templates via settings.

## Services:

### notificationService.ts:
sendNotification(params: {
  userId, tenantId, type, data, channels?, priority?
}):
  1. Get user notification preferences
  2. Get template for type + channel
  3. Replace template variables
  4. Queue jobs for each channel (Bull)
  5. Create notification record
  6. Emit socket event for in-app

sendBulkNotification(userIds[], type, data):
  - Queue bulk send job
  - Progress tracking

### jobs/notificationJobs.ts:
- emailJob: Use Nodemailer/SES, retry on failure
- smsJob: Use Twilio, handle delivery callbacks
- pushJob: Use Expo Push API

## Frontend Components:

### 1. Notification Bell (/header):
- Bell icon in header with unread count badge
- Click opens notification panel (overlay)
- Panel shows last 20 notifications, grouped by date
- Each notification:
  * Icon (category-based)
  * Title, body (truncated)
  * Time (relative: "2 min ago")
  * Click → navigate to relevant page
  * Unread indicator
- "Mark all as read" button
- "View all notifications" link

### 2. Notifications Page (/notifications):
- Full notification history
- Filter by category, date, read/unread
- Bulk mark as read
- Delete notifications

### 3. Notification Settings (/settings/notifications):
Per user, per type: which channels to receive on
Toggle matrix: notification type × channel
Quiet hours: "Don't send between 11PM - 7AM"
Frequency settings for digest notifications

### 4. Internal Messaging (/messages):
Staff-to-staff messaging:
- Inbox with conversations
- New message: search staff by name/role
- Department-wide announcements
- Message threads
- File attachments
- Read receipts
- Notification for new messages

### 5. Notification Template Manager (/admin/notification-templates):
For hospital admin:
- List all notification templates
- Edit template body/subject
- Preview with sample data
- Test send button
- Toggle channels per template

## Communication Audit:
- All patient communications logged
- Consent tracking for marketing messages
- Unsubscribe handling for email
- GDPR compliant data retention

All with TypeScript, Queue-based processing, delivery tracking.
```

---

### PHASE 19: SECURITY HARDENING & PERFORMANCE

**Duration**: Week 15-16  
**Goal**: Production-grade security implementation, caching, and performance optimization.

---

#### 🤖 PHASE 19 PROMPT

```
Building on Phase 18. Implement comprehensive security hardening and performance optimization.

## SECURITY IMPLEMENTATION:

### 1. OWASP Top 10 Compliance:
middlewares/security.ts:

A01 Broken Access Control:
- Verify user can only access their tenant's data (tenant middleware)
- Resource-level authorization: can user X access resource Y
- Implement ABAC (Attribute-Based Access Control) for complex rules

A02 Cryptographic Failures:
- All passwords: bcryptjs (12 rounds)
- Sensitive data (PAN, insurance numbers): AES-256-GCM encryption at rest
- TLS 1.3 enforced
- No sensitive data in URL parameters

A03 Injection:
- Mongoose schema validation (no raw MongoDB operators from input)
- Express Validator sanitization on all inputs
- Mongoose .lean() for read-only queries
- Parameterized aggregation pipelines

A04 Insecure Design:
- Rate limiting per endpoint type (see below)
- Business logic validation (can't book past appointment, can't pay more than bill)

A05 Security Misconfiguration:
- Helmet.js with strict CSP
- No stack traces in production responses
- Remove X-Powered-By header
- Disable directory listing

A06 Vulnerable Components:
- npm audit in CI pipeline
- Dependabot for dependency updates
- Software Bill of Materials (SBOM) generation

A07 Authentication Failures:
- Progressive lockout (5 attempts → 15min lockout)
- Secure session management
- CSRF protection for state-changing operations

A08 Integrity Failures:
- SRI hashes for CDN resources
- Input validation + output encoding

A09 Logging Failures:
- Comprehensive audit logging (every data access, modification, deletion)
- Log tampering protection (append-only log)
- PII masking in logs

A10 SSRF:
- Whitelist for external URL fetching
- Internal service call validation

### 2. Rate Limiting Strategy:
rateLimiter.ts using express-rate-limit + Redis store:

Tiers:
- Auth endpoints: 5 requests/15min per IP
- Public APIs: 100 requests/15min per IP
- Authenticated APIs: 300 requests/min per user
- AI endpoints: 20 requests/min per user (cost control)
- Report generation: 5 requests/min per user
- File uploads: 10 requests/min per user

### 3. Audit Logging:
models/AuditLog.ts:
{
  tenantId, userId, userRole, userEmail,
  action: CREATE|READ|UPDATE|DELETE|LOGIN|LOGOUT|EXPORT,
  resource: string, resourceId,
  ipAddress, userAgent,
  changes: { before, after }, // for updates
  outcome: SUCCESS|FAILURE,
  timestamp
}

auditMiddleware.ts:
- Intercept all write operations
- Log to AuditLog collection
- Never log passwords or tokens
- Log patient data access (HIPAA requirement)

### 4. Data Encryption:
utils/encryption.ts:
- AES-256-GCM for sensitive fields (insurance numbers, national ID)
- Mongoose plugin for auto-encrypt/decrypt on defined fields
- Key rotation support (maintain key versions)

### 5. Input Sanitization:
- DOMPurify on frontend before rendering user input
- express-mongo-sanitize to prevent NoSQL injection
- xss-clean middleware
- File upload: whitelist MIME types, file size limits, virus scan placeholder

## PERFORMANCE OPTIMIZATION:

### 1. Database Optimization:
- Create indexes for all frequent query patterns:
  * patients: phone, email, uhid (unique)
  * appointments: doctorId + date, patientId, status
  * consultations: patientId + visitDate
  * bills: patientId, status, billDate
  * labOrders: patientId, orderedDate, status
  * audit logs: userId, timestamp, resource

- MongoDB query optimization:
  * Use .select() to return only needed fields
  * Use .lean() for read-only queries (50% faster than Mongoose documents)
  * Pagination on all list endpoints (default 20, max 100)
  * Use aggregation for analytics (single query vs multiple)

### 2. Redis Caching Strategy:
services/cacheService.ts:
Cache these with TTL:
- User session: 15 min
- Tenant settings: 1 hour (invalidate on change)
- Doctor schedule: 1 hour (invalidate on booking)
- Drug catalog: 4 hours
- ICD-10 search results: 24 hours
- Analytics dashboards: 15 min
- Patient basic info: 30 min (frequently accessed)

Cache patterns:
- Cache-aside: check cache → if miss, query DB → store in cache
- Write-through: update DB and cache simultaneously
- Cache invalidation: on record update, delete related cache keys

### 3. Frontend Performance:
- Code splitting: lazy-load all feature modules
- React.memo for expensive list items
- Virtual scrolling for long lists (react-window)
- Image optimization: WebP format, lazy loading, Cloudinary transformations
- Service worker for asset caching
- Bundle analysis: track and limit bundle sizes
- Web Vitals monitoring

### 4. API Performance:
- Response compression (gzip via compression middleware)
- HTTP/2 with NGINX
- Connection pooling for MongoDB
- Redis connection pooling
- Background processing for heavy operations (report generation)

### 5. File Upload Optimization:
- Client-side image compression before upload
- Cloudinary responsive images (auto-format, auto-quality)
- S3 multipart upload for large files
- Virus scan placeholder for medical document uploads

## Security Headers (Helmet config):
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{RANDOM}'"],
      styleSrc: ["'self'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com"],
      connectSrc: ["'self'", "*.MedicaLink.app", "wss://"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
})

All security measures documented, with penetration testing checklist included.
```

---

### PHASE 20: DEVOPS, CI/CD & CLOUD DEPLOYMENT

**Duration**: Week 16-17  
**Goal**: Complete Docker containerization, GitHub Actions CI/CD, and AWS production deployment.

---

#### 🤖 PHASE 20 PROMPT

```
Building on Phase 19. Create the complete DevOps infrastructure and deployment pipeline.

## Docker Setup:

### docker-compose.yml (Development):
version: '3.8'
services:
  api:
    build: ./apps/api
    ports: ['5000:5000']
    environment: from .env
    depends_on: [mongodb, redis]
    volumes: (hot reload in dev)

  web:
    build: ./apps/web
    ports: ['3000:3000']
    
  mongodb:
    image: mongo:7
    ports: ['27017:27017']
    volumes: ['mongodb_data:/data/db']
    
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    
  mongo-express:
    image: mongo-express
    ports: ['8081:8081']
    
  redis-insight:
    image: redislabs/redisinsight
    ports: ['8001:8001']

### Dockerfiles:

apps/api/Dockerfile (Multi-stage):
Stage 1 (builder): Install deps, compile TypeScript
Stage 2 (production): Copy compiled files, npm prune --production
Optimized: ~100MB image size

apps/web/Dockerfile (Multi-stage):
Stage 1 (builder): npm install, npm run build
Stage 2: nginx:alpine, copy dist, nginx.conf
Optimized: ~20MB image

### NGINX Config:
/docker/nginx/nginx.conf:
- SSL termination
- Subdomain routing (*.MedicaLink.app → same service)
- Gzip compression
- Rate limiting
- Security headers
- Proxy to Node.js API
- Serve React static files
- WebSocket proxy upgrade for Socket.io

## GitHub Actions CI/CD:

### .github/workflows/main.yml:
Triggers: push to main, pull requests to main

Pipeline stages:
1. Lint & Type Check:
   - ESLint (fail on error)
   - TypeScript type checking
   - Prettier format check

2. Test:
   - Unit tests (Jest/Vitest)
   - Integration tests (supertest for API)
   - Coverage report (minimum 70%)

3. Security Scan:
   - npm audit (fail on critical)
   - CodeQL analysis
   - Snyk dependency check

4. Build:
   - Docker build for api and web
   - Build tagging (commit SHA)

5. Deploy (on main branch only):
   - Push images to ECR
   - Deploy to ECS (Blue/Green deployment)
   - Run DB migrations
   - Health check verification
   - Rollback if health check fails

### .github/workflows/pr.yml:
On PR: Run lint + test only (faster feedback)

## AWS Architecture:

### Production Infrastructure:
- AWS ECS Fargate (container orchestration, no servers to manage)
- Application Load Balancer (distributes traffic, SSL termination)
- AWS ECR (Docker image registry)
- MongoDB Atlas M10 cluster (managed MongoDB, auto-backup)
- AWS ElastiCache for Redis (managed Redis cluster)
- AWS S3 (file storage: reports, images, documents)
- AWS CloudFront (CDN for static files, DICOM images)
- AWS SES (email service — cheaper than Twilio for email)
- AWS Route 53 (DNS, wildcard record for *.MedicaLink.app)
- AWS ACM (SSL certificates, auto-renewal)
- AWS Secrets Manager (environment variables)
- AWS CloudWatch (logs, metrics, alarms)
- AWS WAF (Web Application Firewall)

### Terraform (Infrastructure as Code):
Create terraform/ folder:
- vpc.tf (VPC, subnets, security groups)
- ecs.tf (ECS cluster, services, task definitions)
- alb.tf (load balancer, target groups)
- rds.tf (DocumentDB or point to Atlas)
- elasticache.tf (Redis cluster)
- s3.tf (buckets)
- cloudfront.tf (distribution)
- route53.tf (DNS records)
- iam.tf (roles and policies)

### Environment Configuration:
- Development: .env.local
- Staging: .env.staging
- Production: AWS Secrets Manager

Staging environment:
- Separate ECS tasks
- Separate database (staging Atlas cluster)
- Deployed on every merge to develop branch

## Monitoring & Observability:

### Application Monitoring:
Winston + CloudWatch Logs:
- Structured JSON logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Request ID tracking across services
- Performance timing middleware

Sentry Integration:
- Error tracking in both frontend and backend
- Source maps for production debugging
- Performance monitoring
- Release tracking

### Health Check Endpoints:
GET /health:
{
  status: 'healthy',
  version, uptime, timestamp,
  services: {
    database: 'connected',
    redis: 'connected',
    storage: 'connected'
  }
}

### Alerting:
CloudWatch Alarms for:
- API error rate > 5% → PagerDuty alert
- Response time > 1s (p95) → Slack alert
- Database CPU > 80% → Slack alert
- Memory usage > 85% → Slack alert
- Failed deployments → Email + Slack

### Backup Strategy:
- MongoDB Atlas: continuous backup, point-in-time recovery
- S3 versioning for medical documents
- Redis: RDB snapshots every hour
- Cross-region replication for disaster recovery

## Cost Optimization:
- ECS Fargate Spot for non-critical workloads (70% savings)
- S3 lifecycle policies (move old reports to Glacier after 1 year)
- CloudFront caching reduces origin requests
- Redis ElastiCache reduces DB load
- Reserved instances for predictable workloads

Generate all configuration files with complete, production-ready code.
```

---

### PHASE 21: TESTING & QA

**Duration**: Week 17  
**Goal**: Comprehensive test suite covering unit, integration, and E2E testing.

---

#### 🤖 PHASE 21 PROMPT

```
Building on Phase 20. Create comprehensive test suite for MedicaLink HMS.

## Testing Strategy:

### Backend Testing (Jest + Supertest):

Test structure for each module:
tests/
├── unit/
│   ├── services/        (business logic tests)
│   ├── utils/           (utility function tests)
│   └── models/          (model validation tests)
├── integration/
│   ├── auth.test.ts
│   ├── patients.test.ts
│   ├── appointments.test.ts
│   ├── billing.test.ts
│   └── ... (all modules)
└── setup.ts            (test DB, factories)

Write these critical tests:

1. Auth Tests (tests/integration/auth.test.ts):
- POST /auth/login: valid credentials → returns tokens
- POST /auth/login: invalid password → 401
- POST /auth/login: 5 failed attempts → account lockout
- POST /auth/refresh: valid refresh token → new access token
- POST /auth/refresh: expired token → 401
- POST /auth/logout: invalidates refresh token
- 2FA: setup → verify → login with TOTP

2. Patient Tests:
- Register new patient → UHID auto-generated
- Duplicate patient detection
- Search by name/phone/UHID
- Get patient with all related data
- Update patient info
- Multi-tenant isolation (patient in tenant A not visible in tenant B)

3. Appointment Tests:
- Book appointment: valid slot → success
- Book appointment: already booked slot → conflict error
- Double-booking prevention (concurrent request test)
- Cancel appointment → slot freed
- Slot generation from schedule template

4. Billing Tests:
- Generate bill: items total correctly
- GST calculation accuracy
- Insurance deduction calculation
- Partial payment recording
- Outstanding balance calculation

### Frontend Testing (Vitest + React Testing Library):

Component tests for critical components:
1. AuthGuard: unauthenticated user → redirect to login
2. PatientSearchCombobox: typing shows suggestions, enter selects
3. AppointmentCalendar: shows appointments on correct dates
4. PrescriptionWriter: drug interaction alert shows when needed
5. BillingCalculator: totals calculate correctly
6. DoctorSchedule: available slots match template

### E2E Testing (Playwright):

Critical user journeys:
1. Patient Registration Journey:
   - Navigate to /patients/register
   - Fill all 5 steps
   - Submit and verify UHID generated
   - Verify patient appears in search

2. Appointment Booking Journey:
   - Search for patient
   - Click Book Appointment
   - Select doctor and specialty
   - Pick date and available slot
   - Confirm booking
   - Verify SMS/email notification triggered

3. Complete Consultation Journey:
   - Login as doctor
   - See today's appointments
   - Open patient consultation
   - Enter SOAP notes
   - Write prescription
   - Order lab tests
   - Complete consultation
   - Verify EHR updated

4. Billing Journey:
   - Select patient
   - Create bill with services
   - Add insurance claim
   - Record payment
   - Generate PDF receipt
   - Verify patient ledger updated

5. Pharmacy Dispensing Journey:
   - Login as pharmacist
   - See prescription queue
   - Select pending prescription
   - Verify drug interaction check
   - Dispense medications
   - Update stock

## Test Data Factories:
tests/factories/:
- patientFactory.ts: creates realistic patient data
- doctorFactory.ts: doctor with schedule
- appointmentFactory.ts: appointment with patient + doctor
- billFactory.ts: bill with items
- consultationFactory.ts: full SOAP notes

## CI Integration:
- Tests run on every PR (GitHub Actions)
- Coverage threshold: 70% (enforced)
- E2E: run on staging deploy
- Performance: Lighthouse CI in pipeline
- Test results published to PR comments

All tests documented with describe/it blocks, realistic test data, proper assertions.
```

---

### PHASE 22: DOCUMENTATION & LAUNCH PREPARATION

**Duration**: Week 18  
**Goal**: Complete documentation, API docs, user guides, and launch materials.

---

#### 🤖 PHASE 22 PROMPT

```
Building on Phase 21. Create comprehensive documentation and launch materials.

## API Documentation (Swagger/OpenAPI):

Install swagger-jsdoc + swagger-ui-express.
Create swagger config at src/config/swagger.ts.

Document EVERY endpoint with:
- Description
- Request body schema with examples
- Response schema with examples
- Error responses
- Authentication requirement
- Rate limit information

Swagger UI accessible at: /api/docs

Also generate Postman collection from OpenAPI spec.

## README Files:

### Root README.md:
- Project overview with screenshot
- Feature list (comprehensive)
- Quick start (5 minutes to running)
- Architecture diagram
- Tech stack badges
- Contribution guide
- License

### apps/web/README.md:
- Setup instructions
- Available scripts
- Environment variables documentation
- Folder structure explanation
- Coding conventions

### apps/api/README.md:
- API architecture
- Setup and installation
- All environment variables explained
- Database setup
- Running tests

## User Documentation:

### Hospital Admin Guide (docs/admin-guide.md):
- Initial hospital setup walkthrough
- Adding departments and beds
- Creating user accounts
- Configuring modules
- Setting up billing
- Financial reports guide

### Doctor Guide (docs/doctor-guide.md):
- Consultation workflow
- Prescription writing
- Lab and radiology orders
- EHR review
- Mobile app usage

### Patient Portal Guide (docs/patient-guide.md):
- Account setup
- Booking appointments
- Viewing records
- Paying bills
- Telemedicine

## GitHub Repository Optimization:
- Professional README with live demo link
- Screenshots and screen recordings
- Architecture diagram (draw.io/Mermaid)
- Feature badges (CI status, test coverage, license)
- Issue templates (bug report, feature request)
- PR template
- Code of conduct
- Contributing guidelines
- Changelog (CHANGELOG.md with version history)
- GitHub Pages for documentation site

## Portfolio/LinkedIn Materials:

### Project Description for LinkedIn:
Write a compelling technical project description:
- What problem it solves
- Technical challenges overcome
- Scale and scope (25 modules, 160+ pages, 15 user roles)
- AI integration highlights
- Production-ready features
- Technologies used

### Technical Blog Post Outline:
"Building an International Hospital Management SaaS with AI"
- Introduction: Why HMS, why MERN
- Architecture decisions (multi-tenancy, real-time)
- Interesting technical challenges (slot booking race conditions, EHR design)
- AI integration lessons
- Performance optimization
- Lessons learned

## Live Demo Setup:
- Demo tenant: "MedicaLink General Hospital" (pre-seeded data)
- Demo login credentials for each role
- Demo data: 100 patients, 10 doctors, 50 appointments, billing history
- "Reset to demo state" job (runs at midnight)
- Demo mode indicator banner

## Environment Setup Documentation:
.env.example with ALL variables:
- Comprehensive comments for each variable
- Instructions for obtaining API keys (Stripe, Twilio, OpenAI, etc.)
- Docker setup instructions
- MongoDB Atlas setup guide

Generate all documentation files, comprehensive and ready for professional showcase.
```

---

## QUICK REFERENCE: ALL PROMPTS SUMMARY

| Phase | Title | Est. Duration | Key Output |
|-------|-------|--------------|-----------|
| 0 | Project Foundation | 1 week | Monorepo, design system, base components |
| 1 | Auth & Multi-tenant | 1 week | JWT auth, RBAC, tenant isolation |
| 2 | Super Admin Panel | 3 days | SaaS management dashboard |
| 3 | Admin Dashboard & Settings | 1 week | Hospital admin, dept, bed management |
| 4 | Patient Management | 1 week | Registration, profiles, patient portal |
| 5 | Doctor & Staff Management | 3 days | Doctor profiles, scheduling templates |
| 6 | Appointment Engine | 1 week | Booking, queue, reminders |
| 7 | EHR Module | 1.5 weeks | SOAP notes, prescriptions, AI summaries |
| 8 | Pharmacy | 1 week | Dispensing, inventory, procurement |
| 9 | Laboratory | 1 week | LIS workflow, results, reports |
| 10 | Billing & Finance | 1 week | Bills, insurance, payments, reports |
| 11 | Emergency & ICU | 1 week | Triage, ICU monitoring, ambulance |
| 12 | OT & Blood Bank | 1 week | Surgery records, blood inventory |
| 13 | Telemedicine | 1 week | WebRTC video, virtual waiting room |
| 14 | AI Integration | 2 weeks | Clinical AI, voice notes, predictions |
| 15 | Analytics & BI | 1 week | Dashboards, custom reports |
| 16 | React Native App | 2 weeks | Patient, doctor, nurse mobile apps |
| 17 | HR Management | 1 week | Attendance, payroll, scheduling |
| 18 | Notifications | 1 week | Multi-channel notification hub |
| 19 | Security & Performance | 1 week | OWASP compliance, caching |
| 20 | DevOps & Deployment | 1 week | Docker, CI/CD, AWS |
| 21 | Testing & QA | 1 week | Unit, integration, E2E tests |
| 22 | Documentation & Launch | 1 week | API docs, README, portfolio |

**Total Estimated Development Time**: 22-26 weeks (with focused full-time work)

---

## FINAL STATISTICS

| Metric | Count |
|--------|-------|
| Total Web Pages | 181+ |
| Total Mobile Screens | 100+ |
| Backend Modules | 25+ |
| Data Models | 40+ |
| API Endpoints | 200+ |
| User Roles | 15 |
| AI Integration Points | 14+ |
| Development Phases | 23 |
| Component Library Items | 80+ |
| Test Cases | 200+ |

---

*MedicaLink HMS — Built to impress. Designed to heal. Engineered for scale.*
