#!/bin/bash
# Create a new user via Better Auth email+password sign-up
#
# Usage:
#   ./scripts/create-user.sh
#   EMAIL=admin@iscexpo.edu.bd PASSWORD=admin123 NAME="Admin" ./scripts/create-user.sh

BASE_URL="${AUTH_URL:-http://localhost:3000}"
EMAIL="${EMAIL:-admin@iscexpo.edu.bd}"
PASSWORD="${PASSWORD:-Admin@123}"
NAME="${NAME:-Super Admin}"

echo "=== Creating user: $EMAIL ==="

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$BASE_URL/api/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo ""
echo "Status: $HTTP_CODE"
echo ""
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
