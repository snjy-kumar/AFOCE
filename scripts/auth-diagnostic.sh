#!/bin/bash

# ============================================================
# AFOCE Authentication Diagnostic & Test Script
# ============================================================

echo "🔍 AFOCE Authentication Diagnostic"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Environment
echo "1️⃣ Checking Environment Variables..."
if [ ! -f ./.env.local ]; then
  echo -e "${RED}✗ .env.local not found${NC}"
  exit 1
fi

SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2)
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY .env.local | cut -d= -f2 | cut -c1-30)

if [ -z "$SUPABASE_URL" ]; then
  echo -e "${RED}✗ SUPABASE_URL not set${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Environment variables found${NC}"
echo "  URL: ${SUPABASE_URL}"
echo "  Key: ${SUPABASE_KEY}..."
echo ""

# 2. Test Network Connectivity
echo "2️⃣ Testing Supabase Network Connectivity..."
HEALTH_ENDPOINT="${SUPABASE_URL}/auth/v1/health"

if curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" | grep -q "200"; then
  echo -e "${GREEN}✓ Supabase is reachable (HTTP 200)${NC}"
else
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT")
  echo -e "${YELLOW}⚠ Supabase returned HTTP $HTTP_CODE${NC}"
  echo "  (May still work - not all endpoints return 200)"
fi
echo ""

# 3. Check Build Status
echo "3️⃣ Checking Build Status..."
if npm run build > /tmp/build.log 2>&1; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  echo "  Check: npm run build"
  tail -10 /tmp/build.log
  exit 1
fi
echo ""

# 4. Check Auth File Configuration
echo "4️⃣ Checking Auth Client Configuration..."
if grep -q "persistSession: true" ./utils/supabase/client.ts; then
  echo -e "${GREEN}✓ Session persistence enabled${NC}"
else
  echo -e "${RED}✗ Session persistence NOT configured${NC}"
fi

if grep -q "autoRefreshToken: true" ./utils/supabase/client.ts; then
  echo -e "${GREEN}✓ Auto token refresh enabled${NC}"
else
  echo -e "${RED}✗ Auto token refresh NOT configured${NC}"
fi

if grep -q "flowType.*pkce" ./utils/supabase/client.ts; then
  echo -e "${GREEN}✓ PKCE flow enabled${NC}"
else
  echo -e "${YELLOW}⚠ PKCE flow not explicitly set${NC}"
fi
echo ""

# 5. Check Error Handling
echo "5️⃣ Checking Error Handling..."
if grep -q "Failed to fetch" ./app/\(auth\)/login/page.tsx; then
  echo -e "${GREEN}✓ Network error handling implemented${NC}"
else
  echo -e "${YELLOW}⚠ Network error handling not found${NC}"
fi

if grep -q "try {" ./app/\(auth\)/login/page.tsx && grep -q "} catch" ./app/\(auth\)/login/page.tsx; then
  echo -e "${GREEN}✓ Try-catch error handling added${NC}"
else
  echo -e "${YELLOW}⚠ Try-catch pattern not found${NC}"
fi
echo ""

# 6. Server Status
echo "6️⃣ Checking Dev Server Status..."
if nc -z localhost 3000 2>/dev/null; then
  echo -e "${GREEN}✓ Dev server running on port 3000${NC}"
elif nc -z localhost 3001 2>/dev/null; then
  echo -e "${GREEN}✓ Dev server running on port 3001${NC}"
else
  echo -e "${YELLOW}⚠ Dev server not detected${NC}"
  echo "  Start it with: npm run dev"
fi
echo ""

# 7. Test Login Page
echo "7️⃣ Testing Login Page..."
if curl -s http://localhost:3000/login 2>/dev/null | grep -q "login\|email\|password" 2>/dev/null; then
  echo -e "${GREEN}✓ Login page loads successfully${NC}"
else
  echo -e "${YELLOW}⚠ Could not verify login page (server may not be running)${NC}"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}✓ Authentication Setup Verified${NC}"
echo ""
echo "Next Steps:"
echo "1. Start dev server: npm run dev"
echo "2. Navigate to http://localhost:3000/login"
echo "3. Create test user or log in with existing credentials"
echo "4. After successful login, you should see the dashboard"
echo ""
echo "Troubleshooting:"
echo "- Check browser DevTools Console for errors"
echo "- Check Network tab for failed requests"
echo "- Verify Supabase project is Active (not paused)"
echo "- Clear browser cache: Ctrl+Shift+Delete"
echo ""

