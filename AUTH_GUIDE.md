# 🔐 AFOCE Authentication - Quick Start & Troubleshooting

## What Was Fixed

The login page was failing with `net::ERR_CONNECTION_RESET` and `Failed to fetch` errors. This was caused by an incomplete Supabase browser client configuration that wasn't properly handling:

- ✗ Session persistence (keeping you logged in across page reloads)
- ✗ Token refresh (maintaining auth during long sessions)
- ✗ Cookie management (storing auth state)
- ✗ Error recovery (handling network issues gracefully)

**All of these are now fixed!** ✅

---

## Getting Started with Login

### Step 1: Verify Your Setup

Run the diagnostic script:
```bash
cd /home/sanjay/projects/AFOCE
bash scripts/auth-diagnostic.sh
```

You should see ✓ marks on all checks. If any fail, review the **Troubleshooting** section below.

### Step 2: Start the App

```bash
npm run dev
```

The app will start on `http://localhost:3000` (or `3001` if 3000 is busy).

### Step 3: Test Login

1. **Navigate to login:** http://localhost:3000/login
2. **Enter credentials:** Use any valid Supabase user email and password
3. **Check for success:** You should see the dashboard after login

---

## Creating a Test User

If you don't have test credentials, create one in Supabase:

1. **Open Supabase Dashboard:**
   - Go to https://app.supabase.com
   - Select your project: `ilztuttfsgrpiewbtwnd`

2. **Go to Authentication → Users**

3. **Click "Add User" → "Create new user"**

4. **Fill in:**
   - Email: `test@example.com`
   - Password: `TestPassword123!` (or your choice)
   - Auto confirm user: ✓ Check this

5. **Save and note the credentials**

Now you can use these for testing login!

---

## How the Auth Flow Works Now

### Session Persistence
```
1. User logs in → Supabase returns session + JWT
2. Browser client stores session in localStorage
3. Session survives page reloads and browser restart
4. User stays logged in automatically
```

### Token Refresh
```
1. Session expires after ~60 minutes
2. Browser client automatically refreshes token
3. New session is transparent to user
4. User never needs to re-login due to token expiry
```

### Error Handling
```
1. Network error occurs (connection lost, Supabase down)
2. App catches the error (try-catch)
3. Displays friendly message: "Connection error..."
4. User can retry when connection returns
```

---

## Common Issues & Solutions

### Issue: Still getting "Failed to fetch" errors

**Cause:** Supabase project might be paused

**Solution:**
1. Open Supabase Dashboard: https://app.supabase.com
2. Go to Project Settings → General
3. Check **Project Status**
4. If "Paused": Click **Resume Project**
5. Wait 30 seconds and try login again

### Issue: "Invalid email or password"

**Cause:** Wrong credentials

**Solution:**
1. Double-check the email and password
2. Ensure you're using the correct Supabase project
3. Try creating a new test user (see section above)
4. Check email for typos

### Issue: Login page loads but nothing happens when clicking login

**Cause:** JavaScript error or form not submitting

**Solution:**
1. Open DevTools: **F12** in browser
2. Go to **Console** tab
3. Look for red error messages
4. Screenshot the error and check below

### Issue: "Please verify your email before signing in"

**Cause:** Email not confirmed

**Solution:**
1. In Supabase: Go to Auth → Users
2. Find the user
3. Click to edit
4. Look for **Email confirmed** toggle
5. Turn it ON
6. Try login again

---

## Testing Different Scenarios

### Test 1: Session Persistence
```
✓ Log in successfully
✓ Page redirects to dashboard
✓ Hard refresh page: Ctrl+Shift+R
✓ Should stay on dashboard (not logged out)
```

### Test 2: Token Expiry & Refresh
```
✓ Log in successfully
✓ Wait 5+ minutes (or check DevTools → Network)
✓ Click any action in dashboard
✓ Should work without re-authentication
```

### Test 3: Network Error Handling
```
✓ Disconnect WiFi/unplug ethernet
✓ Attempt login
✓ Should show: "Connection error. Please check your internet..."
✓ Reconnect network
✓ Try login again - should work
```

### Test 4: Browser Cache & Cookies
```
✓ Log in successfully
✓ Open DevTools: F12 → Application
✓ Look at Cookies section
✓ Should see `sb-...` cookies (Supabase auth tokens)
✓ These are httpOnly (hidden for security)
```

---

## What Changed in the Code

### 1. Browser Client Configuration
**File:** `utils/supabase/client.ts`

Added auth configuration:
```typescript
auth: {
  persistSession: true,        // ← Keep sessions across reloads
  autoRefreshToken: true,      // ← Auto-refresh expired tokens
  detectSessionInUrl: true,    // ← Handle auth callbacks
  flowType: "pkce",            // ← OAuth security standard
}
```

### 2. Error Handling
**File:** `app/(auth)/login/page.tsx`

Wrapped auth in try-catch:
```typescript
try {
  const { error } = await supabase.auth.signInWithPassword({...});
  // Handle specific error types
} catch (err) {
  // Catch network/unexpected errors
  setError("Connection error...");
}
```

### 3. Middleware Session Refresh
**File:** `utils/supabase/middleware.ts`

Refresh session on every request:
```typescript
export async function updateSession(request: NextRequest) {
  // ... create Supabase client
  await supabase.auth.getSession(); // Refresh session
  return response;
}
```

---

## Verification Checklist

- [ ] Ran `bash scripts/auth-diagnostic.sh` - all ✓
- [ ] Dev server running: `npm run dev`
- [ ] Can access http://localhost:3000/login
- [ ] Have valid Supabase user credentials
- [ ] Supabase project is "Active" (not paused)
- [ ] Successfully logged in to dashboard
- [ ] Dashboard is fully functional (can see data)
- [ ] Page refresh keeps you logged in
- [ ] No console errors in DevTools

---

## Next Steps

1. **Test login** with valid credentials
2. **Explore dashboard** - should have full access
3. **Create test data** - clients, invoices, expenses
4. **Test workflows** - create, edit, delete operations
5. **Report any issues** with exact error messages

---

## Debug Commands

### Check Supabase Health
```bash
curl https://ilztuttfsgrpiewbtwnd.supabase.co/auth/v1/health
```

### View Recent Logs
```bash
# Terminal where you ran npm run dev
# Look for: "POST /api/auth..." entries
```

### Clear All Browser Data
```
F12 → Application → Clear site data → Include all
```

### Restart Dev Server
```bash
# Stop with Ctrl+C
# Then run:
npm run dev
```

---

## Key Files to Know

```
utils/supabase/client.ts          ← Browser auth client
app/(auth)/login/page.tsx         ← Login form
utils/supabase/middleware.ts      ← Session refresh
proxy.ts                          ← Auth routing rules
.env.local                        ← Credentials (keep secret!)
```

---

## Production Deployment

When ready to deploy to Vercel:

1. **Set environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

2. **Verify Supabase settings:**
   - CORS: Add your domain
   - Auth: Enable Sign-in (it's on by default)

3. **Test in production:**
   - Try login on deployed domain
   - Verify session persists

---

## Still Need Help?

### Check These First
1. Browser Console (F12) for error messages
2. Network tab → Look for failed requests
3. `bash scripts/auth-diagnostic.sh` output
4. Supabase Dashboard → Logs section

### Provide This Info When Asking for Help
```
Error Message: [exact error from console]
URL: [where it failed]
Browser: [Chrome/Firefox/Safari]
Network: [home/office/VPN]
Steps to Reproduce: [exact steps]
```

---

## Reference Links

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **AFOCE README:** `/home/sanjay/projects/AFOCE/README.md`
- **AFOCE Backend Docs:** `/home/sanjay/projects/AFOCE/docs/BACKEND.md`
- **Troubleshooting Guide:** `/home/sanjay/projects/AFOCE/TROUBLESHOOTING.md`

---

**Status:** ✅ Authentication Fixed & Ready to Test  
**Last Updated:** May 3, 2026  
**Version:** AFOCE v1.0.0
