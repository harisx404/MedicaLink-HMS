# MedicaLink HMS — API Server

> Multi-tenant Express.js REST API powering the MedicaLink Hospital Management System.

## Architecture

```
src/
├── config/          # Database, Redis, Cloudinary, Swagger, environment
├── controllers/     # Request handlers (thin layer → delegates to services)
├── middlewares/     # Auth, tenant resolution, rate limiting, validation, XSS
├── models/          # Mongoose schemas (tenant-scoped via connection factory)
├── routes/          # Express route definitions with middleware chains
├── services/        # Business logic (auth, billing, pharmacy, scheduling)
├── sockets/         # Socket.io event handlers for real-time features
├── tests/           # Vitest unit and integration test suites
├── utils/           # Helpers, constants, logger, API response formatter
├── app.ts           # Express application factory
└── server.ts        # HTTP server bootstrap and Socket.io initialization
```

## Key Design Decisions

- **Database-per-tenant**: Each hospital gets an isolated MongoDB database. The `tenantDb` middleware resolves the correct connection from the request context.
- **Service layer pattern**: Controllers are thin — all business logic lives in service files for testability.
- **Redis dual-mode**: Uses TCP (ioredis) locally and HTTP (Upstash) in serverless/Vercel deployments.
- **Zod validation**: Every endpoint validates inputs with Zod schemas before reaching the controller.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `MAIN_DB_NAME` | Yes | Main platform database name |
| `REDIS_URL` | No | Redis TCP URL for local development |
| `UPSTASH_REDIS_REST_URL` | No | Upstash REST URL for serverless |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash auth token |
| `JWT_ACCESS_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret (min 32 chars) |
| `ENCRYPTION_KEY` | Yes | AES-256-GCM key for PII encryption |
| `GEMINI_API_KEY` | No | Google Gemini AI for clinical summaries |
| `CLOUDINARY_*` | No | Image upload service credentials |
| `SMTP_*` | No | Email service configuration |
| `TWILIO_*` | No | SMS and WhatsApp notifications |
| `STRIPE_SECRET_KEY` | No | Payment processing |

## Available Scripts

```bash
# Development server with hot reload
pnpm run dev

# Production build
pnpm run build

# Run test suites
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

## API Documentation

Interactive Swagger UI is available at `/api/docs` when the server is running. The raw OpenAPI spec can be accessed at `/api/docs.json`.

## Testing

The API uses **Vitest** with a local MongoDB instance for integration tests:

- **Unit tests**: Encryption, API response formatting, error handler
- **Integration tests**: Authentication flows, billing workflows, pharmacy inventory

```bash
pnpm run test           # Run all tests
pnpm run test:coverage  # With V8 coverage report
```
