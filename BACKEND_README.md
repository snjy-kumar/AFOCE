# AFOCE Accounting Backend - Complete Documentation

Production-ready accounting backend with Supabase, Next.js, and full security.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
├─────────────────────────────────────────────────────────────┤
│  Middleware → Auth Check → Rate Limit → Security Headers    │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                  │
│  ├── /api/clients     (CRUD + batch)                        │
│  ├── /api/invoices    (CRUD + workflow + export)            │
│  ├── /api/expenses    (CRUD + approval workflow)          │
│  ├── /api/bank-lines  (reconciliation + matching)           │
│  ├── /api/policies    (expense policies)                   │
│  ├── /api/team        (user management)                     │
│  ├── /api/analytics   (dashboard metrics)                   │
│  ├── /api/batch       (batch operations)                   │
│  ├── /api/export      (CSV/PDF/Excel)                      │
│  ├── /api/upload      (file uploads)                      │
│  └── /api/notifications (in-app + email)                    │
├─────────────────────────────────────────────────────────────┤
│  Utilities                                                   │
│  ├── validation.ts    (Zod schemas)                          │
│  ├── rate-limit.ts    (Upstash Redis)                      │
│  ├── email.ts         (Resend integration)                │
│  ├── file-upload.ts   (Supabase Storage)                   │
│  ├── audit.ts         (audit logging)                      │
│  ├── batch.ts         (batch operations)                   │
│  ├── export.ts        (file generation)                   │
│  ├── workflow.ts      (state machines)                     │
│  ├── notifications.ts (notification system)              │
│  └── security.ts      (security utilities)                │
├─────────────────────────────────────────────────────────────┤
│  Supabase                                                    │
│  ├── Auth (Email, OAuth, MFA)                               │
│  ├── Database (PostgreSQL + RLS)                          │
│  ├── Storage (Receipts, Avatars)                          │
│  └── Realtime (optional)                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 What's Included

### ✅ Authentication & Authorization
- Email/password auth with Supabase Auth
- OAuth (Google, Microsoft) ready
- Role-based access control (finance_admin, manager, team_member)
- Multi-tenant with workspace isolation
- MFA support (optional)

### ✅ Security
- Row Level Security (RLS) on all tables
- Rate limiting (auth, API, export, upload)
- Security headers (CSP, HSTS, X-Frame-Options)
- Input sanitization and validation (Zod)
- SQL/XSS injection protection
- File upload validation and virus scanning ready

### ✅ Core Accounting Features
- **Clients**: CRUD, search, pagination
- **Invoices**: CRUD, status workflow, PDF generation
- **Expenses**: CRUD, approval workflow, receipt upload
- **Bank Lines**: Upload, auto-matching, reconciliation
- **Policies**: Expense rules, auto-approval
- **Team**: User management, invites
- **Audit Log**: Complete change tracking

### ✅ Advanced Features
- **Batch Operations**: Bulk create/update/delete/status change
- **Export**: CSV, PDF, Excel generation
- **Notifications**: Email + in-app notification center
- **Workflow**: State machines with role-based permissions
- **Reconciliation**: Auto-matching bank transactions
- **Auto VAT**: Automatic VAT calculation (13% Nepal)

### ✅ Developer Experience
- Complete TypeScript types
- OpenAPI 3.0 specification
- API documentation endpoint
- Security audit script
- Health check endpoint
- Comprehensive error handling

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 3. Run Database Migration

```bash
# In Supabase SQL Editor, run:
cat supabase/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Run Security Audit

```bash
npx ts-node scripts/security-audit.ts
```

## 📚 API Documentation

### Interactive Docs
Visit `/api/docs` after starting the server for complete API documentation.

### OpenAPI Spec
See `openapi.yaml` for OpenAPI 3.0 specification.

### Quick Examples

**Create Client:**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","pan":"123456789","email":"contact@acme.com","type":"client"}'
```

**Create Invoice:**
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "client_id":"CL-0001",
    "bs_date":"Baisakh 2081",
    "ad_date":"2024-04-14",
    "amount":50000,
    "due_days":30
  }'
```

**Export to CSV:**
```bash
curl "http://localhost:3000/api/export?entity=invoices&format=csv" \
  -o invoices.csv
```

**Upload File:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@receipt.jpg" \
  -F "type=receipt"
```

## 🔐 Security

### Authentication Flow
1. User registers → Email confirmation sent
2. User confirms → Profile + workspace auto-created
3. User logs in → JWT session cookie set
4. API calls → Middleware validates session + RLS
5. Data access → Row Level Security enforces org isolation

### Authorization Matrix

| Role | Create | Read | Update | Delete | Approve | Admin |
|------|--------|------|--------|--------|---------|-------|
| finance_admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| manager | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| team_member | ✅ | ✅ | Own | Own | ❌ | ❌ |

### RLS Policies

All tables have RLS policies ensuring users can only:
- Access their own profile
- Access their organization's data
- Modify only resources they created (unless admin)

See `supabase/schema.sql` for complete policy definitions.

## 📊 Database Schema

### Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `auth.users` | Supabase Auth | Built-in |
| `profiles` | User profiles | ✅ |
| `workspaces` | Organizations | ✅ |
| `clients` | Customers/vendors | ✅ |
| `invoices` | Sales invoices | ✅ |
| `expenses` | Business expenses | ✅ |
| `policies` | Expense policies | ✅ |
| `bank_lines` | Bank transactions | ✅ |
| `audit_log` | Change history | ✅ |
| `notifications` | In-app alerts | ✅ |
| `id_sequences` | ID counters | ✅ |
| `recurring_invoices` | Auto-billing | ✅ |

### Auto-Generated IDs
- Clients: `CL-0001`, `CL-0002`...
- Invoices: `INV-0001`, `INV-0002`...
- Expenses: `EXP-0001`, `EXP-0002`...

## 🔧 Configuration

### Supabase Dashboard Settings

See `SUPABASE_SETUP.md` for complete Supabase configuration.

Key settings:
- **Auth**: Enable email confirmations, set JWT expiry
- **Database**: Enable RLS, create indexes
- **Storage**: Create buckets, set RLS policies
- **Functions**: Verify triggers exist

### Environment Variables

See `.env.example` for all available options.

Critical for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (for email)
- `UPSTASH_REDIS_REST_URL` (for rate limiting)

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "checks": {
    "database": { "status": "healthy", "responseTime": 45 },
    "environment": { "status": "healthy" },
    "email": { "status": "configured" }
  }
}
```

### Logs
- Supabase Dashboard → Logs
- Next.js: `npm run dev` console
- Vercel: Built-in log viewer

### Metrics
- Supabase Dashboard → Database → Usage
- Vercel Dashboard → Analytics
- Custom: `/api/analytics`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Register → Confirm email → Login
- [ ] Create client → View list
- [ ] Create invoice → Change status → Export PDF
- [ ] Create expense → Upload receipt → Approve
- [ ] Upload bank statement → Match transactions
- [ ] Export data to CSV
- [ ] Check notifications
- [ ] Verify audit logs

### Security Testing
```bash
# Run audit
npx ts-node scripts/security-audit.ts

# Test rate limiting
for i in {1..20}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health
done

# Should see 429 after limit
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
# Build
docker build -t afoce-accounting .

# Run
docker run -p 3000:3000 --env-file .env.production afoce-accounting
```

### Traditional Server

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "afoce" -- start
```

See `DEPLOYMENT_CHECKLIST.md` for complete deployment guide.

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx ts-node scripts/security-audit.ts` | Security audit |

## 🛠️ Troubleshooting

### RLS Blocking Queries
```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check FROM_EMAIL domain is verified
- Review Supabase Auth email templates

### Rate Limiting Too Strict
Adjust in `lib/utils/rate-limit.ts`:
```typescript
limiter: Ratelimit.slidingWindow(100, "1 m"), // Increase limits
```

### File Upload Failing
- Check storage buckets exist
- Verify RLS policies on storage
- Confirm file size limits

## 📚 Additional Documentation

- `SUPABASE_SETUP.md` - Complete Supabase configuration
- `DEPLOYMENT_CHECKLIST.md` - Production deployment guide
- `openapi.yaml` - OpenAPI 3.0 specification
- `scripts/security-audit.ts` - Security audit script

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Run tests
4. Submit pull request

## 📄 License

MIT License - See LICENSE file

## 🆘 Support

- GitHub Issues: [Report bugs](https://github.com/your-repo/issues)
- Documentation: [Supabase Docs](https://supabase.com/docs)
- Discord: [Supabase Discord](https://discord.gg/supabase)

---

**Built with:**
- Next.js 16
- Supabase
- TypeScript
- Tailwind CSS
- Zod

**Version:** 1.0.0
