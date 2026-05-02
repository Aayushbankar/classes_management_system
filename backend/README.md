# Eklavya App - Django Headless API

This is a Django REST Framework API for the Eklavya App with JWT authentication.

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create .env File
```bash
copy .env.example .env
```

Edit `.env` and update:
- `SECRET_KEY`: Generate a strong secret key
- `DEBUG`: Set to False in production
- `CORS_ALLOWED_ORIGINS`: Add your frontend URL

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Default Owner User
```bash
python manage.py create_default_admin
```

This creates a superuser (with the **owner** role on first run) with credentials:
- **Username:** `admin`
- **Password:** `admin`
- **Role:** `owner`

*Note: If you run the project from the root directory using `python run.py`, migrations, admin creation, and initial data seeding are handled automatically.*

### 6. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

#### Register
- **POST** `/api/auth/register/`
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Login (Default Credentials)
- **POST** `/api/auth/login/`
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "",
    "last_name": "",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Get User Profile
- **GET** `/api/auth/profile/`
- **Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "",
  "last_name": "",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Update User Profile
- **PUT** `/api/auth/profile/update/`
- **Headers:** `Authorization: Bearer <access_token>`

```json
{
  "first_name": "Admin",
  "last_name": "User",
  "email": "newemail@example.com"
}
```

#### Change Password
- **POST** `/api/auth/change-password/`
- **Headers:** `Authorization: Bearer <access_token>`

```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123",
  "new_password_confirm": "newpass123"
}
```

#### Refresh Token
- **POST** `/api/token/refresh/`

```json
{
  "refresh": "<refresh_token>"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Logout
- **POST** `/api/auth/logout/`
- **Headers:** `Authorization: Bearer <access_token>`

#### Health Check
- **GET** `/api/auth/health/`

## Frontend Integration

### Store Tokens
After login, store the tokens in localStorage:
```javascript
const response = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();
localStorage.setItem('access_token', data.access);
localStorage.setItem('refresh_token', data.refresh);
```

### Use Tokens in Requests
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};

fetch('http://localhost:8000/api/auth/profile/', { headers })
```

## Project Structure
```
backend/
├── config/              # Django configuration
│   ├── settings.py     # Settings file
│   ├── urls.py         # URL routing
│   └── wsgi.py         # WSGI application
├── authentication/      # Authentication app
│   ├── models.py       # User model
│   ├── views.py        # API views
│   ├── serializers.py  # Serializers
│   ├── urls.py         # App URLs
│   └── admin.py        # Admin configuration
├── manage.py           # Django management
├── requirements.txt    # Dependencies
├── .env                # Environment variables
└── db.sqlite3          # SQLite database (generated)
```

## Notes

- JWT tokens expire after 60 minutes (configurable in settings)
- Refresh tokens expire after 1 day
- CORS is enabled for your frontend (configure in .env)
- Use `Authorization: Bearer <token>` header for all protected endpoints
- Password reset functionality can be added if needed

## Troubleshooting

### CORS Errors
Make sure `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL (default: `http://localhost:3000`)

### Token Expired
Use the refresh token endpoint to get a new access token without re-logging in

### Database Errors
Run migrations: `python manage.py migrate`

