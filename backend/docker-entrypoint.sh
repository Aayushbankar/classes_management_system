#!/bin/bash

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Initialize system data
echo "Initializing system..."
python manage.py initialize_system

# Start server with gunicorn
echo "Starting production server..."
gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2
