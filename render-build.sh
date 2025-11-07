#!/bin/sh
set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the application first
echo "🔨 Building application..."
pnpm build

# Run migrations after build
echo "� Running database migrations..."
if pnpm run migration:run:prod; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration failed or no pending migrations"
  # Don't fail the build if migrations fail
  exit 0
fi

echo "✅ Deployment setup complete!"
