# AFOCE Development Context

## 🚀 Getting Started

### Prerequisites

**Required:**
- Node.js 20.x or later
- npm 10.x or later
- Git
- Supabase account (for backend)

**Recommended:**
- VS Code with recommended extensions
- Supabase CLI
- Docker (for local Supabase)

### Environment Setup

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/afoce.git
cd afoce
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Variables
```bash
# Copy example env file
cp .env.example .env.local

# Edit with your values
# Required for local development:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional:
RESEND_API_KEY=              # For email notifications
UPSTASH_REDIS_REST_URL=      # For rate limiting
UPSTASH_REDIS_REST_TOKEN=
```

#### 4. Database Setup
```bash
# Option A: Use existing Supabase project
# Run schema.sql in Supabase SQL Editor

# Option B: Local Supabase (recommended for isolated dev)
supabase start
supabase db reset
```

#### 5. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### Development Workflow

#### Daily Development
```bash
# Start dev server
npm run dev

# Run tests in watch mode
npm run test:ui

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

#### Before Commit
```bash
# Full check
npx tsc --noEmit && npm run lint && npm run test

# Or use pre-commit hook (if configured)
```

## 🛠️ Tooling

### VS Code Extensions (Recommended)
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "msjsdiag.vscode-react-native",
    "supabase.supabase-vscode",
    "prisma.prisma"
  ]
}
```

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### npm Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "db:types": "supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID} > lib/database.types.ts"
  }
}
```

## 📦 Project Structure

```
AFOCE/
├── .agents/                 # AI agent skills and configs
├── .claude/                 # Claude-specific settings
├── .qoder/                  # Qoder-specific settings
├── .vscode/                 # VS Code settings and extensions
├── app/                     # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (public)/            # Public pages (landing, pricing)
│   ├── api/                 # API routes
│   │   ├── clients/         # Clients CRUD
│   │   ├── invoices/        # Invoices CRUD + workflow
│   │   ├── expenses/        # Expenses CRUD + approval
│   │   ├── bank-lines/      # Bank reconciliation
│   │   ├── policies/        # Expense policies
│   │   ├── team/            # Team management
│   │   ├── analytics/       # Dashboard metrics
│   │   ├── reports/         # VAT reports, exports
│   │   ├── notifications/   # In-app notifications
│   │   ├── upload/          # File uploads
│   │   └── webhooks/        # External webhooks
│   ├── dashboard/           # Dashboard pages
│   │   ├── analytics/       # Analytics page
│   │   ├── clients/         # Clients management
│   │   ├── expenses/        # Expenses management
│   │   ├── invoices/        # Invoices management
│   │   ├── policies/        # Policies management
│   │   ├── reconciliation/  # Bank reconciliation
│   │   ├── reports/         # Reports page
│   │   ├── team/            # Team management
│   │   └── settings/        # Settings pages
│   ├── todos/               # Todo pages (if used)
│   ├── favicon.ico
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── brand/               # Brand components (logo, etc.)
│   ├── dashboard/           # Dashboard-specific components
│   ├── modals/              # Reusable modals
│   └── public/              # Public page components
├── docs/                    # Documentation
│   ├── PROJECT.md           # Project overview
│   ├── DESIGN.md            # Design system
│   ├── BACKEND.md           # Backend architecture
│   ├── LINTING.md           # Code style guide
│   ├── CONTEXT.md           # This file
│   └── AGENTS.md            # Agent guidelines
├── lib/                     # Core library
│   ├── auth/                # Auth utilities
│   ├── services/            # Business logic services
│   ├── supabase/            # Supabase client config
│   ├── utils/               # Shared utilities
│   │   ├── audit.ts         # Audit logging
│   │   ├── auth-helpers.ts  # Auth helpers
│   │   ├── batch.ts         # Batch operations
│   │   ├── date.ts          # Date utilities (BS/AD)
│   │   ├── email.ts         # Email sending
│   │   ├── export.ts        # CSV/PDF/Excel export
│   │   ├── file-upload.ts   # File upload logic
│   │   ├── notifications.ts # Notifications
│   │   ├── rate-limit.ts    # Rate limiting
│   │   ├── security.ts      # Security utilities
│   │   ├── validation.ts    # Zod schemas
│   │   ├── vat.ts           # VAT calculation
│   │   └── workflow.ts      # State machines
│   ├── types.ts             # Unified types
│   ├── demo-data.ts         # Demo data
│   └── mock-data.ts         # Mock data for testing
├── public/                  # Static assets
├── scripts/                 # Utility scripts
│   └── security-audit.ts    # Security audit script
├── supabase/                # Database
│   ├── schema.sql           # Main schema
│   └── .temp/               # Temporary migrations
├── utils/                   # Additional utilities
├── .env.example             # Environment template
├── .env.local               # Local environment (gitignored)
├── .gitignore               # Git ignore rules
├── AGENTS.md                # Root agent instructions
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies
├── postcss.config.mjs       # PostCSS config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── README.md                # Quick start
```

## 🔑 Key Conventions

### File Naming
- **Components**: PascalCase (`InvoiceForm.tsx`)
- **Utilities**: kebab-case (`vat.ts`, `file-upload.ts`)
- **API routes**: kebab-case directory, `route.ts` file
- **Tests**: `*.test.ts` or `*.spec.ts`

### Code Organization
- **One component per file** (except small sub-components)
- **Co-locate tests** with source files
- **Group by feature** in API routes and dashboard pages
- **Shared utilities** in `lib/utils`

### Import Paths
```typescript
// Absolute imports (configured in tsconfig.json)
import { calculateVAT } from '@/lib/utils/vat';
import type { InvoiceRecord } from '@/lib/types';
import { InvoiceCard } from '@/components/dashboard/invoice-card';

// Relative imports for nearby files
import { helper } from './helper';
import styles from './component.module.css';
```

## 🧪 Testing Strategy

### Test Types
1. **Unit Tests** - Individual functions, utilities
2. **Integration Tests** - API routes, database operations
3. **E2E Tests** - Critical user flows (future)

### Running Tests
```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run specific file
npm run test -- invoice.test.ts

# Run with coverage
npm run test:coverage
```

### Test File Structure
```typescript
// lib/utils/vat.test.ts
import { describe, it, expect } from 'vitest';
import { calculateVAT } from './vat';

describe('calculateVAT', () => {
  describe('valid amounts', () => {
    it('calculates 13% VAT for positive amount', () => {
      expect(calculateVAT(10000)).toBe(1300);
    });
    
    it('handles decimal amounts', () => {
      expect(calculateVAT(100.50)).toBeCloseTo(13.065);
    });
  });
  
  describe('edge cases', () => {
    it('returns 0 for zero amount', () => {
      expect(calculateVAT(0)).toBe(0);
    });
    
    it('returns 0 for negative amount', () => {
      expect(calculateVAT(-100)).toBe(0);
    });
  });
});
```

## 🔒 Security Practices

### Environment Variables
```bash
# Never commit .env.local
# Use .env.example as template
# Prefix client-side vars with NEXT_PUBLIC_

# Client-side (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Server-side (never exposed)
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
UPSTASH_REDIS_REST_TOKEN=
```

### Secrets Management
```bash
# Use environment variables for secrets
# Never hardcode secrets in source code

# For local development, use .env.local
# For production, use platform secrets (Vercel, etc.)
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Deploy on push to main branch

# Environment variables needed:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY (optional)
UPSTASH_REDIS_REST_URL (optional)
UPSTASH_REDIS_REST_TOKEN (optional)
```

### Docker
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Production Checklist
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Rate limiting configured
- [ ] Email service configured
- [ ] Monitoring enabled
- [ ] Error tracking enabled
- [ ] SSL/HTTPS enforced
- [ ] Security headers configured
- [ ] Backup strategy in place

## 🐛 Debugging

### Common Issues

#### Supabase Connection
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

#### RLS Blocking Queries
```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid"}';
SELECT * FROM invoices;
```

#### Rate Limiting Issues
```typescript
// Check Redis connection
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ping = await redis.ping();
console.log(ping); // Should return "PONG"
```

### Logging

#### Client-Side
```typescript
// Use console for development
console.log('Debug info:', data);
console.warn('Warning:', warning);
console.error('Error:', error);

// In production, use error tracking service
```

#### Server-Side
```typescript
// API route logging
export async function GET(request: Request) {
  console.log('Request received:', request.url);
  
  try {
    // ... operation
    console.log('Operation successful');
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}
```

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zod Docs](https://zod.dev/)

### Internal Docs
- [PROJECT.md](./PROJECT.md) - Project overview
- [DESIGN.md](./DESIGN.md) - Design system
- [BACKEND.md](./BACKEND.md) - Backend architecture
- [LINTING.md](./LINTING.md) - Code style guide
- [AGENTS.md](./AGENTS.md) - Agent guidelines

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Maintained By**: Engineering Team
