#!/bin/bash

# Quick API Test Script
# Tests critical endpoints to verify backend is working

set -e

BASE_URL="${API_URL:-http://localhost:5000/api}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="quicktest${TIMESTAMP}@afoce.com"

echo "🧪 Quick Backend Test"
echo "Target: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local token="$5"
    
    printf "Testing %-30s ... " "$name"
    
    if [ -z "$data" ]; then
        if [ -z "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "Authorization: Bearer $token")
        fi
    else
        if [ -z "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data")
        fi
    fi
    
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $status_code)"
        return 1
    fi
}

# Test health
test_endpoint "Health Check" "GET" "/health"
test_endpoint "Detailed Health" "GET" "/health/detailed"

# Test auth
echo ""
echo "📝 Registering test user..."
register_response=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"TestPass123!\",
        \"businessName\": \"Test Business\"
    }")

TOKEN=$(echo "$register_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to get auth token${NC}"
    echo "Response: $register_response"
    exit 1
fi

echo -e "${GREEN}✓ Auth token received${NC}"
echo ""

# Test authenticated endpoints
test_endpoint "Get Profile" "GET" "/auth/profile" "" "$TOKEN"

# Create customer
echo ""
echo "👥 Testing Customer API..."
customer_response=$(curl -s -X POST "$BASE_URL/customers" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name": "Test Customer",
        "email": "customer@test.com"
    }')

CUSTOMER_ID=$(echo "$customer_response" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -n "$CUSTOMER_ID" ]; then
    echo -e "${GREEN}✓ Customer created${NC} (ID: ${CUSTOMER_ID:0:8}...)"
else
    echo -e "${RED}✗ Customer creation failed${NC}"
fi

test_endpoint "Get Customers" "GET" "/customers" "" "$TOKEN"

# Test dashboard
echo ""
echo "📊 Testing Dashboard..."
test_endpoint "Dashboard Summary" "GET" "/dashboard/summary" "" "$TOKEN"

echo ""
echo "✅ Quick test complete!"
echo ""
echo "For comprehensive testing:"
echo "  • Import AFOCE-Postman-Collection.json into Postman"
echo "  • Run: node test-api.js"
echo "  • Visit: http://localhost:5000/api-docs"
