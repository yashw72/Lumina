#!/bin/sh
set -e

# Ensure persistent disk data directories exist and are owned by appuser
mkdir -p /app/data/uploads /app/data/chroma /app/data/images
chown -R appuser:appuser /app/data 2>/dev/null || chmod -R 777 /app/data 2>/dev/null || true

PORT="${PORT:-8000}"

if [ $# -eq 0 ] || [ "$1" = "uvicorn" ]; then
    exec su -s /bin/sh appuser -c "exec uvicorn app.main:app --host 0.0.0.0 --port $PORT"
else
    exec su -s /bin/sh appuser -c "exec $*"
fi
