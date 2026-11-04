#!/bin/sh
set -e

PORT="${PORT:-3000}"

echo "=== HydroShift AI Web Startup ==="
echo "Port: $PORT"

cd /app/apps/web

if [ -f "./node_modules/.bin/next" ]; then
    echo "--> Launching via ./node_modules/.bin/next..."
    exec ./node_modules/.bin/next start --port "$PORT" --hostname 0.0.0.0
elif command -v pnpm >/dev/null 2>&1; then
    echo "--> Launching via pnpm..."
    exec pnpm start -- --port "$PORT" --hostname 0.0.0.0
else
    echo "--> Launching via npx next..."
    exec npx next start --port "$PORT" --hostname 0.0.0.0
fi
