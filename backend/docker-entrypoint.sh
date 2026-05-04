#!/bin/bash

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Initialize system data
echo "Initializing system..."
python manage.py initialize_system

# Start server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
