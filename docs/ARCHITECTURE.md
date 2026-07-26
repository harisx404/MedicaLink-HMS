# Technical Architecture & System Design — MedicaLink HMS

System architecture, data models, multi-tenancy mechanics, caching strategy, security safeguards, and AI pipeline details for MedicaLink HMS.

---

## System Architecture Topology

```mermaid
graph TD
    Client[React 18 Web SPA / Mobile App] -->|HTTPS / WSS| Nginx[Nginx Reverse Proxy / Load Balancer]
    Nginx -->|Express REST API| API[API Gateway / Express Server]
    API -->|Tenant Isolation Middleware| TenantRouter{Tenant Connection Router}
    TenantRouter -->|Tenant A Header| DB_A[(MongoDB Tenant A DB)]
    TenantRouter -->|Tenant B Header| DB_B[(MongoDB Tenant B DB)]
    API -->|Read-Through Cache| Redis[(Redis Multi-Layer Cache)]
    API -->|Websocket Telemetry| Socket[Socket.io Real-Time Hub]
    API -->|Clinical LLM Prompts| Gemini[Google Gemini 1.5 AI API]
```

---

## Multi-Tenant Database-per-Tenant Isolation

MedicaLink HMS uses a database-per-tenant isolation strategy. Rather than storing all tenants in shared tables filtered by `tenantId`, each tenant operates against a separate MongoDB database instance (`medicalink_tenant_{id}`).

### Tenant Resolution Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant Client as Client Application
    participant Auth as Auth & Tenant Middleware
    participant Pool as Connection Manager Cache
    participant DB as MongoDB Cluster

    Client->>Auth: Request with `x-tenant-id` header or JWT payload
    Auth->>Pool: Query connection pool for Tenant ID
    alt Connection Exists in Pool
        Pool-->>Auth: Return cached Mongoose Connection
    else New Connection Required
        Pool->>DB: Open dedicated MongoDB connection (`medicalink_tenant_{id}`)
        Pool-->>Auth: Cache & return new Mongoose Connection
    end
    Auth->>DB: Execute query strictly within Tenant Database context
    DB-->>Client: Return isolated JSON data
```

---

## Redis Caching Architecture

To support high-concurrency read operations, MedicaLink HMS uses a dual-mode Redis client supporting both ioredis (TCP socket) and Upstash (HTTP REST API).

### Cache Strategy

```
+-------------------------------------------------------------------+
|                        Incoming HTTP GET Request                   |
+-------------------------------------------------------------------+
                                  |
                                  v
                    +---------------------------+
                    |  Cache Key Resolution     |
                    | (tenant:path:query hash)  |
                    +---------------------------+
                                  |
               +------------------+------------------+
               |                                     |
               v                                     v
     [ Cache Hit ]                             [ Cache Miss ]
               |                                     |
    Return Cached JSON payload             Execute Mongoose DB Query
    (Header: X-Cache: HIT)                           |
               |                               Store in Redis (TTL: 300s)
               v                                     v
     Respond in <15ms                      Return Response (X-Cache: MISS)
```

---

## Security & HIPAA Safeguards

```mermaid
graph LR
    subgraph "Edge Security"
        Helmet[Helmet Security Headers]
        Sanitize[express-mongo-sanitize]
        Limiter[Tiered Rate Limiters]
    end

    subgraph "Authentication & Authorization"
        JWT[HttpOnly Access/Refresh JWT Tokens]
        TOTP[Two-Factor Auth TOTP]
        RBAC[15-Role RBAC / ABAC Matrix]
    end

    subgraph "Data Security"
        AES[AES-256-GCM Field Encryption]
        Audit[Immutable Audit Logging]
    end

    Edge Security --> Authentication & Authorization --> Data Security
```

- **Field-Level PII Encryption:** Sensitive fields (SSN, tax ID, insurance policy ID) are encrypted at rest using AES-256-GCM.
- **RBAC Matrix:** Access is bounded by 15 predefined roles (`SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`, `PHARMACIST`, `LAB_TECH`, `RECEPTIONIST`, `ACCOUNTANT`, `PATIENT`, etc.).

---

## AI Clinical Decision Support Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant Doctor as Doctor / EHR Workstation
    participant Backend as Express AI Controller
    participant Gemini as Google Gemini 1.5 API

    Doctor->>Backend: Submit SOAP Consultation Notes
    Backend->>Backend: Sanitize & redact direct PII identifiers
    Backend->>Gemini: Prompt with Clinical Context & Structured Schema
    Gemini-->>Backend: Return JSON with suggested ICD-10 codes & drug warnings
    Backend-->>Doctor: Display suggestions in Consultation UI for verification
```
