# Development Context & Backend/Frontend Plan

## Current app status

### Frontend
- React app with two pages:
  - `/` → `Login` page
  - `/dashboard` → `Dashboard` page
- `src/config.js` contains backend base URL logic:
  - Uses `process.env.REACT_APP_API_URL` or default `http://localhost:8000/api`
- `src/login.js` sends login requests to `${API_URL}/auth/login/`
- `src/Dashboard.js` loads current profile from `${API_URL}/auth/profile/`
- `.env.local` exists with default frontend API URL
- `.env.example` exists for frontend env variables

### Backend
- Django project in `backend/`
- Custom authentication app `authentication/`
- JWT auth integration using `djangorestframework-simplejwt`
- Auth routes currently configured:
  - `POST /api/auth/register/`
  - `POST /api/auth/login/`
  - `GET /api/auth/profile/`
  - `PUT /api/auth/profile/update/`
  - `POST /api/auth/change-password/`
  - `POST /api/auth/logout/`
  - `GET /api/auth/health/`
- Custom `User` model defined in `authentication/models.py`
- `AUTH_USER_MODEL = 'authentication.User'` configured in `backend/config/settings.py`

### Dev helper
- `run.py` in root starts both backend and frontend simultaneously
- It uses the backend virtualenv Python if available
- It runs `npm start` for frontend with `shell=True` for Windows compatibility

## Immediately known issues

- `run.py` currently has some duplicate `if __name__ == '__main__'` lines at the end and may need cleanup
- Frontend previously showed connection refused at `http://localhost:8000/api/auth/login/`
- Backend installation required fixing `requirements.txt` versions for `djangorestframework-simplejwt` and `Pillow`

## Completed setup steps so far

1. Created backend venv and installed packages
2. Added `.env` for backend configuration
3. Created Django migrations and applied them
4. Created default admin user with credentials:
   - Username: `admin`
   - Password: `admin`
5. Added frontend config to use environment-based API URL

## Resume checklist

### Backend commands
```powershell
cd c:\Clients_App\eklavya-app\backend
venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py create_default_admin
```

### Start development
```powershell
cd c:\Clients_App\eklavya-app
python run.py
```

### Quick backend test
Open in browser:
- `http://localhost:8000/api/auth/health/`

## Information needed later before continuing development

Please answer these when you resume:

1. **Complete page list**
   - What are all the app pages/screens you want?
   - Which page is entry point after login?

2. **Page behavior**
   - For each page, what data should display?
   - Are there tables, cards, forms, search/filter controls?
   - What user actions are available on each page?

3. **Data entities / models**
   - Which main objects exist in the app?
   - Example: members, cases, levels, tasks, payments, reports, notifications

4. **Relationships and flow**
   - Does one entity belong to another? (e.g. member → case, case → level)
   - Does the app have hierarchical screens or nested lists?

5. **Roles and permissions**
   - Are there separate roles like admin / manager / user?
   - Should some pages or actions be restricted?

6. **Special requirements**
   - File upload, document storage, status updates, timeline/history, calendar, approval workflow

## Proposed backend API structure

Based on the current app and the intended member flow, the likely API structure will include:

- `POST /api/auth/login/`
- `POST /api/auth/register/`
- `GET /api/auth/profile/`
- `PUT /api/auth/profile/update/`
- `POST /api/auth/change-password/`
- `POST /api/auth/logout/`
- `GET /api/auth/health/`

And once the remaining pages are defined, we will add resources like:

- `GET /api/members/`
- `POST /api/members/`
- `GET /api/members/{id}/`
- `PUT /api/members/{id}/`
- `DELETE /api/members/{id}/`

- `GET /api/levels/`
- `GET /api/cases/`
- `POST /api/cases/`
- `GET /api/reports/`
- `POST /api/reports/`

This file will be updated once the full page/data requirements are available.

## Context dump for resuming later

- Project root: `c:\Clients_App\eklavya-app`
- Backend root: `c:\Clients_App\eklavya-app\backend`
- Frontend root: `c:\Clients_App\eklavya-app\src`
- Current working file: `run.py`
- Currently implemented features: login, dashboard, auth backend
- Pending work: page mapping, backend data models, API routes for all pages

## Next development step when ready

1. Finalize page list and data from user requirements
2. Define models for backend resources
3. Create serializers and viewsets for each resource
4. Wire frontend pages to new APIs
5. Add roles/permissions if needed
6. Improve run script and deployment config
