/**
 * Deployment runbook
 * Step-by-step guide for deploying to production
 */

# Production Deployment Runbook

## Pre-deployment checklist

### 1. Code quality gates
- [ ] All CI checks passing (lint, type, test, build, secrets)
- [ ] All tests passing with >70% coverage
- [ ] No warnings in build output
- [ ] No security vulnerabilities in dependencies (`npm audit`)

### 2. Environment configuration
- [ ] All required env vars set in production (verify with checklist below)
- [ ] Secrets rotated within last 90 days
- [ ] API keys validated (can make test calls)
- [ ] Email provider credentials active (Resend)
- [ ] Supabase project accessible

**Required environment variables:**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Webhook security
WEBHOOK_API_KEY=sk_prod_xxx (must be 32+ chars, random)

# Email provider
RESEND_API_KEY=re_xxx

# Optional: observability
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 3. Database checks
- [ ] All migrations have been applied to production database
  - Command: `SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;` (in Supabase)
  - Latest migration should match current codebase: `supabase/migrations/20260516012000_secure_invites.sql`

- [ ] RLS is enabled on all tables (see below for audit)
- [ ] Backup exists and is recent (< 24 hours old)
- [ ] Restore from backup has been tested (document: date, duration, success)

### 4. RLS audit
Run this in Supabase SQL editor to verify RLS coverage:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN '✓ RLS enabled' ELSE '✗ RLS missing' END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected output: All public tables should have `rowsecurity = true`.

Tables that require RLS:
- `profiles` - org isolation by org_id
- `pending_invites` - no authenticated access (service_role only)
- `organizations` - org isolation
- `audit_logs` - org isolation
- `expenses` - org isolation
- `invoices` - org isolation
- All other data tables

### 5. Webhook security
- [ ] WEBHOOK_API_KEY is configured and non-empty
- [ ] Webhook endpoint at `/api/webhooks/bank-statement` will return 503 if key is missing
- [ ] Test webhook delivery with sample payload (verify 200 response with correct key, 401 without)

### 6. Rate limiting
- [ ] Rate limits configured for mutation endpoints (POST, PUT, DELETE)
- [ ] Test: Make 11 rapid requests to POST /api/expenses → expect 429 on 11th
- [ ] Test: Make 11 rapid requests to POST /api/invoices → expect 429 on 11th

### 7. Secrets scanning
- [ ] Gitleaks scan passed (no committed secrets)
- [ ] `.env` files not committed
- [ ] `node_modules/` not committed
- [ ] API keys rotated before deploy

### 8. Database backup
- [ ] Backup enabled in Supabase console
- [ ] Backup retention: 30 days minimum
- [ ] Test restore procedure:
  - [ ] Create test restore to separate database
  - [ ] Verify schema matches production
  - [ ] Verify data integrity (spot-check a few records)
  - [ ] Document restore time and any issues

---

## Deployment steps

### 1. Code deployment

**Option A: Vercel (recommended)**

```bash
git push origin main
# Vercel will auto-deploy on push to main
# Monitor: https://vercel.com/dashboard
```

**Option B: Manual deployment**

```bash
npm ci
npm run build
npm run start
```

### 2. Database migrations

Run in Supabase console or via CLI:

```bash
supabase db push
```

Verify in logs that migrations applied successfully.

### 3. Post-deployment smoke tests

**Health endpoint:**

```bash
curl https://your-domain/api/health
# Expected: 200 with { ok: true }
```

**Auth endpoint (no-op test):**

```bash
curl https://your-domain/api/auth/session \
  -H "Authorization: Bearer invalid"
# Expected: 401
```

**Database connectivity (requires valid JWT):**

```bash
# Log in via UI, copy JWT from browser console or auth header
curl https://your-domain/api/team \
  -H "Authorization: Bearer <JWT>"
# Expected: 200 with org data
```

**Webhook endpoint:**

```bash
curl -X POST https://your-domain/api/webhooks/bank-statement \
  -H "X-API-Key: $WEBHOOK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
# Expected: 200
```

### 4. Monitor error rates

Check error tracking (Sentry, New Relic, or CloudFlare Analytics) for:

- [ ] No spike in 5xx errors
- [ ] No spike in authentication failures
- [ ] No spike in timeout errors

If error rate > 5% above baseline, **ROLLBACK**.

---

## Rollback procedure

### Code rollback

```bash
# Revert to last stable commit
git revert <commit-hash>
git push origin main

# Or deploy last stable tag
git checkout <last-stable-tag>
npm run build
# Redeploy via Vercel or your hosting
```

### Database rollback

If a migration caused issues:

```bash
# In Supabase console, run the reverse migration
# (Keep migrations reversible for this reason)

supabase db push --dry-run  # See what would run
supabase db pull  # Pull latest schema
```

### Secrets rollback

If credentials were exposed:

1. Invalidate old keys immediately
2. Generate new credentials
3. Update `.env` in production
4. Redeploy code (to pick up new env vars)
5. Invalidate any bearer tokens issued with old secrets

---

## Post-deployment

### 1. Verify traffic is flowing

- [ ] Check API response times (should be < 500ms p50, < 1s p95)
- [ ] Check database connection pool (should have available connections)
- [ ] Check error rate (should be < 1%)

### 2. Monitor for 24 hours

- [ ] Set alerts for:
  - Error rate > 5%
  - Response time p95 > 2s
  - Webhook delivery failure rate > 10%
  - Database connection pool exhaustion

### 3. Document deployment

Record in a `DEPLOYMENTS.md` or wiki:

```
**Date**: 2026-05-16
**Version**: v0.1.0
**Deployed by**: [name]
**Migrations applied**: 20260516012000_secure_invites
**Issues**: None
**Rollback needed**: No
**Notes**: Hardened invite flow, added RLS audit
```

---

## Incident response

### Error spike detected

1. **Check logs** → Search for patterns (specific endpoint, user, error message)
2. **Check recent changes** → Did this deploy introduce the error?
3. **Check dependencies** → Did a package update break something?
4. **Rollback if needed** → See rollback procedure above
5. **Fix and redeploy** → After fix is verified locally

### Webhook failures

1. Check WEBHOOK_API_KEY is set and hasn't rotated
2. Check firewall/network is not blocking webhook source
3. Check rate limiting isn't rejecting webhook requests
4. Check database isn't in read-only mode
5. Re-run webhook delivery from admin panel

### Database unavailable

1. Check Supabase status page
2. Try connecting from SQL editor in Supabase console
3. If unavailable, contact Supabase support
4. If partial outage, fail gracefully (return 503, don't retry)

---

## Recovery strategies

### Backup & restore

**RPO (Recovery Point Objective)**: 1 day (daily backups)
**RTO (Recovery Time Objective)**: 1 hour (restore usually takes 30min)

To restore:

1. Open Supabase console → Backups
2. Select backup from desired date/time
3. Click "Restore" → Creates new database
4. Update connection strings to new database
5. Run migrations to ensure schema is up-to-date
6. Test data integrity
7. Monitor for issues

### Connection pooling

If connection pool exhausted:

1. Increase pool size in Supabase console (Databases → Connection pooling)
2. Check for database locks: `SELECT * FROM pg_stat_activity WHERE wait_event IS NOT NULL;`
3. Kill long-running queries if safe
4. Monitor new connections after increase

---

## Runbook sign-off

Before deploying to production, lead engineer confirms:

- [ ] All pre-deployment checks passed
- [ ] Team reviewed changes and agrees they're safe
- [ ] Backup exists and is restorable
- [ ] Incident response plan understood by team
- [ ] Post-deployment monitoring is active

**Approved by**: ___________________  
**Date**: ___________________
