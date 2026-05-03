# AFOCE Accounting Platform - API Documentation

## Overview

AFOCE is a production-ready accounting platform built with Next.js 16 and Supabase. This document provides complete API reference for all endpoints.

## Base URL

```
https://afoce.app/api
```

## Authentication

All authenticated endpoints require a valid Supabase session. Authentication is handled via Supabase SSR with httpOnly cookies.

### Auth Headers
No explicit headers needed - authentication is automatic via Supabase middleware.

### Response Format

All API responses follow this format:

```json
{
  "data": null or {...},
  "error": null or { "message": "...", "code": "..." }
}
```

## Clients API

### List Clients
```
GET /api/clients?page=1&pageSize=20&type=client&search=...
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `pageSize` (number) - Items per page (default: 20)
- `type` (string) - Filter by type: "client" or "vendor"
- `search` (string) - Search by name, PAN, or email
- `sortBy` (string) - Sort field (default: "created_at")
- `sortOrder` (string) - "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "data": {
    "data": [
      {
        "id": "CL-0001",
        "org_id": "org-123",
        "name": "Acme Corp",
        "pan": "123456789",
        "email": "contact@acme.com",
        "phone": "+977-1-1234567",
        "type": "client",
        "address": "Kathmandu",
        "notes": "Key account",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150
    }
  },
  "error": null
}
```

### Get Client
```
GET /api/clients/:id
```

### Create Client
```
POST /api/clients
Content-Type: application/json

{
  "name": "Acme Corp",
  "pan": "123456789",
  "email": "contact@acme.com",
  "phone": "+977-1-1234567",
  "type": "client",
  "address": "Kathmandu",
  "notes": "Key account"
}
```

**Validation:**
- `name` (required) - 1-100 characters
- `pan` (required) - 9 digits
- `email` (optional) - Valid email format
- `phone` (optional) - 10-20 digit phone number
- `type` (required) - "client" or "vendor"
- `address` (optional) - Max 200 characters
- `notes` (optional) - Max 1000 characters

### Update Client
```
PATCH /api/clients/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Delete Client
```
DELETE /api/clients/:id
```

Returns 204 No Content on success.

---

## Invoices API

### List Invoices
```
GET /api/invoices?page=1&status=paid&clientId=CL-0001&search=...
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `pageSize` (number) - Items per page (default: 20)
- `status` (string) - Filter: "draft", "pending", "paid", "overdue", "rejected"
- `clientId` (string) - Filter by client
- `search` (string) - Search by invoice number or client name
- `fromDate` (string) - Filter from date (YYYY-MM-DD)
- `toDate` (string) - Filter to date (YYYY-MM-DD)

### Create Invoice
```
POST /api/invoices
Content-Type: application/json

{
  "client_id": "CL-0001",
  "bs_date": "Baisakh 2081",
  "ad_date": "2024-04-14",
  "due_days": 30,
  "amount": 50000,
  "status": "draft",
  "items": [
    {
      "description": "Professional Services",
      "quantity": 1,
      "rate": 50000,
      "amount": 50000
    }
  ],
  "notes": "Payment terms: Net 30"
}
```

### Update Invoice
```
PATCH /api/invoices/:id
```

### Update Invoice Status
```
PATCH /api/invoices/:id/status
Content-Type: application/json

{
  "status": "paid",
  "reason": "Payment received"
}
```

### Delete Invoice
```
DELETE /api/invoices/:id
```

---

## Expenses API

### List Expenses
```
GET /api/expenses?page=1&status=pending_approval&category=Travel&employee=...
```

**Query Parameters:**
- `page` (number) - Page number
- `pageSize` (number) - Items per page (default: 20)
- `status` (string) - "pending_approval", "manager_review", "blocked", "approved", "rejected"
- `category` (string) - Filter by category
- `employee` (string) - Filter by employee name
- `minAmount` (number) - Minimum amount filter
- `maxAmount` (number) - Maximum amount filter
- `from` (string) - Start date (YYYY-MM-DD)
- `to` (string) - End date (YYYY-MM-DD)

### Create Expense
```
POST /api/expenses
Content-Type: application/json

{
  "employee": "John Doe",
  "category": "Travel",
  "amount": 5000,
  "bs_date": "Baisakh 2081",
  "ad_date": "2024-04-14",
  "receipt_url": "https://...",
  "policy_id": "POL-001",
  "description": "Flight to Delhi"
}
```

### Approve/Reject Expense
```
PATCH /api/expenses/:id/approve
Content-Type: application/json

{
  "action": "approve",
  "notes": "Approved by manager"
}
```

**Actions:**
- `approve` - Approve the expense
- `reject` - Reject the expense
- `request_review` - Request additional review

---

## Reports API

### Get VAT Report
```
GET /api/reports/vat?from=2024-01-01&to=2024-03-31
```

**Query Parameters:**
- `from` (string) - Start date (YYYY-MM-DD)
- `to` (string) - End date (YYYY-MM-DD)

**Response:**
```json
{
  "data": {
    "period": { "from": "2024-01-01", "to": "2024-03-31" },
    "outputVAT": 130000,
    "inputVAT": 26000,
    "netVAT": 104000,
    "filingDue": "2024-04-20",
    "invoiceCount": 10,
    "expenseCount": 20
  },
  "error": null
}
```

### Get Audit Logs
```
GET /api/reports/audit?from=...&to=...&actor=...&entityType=invoices
```

---

## Bank Reconciliation API

### List Bank Lines
```
GET /api/bank-lines?status=matched&fromDate=...&toDate=...
```

**Query Parameters:**
- `page` (number)
- `pageSize` (number)
- `status` (string) - "matched", "needs_review", "unmatched"
- `fromDate` (string) - YYYY-MM-DD
- `toDate` (string) - YYYY-MM-DD

### Import Bank Statement
```
POST /api/bank-lines
Content-Type: application/json

{
  "date": "2024-04-14",
  "description": "Payment from ABC Corp",
  "amount": 50000,
  "type": "credit"
}
```

### Match Bank Line to Invoice/Expense
```
PATCH /api/bank-lines/:id
Content-Type: application/json

{
  "matched_invoice_id": "INV-0001",
  "state": "matched"
}
```

---

## Search API

### Global Search
```
GET /api/search?q=...&type=all&limit=20
```

**Query Parameters:**
- `q` (string) - Search query
- `type` (string) - "all", "clients", "invoices", "expenses", "policies"
- `limit` (number) - Results limit (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "CL-0001",
      "type": "client",
      "name": "Acme Corp",
      "score": 0.95
    },
    {
      "id": "INV-0001",
      "type": "invoice",
      "title": "Invoice INV-0001",
      "score": 0.88
    }
  ],
  "error": null
}
```

---

## Analytics API

### Get Dashboard Analytics
```
GET /api/analytics
```

**Response:**
```json
{
  "data": {
    "metrics": [
      {
        "label": "Total Revenue",
        "value": "Rs. 500,000",
        "change": "+12.5%",
        "trend": "up"
      }
    ],
    "monthlyData": [
      {
        "month": "January",
        "revenue": 50000,
        "expenses": 15000,
        "profit": 35000
      }
    ]
  },
  "error": null
}
```

---

## Export API

### Export Data
```
POST /api/export
Content-Type: application/json

{
  "type": "invoices",
  "format": "csv",
  "filters": {
    "status": "paid",
    "from": "2024-01-01",
    "to": "2024-03-31"
  }
}
```

**Types:**
- `invoices` - Export invoices
- `expenses` - Export expenses
- `clients` - Export clients
- `vat_report` - Export VAT report

**Formats:**
- `csv` - Comma-separated values
- `pdf` - PDF document
- `excel` - Excel spreadsheet

---

## Team API

### List Team Members
```
GET /api/team
```

### Invite Team Member
```
POST /api/team
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "Finance Admin"
}
```

### Update Team Member Role
```
PATCH /api/team/:id
Content-Type: application/json

{
  "role": "Manager"
}
```

### Remove Team Member
```
DELETE /api/team/:id
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource doesn't exist |
| `VALIDATION_ERROR` | Input validation failed |
| `DUPLICATE` | Resource already exists |
| `RATE_LIMIT` | Too many requests |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 100 requests per minute
- **Anonymous users**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Common Response Examples

### Success (200 OK)
```json
{
  "data": { "id": "INV-001", "amount": 50000 },
  "error": null
}
```

### Created (201 Created)
```json
{
  "data": { "id": "CL-0001", "name": "Acme Corp" },
  "error": null
}
```

### Validation Error (422 Unprocessable Entity)
```json
{
  "data": null,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "name": ["Name is required"],
      "pan": ["PAN must be 9 digits"]
    }
  }
}
```

### Server Error (500 Internal Server Error)
```json
{
  "data": null,
  "error": {
    "message": "Internal server error",
    "code": "SERVER_ERROR"
  }
}
```

---

## Webhook Events (Future)

Webhooks will be available for:
- `invoice.created`
- `invoice.paid`
- `expense.approved`
- `expense.rejected`
- `reconciliation.complete`

---

## Code Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(PUBLIC_URL, ANON_KEY);

// Create invoice
const { data, error } = await fetch('/api/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'CL-0001',
    bs_date: 'Baisakh 2081',
    ad_date: '2024-04-14',
    amount: 50000,
  }),
});

// List invoices
const response = await fetch('/api/invoices?page=1&status=paid');
const { data: invoices } = await response.json();
```

### cURL

```bash
# Get invoices
curl https://afoce.app/api/invoices \
  -H "Cookie: sb-session=..." \
  -H "Content-Type: application/json"

# Create invoice
curl https://afoce.app/api/invoices \
  -X POST \
  -H "Cookie: sb-session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CL-0001",
    "bs_date": "Baisakh 2081",
    "ad_date": "2024-04-14",
    "amount": 50000
  }'
```

---

## Support

For API issues or questions:
- Email: api@afoce.app
- Docs: https://docs.afoce.app
- Status: https://status.afoce.app
