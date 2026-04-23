#!/usr/bin/env bash
# Verify .env.local has real (non-empty, non-placeholder) values for the keys
# the app actually needs to boot. Useful after copying an env file between
# machines — especially since `vercel env pull` silently writes "" for any
# Vercel-flagged "Sensitive" variable.
#
#   scripts/verify-env.sh
#
# Exit 0 if all required keys are present and non-empty. Exit 1 otherwise.
# Never prints values — only status.

set -euo pipefail
cd "$(dirname "$0")/.."

FILE=".env.local"
if [[ ! -f "$FILE" ]]; then
  echo "FAIL: $FILE not found. Drop the Windows .env.local here and re-run."
  exit 1
fi

REQUIRED=(
  AUTH_SECRET
  AUTH_GOOGLE_ID
  AUTH_GOOGLE_SECRET
  DATABASE_URL
  ANTHROPIC_API_KEY
)
OPTIONAL=(
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN
  OPENAI_API_KEY
  AUTH_TRUST_HOST
  NAVER_CLIENT_ID
  NAVER_CLIENT_SECRET
)

fail=0
for key in "${REQUIRED[@]}"; do
  line=$(grep -E "^${key}=" "$FILE" || true)
  if [[ -z "$line" ]]; then
    echo "MISSING  $key  (not in file)"
    fail=1
    continue
  fi
  val="${line#*=}"
  # strip matched surrounding quotes
  if [[ "$val" =~ ^\".*\"$ ]]; then val="${val:1:${#val}-2}"; fi
  if [[ "$val" =~ ^\'.*\'$ ]]; then val="${val:1:${#val}-2}"; fi
  if [[ -z "$val" ]]; then
    echo "EMPTY    $key  (present but blank)"
    fail=1
  else
    echo "OK       $key  (len=${#val})"
  fi
done

echo ""
echo "--- optional ---"
for key in "${OPTIONAL[@]}"; do
  line=$(grep -E "^${key}=" "$FILE" || true)
  if [[ -z "$line" ]]; then
    echo "skip     $key  (not set — feature disabled)"
    continue
  fi
  val="${line#*=}"
  if [[ "$val" =~ ^\".*\"$ ]]; then val="${val:1:${#val}-2}"; fi
  if [[ "$val" =~ ^\'.*\'$ ]]; then val="${val:1:${#val}-2}"; fi
  if [[ -z "$val" ]]; then
    echo "skip     $key  (blank — feature disabled)"
  else
    echo "OK       $key  (len=${#val})"
  fi
done

if [[ $fail -eq 0 ]]; then
  echo ""
  echo "All required env vars look good. Try: pnpm dev"
  exit 0
else
  echo ""
  echo "Some required env vars are missing/empty. App auth/db will 500."
  exit 1
fi
