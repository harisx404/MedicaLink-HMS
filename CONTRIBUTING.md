# Contributing to MedicaLink HMS

Thank you for your interest in contributing to MedicaLink HMS. This guide covers the development workflow, coding standards, and submission process.

## Development Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Redis (local or Upstash)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/harisx404/MedicaLink-HMS.git
cd MedicaLink-HMS

# Install dependencies
pnpm install

# Start infrastructure (MongoDB + Redis)
docker-compose up -d

# Copy environment files
cp .env.example apps/api/.env
cp .env.example apps/web/.env

# Start development servers
pnpm run dev
```

## Coding Standards

### TypeScript
- Strict mode enabled — no `any` types, no implicit `any`
- Every async function must have proper error handling
- Use Zod schemas for all runtime validation

### Naming Conventions
- `camelCase` for variables and functions
- `PascalCase` for components, types, and interfaces
- `SCREAMING_SNAKE_CASE` for constants and enum values

### File Organization
- Feature-based folder structure
- Barrel exports (`index.ts`) in every directory
- Shared types in `packages/shared`

### Code Quality
- No `console.log()` in production code
- No commented-out code blocks
- No unused imports or variables
- Every component handles loading, error, and empty states

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
type(scope): short imperative description
```

### Types
| Type | When to Use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `security` | Security patch or hardening |
| `perf` | Performance improvement |
| `refactor` | Code restructured, no behavior change |
| `docs` | Documentation update |
| `test` | Test addition or modification |
| `chore` | Dependency update, config, build |
| `style` | Formatting only |
| `ci` | CI/CD pipeline change |

### Examples
```
feat(pharmacy): implement FEFO batch selection for dispensing
fix(auth): resolve token expiry edge case on concurrent sessions
test(billing): add integration tests for payment recording
```

## Pull Request Process

1. Create a feature branch from `dev`: `git checkout -b feature/your-feature`
2. Make your changes following the coding standards above
3. Run `pnpm run build` and ensure 0 errors
4. Run `pnpm run test` and ensure all tests pass
5. Commit using Conventional Commits format
6. Push and open a PR against `dev`
7. Fill out the PR template completely
8. Request review

## Branch Strategy

```
main            → Always clean and deployable
dev             → Active development branch
feature/[name]  → New features
fix/[name]      → Bug fixes
security/[name] → Security patches
```

## Architecture

```
MedicaLink-HMS/
├── apps/
│   ├── api/          # Express.js REST API (multi-tenant)
│   ├── web/          # React SPA (Vite + Redux)
│   └── mobile/       # React Native (Expo)
├── packages/
│   ├── shared/       # Shared TypeScript types and enums
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
└── turbo.json        # Turborepo pipeline config
```

## Questions?

Open an issue with the `question` label or reach out via the repository discussions.
