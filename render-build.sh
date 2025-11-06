#!/bin/sh
set -e

echo "🚀 Starting deployment process..."

# Run migrations
echo "📦 Running database migrations..."
pnpm run migration:run || echo "⚠️  Migrations failed or no pending migrations"

echo "✅ Deployment setup complete!"
