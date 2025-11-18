#!/bin/sh
set -e

echo "🚀 Starting Atara Backend..."

# Run database migrations before starting
echo " Running database migrations..."
if [ -f "dist/data-source.js" ]; then
  node node_modules/.bin/typeorm migration:run -d dist/data-source.js || echo "⚠️  No pending migrations or migrations failed"
else
  echo "⚠️  data-source.js not found, skipping migrations"
fi

# Fix notifications table if needed
echo "🔧 Ensuring notifications table exists..."
node fix-production-notifications.js || echo "⚠️  Notifications table setup failed or already exists"

# Start the application
echo "✅ Starting NestJS application..."
exec node dist/main.js