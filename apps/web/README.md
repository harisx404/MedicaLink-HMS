# MedicaLink HMS — Web Application

> React SPA powering the MedicaLink Hospital Management System dashboard.

## Architecture

```
src/
├── app/             # App.tsx, router.tsx, providers
├── components/      # Shared UI components (DataTable, StatsCard, PageHeader, etc.)
├── features/        # Feature modules (auth, patients, pharmacy, billing, etc.)
├── hooks/           # Custom React hooks (useAuth, useTenant, useDebounce)
├── layouts/         # AppLayout, SuperAdminLayout, PatientPortalLayout
├── lib/             # API client, utilities, cn() helper
├── pages/           # Route-level page components
├── store/           # Redux Toolkit store, API slices, feature slices
├── tests/           # Vitest test setup
├── types/           # TypeScript type definitions
└── index.css        # Design system tokens and global styles
```

## Design System

The UI follows a strict design system defined in `tailwind.config.js`:

- **Primary**: Indigo (`#4F46E5`) — actions, links, active states
- **Secondary**: Teal (`#14B8A6`) — accents, success indicators
- **Background**: `#F0F4F8` (app), `#0A1628` (sidebar)
- **Typography**: Plus Jakarta Sans (headings), Inter (body)
- **Animations**: Framer Motion for page transitions, hover effects, and micro-interactions

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:5000`) |

## Available Scripts

```bash
# Development server with HMR
pnpm run dev

# Production build
pnpm run build

# Run test suites
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Lint check
pnpm run lint
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Redux Toolkit + RTK Query | State management and API caching |
| React Router v7 | Client-side routing |
| React Hook Form + Zod | Form management and validation |
| Tailwind CSS v3 | Utility-first styling |
| shadcn/ui (Radix) | Accessible component primitives |
| Framer Motion | Animations and transitions |
| Recharts | Data visualization |
| TanStack Table | Advanced data tables |

## Testing

Frontend tests use **Vitest** with **jsdom** environment:

```bash
pnpm run test          # Run all tests
pnpm run test:watch    # Watch mode
```
