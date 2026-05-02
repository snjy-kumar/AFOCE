<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AFOCE - Root Agent Instructions

## 🎯 Project Context

**AFOCE** is a production-ready accounting platform for Nepali businesses built with Next.js 16 and Supabase.

### Quick Links
- **Project Overview**: `docs/PROJECT.md`
- **Design System**: `docs/DESIGN.md`
- **Backend Architecture**: `docs/BACKEND.md`
- **Code Style Guide**: `docs/LINTING.md`
- **Development Setup**: `docs/CONTEXT.md`
- **Agent Guidelines**: `docs/AGENTS.md`

### Core Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + RLS)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Validation**: Zod schemas
- **Testing**: Vitest

## 📋 Agent Workflow

### Before Starting Any Task

1. **Read relevant documentation** in `docs/` folder
2. **Understand existing patterns** in the codebase
3. **Check for existing skills** in `.agents/skills/`
4. **Follow security-first principles** (auth, RLS, validation)

### Implementation Checklist

```markdown
## Security
- [ ] Authentication check in API routes
- [ ] Input validation with Zod
- [ ] RLS policies protect data
- [ ] No hardcoded secrets
- [ ] Audit logging for mutations

## Code Quality
- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Error handling implemented
- [ ] Consistent naming
- [ ] Imports organized

## Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for APIs
- [ ] Tests pass

## Documentation
- [ ] JSDoc for complex functions
- [ ] Update relevant docs
```

## 🔐 Security Rules (MANDATORY)

### 1. Authentication Required
Every API route must check authentication:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json(
    { data: null, error: { message: 'Unauthorized' } },
    { status: 401 }
  );
}
```

### 2. Input Validation Required
Always validate input with Zod schemas:
```typescript
const result = createInvoiceSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { data: null, error: { message: result.error.errors[0].message } },
    { status: 400 }
  );
}
```

### 3. RLS is Mandatory
Never bypass Row Level Security. All tables have RLS policies.

### 4. Audit All Mutations
Log all create/update/delete operations:
```typescript
await auditLog({
  org_id: profile.org_id,
  actor_id: user.id,
  action: 'create',
  entity_type: 'invoice',
  entity_id: invoice.id,
  detail: invoice,
});
```

### 5. No Hardcoded Secrets
Use environment variables:
```typescript
// ✅ Correct
const apiKey = process.env.API_KEY;

// ❌ Wrong
const apiKey = 'sk-1234567890';
```

## 📁 File Conventions

### API Routes
Location: `app/api/{resource}/route.ts`

```typescript
// Required imports order:
// 1. External (next/, @supabase/)
// 2. Internal (@/lib/)
// 3. Relative (./)

// Required structure:
// 1. GET handler (list/fetch)
// 2. POST handler (create)
// 3. PATCH handler (update)
// 4. DELETE handler (remove)
```

### React Components
Location: `components/{category}/{name}.tsx`

```typescript
// Required structure:
// 1. Imports
// 2. Types/Interfaces
// 3. Component function
// 4. Export
```

### Utilities
Location: `lib/utils/{name}.ts`

```typescript
// Required:
// - JSDoc comments
// - Type annotations
// - Error handling
```

## 🧪 Testing Requirements

### Run Before Committing
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Tests
npm run test
```

### Test File Location
- Unit tests: `lib/utils/{name}.test.ts`
- Integration tests: `app/api/{resource}/route.test.ts`
- Component tests: `components/{name}.test.tsx`

## 📝 Documentation Requirements

### When Adding Features
1. Update `docs/PROJECT.md` - Feature overview
2. Update `docs/BACKEND.md` - API documentation
3. Update `docs/DESIGN.md` - Component docs
4. Add JSDoc to complex functions

### JSDoc Template
```typescript
/**
 * Function description
 * 
 * @param param - Description
 * @returns Description
 * 
 * @throws Error when condition
 * 
 * @example
 * ```ts
 * const result = functionName(args);
 * ```
 */
```

## 🚨 Common Mistakes to Avoid

### ❌ Never Do This
```typescript
// No validation
await supabase.from('invoices').insert(body);

// No auth check
const { data } = await supabase.from('invoices').select('*');

// Using any
function process(data: any) { }

// Hardcoded secrets
const key = 'sk-secret';

// No error handling
const { data } = await supabase.from('invoices').select('*');
return NextResponse.json({ data });
```

### ✅ Always Do This
```typescript
// Validate first
const result = schema.safeParse(body);
if (!result.success) { /* return error */ }

// Check auth
const { data: { user } } = await supabase.auth.getUser();
if (!user) { /* return 401 */ }

// Proper types
function process(data: InvoiceRecord) { }

// Environment variables
const key = process.env.API_KEY;

// Handle errors
const { data, error } = await supabase.from('invoices').select('*');
if (error) { /* return error */ }
```

## 🔗 Quick Reference

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### npm Scripts
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
npm run test     # Run tests
npx tsc --noEmit # Type check
```

### Key Directories
```
app/api/         - API routes
app/dashboard/   - Dashboard pages
components/      - React components
lib/utils/       - Shared utilities
lib/types.ts     - Type definitions
docs/            - Documentation
supabase/        - Database schema
```

## 📚 Additional Resources

### Internal Docs
- `docs/PROJECT.md` - Full project overview
- `docs/BACKEND.md` - API patterns, database design
- `docs/DESIGN.md` - UI components, styling
- `docs/LINTING.md` - Code style, ESLint rules
- `docs/CONTEXT.md` - Setup, tooling, debugging
- `docs/AGENTS.md` - Detailed agent workflows

### External Docs
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/docs)

---

**Last Updated**: 2026-05-02  
**Project Version**: 1.0.0
