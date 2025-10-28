#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME=${PROJECT_NAME:-meme-alchemist-web}

echo "[deploy] Building frontend..."
pnpm build

echo "[deploy] Deploying to Cloudflare Pages..."
# Use backend's wrangler but deploy from frontend directory
cd ../backend
pnpm exec wrangler pages deploy ../frontend/out --project-name="$PROJECT_NAME" --commit-dirty=true

echo "[deploy] ✅ Deployment complete!"
echo "[deploy] Visit: https://$PROJECT_NAME.pages.dev"

