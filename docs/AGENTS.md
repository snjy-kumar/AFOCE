# AFOCE Agent Guidelines

## 🤖 Working with AI Agents

This document provides guidelines for AI agents (Claude, Codex, Qoder, etc.) working on the AFOCE codebase.

## 📋 Core Principles

### 1. Security First
- **Never bypass authentication** - Always validate user sessions
- **Never disable RLS** - Row-level security is mandatory
- **Never expose secrets** - Use environment variables, never hardcode
- **Validate all input** - Use Zod schemas before processing
- **Log all mutations** - Audit trail is required

### 2. Code Quality
- **Type safety** - No `any` types, use proper TypeScript
- **Error handling** - Always handle errors gracefully
- **Testing** - Write tests for new features
- **Documentation** - Comment complex logic, update docs

### 3. Best Practices
- **Follow existing patterns** - Match the codebase style
- **Modular design** - Single responsibility, clear boundaries
- **Readable code** - Descriptive names, clear structure
- **Performance** - Efficient queries, pagination, caching

## 🔧 Agent Workflows

### Code Review Checklist

Before submitting code changes:

```markdown
## Security
- [ ] Input validation with Zod schemas
- [ ] Authentication check in API routes
- [ ] RLS policies protect data access
- [ ] No hardcoded secrets
- [ ] Security headers applied
- [ ] Rate limiting considered

## Code Quality
- [ ] TypeScript strict mode compliant
- [ ] No `any` types
- [ ] Error handling implemented
- [ ] Consistent naming conventions
- [ ] Imports organized correctly

## Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for API routes
- [ ] Edge cases covered
- [ ] Tests pass locally

## Documentation
- [ ] JSDoc comments for complex functions
- [ ] Updated relevant docs
- [ ] Clear commit messages
```

### Implementation Workflow

#### 1. Understand the Task
```markdown
- Read existing code in the area
- Check related documentation
- Identify patterns to follow
- Note potential pitfalls
```

#### 2. Plan the Changes
```markdown
- Files to modify
- New files to create
- Dependencies needed
- Tests to write
```

#### 3. Implement Incrementally
```markdown
- Small, focused changes
- Commit frequently
- Test after each change
- Verify type checking passes
```

#### 4. Verify and Test
```markdown
- Run type check: `npx tsc --noEmit`
- Run linter: `npm run lint`
- Run tests: `npm run test`
- Manual testing in browser
```

## 📁 File Conventions

### API Routes
```typescript
// app/api/{resource}/route.ts

// 1. Imports (organized)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ResourceType } from '@/lib/types';
import { auditLog } from '@/lib/utils/audit';
import { createResourceSchema } from '@/lib/utils/validation';

// 2. Constants
const DEMO_ORG = 'demo-org';

// 3. GET handler
export async function GET(request: Request) {
  // Auth check
  const cookieStore = await cookies();
  const supabase = createServerClient(/*...*/);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  
  // Get org_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();
  
  // Query with filters
  // ...
  
  return NextResponse.json({ data, error: null });
}

// 4. POST handler
export async function POST(request: Request) {
  // Auth check
  // ...
  
  // Validate input
  const body = await request.json();
  const result = createResourceSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { data: null, error: { message: result.error.errors[0].message } },
      { status: 400 }
    );
  }
  
  // Create resource
  // ...
  
  // Audit log
  await auditLog({ /*...*/ });
  
  return NextResponse.json({ data, error: null }, { status: 201 });
}
```

### React Components
```typescript
// components/dashboard/resource-list.tsx

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ResourceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ResourceListProps {
  initialData: ResourceRecord[];
}

export function ResourceList({ initialData }: ResourceListProps) {
  // 1. State
  const [resources, setResources] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Handlers
  const handleDelete = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 3. Render
  return (
    <div className="resource-list">
      {resources.map(resource => (
        <Card key={resource.id}>
          <h3>{resource.name}</h3>
          <Button onClick={() => handleDelete(resource.id)}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

### Utility Functions
```typescript
// lib/utils/resource-utils.ts

import type { ResourceRecord } from '@/lib/types';

/**
 * Format resource amount for display
 * @param amount - Raw amount in smallest currency unit
 * @returns Formatted amount string (e.g., "Rs. 1,000.00")
 */
export function formatResourceAmount(amount: number): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
  }).format(amount / 100);
}

/**
 * Check if resource can be deleted
 * @param resource - Resource record
 * @returns true if deletable
 */
export function canDeleteResource(resource: ResourceRecord): boolean {
  // Only draft status resources can be deleted
  return resource.status === 'draft';
}
```

## 🔐 Security Patterns

### Authentication Pattern
```typescript
// Always check authentication in API routes
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  
  // Proceed with authenticated user
}
```

### Authorization Pattern
```typescript
// Check user role for sensitive operations
const { data: profile } = await supabase
  .from('profiles')
  .select('role, org_id')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'finance_admin') {
  return NextResponse.json(
    { data: null, error: { message: 'Forbidden' } },
    { status: 403 }
  );
}
```

### Input Validation Pattern
```typescript
import { z } from 'zod';
import { createResourceSchema } from '@/lib/utils/validation';

export async function POST(request: Request) {
  const body = await request.json();
  
  const result = createResourceSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { 
        data: null, 
        error: { 
          message: result.error.errors[0].message,
          field: result.error.errors[0].path.join('.')
        } 
      },
      { status: 400 }
    );
  }
  
  const validatedData = result.data;
  // ... proceed
}
```

### Audit Logging Pattern
```typescript
import { auditLog } from '@/lib/utils/audit';

// After any mutation
await auditLog({
  org_id: profile.org_id,
  actor_id: user.id,
  action: 'create', // or 'update', 'delete'
  entity_type: 'invoice',
  entity_id: invoice.id,
  detail: invoice,
});
```

## 🧪 Testing Patterns

### Unit Test Pattern
```typescript
// lib/utils/resource-utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatResourceAmount, canDeleteResource } from './resource-utils';

describe('formatResourceAmount', () => {
  it('formats amount correctly', () => {
    expect(formatResourceAmount(100000)).toBe('Rs. 1,000.00');
  });
  
  it('handles zero', () => {
    expect(formatResourceAmount(0)).toBe('Rs. 0.00');
  });
});

describe('canDeleteResource', () => {
  it('allows deletion of draft resources', () => {
    const resource = { status: 'draft' } as ResourceRecord;
    expect(canDeleteResource(resource)).toBe(true);
  });
  
  it('prevents deletion of non-draft resources', () => {
    const resource = { status: 'pending' } as ResourceRecord;
    expect(canDeleteResource(resource)).toBe(false);
  });
});
```

### API Route Test Pattern
```typescript
// app/api/resources/route.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('POST /api/resources', () => {
  beforeEach(() => {
    // Mock authentication
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });
  });
  
  it('creates a new resource', async () => {
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Resource',
        // ... other fields
      }),
    });
    
    expect(response.status).toBe(201);
    const { data } = await response.json();
    expect(data.id).toBeDefined();
  });
  
  it('returns 400 for invalid input', async () => {
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '', // Invalid
      }),
    });
    
    expect(response.status).toBe(400);
  });
});
```

## 📝 Documentation Patterns

### JSDoc Comments
```typescript
/**
 * Calculate total amount including VAT
 * 
 * @param baseAmount - The base amount before VAT
 * @param vatRate - VAT rate (default: 0.13 for 13%)
 * @returns Total amount including VAT
 * 
 * @throws Error if baseAmount is negative
 * 
 * @example
 * ```ts
 * const total = calculateTotal(10000); // Returns 11300
 * ```
 */
export function calculateTotal(
  baseAmount: number,
  vatRate: number = 0.13
): number {
  if (baseAmount < 0) {
    throw new Error('Base amount cannot be negative');
  }
  return baseAmount * (1 + vatRate);
}
```

### README Updates
When adding new features, update relevant documentation:
- `docs/PROJECT.md` - Feature overview
- `docs/BACKEND.md` - API endpoint documentation
- `docs/DESIGN.md` - Component documentation
- `docs/CONTEXT.md` - Setup instructions if needed

## 🚨 Common Pitfalls

### ❌ Don't Do This

```typescript
// ❌ No input validation
export async function POST(request: Request) {
  const body = await request.json();
  await supabase.from('invoices').insert(body); // Dangerous!
}

// ❌ No auth check
export async function GET() {
  const { data } = await supabase.from('invoices').select('*');
  return NextResponse.json({ data });
}

// ❌ Hardcoded secrets
const apiKey = 'sk-1234567890'; // Never!

// ❌ Using any type
function process(data: any) {
  return data.value;
}

// ❌ Skipping error handling
const { data } = await supabase.from('invoices').select('*');
return NextResponse.json({ data }); // What if error?
```

### ✅ Do This Instead

```typescript
// ✅ Validate input
import { createInvoiceSchema } from '@/lib/utils/validation';

export async function POST(request: Request) {
  const body = await request.json();
  const result = createInvoiceSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { data: null, error: { message: result.error.message } },
      { status: 400 }
    );
  }
  
  const { data } = await supabase
    .from('invoices')
    .insert(result.data)
    .select()
    .single();
  
  return NextResponse.json({ data, error: null }, { status: 201 });
}

// ✅ Auth check
export async function GET() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  
  // Proceed...
}

// ✅ Environment variables
const apiKey = process.env.API_KEY;

// ✅ Proper types
interface Data {
  value: string;
}

function process(data: Data): string {
  return data.value;
}

// ✅ Error handling
const { data, error } = await supabase
  .from('invoices')
  .select('*');

if (error) {
  return NextResponse.json(
    { data: null, error: { message: error.message } },
    { status: 500 }
  );
}

return NextResponse.json({ data, error: null });
```

## 🔗 Resources

### Internal Documentation
- [PROJECT.md](./PROJECT.md) - Project overview
- [DESIGN.md](./DESIGN.md) - Design system
- [BACKEND.md](./BACKEND.md) - Backend architecture
- [LINTING.md](./LINTING.md) - Code style guide
- [CONTEXT.md](./CONTEXT.md) - Development setup

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Maintained By**: Engineering Team
