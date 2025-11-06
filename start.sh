#!/bin/sh

echo "Running database migrations..."
node dist/main.js migrate || true

echo "Starting application..."
node dist/main.js
