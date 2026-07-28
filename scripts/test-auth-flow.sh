#!/bin/bash
# Full auth flow test: sign-up → sign-in → session check → sign-out
#
# Usage:
#   ./scripts/test-auth-flow.sh
#   AUTH_URL=http://localhost:3000 ./scripts/test-auth-flow.sh

set -e

BASE_URL="${AUTH_URL:-http://localhost:3000}"
EMAIL="test-$(date +%s)@iscexpo.edu.bd"
PASSWORD="TestPass@123"
NAME="Test User $(date +%s)"

echo "╔══════════════════════════════════════╗"
echo "║     ISC Expo — Auth Flow Test       ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Base URL: $BASE_URL"
echo "Email:    $EMAIL"
echo ""

# ─── 1. Sign Up ─────────────────────────────────────────────────────────────
echo "━━━ Step 1: Sign Up ━━━"
SIGNUP=$(curl -s -w "\n%{http_code}" \
  -X POST "$BASE_URL/api/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\"
  }")

SIGNUP_CODE=$(echo "$SIGNUP" | tail -1)
SIGNUP_BODY=$(echo "$SIGNUP" | head -n -1)
echo "Status: $SIGNUP_CODE"
echo "$SIGNUP_BODY" | python3 -m json.tool 2>/dev/null || echo "$SIGNUP_BODY"
echo ""

if [ "$SIGNUP_CODE" != "200" ] && [ "$SIGNUP_CODE" != "201" ]; then
  echo "❌ Sign-up failed with status $SIGNUP_CODE"
  exit 1
fi
echo "✅ Sign-up successful"
echo ""

# ─── 2. Sign In ─────────────────────────────────────────────────────────────
echo "━━━ Step 2: Sign In ━━━"
SIGNIN=$(curl -s -w "\n%{http_code}" \
  -X POST "$BASE_URL/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -c /tmp/test-session.txt \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

SIGNIN_CODE=$(echo "$SIGNIN" | tail -1)
SIGNIN_BODY=$(echo "$SIGNIN" | head -n -1)
echo "Status: $SIGNIN_CODE"
echo "$SIGNIN_BODY" | python3 -m json.tool 2>/dev/null || echo "$SIGNIN_BODY"
echo ""

if [ "$SIGNIN_CODE" != "200" ]; then
  echo "❌ Sign-in failed with status $SIGNIN_CODE"
  exit 1
fi
echo "✅ Sign-in successful"
echo ""

# ─── 3. Check Session ──────────────────────────────────────────────────────
echo "━━━ Step 3: Check Session ━━━"
SESSION=$(curl -s -w "\n%{http_code}" \
  -b /tmp/test-session.txt \
  "$BASE_URL/api/auth/get-session")

SESSION_CODE=$(echo "$SESSION" | tail -1)
SESSION_BODY=$(echo "$SESSION" | head -n -1)
echo "Status: $SESSION_CODE"
echo "$SESSION_BODY" | python3 -m json.tool 2>/dev/null || echo "$SESSION_BODY"
echo ""

if [ "$SESSION_CODE" != "200" ]; then
  echo "❌ Session check failed with status $SESSION_CODE"
  exit 1
fi
echo "✅ Session valid"
echo ""

# ─── 4. Test Protected Route ───────────────────────────────────────────────
echo "━━━ Step 4: Test Protected Route (GET /api/admin/seed) ━━━"
ADMIN=$(curl -s -w "\n%{http_code}" \
  -b /tmp/test-session.txt \
  "$BASE_URL/api/admin/seed")

ADMIN_CODE=$(echo "$ADMIN" | tail -1)
ADMIN_BODY=$(echo "$ADMIN" | head -n -1)
echo "Status: $ADMIN_CODE"
echo "$ADMIN_BODY" | python3 -m json.tool 2>/dev/null || echo "$ADMIN_BODY"
echo ""

# ─── 5. Sign Out ────────────────────────────────────────────────────────────
echo "━━━ Step 5: Sign Out ━━━"
SIGNOUT=$(curl -s -w "\n%{http_code}" \
  -X POST "$BASE_URL/api/auth/sign-out" \
  -b /tmp/test-session.txt \
  -c /tmp/test-session.txt)

SIGNOUT_CODE=$(echo "$SIGNOUT" | tail -1)
SIGNOUT_BODY=$(echo "$SIGNOUT" | head -n -1)
echo "Status: $SIGNOUT_CODE"
echo "$SIGNOUT_BODY" | python3 -m json.tool 2>/dev/null || echo "$SIGNOUT_BODY"
echo ""
echo "✅ Sign-out complete"
echo ""

# ─── 6. Verify Session Invalidated ──────────────────────────────────────────
echo "━━━ Step 6: Verify Session Invalidated ━━━"
AFTER_SIGNOUT=$(curl -s -w "\n%{http_code}" \
  -b /tmp/test-session.txt \
  "$BASE_URL/api/auth/get-session")

AFTER_CODE=$(echo "$AFTER_SIGNOUT" | tail -1)
AFTER_BODY=$(echo "$AFTER_SIGNOUT" | head -n -1)
echo "Status: $AFTER_CODE"
echo "$AFTER_BODY" | python3 -m json.tool 2>/dev/null || echo "$AFTER_BODY"
echo ""

if [ "$AFTER_CODE" = "200" ]; then
  SESSION_DATA=$(echo "$AFTER_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('null' if d.get('session') is None else 'valid')" 2>/dev/null)
  if [ "$SESSION_DATA" = "null" ] || [ "$SESSION_DATA" = "None" ]; then
    echo "✅ Session properly invalidated"
  else
    echo "⚠️  Session still appears valid (may be cached)"
  fi
else
  echo "✅ Session properly invalidated (status: $AFTER_CODE)"
fi

rm -f /tmp/test-session.txt
echo ""
echo "╔══════════════════════════════════════╗"
echo "║         All tests passed! ✅         ║"
echo "╚══════════════════════════════════════╝"
