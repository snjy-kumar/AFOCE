# AFOCE Accounting - Project Overview

## 🎯 Mission

Build a production-ready, secure, and scalable accounting platform for Nepali businesses with modern UX, real-time collaboration, and automated financial workflows.

## 📋 Core Requirements

### Functional Requirements
- **Multi-tenant architecture** with workspace isolation
- **Client/Vendor management** with PAN validation (Nepal)
- **Invoicing system** with PDF generation, status workflows, recurring invoices
- **Expense tracking** with approval workflows and policy enforcement
- **Bank reconciliation** with auto-matching
- **VAT calculation** (13% Nepal) and filing reports
- **Team management** with role-based access control
- **Audit logging** for compliance
- **Notifications** (email + in-app)
- **Export** (CSV, PDF, Excel)

### Non-Functional Requirements
- **Security first**: RLS, rate limiting, input validation, security headers
- **Modularity**: Separation of concerns, reusable utilities, clear boundaries
- **Readability**: Consistent naming, comprehensive comments, self-documenting code
- **Correctness**: Type safety, validation at boundaries, comprehensive error handling
- **Robustness**: Graceful degradation, retry logic, circuit breakers
- **Performance**: Efficient queries, pagination, caching where appropriate
- **Maintainability**: Testable code, clear abstractions, documented patterns

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                    │
├─────────────────────────────────────────────────────────────┤
│  Middleware Layer                                             │
│  ├── Authentication (Supabase SSR)                           │
│  ├── Authorization (role checks)                             │
│  ├── Rate Limiting (Upstash Redis)                           │
│  └── Security Headers (CSP, HSTS, etc.)                      │
├─────────────────────────────────────────────────────────────┤
│  API Routes (/app/api)                                        │
│  ├── /api/clients      - CRUD + search + pagination          │
│  ├── /api/invoices     - CRUD + workflow + PDF export        │
│  ├── /api/expenses     - CRUD + approval workflow            │
│  ├── /api/bank-lines   - reconciliation + matching           │
│  ├── /api/policies     - expense rules + auto-approval       │
│  ├── /api/team         - user management + invites           │
│  ├── /api/analytics    - dashboard metrics                   │
│  ├── /api/reports      - VAT reports + exports               │
│  ├── /api/notifications - in-app + email                     │
│  ├── /api/upload       - file uploads (Supabase Storage)     │
│  └── /api/webhooks     - external integrations               │
├─────────────────────────────────────────────────────────────┤
│  UI Components (/components)                                  │
│  ├── brand/            - Logo, typography, colors            │
│  ├── dashboard/        - Dashboard widgets, charts           │
│  ├── modals/           - Reusable modal dialogs              │
│  └── public/           - Landing page components             │
├─────────────────────────────────────────────────────────────┤
│  Pages (/app)                                                 │
│  ├── (auth)/           - Login, register, password reset     │
│  ├── dashboard/        - Main app pages                      │
│  ├── (public)/         - Landing, pricing, about             │
│  └── api/              - API routes (see above)              │
├─────────────────────────────────────────────────────────────┤
│  Utilities (/lib)                                             │
│  ├── auth/             - Auth helpers, session management    │
│  ├── services/         - Business logic layer                │
│  ├── supabase/         - Supabase client config              │
│  ├── utils/            - Shared utilities                    │
│  │   ├── audit.ts      - Audit logging                       │
│  │   ├── email.ts      - Email sending (Resend)              │
│  │   ├── export.ts     - CSV/PDF/Excel generation            │
│  │   ├── file-upload.ts - File upload logic                  │
│  │   ├── notifications.ts - Notification system              │
│  │   ├── rate-limit.ts - Rate limiting                       │
│  │   ├── security.ts   - Security utilities                  │
│  │   ├── validation.ts - Zod schemas                         │
│  │   ├── vat.ts        - VAT calculations                    │
│  │   └── workflow.ts   - State machine logic                 │
│  └── types.ts          - Unified type definitions            │
├─────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                               │
│  ├── RLS policies      - Row-level security                  │
│  ├── Triggers          - Auto-ID generation, updated_at      │
│  ├── Functions         - Business logic in DB                │
│  └── Indexes           - Query optimization                  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
AFOCE/
├── .agents/              - Agent skills and configurations
├── .claude/              - Claude-specific settings
├── .qoder/               - Qoder-specific settings
├── app/                  - Next.js App Router
│   ├── (auth)/           - Auth pages (grouped)
│   ├── (public)/         - Public pages (grouped)
│   ├── api/              - API routes
│   ├── dashboard/        - Dashboard pages
│   ├── todos/            - Todo pages
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/           - React components
│   ├── brand/            - Brand components
│   ├── dashboard/        - Dashboard components
│   ├── modals/           - Modal components
│   └── public/           - Public page components
├── docs/                 - Project documentation (NEW)
│   ├── PROJECT.md        - This file
│   ├── DESIGN.md         - Design system
│   ├── BACKEND.md        - Backend architecture
│   ├── LINTING.md        - Code style guide
│   ├── CONTEXT.md        - Development context
│   └── AGENTS.md         - Agent guidelines
├── lib/                  - Core library code
│   ├── auth/             - Authentication utilities
│   ├── services/         - Business logic services
│   ├── supabase/         - Supabase configuration
│   ├── utils/            - Shared utilities
│   ├── types.ts          - Type definitions
│   ├── demo-data.ts      - Demo data
│   └── mock-data.ts      - Mock data for testing
├── public/               - Static assets
├── scripts/              - Utility scripts
├── supabase/             - Database schema and migrations
│   ├── schema.sql        - Main schema
│   └── .temp/            - Temporary migration files
├── utils/                - Additional utilities
├── .env.example          - Environment template
├── .env.local            - Local environment (gitignored)
├── AGENTS.md             - Root agent instructions
├── package.json          - Dependencies
├── tsconfig.json         - TypeScript config
├── next.config.ts        - Next.js config
├── tailwind.config.ts    - Tailwind config
└── README.md             - Quick start guide
```

## 🎯 Design Principles

### 1. Security First
- Every API endpoint validates input with Zod
- RLS policies on all database tables
- Rate limiting on all public endpoints
- Security headers on all responses
- Audit logging for all mutations

### 2. Type Safety
- TypeScript strict mode enabled
- Zod schemas for runtime validation
- Generated types from Supabase schema
- No `any` types allowed

### 3. Error Handling
- Consistent error response format
- User-friendly error messages
- Detailed server logs for debugging
- Graceful degradation on failures

### 4. Modularity
- Single responsibility per file
- Clear separation: UI / API / Business Logic / Data
- Reusable utilities in `/lib/utils`
- Feature-based organization in API routes

### 5. Testing Strategy
- Unit tests for utilities (vitest)
- Integration tests for API routes
- E2E tests for critical flows
- Mock data for development

## 📊 Current Status

### ✅ Completed
- Database schema with RLS policies
- Auto-ID generation triggers
- Core API routes (clients, invoices, expenses, etc.)
- Authentication with Supabase
- Rate limiting setup
- Email notifications (Resend)
- File upload (Supabase Storage)
- VAT calculation utilities
- Workflow state machines
- Audit logging
- Export utilities (CSV, PDF, Excel)
- TypeScript type definitions
- Zod validation schemas
- Security utilities

### 🚧 In Progress / Needs Attention
- Frontend UI components (dashboard pages)
- Comprehensive test coverage
- API documentation endpoint
- Performance optimization
- Accessibility (WCAG compliance)
- Mobile responsiveness
- Internationalization (i18n)
- Monitoring and observability

### 📋 Future Enhancements
- Real-time updates (Supabase Realtime)
- Advanced reporting and analytics
- Multi-currency support
- Automated bank feeds (API integrations)
- Mobile app (React Native)
- Offline mode
- Advanced search (full-text)
- Custom fields and forms
- API webhooks for integrations
- Scheduled tasks (cron jobs)

## 🔐 Security Model

### Authentication Flow
1. User registers → Email confirmation
2. User confirms → Profile + workspace created
3. User logs in → JWT session cookie
4. API calls → Middleware validates session
5. Database → RLS enforces org isolation

### Authorization Matrix

| Role | Create | Read | Update | Delete | Approve | Admin |
|------|--------|------|--------|--------|---------|-------|
| finance_admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| manager | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| team_member | ✅ | ✅ | Own | Own | ❌ | ❌ |

### Security Layers
1. **Network**: HTTPS, CORS, security headers
2. **Application**: Auth middleware, rate limiting, input validation
3. **Database**: RLS policies, prepared statements, audit logs
4. **Storage**: Signed URLs, file type validation, size limits

## 📈 Success Metrics

- **Performance**: < 200ms API response time (p95)
- **Reliability**: 99.9% uptime
- **Security**: Zero critical vulnerabilities
- **Code Quality**: > 80% test coverage
- **User Experience**: < 3s page load time

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Maintained By**: Development Team
