# Troubleshooting Guide: Network Errors & Login Issues

## Current Error

```
TypeError: Failed to fetch
POST https://ilztuttfsgrpiewbtwnd.supabase.co/auth/v1/token?grant_type=password
net::ERR_CONNECTION_RESET
```

This error occurs when the browser cannot reach the Supabase authentication endpoint.

---

## Quick Diagnostics

### 1. Check Supabase Project Status

Visit your Supabase dashboard:
```
https://app.supabase.com/
```

**Look for:**
- ✓ Project status (should be "Healthy")
- ✓ Database is running
- ✓ Auth is enabled

### 2. Test Network Connectivity

Run this in your terminal:
```bash
# Test DNS resolution
nslookup ilztuttfsgrpiewbtwnd.supabase.co

# Test HTTPS connection
curl -I https://ilztuttfsgrpiewbtwnd.supabase.co

# Test with timeout
curl --connect-timeout 5 \
  https://ilztuttfsgrpiewbtwnd.supabase.co/auth/v1/health
```

Expected response: `200 OK`

### 3. Verify Environment Variables

Check `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ilztuttfsgrpiewbtwnd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 4. Browser Console Check

Open Chrome DevTools (F12):
- Go to **Application** → **Local Storage**
- Check if keys exist for your domain
- Look for any CORS errors in **Console** tab

---

## Common Causes & Solutions

### 1. Supabase Project Paused or Down

**Solution:**
1. Log into Supabase dashboard
2. Go to **Project Settings** → **General**
3. Check project status (should be "Active")
4. If paused, click **Resume Project**

### 2. Network/Firewall Blocking

**Solutions:**
- Try using a VPN
- Check if your corporate/ISP firewall blocks Supabase
- Try from a different network (mobile hotspot)
- Try from a different device

### 3. CORS Configuration Issue

**Check CORS settings:**
1. In Supabase dashboard, go to **Project Settings** → **API**
2. Look for **CORS configuration**
3. Ensure your app URL is whitelisted

**For localhost development:**
```
http://localhost:3000
```

**For production:**
```
https://yourdomain.com
```

### 4. Browser Cache Issues

**Solution:**
```bash
# Hard refresh in browser
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R

# Or clear cache:
# Open DevTools → Settings → Network → "Disable cache"
```

### 5. Old/Invalid Tokens

**Solution:**
1. Clear browser cookies:
   - Dev Tools → Application → Cookies
   - Delete all `sb-*` cookies
2. Clear local storage:
   - Dev Tools → Application → Local Storage
   - Delete entries for your domain
3. Restart the development server:
   ```bash
   npm run dev
   ```

---

## Debugging Steps

### Step 1: Verify Supabase Connectivity

Add this to `app/(auth)/login/page.tsx` temporarily:

```typescript
// Add at top of component
useEffect(() => {
  const checkConnection = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`,
        { method: 'HEAD' }
      );
      console.log('Supabase Health Check:', response.status);
    } catch (error) {
      console.error('Supabase connection failed:', error);
    }
  };
  checkConnection();
}, []);
```

### Step 2: Check Request Headers

In DevTools Network tab:
1. Attempt login
2. Look for the failed POST request
3. Check **Request Headers**:
   - `Authorization: Bearer ...` (might be empty for login)
   - `Content-Type: application/json`
   - `User-Agent: ...`

### Step 3: Test with cURL

```bash
# Test health endpoint
curl -v https://ilztuttfsgrpiewbtwnd.supabase.co/auth/v1/health

# Test login (with dummy credentials)
curl -X POST https://ilztuttfsgrpiewbtwnd.supabase.co/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_PUBLISHABLE_KEY" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## Solutions by Environment

### Development (Localhost)

**If getting `net::ERR_CONNECTION_RESET`:**

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Clear all browser data:**
   ```
   DevTools → Application → Clear site data
   ```

3. **Check local env file:**
   ```bash
   cat .env.local | grep SUPABASE
   ```

4. **Verify Supabase is accessible:**
   ```bash
   curl -I https://ilztuttfsgrpiewbtwnd.supabase.co
   ```

### Production (Vercel/Hosting)

1. **Check environment variables are set:**
   ```bash
   # Vercel: Settings → Environment Variables
   # Ensure both variables are set:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```

2. **Verify domain in CORS:**
   - Supabase Dashboard → Project Settings → API
   - Add your production domain to CORS

3. **Check SSL/TLS:**
   - Production should use HTTPS
   - Supabase should be HTTPS

---

## Error Recovery Checklist

- [ ] Verify Supabase project is active (not paused)
- [ ] Confirm network connectivity to Supabase
- [ ] Check environment variables are correct
- [ ] Clear browser cache and cookies
- [ ] Restart development server
- [ ] Try from different network/device
- [ ] Check Supabase CORS settings
- [ ] Verify domain is whitelisted
- [ ] Test health endpoint: `/auth/v1/health`
- [ ] Check browser DevTools Network tab

---

## Still Having Issues?

### Contact Supabase Support

If nothing above works:

1. **Check Supabase Status:**
   - https://status.supabase.com/

2. **File a support ticket:**
   - https://supabase.com/dashboard/support

3. **Community Help:**
   - https://github.com/supabase/supabase/discussions

### Provide This Info to Support

```
Project ID: ilztuttfsgrpiewbtwnd
Error: net::ERR_CONNECTION_RESET
Endpoint: /auth/v1/token
Environment: [development/production]
Browser: [Chrome/Firefox/Safari/Edge]
Network: [Home/Corporate/VPN]
Last working: [when did this last work]
```

---

## Related Files to Check

```
.env.local              # Verify variables
app/(auth)/login/page.tsx   # Login form
lib/supabase/client.ts      # Supabase client config
middleware.ts           # Auth middleware
```

---

## Prevention Tips

1. **Always test after deployment**
2. **Set up monitoring for Supabase health**
3. **Use error boundaries** (already implemented)
4. **Log auth errors** (already implemented)
5. **Have fallback UI** (already implemented)

---

## Next Steps

1. Follow the **Quick Diagnostics** section above
2. Run the **cURL tests** to verify connectivity
3. Check Supabase Dashboard for project status
4. Clear browser cache and try again
5. Restart dev server: `npm run dev`

If the issue persists, please provide:
- Exact error message from DevTools
- Network tab details
- Result of `curl` tests
- Supabase project status

---

*Last Updated: 2026-05-03*
*AFOCE v1.0.0*
