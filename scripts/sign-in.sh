#!/bin/bash
# Sign in via Better Auth email+password and extract session token
#
# Usage:
#   ./scripts/sign-in.sh
#   EMAIL=admin@iscexpo.edu.bd PASSWORD=admin123 ./scripts/sign-in.sh

BASE_URL="${AUTH_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-admin@iscexpo.edu.bd}"
PASSWORD="${PASSWORD:-Admin@123}"

echo "=== Signing in as: $EMAIL ==="

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$BASE_URL/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -c /tmp/auth-cookies.txt \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo ""
echo "Status: $HTTP_CODE"
echo ""
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

if [ -f /tmp/auth-cookies.txt ]; then
  echo ""
  echo "=== Session cookie saved to /tmp/auth-cookies.txt ==="
fi
