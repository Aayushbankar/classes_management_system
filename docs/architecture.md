# Architecture Overview

System architecture and design decisions for the Classes Management System.

---

## System Overview

The Classes Management System is a full-stack web application with a clear separation between a **React single-page application** (SPA) frontend and a **Django REST Framework** headless API backend.

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │           React SPA (Port 3001)                ││
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          ││
│  │  │Login │ │Dash- │ │Stud- │ │Fees  │  ...      ││
│  │  │Page  │ │board │ │ents  │ │Page  │           ││
│  │  └──────┘ └──────┘ └──────┘ └──────┘          ││
│  │              ↕ api.js (JWT Auth)                ││
│  └─────────────────────────────────────────────────┘│
└───────────────────────┬─────────────────────────────┘
                        │ HTTP/JSON (REST)
┌───────────────────────┴─────────────────────────────┐
│              Django REST API (Port 8000)             │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   Auth     │  │  Students  │  │  Finance   │     │
│  │  (JWT)     │  │            │  │            │     │
│  ├────────────┤  ├────────────┤  ├────────────┤     │
│  │  Teachers  │  │  Branches  │  │  Schedule  │     │
│  ├────────────┤  ├────────────┤  ├────────────┤     │
│  │ Notifica-  │  │  Reports   │  │            │     │
│  │   tions    │  │            │  │            │     │
│  └────────────┘  └────────────┘  └────────────┘     │
│                       ↕                              │
│              ┌────────────────┐                      │
│              │    SQLite /    │                      │
│              │  PostgreSQL    │                      │
│              └────────────────┘                      │
└──────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Django Project Layout

The backend follows a **modular app-per-domain** pattern. Each Django app owns its own models, serializers, views, and URL configuration.

| App | Purpose | Key Models |
|-----|---------|------------|
| `config` | Django settings, root URL routing, WSGI | — |
| `authentication` | Custom User model, JWT auth, role management | `User` |
| `branches` | Branch CRUD and branch-level filtering | `Branch` |
| `students` | Student profiles, enrollment, fee tracking | `Student` |
| `teachers` | Teacher profiles and subject assignments | `Teacher` |
| `finance` | Fee payment ledger and payment recording | `Payment` |
| `schedule` | Timetable slots with conflict detection | `TimetableSlot` |
| `notifications` | In-app notification delivery | `Notification` |
| `reports` | Dashboard analytics and fee summaries | — (views only) |

### Authentication Flow

```
1. Client sends POST /api/auth/login/ with username + password
2. Backend validates credentials and returns:
   - JWT access token (60 min expiry)
   - JWT refresh token (1 day expiry)
   - User profile (id, role, branch)
3. Client stores tokens in localStorage
4. All subsequent API calls include:
   Authorization: Bearer <access_token>
5. When access token expires, client uses refresh token to get a new one
```

### Role-Based Access Control

```
Owner (Global)
├── Full CRUD on all resources across all branches
├── Create/manage Admin users
├── Access all dashboards and reports
│
Admin (Branch-Scoped)
├── Full CRUD on own branch's resources
├── Create/manage Assistant users in own branch
├── Access branch-level dashboards
│
Assistant (Branch-Scoped, Read-Only)
└── View own branch's data only
```

Branch filtering is automatically applied in the backend based on the authenticated user's role and branch assignment.

### Key Design Decisions

1. **Headless API** — No server-rendered HTML. The backend is purely a REST API consumed by the React frontend.
2. **Branch-level isolation** — Admin and Assistant users can only access data belonging to their assigned branch.
3. **Computed fee fields** — `fee_left` is computed as `decided_fee - paid_fee` at the serializer level, not stored redundantly.
4. **Timetable conflict detection** — The backend validates teacher schedule conflicts when creating/updating timetable slots.
5. **PDF Generation (Cairo)** — Professional receipts are generated server-side using `xhtml2pdf`. This requires system-level Cairo libraries on the host or container.
6. **Structured Logging** — All authentication events and financial transactions are logged to both stdout (for container monitoring) and local files.

---

## Frontend Architecture

### Component Hierarchy

```
<App>
├── <Login />                     # Auth page (unauthenticated)
└── <ProtectedRoute>
    └── <Layout>                  # Navigation shell + theme system
        ├── <DashboardPage />     # Analytics dashboard
        ├── <StudentsPage />      # Student directory + CRUD
        ├── <StudentDetailPage /> # Individual student profile
        ├── <TeachersPage />      # Teacher directory + CRUD
        ├── <TeacherDetailPage /> # Individual teacher profile
        ├── <FeesPage />          # Revenue dashboard + payment ledger
        ├── <TimetablePage />     # Weekly schedule manager
        ├── <BranchesPage />      # Branch management
        ├── <UsersPage />         # User administration
        ├── <NotificationsPage /> # Alert center
        ├── <ReportsPage />       # Reports & analytics
        └── <ProfilePage />       # User profile settings
```

### Key Frontend Modules

| Module | File | Responsibility |
|--------|------|----------------|
| API Client | `src/api.js` | Centralized fetch wrapper with JWT injection, token refresh, role helpers |
| Config | `src/config.js` | Environment-based API URL configuration |
| Routing | `src/App.js` | React Router v7 route definitions |
| Layout | `src/Layout.js` | Sidebar navigation, theme switcher, mobile bottom nav |
| Error Boundary | `src/ErrorBoundary.js` | Catch and display React rendering errors |
| Design System | `src/index.css` | CSS custom properties (tokens), glassmorphism, responsive grid |

### Theming System

The UI supports multiple themes via CSS custom properties:

- **Modern Azure** — Professional blue-toned light theme
- **Midnight Pro** — Dark mode with deep purples
- **Royal Velvet** — Rich purple and gold accents
- **Crimson Sunset** — Warm red-orange tones

Themes are toggled by applying a `data-theme` attribute to the root `<html>` element, which swaps the CSS custom property values.

### State Management

The app uses **React local state** (`useState` / `useEffect` / `useMemo`) — no external state management library. Each page manages its own data fetching and state. The API client (`api.js`) handles authentication state via `localStorage`.

---

## Data Flow

```
User Action → React Component → api.js (fetch + JWT) → Django View
                                                           ↓
                                                      Serializer
                                                           ↓
                                                      Database
                                                           ↓
                                                      Response JSON
                                                           ↓
                                                      React Component → UI Update
```

---

## API URL Structure

All API endpoints are prefixed with `/api/`:

| Prefix | App |
|--------|-----|
| `/api/auth/` | Authentication & user management |
| `/api/branches/` | Branch operations |
| `/api/students/` | Student operations |
| `/api/teachers/` | Teacher operations |
| `/api/finance/` | Fee payment operations |
| `/api/schedule/` | Timetable operations |
| `/api/notifications/` | Notification operations |
| `/api/reports/` | Dashboard & analytics |
| `/api/docs/` | Swagger UI |
| `/api/redoc/` | ReDoc documentation |

See [API Reference](api-reference.md) for full endpoint details.
