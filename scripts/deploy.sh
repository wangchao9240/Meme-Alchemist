#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🚀 Deploying Meme Alchemist..."
echo ""

# Parse arguments
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true

while [[ $# -gt 0 ]]; do
  case $1 in
    --backend-only)
      DEPLOY_FRONTEND=false
      shift
      ;;
    --frontend-only)
      DEPLOY_BACKEND=false
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--backend-only|--frontend-only]"
      exit 1
      ;;
  esac
done

# Deploy backend
if [[ "$DEPLOY_BACKEND" == true ]]; then
  echo "📦 Deploying backend (Cloudflare Workers)..."
  cd backend
  pnpm run deploy
  cd ..
  echo "✅ Backend deployed!"
  echo ""
fi

# Deploy frontend
if [[ "$DEPLOY_FRONTEND" == true ]]; then
  echo "🎨 Deploying frontend (Cloudflare Pages)..."
  cd frontend
  ./deploy.sh
  cd ..
  echo "✅ Frontend deployed!"
  echo ""
fi

echo "🎉 Deployment complete!"
echo ""
echo "🌐 Your app is live at:"
echo "   Frontend: https://meme-alchemist-web.pages.dev"
echo "   Backend:  https://meme-alchemist-api.chasenwang1026.workers.dev"
