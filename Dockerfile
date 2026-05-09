# ============================================
# Eklavya — Single Container Deployment
# ============================================
# Stage 1: Build React frontend
# Stage 2: Python backend serves everything
# ============================================

# --- Stage 1: Build React ---
FROM node:18-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY public/ public/
COPY src/ src/

# Same origin — API is at /api on the same host
ENV REACT_APP_API_URL=/api
RUN npm run build


# --- Stage 2: Python Backend ---
FROM python:3.12-slim
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy React build output
COPY --from=frontend-build /app/build /app/frontend_build

# Collect Django static files
RUN DATABASE_URL=sqlite:///tmp/dummy.db python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

# Copy and use startup script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
