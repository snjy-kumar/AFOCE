# AFOCE Code Style Guide

## 📐 TypeScript Guidelines

### Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### Type Definitions

#### Prefer Interfaces for Object Shapes
```typescript
// ✅ Good - interfaces for object types
interface InvoiceRecord {
  id: string;
  amount: number;
  status: InvoiceStatus;
}

// ✅ Good - type aliases for unions, primitives
type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'rejected';
type UserId = string;
```

#### No `any` Type
```typescript
// ❌ Avoid
function process(data: any) {
  return data.value;
}

// ✅ Better - use unknown with type guard
function process(data: unknown) {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}

// ✅ Best - proper type definition
interface Data {
  value: string;
}

function process(data: Data) {
  return data.value;
}
```

#### Type Guards
```typescript
// Type guard function
function isInvoiceRecord(data: unknown): data is InvoiceRecord {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'amount' in data &&
    'status' in data
  );
}

// Usage
if (isInvoiceRecord(data)) {
  // data is now typed as InvoiceRecord
  console.log(data.id);
}
```

### Naming Conventions

#### Files and Directories
```
✅ kebab-case for files: user-profile.tsx, invoice-service.ts
✅ kebab-case for directories: lib/utils, app/api
✅ PascalCase for React components: InvoiceForm.tsx, Dashboard.tsx
```

#### Variables and Functions
```typescript
// ✅ Descriptive names
const invoiceTotal = calculateTotal(invoice);
const hasValidPermission = checkPermission(user, 'invoice:create');

// ❌ Vague names
const total = calculateTotal(invoice);
const ok = checkPermission(user, 'invoice:create');

// ✅ Boolean prefixes
const isLoading = true;
const hasError = false;
const canDelete = true;
const shouldShowModal = false;

// ✅ Function names as verbs
function getUserById(id: string) { }
function createInvoice(data: CreateInvoiceInput) { }
function validateEmail(email: string) { }
```

#### Constants
```typescript
// ✅ Uppercase with underscores for constants
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const VAT_RATE = 0.13;
const DEFAULT_PAGE_SIZE = 20;

// ✅ PascalCase for exported constants
export const InvoiceStatus = {
  Draft: 'draft',
  Pending: 'pending',
  Paid: 'paid',
} as const;
```

#### Classes and Interfaces
```typescript
// ✅ PascalCase
class InvoiceService { }
interface UserPreferences { }
type ApiResponse<T> = { }
```

### Code Organization

#### Import Order
```typescript
// 1. External dependencies
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// 2. Internal aliases
import type { InvoiceRecord } from '@/lib/types';
import { calculateVAT } from '@/lib/utils/vat';

// 3. Relative imports
import { InvoiceForm } from './invoice-form';
import styles from './invoice-card.module.css';

// 4. Type imports (grouped with their source)
import type { CreateInvoiceInput } from '@/lib/utils/validation';
```

#### Export Organization
```typescript
// ✅ Named exports for most cases
export function createInvoice(data: CreateInvoiceInput) { }
export function getInvoice(id: string) { }
export const InvoiceStatus = { } as const;

// ✅ Default export for components
export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  return <div>{/* ... */}</div>;
}

// ❌ Avoid mixing default and named exports in same file
```

#### File Structure
```typescript
// 1. Imports
import { } from '';

// 2. Type definitions
interface Props { }
type State = { };

// 3. Constants
const DEFAULT_VALUE = '';

// 4. Helper functions (private)
function helperFunction() { }

// 5. Main component/function
export default function Component() { }

// 6. Named exports (if any)
export function utilityFunction() { }
```

## 🎨 ESLint Configuration

### Base Config
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "import"
  ],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    
    // React
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // Import
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ],
    
    // General
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Custom Rules for AFOCE
```typescript
// eslint-plugin-afoce (custom rules)
module.exports = {
  rules: {
    // Enforce audit logging for mutations
    'require-audit-log': 'error',
    
    // Enforce RLS policy checks
    'require-rls-check': 'error',
    
    // Enforce Zod validation in API routes
    'require-zod-validation': 'error',
    
    // Enforce error handling
    'require-error-handling': 'error',
  },
};
```

## 📝 Code Patterns

### Error Handling

#### Try-Catch Pattern
```typescript
// ✅ Good - specific error handling
try {
  const invoice = await createInvoice(data);
  return NextResponse.json({ data: invoice, error: null });
} catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { data: null, error: { message: error.errors[0].message } },
      { status: 400 }
    );
  }
  
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

#### Result Pattern
```typescript
// ✅ Good - explicit success/failure
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function getInvoice(id: string): Promise<Result<InvoiceRecord>> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// Usage
const result = await getInvoice('INV-0001');
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Async/Await

#### Consistent Async Patterns
```typescript
// ✅ Good - async/await
async function getUserInvoices(userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

// ❌ Avoid - promise chains
function getUserInvoices(userId: string) {
  return supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
}
```

#### Parallel Execution
```typescript
// ✅ Good - parallel when independent
async function getDashboardData(orgId: string) {
  const [invoices, expenses, clients] = await Promise.all([
    supabase.from('invoices').select('*').eq('org_id', orgId),
    supabase.from('expenses').select('*').eq('org_id', orgId),
    supabase.from('clients').select('*').eq('org_id', orgId),
  ]);
  
  return { invoices, expenses, clients };
}

// ❌ Avoid - sequential when independent
async function getDashboardData(orgId: string) {
  const invoices = await supabase.from('invoices').select('*').eq('org_id', orgId);
  const expenses = await supabase.from('expenses').select('*').eq('org_id', orgId);
  const clients = await supabase.from('clients').select('*').eq('org_id', orgId);
  
  return { invoices, expenses, clients };
}
```

### React Patterns

#### Component Structure
```typescript
// ✅ Good - clear component structure
interface InvoiceCardProps {
  invoice: InvoiceRecord;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function InvoiceCard({ invoice, onEdit, onDelete }: InvoiceCardProps) {
  // 1. Hooks
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 2. Derived state
  const isOverdue = invoice.status === 'overdue';
  
  // 3. Event handlers
  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteInvoice(invoice.id);
    onDelete?.(invoice.id);
  };
  
  // 4. Render
  return (
    <div className={cn('card', isOverdue && 'card--overdue')}>
      <h3>{invoice.id}</h3>
      <p>Rs. {invoice.amount}</p>
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
```

#### Custom Hooks
```typescript
// ✅ Good - reusable hook
interface UseInvoicesOptions {
  initialFilters?: InvoiceFilters;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const [filters, setFilters] = useState<InvoiceFilters>(
    options.initialFilters ?? {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices?${new URLSearchParams(filters)}`);
      const { data } = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  return {
    filters,
    setFilters,
    isLoading,
    error,
    fetchInvoices,
  };
}
```

### Database Queries

#### Supabase Query Patterns
```typescript
// ✅ Good - typed query with error handling
async function getInvoiceWithClient(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients!client_id (
        name,
        pan,
        email
      )
    `)
    .eq('id', invoiceId)
    .single();
  
  if (error) {
    throw new DatabaseError(error.message);
  }
  
  return data as InvoiceRecordWithClient;
}

// ✅ Good - batch operations
async function updateInvoiceStatuses(
  ids: string[],
  status: InvoiceStatus
) {
  const { error } = await supabase
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids);
  
  if (error) throw error;
}
```

#### Transaction Pattern
```typescript
// ✅ Good - transaction with rollback
async function createInvoiceWithItems(data: CreateInvoiceWithItemsInput) {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({ /* ... */ })
    .select()
    .single();
  
  if (invoiceError) throw invoiceError;
  
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(
      data.items.map(item => ({
        invoice_id: invoice.id,
        ...item,
      }))
    );
  
  if (itemsError) {
    // Rollback
    await supabase.from('invoices').delete().eq('id', invoice.id);
    throw itemsError;
  }
  
  return invoice;
}
```

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// ✅ Good - clear test structure
import { describe, it, expect, vi } from 'vitest';
import { calculateVAT } from '@/lib/utils/vat';

describe('calculateVAT', () => {
  it('calculates 13% VAT correctly', () => {
    const amount = 10000;
    const vat = calculateVAT(amount);
    
    expect(vat).toBe(1300);
  });
  
  it('returns 0 for negative amounts', () => {
    const vat = calculateVAT(-100);
    
    expect(vat).toBe(0);
  });
});
```

### Integration Tests
```typescript
// ✅ Good - API route test
import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('POST /api/clients', () => {
  beforeEach(async () => {
    // Seed test data
    await seedDatabase();
  });
  
  it('creates a new client', async () => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Client',
        pan: '123456789',
        type: 'client',
      }),
    });
    
    expect(response.status).toBe(201);
    const { data } = await response.json();
    expect(data.id).toMatch(/^CL-\d{4}$/);
  });
  
  it('returns 400 for invalid PAN', async () => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Client',
        pan: 'invalid',
      }),
    });
    
    expect(response.status).toBe(400);
  });
});
```

## 📄 Documentation

### JSDoc Comments
```typescript
/**
 * Calculate VAT amount for a given base amount.
 * 
 * @param amount - The base amount (before VAT)
 * @returns The VAT amount (13% of base amount, or 0 if negative)
 * 
 * @example
 * ```ts
 * const vat = calculateVAT(10000); // Returns 1300
 * ```
 */
export function calculateVAT(amount: number): number {
  if (amount <= 0) return 0;
  return amount * 0.13;
}
```

### README Sections
```markdown
# Component Name

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `invoice` | `InvoiceRecord` | - | The invoice data to display |
| `onEdit` | `(id: string) => void` | - | Callback when edit button clicked |

## Usage

```tsx
<InvoiceCard 
  invoice={invoice} 
  onEdit={(id) => router.push(`/invoices/${id}/edit`)} 
/>
```

## Accessibility

- Keyboard navigable
- Screen reader announcements
- ARIA labels for actions
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-02  
**Maintained By**: Engineering Team
