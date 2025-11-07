#!/bin/sh

echo "Running database migrations..."
npm run migration:run:prod || echo "Migration failed, continuing anyway..."

echo "Starting application..."
npm run start:prod
