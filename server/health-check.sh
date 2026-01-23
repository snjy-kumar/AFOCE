#!/bin/bash
# Health Check Script
# Returns 0 if healthy, 1 if unhealthy

HEALTH_ENDPOINT="http://localhost:5000/api/health"
MAX_RETRIES=3
RETRY_DELAY=2

for i in $(seq 1 $MAX_RETRIES); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Server is healthy"
        exit 0
    fi
    
    if [ $i -lt $MAX_RETRIES ]; then
        echo "⚠ Health check failed (attempt $i/$MAX_RETRIES), retrying..."
        sleep $RETRY_DELAY
    fi
done

echo "✗ Server is unhealthy"
exit 1
