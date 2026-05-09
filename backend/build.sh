#!/usr/bin/env bash
# Render build script — runs during deploy

set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running database migrations..."
python manage.py migrate

echo "Initializing system data..."
python manage.py initialize_system || true

echo "Build complete!"
