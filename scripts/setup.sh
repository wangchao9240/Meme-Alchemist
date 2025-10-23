#!/bin/bash

set -e

echo "🚀 Setting up Meme Alchemist..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js >= 18 required. Current: $(node -v)"
  exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found. Installing..."
  npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create .env.local for frontend
if [ ! -f frontend/.env.local ]; then
  echo "📝 Creating frontend/.env.local..."
  cat > frontend/.env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:8787
EOF
fi

# Create wrangler.toml placeholder
echo "📝 Please configure backend/wrangler.toml with your KV namespace IDs"
echo "   Run: wrangler kv:namespace create CACHE"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Set up Cloudflare KV namespace"
echo "  2. Set up Supabase project"
echo "  3. Configure secrets: wrangler secret put SECRET_NAME"
echo "  4. Run: pnpm dev"
echo ""

