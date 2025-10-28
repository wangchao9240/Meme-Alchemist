#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

API_URL=${API_URL:-http://127.0.0.1:8787}
ADMIN_KEY=${ADMIN_KEY:-dev-secret}
CACHE_KEY=${CACHE_KEY:-"trends:$(date -u +%F)"}
PREVIEW_NAMESPACE=${PREVIEW_NAMESPACE:-7bc1199d51514f0092c1de8600498ac3}
PRODUCTION_NAMESPACE=${PRODUCTION_NAMESPACE:-ce6e9d39dee2414e81046e366a49c4b9}

LOG_FILE="${SCRIPT_DIR}/.sync-trends.log"
TEMP_JSON="$(mktemp)"

DEV_PID=""

stop_dev() {
  if [[ -n "$DEV_PID" ]] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
    echo "[sync-trends] Stopping local worker (pid $DEV_PID)..."
    kill "$DEV_PID" >/dev/null 2>&1 || true

    for _ in {1..10}; do
      if ! kill -0 "$DEV_PID" >/dev/null 2>&1; then
        break
      fi
      sleep 0.5
    done

    if kill -0 "$DEV_PID" >/dev/null 2>&1; then
      echo "[sync-trends] Force killing local worker (pid $DEV_PID)"
      kill -9 "$DEV_PID" >/dev/null 2>&1 || true
    fi

    wait "$DEV_PID" 2>/dev/null || true
  fi

  DEV_PID=""
}

cleanup() {
  stop_dev
  rm -f "$TEMP_JSON"
}

trap cleanup EXIT

echo "[sync-trends] Starting local worker via pnpm dev..."
pnpm dev -- --local --port 8787 >"$LOG_FILE" 2>&1 &
DEV_PID=$!

READY=false
for _ in {1..40}; do
  if curl -sf "$API_URL/api/trends" >/dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 1
done

if [[ "$READY" != true ]]; then
  echo "[sync-trends] Failed to start local worker. See $LOG_FILE" >&2
  exit 1
fi

echo "[sync-trends] Triggering refresh via $API_URL/api/trends/refresh"
curl -sf -X POST "$API_URL/api/trends/refresh" \
  -H "X-Admin-Key: $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  || {
    echo "[sync-trends] Refresh request failed" >&2
    exit 1
  }

# Give the refresh a moment to populate KV
sleep 3

echo "[sync-trends] Downloading trends payload"
curl -sf "$API_URL/api/trends?date=today&limit=50" >"$TEMP_JSON"

stop_dev
trap - EXIT

echo "[sync-trends] Uploading $CACHE_KEY to preview namespace ($PREVIEW_NAMESPACE)"
pnpm exec wrangler kv:key put "$CACHE_KEY" --namespace-id="$PREVIEW_NAMESPACE" --path "$TEMP_JSON"

echo "[sync-trends] Uploading $CACHE_KEY to production namespace ($PRODUCTION_NAMESPACE)"
pnpm exec wrangler kv:key put "$CACHE_KEY" --namespace-id="$PRODUCTION_NAMESPACE" --path "$TEMP_JSON"

rm -f "$TEMP_JSON"

echo "[sync-trends] Done. Key: $CACHE_KEY"

