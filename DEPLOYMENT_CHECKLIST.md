# AFOCE Accounting - Production Deployment Checklist

Complete checklist for deploying to production.

## Pre-Deployment

### 1. Environment Variables

Create `.env.production` file:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Email Service (Required)
RESEND_API_KEY=re_your_key
FROM_EMAIL=noreply@yourdomain.com

# Rate Limiting (Recommended)
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Security
WEBHOOK_API_KEY=your-webhook-secret-key
API_KEY=your-internal-api-key

# Features
ENABLE_DEMO_MODE=false
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_AUTO_RECONCILIATION=true

# VAT
VAT_RATE=0.13
DEFAULT_CURRENCY=NPR
```

### 2. Supabase Configuration

- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Verify all tables have RLS enabled
- [ ] Create storage buckets (receipts, avatars, invoice-attachments, general)
- [ ] Configure storage RLS policies
- [ ] Set up email templates in Auth settings
- [ ] Enable connection pooling
- [ ] Enable daily backups
- [ ] Configure custom SMTP (optional)

### 3. Domain & DNS

- [ ] Purchase domain
- [ ] Configure DNS A record pointing to hosting
- [ ] Set up SSL certificate (Let's Encrypt or custom)
- [ ] Configure www redirect

### 4. Hosting Setup (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or use Git integration
# Connect GitHub repo to Vercel
```

## Deployment Steps

### Step 1: Database Migration

```bash
# Apply schema changes
supabase db push

# Or run manually in SQL Editor
cat supabase/schema.sql | pbcopy
# Paste into Supabase SQL Editor
```

### Step 2: Build Application

```bash
# Install dependencies
npm ci

# Run type check
npx tsc --noEmit

# Build
npm run build

# Test build locally
npm start
```

### Step 3: Deploy

**Option A: Vercel**
```bash
vercel --prod
```

**Option B: Docker**
```bash
# Build image
docker build -t afoce-accounting .

# Run
docker run -p 3000:3000 --env-file .env.production afoce-accounting
```

**Option C: Traditional Server**
```bash
# PM2
pm2 start npm --name "afoce" -- start

# Or systemd service
sudo systemctl enable afoce
sudo systemctl start afoce
```

## Post-Deployment Verification

### 1. Health Check

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2024-...",
  "checks": { ... }
}
```

### 2. Authentication Flow

- [ ] Register new account
- [ ] Confirm email (check spam folder)
- [ ] Login with credentials
- [ ] Password reset flow
- [ ] Logout

### 3. Core Features

- [ ] Create client
- [ ] Create invoice
- [ ] Create expense
- [ ] Upload receipt
- [ ] Export to CSV
- [ ] Generate PDF
- [ ] Approve expense
- [ ] Change invoice status
- [ ] View analytics

### 4. Security Verification

```bash
# Check security headers
curl -I https://yourdomain.com

# Verify:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000

# Test rate limiting
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/api/health
done
# Should see 429 after limit
```

### 5. Performance Check

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Or manual in Chrome DevTools
# Performance tab > Start profiling > Reload page
```

## Monitoring Setup

### 1. Error Tracking

```bash
# Sentry (optional)
npm install @sentry/nextjs
```

Configure in `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

### 2. Analytics

```bash
# Vercel Analytics (built-in)
# Or Google Analytics
npm install @next/third-parties@latest next@latest
```

### 3. Uptime Monitoring

Set up external monitoring:
- UptimeRobot (free tier)
- Pingdom
- Better Uptime

Monitor these endpoints:
- `https://yourdomain.com/api/health` (every 5 min)
- `https://yourdomain.com` (every 5 min)

## Backup Strategy

### Database Backups

Supabase provides automatic backups, but verify:

```bash
# List backups (Supabase CLI)
supabase backups list

# Manual backup before major changes
supabase db dump -f backup-$(date +%Y%m%d).sql
```

### Storage Backups

```bash
# Download all storage files
supabase storage ls -r > storage-list.txt

# Or use S3 sync if using custom storage
aws s3 sync s3://your-bucket ./backup/storage/
```

## Rollback Plan

If deployment fails:

```bash
# Vercel - rollback to previous deployment
vercel rollback

# Or manual database rollback
supabase db reset  # Careful! Destructive

# Restore from backup
psql -h your-db-host -U postgres -d postgres < backup-YYYYMMDD.sql
```

## Security Checklist

- [ ] Change all default/demo passwords
- [ ] Enable 2FA on Supabase account
- [ ] Restrict API keys (use only anon key in client)
- [ ] Enable RLS on all tables
- [ ] Configure CORS properly
- [ ] Enable SSL enforcement
- [ ] Set secure cookie flags
- [ ] Remove demo data before launch
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Enable WAF rules (if available)

## Performance Optimization

### Before Launch

- [ ] Run `next build` with no errors
- [ ] Enable image optimization
- [ ] Configure CDN for static assets
- [ ] Set up caching headers
- [ ] Minimize bundle size
- [ ] Lazy load heavy components
- [ ] Optimize database queries
- [ ] Add database indexes

### Lighthouse Targets

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## Launch Day Tasks

### Pre-Launch (T-1 hour)

- [ ] Final backup of database
- [ ] Verify SSL certificate
- [ ] Test payment flows (if applicable)
- [ ] Send test emails
- [ ] Check all environment variables

### Launch (T-0)

- [ ] Deploy to production
- [ ] Verify health check passes
- [ ] Smoke test critical paths
- [ ] Monitor error rates
- [ ] Check real-time user analytics

### Post-Launch (T+1 hour)

- [ ] Monitor for errors
- [ ] Check performance metrics
- [ ] Verify backups are working
- [ ] Test customer support flow
- [ ] Announce launch (if applicable)

## Maintenance Schedule

### Daily

- [ ] Check error logs
- [ ] Monitor disk space
- [ ] Review failed auth attempts

### Weekly

- [ ] Review audit logs
- [ ] Check slow queries
- [ ] Monitor API usage
- [ ] Review security alerts

### Monthly

- [ ] Security audit
- [ ] Dependency updates
- [ ] Performance review
- [ ] Backup verification

### Quarterly

- [ ] Access review
- [ ] Disaster recovery test
- [ ] SSL certificate renewal
- [ ] Security policy review

## Emergency Contacts

- **Hosting Provider**: [Your hosting support]
- **Supabase Support**: support@supabase.io
- **Domain Registrar**: [Your registrar]
- **Team Lead**: [Your contact]

## Troubleshooting

### Common Issues

**Build fails:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**Database connection fails:**
```bash
# Check connection pooling
# Verify DATABASE_URL format
# Test connection from deployment server
```

**Email not sending:**
```bash
# Check Resend dashboard
# Verify FROM_EMAIL domain
# Check spam folders
# Verify email templates in Supabase
```

**Storage uploads failing:**
```bash
# Check bucket exists
# Verify RLS policies
# Check file size limits
# Test CORS configuration
```

---

**Good luck with your launch! 🚀**
