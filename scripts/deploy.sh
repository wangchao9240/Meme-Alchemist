#!/bin/bash

set -e

echo "🚀 Deploying Meme Alchemist..."

# Build and deploy frontend
echo "📦 Building frontend..."
cd frontend
pnpm build
echo "☁️  Deploying to Cloudflare Pages..."
npx wrangler pages deploy out --project-name=meme-alchemist
cd ..

# Deploy backend
echo "⚡ Deploying Workers API..."
cd backend
pnpm deploy
cd ..

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Frontend: https://meme-alchemist.pages.dev"
echo "API: https://meme-alchemist-api.workers.dev"
echo ""

