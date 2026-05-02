# AFOCE Backend Architecture

## 📡 API Design

### RESTful Conventions

#### HTTP Methods
- `GET` - Retrieve resources (safe, idempotent)
- `POST` - Create new resources
- `PUT` - Full resource replacement
- `PATCH` - Partial resource updates
- `DELETE` - Remove resources

#### URL Structure
```
/api/{resource}              - Collection operations
/api/{resource}/{id}         - Single resource operations
/api/{resource}/{id}/{action} - Custom actions
```

#### Standard Response Format
```typescript
// Success Response (2xx)
{
  "data": { ... },
  "error": null
}

// Paginated Response
{
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150
    }
  },
  "error": null
}

// Error Response (4xx, 5xx)
{
  "data": null,
  "error": {
    "message": "Human-readable error message"
  }
}
```

#### Status Codes
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid auth |
| 403 | Forbidden | Valid auth, insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate, constraint violation |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side failure |

### API Endpoint Examples

#### Clients API
```typescript
// GET /api/clients?page=1&pageSize=20&type=client&search=acme
// GET /api/clients/:id
// POST /api/clients
// PATCH /api/clients/:id
// DELETE /api/clients/:id
```

#### Invoices API
```typescript
// GET /api/invoices?status=paid&clientId=CL-0001
// GET /api/invoices/:id
// POST /api/invoices
// PATCH /api/invoices/:id
// PATCH /api/invoices/:id/status  // Status change
// DELETE /api/invoices/:id
// POST /api/invoices/:id/export    // Export to PDF
```

#### Expenses API
```typescript
// GET /api/expenses?status=pending_approval
// GET /api/expenses/:id
// POST /api/expenses
// PATCH /api/expenses/:id
// PATCH /api/expenses/:id/approve  // Approval action
// DELETE /api/expenses/:id
```

### Request Validation

#### Zod Schema Pattern
```typescript
// lib/utils/validation.ts
import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1).max(100),
  pan: z.string().regex(/^\d{9}$/, 'PAN must be 9 digits'),
  email: z.string().email().optional().nullable(),
  phone: z.string().regex(/^[\d\s\-\+\(\)]{10,20}$/).optional().nullable(),
  type: z.enum(['client', 'vendor']).default('client'),
  address: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
```

#### API Route Validation
```typescript
// app/api/clients/route.ts
import { createClientSchema } from '@/lib/utils/validation';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate input
  const result = createClientSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { data: null, error: { message: result.error.errors[0].message } },
      { status: 400 }
    );
  }
  
  const validatedData = result.data;
  // ... proceed with creation
}
```

### Error Handling

#### Consistent Error Format
```typescript
// lib/utils/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage in API routes
try {
  // ... operation
} catch (error) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: error.statusCode }
    );
  }
  
  // Unexpected error
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { data: null, error: { message: 'Internal server error' } },
    { status: 500 }
  );
}
```

#### Validation Error Format
```typescript
{
  "data": null,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      },
      {
        "field": "pan",
        "message": "PAN must be 9 digits"
      }
    ]
  }
}
```

## 🗄️ Database Patterns

### Schema Design Principles

#### 1. Multi-Tenancy via `org_id`
```sql
-- Every table (except profiles) has org_id for workspace isolation
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES workspaces(id),
  -- ... other columns
);
```

#### 2. Human-Readable IDs
```sql
-- Auto-generated via triggers: CL-0001, INV-0001, EXP-0001
CREATE TRIGGER set_client_id 
  BEFORE INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION assign_client_id();
```

#### 3. Audit Trail
```sql
-- Every table has created_by, created_at, updated_at
CREATE TABLE expenses (
  -- ...
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. Status Enums
```sql
-- Use CHECK constraints for status fields
CREATE TABLE invoices (
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'rejected'))
);
```

### Row Level Security (RLS)

#### Policy Pattern
```sql
-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Organization members can access all invoices in their org
CREATE POLICY "invoices_all_org_member" ON invoices FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Function to get user's org_id
CREATE OR REPLACE FUNCTION public.get_user_org_id(auth_uid UUID)
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth_uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

#### Policy Types
```sql
-- SELECT: Users can read their org's data
CREATE POLICY "clients_select_org" ON clients FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

-- INSERT: Users can create in their org
CREATE POLICY "clients_insert_org" ON clients FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- UPDATE: Users can update in their org
CREATE POLICY "clients_update_org" ON clients FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

-- DELETE: Only admins can delete (example with role check)
CREATE POLICY "clients_delete_admin" ON clients FOR DELETE
  USING (
    org_id = get_user_org_id(auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'finance_admin'
  );
```

### Indexes

#### Standard Indexes
```sql
-- Foreign key indexes (often missed!)
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);

-- Status filtering
CREATE INDEX idx_invoices_org_status ON invoices(org_id, status);

-- Date range queries
CREATE INDEX idx_invoices_org_date ON invoices(org_id, ad_date DESC);

-- Composite indexes for common queries
CREATE INDEX idx_expenses_org_status_date ON expenses(org_id, status, ad_date);
```

#### Performance Optimization
```sql
-- Covering indexes for frequent queries
CREATE INDEX idx_clients_org_name_email 
  ON clients(org_id, name, email) 
  INCLUDE (pan, phone, type);

-- Partial indexes for filtered subsets
CREATE INDEX idx_invoices_overdue 
  ON invoices(org_id, due_date)
  WHERE status = 'overdue';
```

### Triggers

#### Auto-Update Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoices_updated_at 
  BEFORE UPDATE ON invoices 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();
```

#### Auto-Generate IDs
```sql
CREATE OR REPLACE FUNCTION assign_invoice_id()
RETURNS TRIGGER AS $$
DECLARE new_seq INTEGER;
BEGIN
  UPDATE id_sequences 
  SET invoice_seq = invoice_seq + 1 
  WHERE org_id = NEW.org_id 
  RETURNING invoice_seq INTO new_seq;
  
  NEW.id = 'INV-' || LPAD(new_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Audit Logging
```sql
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (org_id, actor_id, action, entity_type, entity_id, detail)
  VALUES (
    COALESCE(NEW.org_id, OLD.org_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(COALESCE(NEW, OLD))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🔐 Security Architecture

### Authentication Flow

#### 1. Supabase Auth Integration
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => 
            cookieStore.set(name, value)
          );
        },
      },
    }
  );
}
```

#### 2. Middleware Authentication
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: {/*...*/} }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

### Rate Limiting

#### Upstash Redis Implementation
```typescript
// lib/utils/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limits for different endpoints
export const rateLimiters = {
  // Auth: 5 attempts per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:auth',
  }),
  
  // API: 100 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),
  
  // Export: 10 requests per minute
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:export',
  }),
  
  // Upload: 20 requests per minute
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    prefix: 'ratelimit:upload',
  }),
};

export async function checkRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiters
) {
  const limit = rateLimiters[limiter];
  const result = await limit.limit(identifier);
  
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
```

#### Usage in API Routes
```typescript
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await checkRateLimit(ip, 'auth');
  
  if (!success) {
    return NextResponse.json(
      { data: null, error: { message: 'Too many requests' } },
      { status: 429 }
    );
  }
  
  // ... proceed
}
```

### Input Sanitization

#### SQL Injection Prevention
```typescript
// Always use parameterized queries (Supabase does this by default)
// NEVER concatenate user input into queries

// ❌ Wrong
const query = `SELECT * FROM clients WHERE name = '${name}'`;

// ✅ Correct
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('name', name);
```

#### XSS Prevention
```typescript
// lib/utils/security.ts
import validator from 'validator';

export function sanitizeInput(input: string): string {
  return validator.escape(validator.trim(input));
}

// Sanitize before rendering in HTML
const safeName = sanitizeInput(userInput);
```

### Security Headers

#### Middleware Headers
```typescript
// middleware.ts
export function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  return response;
}
```

### File Upload Security

#### Validation
```typescript
// lib/utils/file-upload.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function validateFile(file: File) {
  // Check size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  // Check type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Sanitize filename
  const safeName = sanitizeFileName(file.name);
  
  return { safeName, size: file.size, type: file.type };
}
```

## 🔄 Business Logic Layer

### Service Pattern

#### Example: Invoice Service
```typescript
// lib/services/invoice-service.ts
import { createClient } from '@/lib/supabase/server';
import { calculateVAT } from '@/lib/utils/vat';
import { auditLog } from '@/lib/utils/audit';
import { sendNotification } from '@/lib/utils/notifications';
import type { CreateInvoiceInput } from '@/lib/utils/validation';

export class InvoiceService {
  private supabase;
  
  constructor() {
    this.supabase = createClient();
  }
  
  async createInvoice(data: CreateInvoiceInput, userId: string) {
    const orgId = await this.getUserOrgId(userId);
    
    // Calculate VAT
    const vat = calculateVAT(data.amount);
    
    // Create invoice
    const { data: invoice, error } = await this.supabase
      .from('invoices')
      .insert({
        ...data,
        org_id: orgId,
        vat,
        created_by: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Audit log
    await auditLog({
      org_id: orgId,
      actor_id: userId,
      action: 'create',
      entity_type: 'invoice',
      entity_id: invoice.id,
      detail: invoice,
    });
    
    // Send notification
    await sendNotification({
      user_id: userId,
      type: 'invoice_created',
      title: 'Invoice Created',
      message: `Invoice ${invoice.id} has been created`,
      link: `/dashboard/invoices/${invoice.id}`,
    });
    
    return invoice;
  }
  
  async changeStatus(invoiceId: string, newStatus: string, userId: string) {
    // Validate status transition
    const validTransitions = {
      draft: ['pending', 'rejected'],
      pending: ['paid', 'rejected', 'overdue'],
      paid: [],
      overdue: ['paid', 'rejected'],
      rejected: ['pending', 'draft'],
    };
    
    const invoice = await this.getInvoice(invoiceId);
    if (!validTransitions[invoice.status].includes(newStatus)) {
      throw new Error(`Cannot transition from ${invoice.status} to ${newStatus}`);
    }
    
    // Update status
    const { data, error } = await this.supabase
      .from('invoices')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Audit log
    await auditLog({
      org_id: invoice.org_id,
      actor_id: userId,
      action: 'update',
      entity_type: 'invoice',
      entity_id: invoiceId,
      detail: { status: newStatus, previous_status: invoice.status },
    });
    
    return data;
  }
  
  private async getUserOrgId(userId: string): Promise<string> {
    const { data } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', userId)
      .single();
    
    if (!data?.org_id) {
      throw new Error('No workspace found');
    }
    
    return data.org_id;
  }
}
```

### Workflow State Machine

```typescript
// lib/utils/workflow.ts
type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'rejected';

interface StateTransition {
  from: InvoiceStatus;
  to: InvoiceStatus;
  allowedRoles: string[];
  conditions?: (invoice: any, user: any) => boolean;
}

export const invoiceTransitions: StateTransition[] = [
  {
    from: 'draft',
    to: 'pending',
    allowedRoles: ['finance_admin', 'manager', 'team_member'],
  },
  {
    from: 'pending',
    to: 'paid',
    allowedRoles: ['finance_admin', 'manager'],
    conditions: (invoice) => invoice.amount > 0,
  },
  {
    from: 'pending',
    to: 'rejected',
    allowedRoles: ['finance_admin', 'manager'],
  },
  {
    from: 'pending',
    to: 'overdue',
    allowedRoles: ['system'], // Automated transition
    conditions: (invoice) => {
      const dueDate = new Date(invoice.ad_date);
      dueDate.setDate(dueDate.getDate() + invoice.due_days);
      return new Date() > dueDate;
    },
  },
  // ... more transitions
];

export function canTransition(
  invoice: any,
  newStatus: InvoiceStatus,
  userRole: string
): boolean {
  const transition = invoiceTransitions.find(
    (t) => t.from === invoice.status && t.to === newStatus
  );
  
  if (!transition) return false;
  if (!transition.allowedRoles.includes(userRole)) return false;
  if (transition.conditions && !transition.conditions(invoice, { role: userRole })) {
    return false;
  }
  
  return true;
}
```

## 📊 Caching Strategy

### React Query Pattern
```typescript
// components/dashboard/use-invoices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      // Invalidate invoices list
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
```

### Server-Side Caching
```typescript
// lib/cache.ts
import { cache } from 'react';

export const getDashboardMetrics = cache(async (orgId: string) => {
  // Expensive query
  const { data } = await supabase.rpc('get_dashboard_metrics', { org_id: orgId });
  return data;
});
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Maintained By**: Backend Team
