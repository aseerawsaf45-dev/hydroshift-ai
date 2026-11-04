#!/bin/sh
set -e

PORT="${PORT:-8000}"

echo "=== HydroShift AI API Startup ==="
echo "Port: $PORT"
echo "Environment: ${ENVIRONMENT:-production}"

echo "--> Applying Alembic migrations..."
python -m alembic upgrade head || echo "[Warning] Alembic migrations had issues or were already up to date."

echo "--> Running idempotent database seeders..."
python -m scripts.seed || echo "[Warning] scripts.seed encountered a non-fatal error."
python -m scripts.seed_crop_data || echo "[Warning] scripts.seed_crop_data encountered a non-fatal error."
python -m scripts.ingest_ground_truth || echo "[Warning] scripts.ingest_ground_truth encountered a non-fatal error."
python -m scripts.populate_database || echo "[Warning] scripts.populate_database encountered a non-fatal error."

echo "--> Launching Uvicorn ASGI server on 0.0.0.0:$PORT..."
exec python -m uvicorn services.api.app.main:app --host 0.0.0.0 --port "$PORT"
