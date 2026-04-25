# Django Backend Setup Guide

## Quick Start (Windows)

### Step 1: Open PowerShell & Navigate to Backend
```powershell
cd c:\Clients_App\eklavya-app\backend
```

### Step 2: Create Virtual Environment
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

### Step 3: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Configure Environment
1. Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

2. Edit `.env` file (open with text editor) and update:
   - `SECRET_KEY=your-secret-key-here` → Generate a new secret key (you can use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
   - `DEBUG=True` (for development)
   - `CORS_ALLOWED_ORIGINS=http://localhost:3000` (your frontend URL)

### Step 5: Run Migrations
```powershell
python manage.py makemigrations
python manage.py migrate
```

### Step 6: Create Default Admin User
```powershell
python manage.py create_default_admin
```

This creates a superuser with:
- **Username:** `admin`
- **Password:** `admin`
- **Email:** `admin@example.com`

### Step 7: Start Development Server
```powershell
python manage.py runserver
```

✅ Server running at: `http://localhost:8000`

## Test the API

### Health Check
```
GET http://localhost:8000/api/auth/health/
```

### Register a New User
```
POST http://localhost:8000/api/auth/register/
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "secure123",
  "password_confirm": "secure123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login (using default admin credentials)
```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

Response:
```json
{
  "user": {...},
  "access": "eyJ0eXAi...",
  "refresh": "eyJ0eXAi..."
}
```

**Copy the `access` token to use in authenticated requests**

### Get User Profile (requires access token)
```
GET http://localhost:8000/api/auth/profile/
Authorization: Bearer <access_token>
```

## Frontend Integration

The frontend is already configured to:
- Send login requests to `http://localhost:8000/api/auth/login/`
- Store tokens in localStorage
- Use tokens for authenticated requests

**Make sure both servers are running:**
1. Django backend: `http://localhost:8000`
2. React frontend: `http://localhost:3000`

## Troubleshooting

### CORS Error in Console
- Make sure `CORS_ALLOWED_ORIGINS` in `.env` matches your frontend URL
- Default: `http://localhost:3000`

### Port Already in Use
```powershell
python manage.py runserver 8001  # Use different port
```

### Database Error
```powershell
python manage.py migrate --run-syncdb
```

### Can't Activate Virtual Environment
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Project Structure

```
backend/
├── config/                  # Django configuration
│   ├── settings.py         # All settings
│   ├── urls.py             # URL routing
│   ├── wsgi.py             # WSGI app
│   └── __init__.py
├── authentication/          # Authentication app
│   ├── models.py           # User model
│   ├── views.py            # API endpoints
│   ├── serializers.py      # Data serializers
│   ├── urls.py             # App routes
│   ├── admin.py            # Admin interface
│   ├── apps.py             # App config
│   ├── migrations/         # DB migrations
│   └── __init__.py
├── manage.py               # Django CLI
├── requirements.txt        # Dependencies
├── .env                    # Environment (created)
├── .env.example            # Example env
├── .gitignore              # Git ignore
├── db.sqlite3              # Database (created)
└── README.md               # Full documentation
```

## Next Steps

1. ✅ Backend setup complete
2. ✅ Frontend already configured
3. Start both servers and test the login flow
4. Add more features as needed (profile updates, password reset, etc.)

## Admin Panel

Access Django admin at: `http://localhost:8000/admin/`
- Username: (whatever you set during `createsuperuser`)
- Password: (whatever you set during `createsuperuser`)

Manage users and data directly from here!

