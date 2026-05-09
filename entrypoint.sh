#!/bin/bash
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Initializing system data..."
python manage.py initialize_system --reset || true

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2
