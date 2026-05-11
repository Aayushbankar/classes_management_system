# Deployment Guide

Instructions for deploying the Classes Management System to production environments.

---

## Deployment Platforms

### Render (Single-Container)
The most efficient way to deploy is using Render with the root `Dockerfile`. This will build both the React frontend and Django backend into a single container.

1. **New → Web Service** on Render.
2. Connect your GitHub repository.
3. **Environment**: `Docker`.
4. **Build Command**: (Automatic via Dockerfile).
5. **Add Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL URL.
   - `SECRET_KEY`: A strong random string.
   - `ALLOWED_HOSTS`: `your-app.onrender.com`.
   - `REACT_APP_API_URL`: `/api`.

> **Note**: Our Docker configuration automatically installs `libcairo2-dev` and `pkg-config`, which are required for the PDF receipt system.

---

## Docker (Recommended)

The project includes Docker configuration for containerized deployment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 20+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

### Quick Deploy

```bash
docker compose up --build -d
```

This starts:
- **Backend** on port `8000`
- **Frontend** on port `3001`

### Docker Compose Configuration

```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DEBUG=False
      - ALLOWED_HOSTS=your-domain.com
      - CORS_ALLOWED_ORIGINS=https://your-domain.com
    restart: always

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
    depends_on:
      - backend
    restart: always
```

### Production Environment Variables

Set these environment variables for production:

#### Backend

| Variable | Production Value |
|----------|-----------------|
| `DEBUG` | `False` |
| `SECRET_KEY` | Strong random key (50+ characters) |
| `ALLOWED_HOSTS` | `your-domain.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-domain.com` |
| `DATABASE_URL` | PostgreSQL connection string |

#### Frontend

| Variable | Production Value |
|----------|-----------------|
| `REACT_APP_API_URL` | `https://your-domain.com/api` |

---

## Manual Deployment

### Backend (Django)

1. **Set up the server:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # IMPORTANT: Install Cairo for PDF receipts
   sudo apt-get install build-essential libcairo2-dev pkg-config
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Run migrations and collect static files:**
   ```bash
   python manage.py migrate
   python manage.py initialize_system
   python manage.py collectstatic --noinput
   ```

4. **Run with Gunicorn:**
   ```bash
   pip install gunicorn
   gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
   ```

### Frontend (React)

1. **Build the production bundle:**
   ```bash
   # From project root
   npm install
   REACT_APP_API_URL=https://your-domain.com/api npm run build
   ```

2. **Serve the `build/` directory** with Nginx, Apache, or any static file server.

---

## Nginx Reverse Proxy

Example Nginx configuration for serving both frontend and backend:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (React static files)
    location / {
        root /var/www/eklavya/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

---

## Database

### Development

SQLite is used by default (`backend/db.sqlite3`). No configuration needed.

### Production

Switch to PostgreSQL:

1. Install the PostgreSQL driver:
   ```bash
   pip install psycopg2-binary
   ```

2. Update `backend/.env`:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/eklavya_db
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

---

## Security Checklist

Before deploying to production:

- [ ] Set `DEBUG=False`
- [ ] Generate a strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set strict `CORS_ALLOWED_ORIGINS`
- [ ] Change the default admin password
- [ ] Enable HTTPS (TLS/SSL)
- [ ] Set up database backups
- [ ] Configure proper logging
- [ ] Add rate limiting to auth endpoints
