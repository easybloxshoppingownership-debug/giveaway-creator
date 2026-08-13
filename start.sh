#!/usr/bin/env bash
set -e

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --omit=dev
fi

echo "Starting giveaway-creator..."
exec node index.js
