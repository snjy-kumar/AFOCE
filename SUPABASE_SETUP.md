# Supabase Dashboard Configuration Guide

Complete security and configuration checklist for AFOCE Accounting.

## 1. Authentication Settings

### URL Configuration
**Go to:** Authentication → URL Configuration

- **Site URL**: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/dashboard`

### Email Templates
**Go to:** Authentication → Email Templates

Configure these templates:

1. **Confirm Signup**
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Account</a></p>
<p>Or copy: {{ .ConfirmationURL }}</p>
```

2. **Reset Password**
```html
<h2>Reset Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
```

3. **Magic Link**
```html
<h2>Login to AFOCE</h2>
<p>Click the link below to login:</p>
<p><a href="{{ .ConfirmationURL }}">Login</a></p>
<p>Or copy: {{ .ConfirmationURL }}</p>
```

### Auth Settings
**Go to:** Authentication → Settings

- **Enable Email Confirmations**: ✅ (Recommended for production)
- **Enable Secure Email Change**: ✅
- **Enable Secure Password Change**: ✅
- **JWT Expiry**: 3600 seconds (1 hour)
- **Enable Refresh Token Rotation**: ✅
- **Min password length**: 8
- **Prevent user enumeration**: ✅

### Third-Party OAuth (Optional)
**Go to:** Authentication → Providers

Enable if needed:
- Google OAuth (for Gmail users)
- Microsoft OAuth (for corporate users)

## 2. Database Security

### Row Level Security (RLS)
**Go to:** Database → Tables → Enable RLS

RLS is already configured in `supabase/schema.sql`. Verify all tables have RLS enabled:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Tables with RLS enabled:
- ✅ `profiles`
- ✅ `workspaces`
- ✅ `clients`
- ✅ `invoices`
- ✅ `expenses`
- ✅ `policies`
- ✅ `bank_lines`
- ✅ `audit_log`
- ✅ `id_sequences`
- ✅ `notifications` (NEW)
- ✅ `recurring_invoices` (NEW)

### Policies Verification
**Go to:** Database → Policies

Verify these policies exist:

| Table | Policies |
|-------|----------|
| profiles | profiles_select_own, profiles_update_own, profiles_insert_own |
| workspaces | workspaces_select_member |
| clients | clients_all_org_member |
| invoices | invoices_all_org_member |
| expenses | expenses_all_org_member |
| policies | policies_all_org_member |
| bank_lines | bank_lines_all_org_member |
| audit_log | audit_log_select_org_member, audit_log_insert_org_member |

### Connection Pooling
**Go to:** Database → Connection Pooling

- **Enable Connection Pooler**: ✅ (for serverless functions)
- **Pool Size**: 10-20 (adjust based on load)

## 3. Storage Security

### Create Storage Buckets
**Go to:** Storage → New Bucket

Create these buckets with policies:

1. **Bucket: `receipts`**
   - Public: ❌ (Private)
   - File size limit: 5MB
   - Allowed types: image/jpeg, image/png, image/webp, application/pdf

2. **Bucket: `avatars`**
   - Public: ✅ (For profile images)
   - File size limit: 2MB
   - Allowed types: image/jpeg, image/png, image/webp

3. **Bucket: `invoice-attachments`**
   - Public: ❌ (Private)
   - File size limit: 10MB
   - Allowed types: image/jpeg, image/png, image/webp, application/pdf

4. **Bucket: `general`**
   - Public: ❌ (Private)
   - File size limit: 20MB
   - Allowed types: image/jpeg, image/png, image/webp, application/pdf, text/csv

### Storage RLS Policies
**Go to:** Storage → Policies

Add these policies for each bucket:

```sql
-- SELECT policy (users can read their org's files)
CREATE POLICY "Select own org files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT policy (authenticated users can upload)
CREATE POLICY "Insert own org files" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN ('receipts', 'avatars', 'invoice-attachments', 'general')
  );

-- DELETE policy (users can delete their own files)
CREATE POLICY "Delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('receipts', 'avatars', 'invoice-attachments', 'general') AND
    owner = auth.uid()
  );
```

## 4. API Security

### API Keys Management
**Go to:** Project Settings → API

**Never expose these in client code:**
- `service_role_key` - Only for server-side use
- `anon_key` - Safe for client-side (RLS protects data)

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only!
```

### Enable Realtime (Optional)
**Go to:** Database → Replication → Realtime

Enable for tables that need live updates:
- `notifications`
- `bank_lines`
- `audit_log`

```sql
-- Enable realtime for notifications
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add tables to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE bank_lines;
```

## 5. Functions & Triggers

### Verify Database Functions
**Go to:** Database → Functions

Ensure these functions exist:
- ✅ `update_updated_at()` - Auto-updates timestamps
- ✅ `assign_client_id()` - Auto-generates client IDs
- ✅ `assign_invoice_id()` - Auto-generates invoice IDs
- ✅ `assign_expense_id()` - Auto-generates expense IDs
- ✅ `get_user_org_id()` - Gets user's organization
- ✅ `handle_new_user()` - Creates profile on signup

### Verify Triggers
**Go to:** Database → Triggers

Ensure these triggers exist:
- ✅ `set_profiles_updated_at`
- ✅ `set_workspaces_updated_at`
- ✅ `set_clients_updated_at`
- ✅ `set_invoices_updated_at`
- ✅ `set_expenses_updated_at`
- ✅ `set_policies_updated_at`
- ✅ `set_bank_lines_updated_at`
- ✅ `set_client_id` (before insert on clients)
- ✅ `set_invoice_id` (before insert on invoices)
- ✅ `set_expense_id` (before insert on expenses)
- ✅ `on_auth_user_created` (after insert on auth.users)

## 6. Security Settings

### Enable Backup
**Go to:** Database → Backups

- Enable **Daily backups** (included in Pro plan)
- Set **Point-in-time recovery** retention

### Enable SSL
**Go to:** Database → SSL Configuration

- **Enforce SSL**: ✅ (Required for production)

### Network Restrictions
**Go to:** Project Settings → Network

Add IP restrictions if needed:
```
Allowed IPs: Your server IPs only (optional)
```

### Enable MFA (Optional)
**Go to:** Authentication → Providers

Enable MFA for additional security:
- Phone Auth (Twilio)
- Authenticator Apps (TOTP)

## 7. Edge Functions (Optional)

Create serverless functions for:
- **Process Bank Statements**: `supabase/functions/process-bank-statement/index.ts`
- **Generate PDF Invoices**: `supabase/functions/generate-pdf/index.ts`
- **Send Email Notifications**: `supabase/functions/send-email/index.ts`
- **Daily Recurring Invoices**: `supabase/functions/recurring-invoices/index.ts`

## 8. Monitoring & Logs

### Enable Logging
**Go to:** Logs → Postgres

Monitor:
- Failed auth attempts
- Slow queries (> 1 second)
- RLS policy violations
- Storage upload errors

### Set Up Alerts (Pro Plan)
**Go to:** Project Settings → Alerts

Configure alerts for:
- Database size > 80%
- Auth failures > 10/min
- API errors > 5%

## 9. Final Security Checklist

### Before Production Launch

- [ ] Change all default passwords
- [ ] Enable email confirmations
- [ ] Verify all RLS policies are active
- [ ] Confirm storage buckets are private
- [ ] Enable SSL enforcement
- [ ] Set up daily backups
- [ ] Configure CORS in Authentication settings
- [ ] Review and limit API key permissions
- [ ] Enable connection pooling
- [ ] Test password reset flow
- [ ] Test email confirmations
- [ ] Verify file upload limits
- [ ] Check audit log captures all changes

### Post-Launch Monitoring

- [ ] Monitor auth failure rates
- [ ] Review audit logs weekly
- [ ] Check storage usage
- [ ] Monitor database size
- [ ] Review slow query logs
- [ ] Check for RLS bypass attempts
- [ ] Verify backup integrity monthly

## 10. Quick Verification Commands

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check all tables have RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'pg_%';

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- Check indexes for performance
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Verify user creation flow
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
```

## 11. Environment Variables Setup

Add these to your `.env.local`:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Required for production)
RESEND_API_KEY=re_your_key
FROM_EMAIL=noreply@yourdomain.com

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Webhook Security
WEBHOOK_API_KEY=your-webhook-secret

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 12. Common Issues & Solutions

### Issue: RLS blocking legitimate queries
**Solution:** Check the `get_user_org_id()` function exists and returns correct org_id.

### Issue: File uploads failing
**Solution:** Verify storage buckets exist and RLS policies allow the authenticated user.

### Issue: Auth emails not sending
**Solution:** Configure SMTP in Authentication → Providers or use Supabase's built-in email.

### Issue: Auto-generated IDs not working
**Solution:** Verify `id_sequences` table has a row for each org and triggers are enabled.

### Issue: Audit log not recording
**Solution:** Ensure `audit_log` table exists and `auditLog` helper function is called in API routes.

---

**Need Help?** Refer to Supabase docs: https://supabase.com/docs
