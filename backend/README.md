# Classes Management System — Backend API

Django REST Framework headless API powering the Classes Management System.

## Quick Reference

```bash
# Activate virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Run migrations
python manage.py migrate

# Initialize system (creates default admin + seed data)
python manage.py initialize_system

# Start development server
python manage.py runserver
```

> **Tip:** Running `python run.py` from the project root handles all of this automatically.

## Default Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |
| Role | Owner |

## Project Structure

```
backend/
├── config/              # Django settings, URLs, WSGI
├── authentication/      # Custom User model, JWT, roles
├── branches/            # Branch CRUD
├── students/            # Student management
├── teachers/            # Teacher management
├── finance/             # Fee payments & ledger
├── schedule/            # Timetable slots
├── notifications/       # In-app alerts
├── reports/             # Dashboard analytics
├── manage.py
├── requirements.txt
├── .env.example
└── Dockerfile
```

## Documentation

| Document | Path |
|----------|------|
| Full Setup Guide | [docs/setup.md](../docs/setup.md) |
| API Reference | [docs/api-reference.md](../docs/api-reference.md) |
| Architecture | [docs/architecture.md](../docs/architecture.md) |
| Deployment | [docs/deployment.md](../docs/deployment.md) |

## API Docs (Interactive)

When the server is running:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/
