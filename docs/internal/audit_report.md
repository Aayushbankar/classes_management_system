# Eklavya App — Complete System Audit Report

> **Auditor**: Antigravity AI | **Date**: 25 April 2026  
> **Scope**: Full-stack review (Django REST + React), Security, UI/UX, Architecture, Feature Completeness

---

## Executive Summary

Eklavya is a coaching-class management system with a Django REST backend and React frontend. It manages **students, teachers, branches, fees, timetables, and notifications**. The app has a solid foundation with proper JWT authentication, role-based access control, and a responsive mobile-first UI. However, there are **critical security gaps**, **missing features for real-world coaching operations**, and **UI/UX issues on mobile** that need immediate attention before production deployment.

| Area | Score | Verdict |
|------|-------|---------|
| **Architecture** | 7/10 | Solid foundation, needs production hardening |
| **Security** | 4/10 | Critical vulnerabilities found |
| **UI/UX (Desktop)** | 8/10 | Clean, professional, theme-aware |
| **UI/UX (Mobile)** | 6/10 | Functional but needs polish |
| **Feature Completeness** | 5/10 | Core CRUD works, many real-world needs missing |
| **Code Quality** | 7/10 | Clean patterns, some inconsistencies |

---

## 1. Security Audit

### 🔴 CRITICAL Issues

> [!CAUTION]
> These must be fixed before ANY production deployment.

#### 1.1 Open Registration Endpoint
[register_view](file:///c:/Clients_App/eklavya-app/backend/authentication/views.py#L115-L134) uses `@permission_classes([AllowAny])`. **Anyone on the internet can create an account** with any role. There is no invite-only or admin-approval flow.

**Impact**: An attacker can register as an admin and access all data.  
**Fix**: Remove public registration or restrict it to owner/admin-initiated user creation only.

#### 1.2 JWT Tokens Stored in localStorage
[api.js L3](file:///c:/Clients_App/eklavya-app/src/api.js#L3) stores access tokens in `localStorage`. This is **vulnerable to XSS attacks** — any injected script can steal the token.

**Impact**: If any XSS vulnerability exists (even in a third-party library), all user sessions are compromised.  
**Fix**: Use `httpOnly` cookies for token storage. The backend already has `CORS_ALLOW_CREDENTIALS = True`.

#### 1.3 Insecure SECRET_KEY
[.env L1](file:///c:/Clients_App/eklavya-app/backend/.env#L1) contains `SECRET_KEY=django-insecure-eklavya-app-test-key-change-in-production-123456`. The JWT signing key is derived from this.

**Impact**: Anyone who can guess this key can forge JWT tokens for any user.  
**Fix**: Generate a proper 50+ character random secret key for production.

#### 1.4 DEBUG = True in Production Config
[settings.py L10](file:///c:/Clients_App/eklavya-app/backend/config/settings.py#L10) defaults to `DEBUG=True`. When DEBUG is on:
- Full stack traces are exposed to users
- `CORS_ALLOW_ALL_ORIGINS = True` is enabled ([L124](file:///c:/Clients_App/eklavya-app/backend/config/settings.py#L124))
- Django admin shows sensitive debug info

#### 1.5 No Rate Limiting
No rate limiting on login, registration, or any API endpoint. **Brute-force attacks** on login are trivially possible.

**Fix**: Add `django-ratelimit` or `drf-throttling` to login and sensitive endpoints.

### 🟡 MEDIUM Issues

#### 1.6 Client-Side Role Checks
[api.js L92-105](file:///c:/Clients_App/eklavya-app/src/api.js#L92-L105) — `isAdmin()`, `isOwner()`, `canManageUsers()` all read from `localStorage`. A user can modify their stored role in browser DevTools to see admin UI elements (though backend still enforces permissions, this leaks admin-only UI and creates confusion).

#### 1.7 No Token Refresh Logic
The frontend has no automatic token refresh. When the 60-minute access token expires, users are silently logged out. The `/api/token/refresh/` endpoint exists but is never called.

#### 1.8 SQLite in Production
[settings.py L68-73](file:///c:/Clients_App/eklavya-app/backend/config/settings.py#L68-L73) uses SQLite. This doesn't support concurrent writes and will corrupt data under load.

**Fix**: Migrate to PostgreSQL for production.

#### 1.9 No HTTPS Enforcement
No `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, or `SESSION_COOKIE_SECURE` settings. All data including JWT tokens transmitted in plaintext.

#### 1.10 CSV Import Has No File Validation
[students/views.py L52-96](file:///c:/Clients_App/eklavya-app/backend/students/views.py#L52-L96) accepts file uploads without:
- File size limits
- File type validation (accepts any file, not just CSV)
- Content sanitization

---

## 2. Architecture Review

### System Architecture Diagram

```mermaid
graph TB
    subgraph Frontend ["React SPA (Port 3001)"]
        UI[React Components]
        API_CLIENT[api.js Client]
        ROUTER[React Router]
        THEMES[Theme System]
    end

    subgraph Backend ["Django REST (Port 8000)"]
        AUTH[Authentication Module]
        STUDENTS[Students Module]
        TEACHERS[Teachers Module]
        FINANCE[Finance Module]
        SCHEDULE[Schedule Module]
        BRANCHES[Branches Module]
        NOTIFICATIONS[Notifications Module]
        REPORTS[Reports/Dashboard]
    end

    subgraph Database
        SQLITE[(SQLite)]
    end

    UI --> API_CLIENT
    API_CLIENT -->|JWT Bearer Token| AUTH
    API_CLIENT --> STUDENTS
    API_CLIENT --> TEACHERS
    API_CLIENT --> FINANCE
    API_CLIENT --> SCHEDULE
    API_CLIENT --> BRANCHES
    API_CLIENT --> NOTIFICATIONS
    API_CLIENT --> REPORTS

    AUTH --> SQLITE
    STUDENTS --> SQLITE
    TEACHERS --> SQLITE
    FINANCE --> SQLITE
    SCHEDULE --> SQLITE
    BRANCHES --> SQLITE
    NOTIFICATIONS --> SQLITE
```

### Data Model Relationships

```mermaid
erDiagram
    Branch ||--o{ Student : has
    Branch ||--o{ Teacher : has
    Branch ||--o{ User : has
    Branch ||--o{ TimetableSlot : has
    Branch ||--o{ Notification : targets
    Student ||--o{ FeePayment : pays
    Teacher ||--o{ TimetableSlot : teaches
    User ||--o{ UserActionLog : creates
```

### Architecture Strengths
- **Clean modular Django apps** — each domain (students, teachers, finance) is its own app
- **Proper JWT auth** with SimpleJWT
- **Branch-scoped data isolation** — non-superusers only see their branch's data
- **Audit trail** via `UserActionLog`
- **OpenAPI/Swagger** docs auto-generated

### Architecture Weaknesses
- **No caching layer** — every page load hits the database directly
- **No background task queue** — notifications, reports, and CSV imports run synchronously
- **No file storage strategy** — no media/uploads configuration
- **No logging/monitoring** — no structured logging, no error tracking (Sentry, etc.)
- **Tight coupling** — the reports module imports directly from all other modules
- **Mock data in production code** — [reports/views.py L139-145](file:///c:/Clients_App/eklavya-app/backend/reports/views.py#L139-L145) returns hardcoded values for `attendance_percent`, `results_percent`, `total_courses`

---

## 3. UI/UX Audit (Mobile-First)

### 3.1 Login Page ✅
Clean, centered, high contrast. No issues.

### 3.2 Dashboard — Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| KPI label contrast | 🟡 Medium | "Total Students", "Active Branches" text is nearly invisible on dark cards in Midnight theme |
| Chart not touch-friendly | 🟡 Medium | Area chart tooltips require precise tap — no pinch/zoom support |
| Bottom nav overlap | 🔴 High | Content at page bottom gets hidden behind the fixed bottom nav bar |

### 3.3 Student Directory — Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| Table overflow on mobile | 🟡 Medium | Table columns extend beyond viewport width with no horizontal scroll indicator |
| No student detail deep-link | 🟡 Medium | Clicking a student name goes to a detail page, but there's no back button |
| No bulk actions | 🟡 Medium | Can't select multiple students for batch operations |

### 3.4 Timetable — Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| **Table overflow** | 🔴 High | 5-column table is completely unusable on 390px screens — columns clip and text truncates |
| No card-view fallback | 🔴 High | Unlike Students/Fees pages, Timetable has no mobile card layout |
| Branch filter missing | 🟡 Medium | The branch dropdown doesn't appear because it falls outside the viewport |

### 3.5 Fees Dashboard ✅
Generally well-designed. Filter drawer works. Revenue cards are clear.

### 3.6 Reports Page ✅
Clean layout with progress bars and breakdown.

### 3.7 Notifications — Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| Raw ISO timestamps | 🟡 Medium | Shows `2026-04-25T13:09:21.123Z` instead of "5 min ago" |
| No notification actions | 🟡 Medium | Can't dismiss or delete notifications |
| No empty state | 🟢 Low | Shows blank space when no notifications exist |

### 3.8 Profile Page — Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| **Horizontal form layout** | 🔴 High | Labels sit beside inputs, making input fields tiny (< 100px wide) on mobile |
| No profile picture | 🟢 Low | No avatar/image upload capability |
| Change password UX | 🟡 Medium | No password strength indicator |

### 3.9 Branches Page ✅
Well-designed card grid. Hover actions work. CRUD flows are clean.

---

## 4. Feature Completeness — What's Missing for a Real Coaching Business

### 🔴 Must-Have (Missing)

| Feature | Why It's Needed |
|---------|----------------|
| **Attendance Tracking** | Core coaching operation — daily mark attendance per batch. Currently shows mock "95%" |
| **Exam/Test Results** | Record and analyze student performance. Test schedule exists but no results module |
| **Parent Communication** | SMS/WhatsApp notifications for fees, attendance, test dates |
| **Receipt Generation** | Print/PDF fee receipts for parents — legally required |
| **Student Photo/ID** | No media upload support at all |
| **Batch Management** | No dedicated batch CRUD — `batch_time` is just a free-text field on Student model |

### 🟡 Should-Have (Missing)

| Feature | Why It's Needed |
|---------|----------------|
| **Expense Tracking** | Only tracks income (fees). No rent, salary, material costs |
| **Teacher Salary Management** | No payroll module |
| **Staff Attendance** | Track teacher/staff presence |
| **Academic Calendar** | Holiday management, session planning |
| **Data Export** | No PDF/Excel export of reports, student lists |
| **Backup & Restore** | No database backup strategy |
| **Multi-language** | Hindi/regional language support for parent-facing features |

### 🟢 Nice-to-Have (Missing)

| Feature | Why It's Needed |
|---------|----------------|
| PWA Support | Install as app on mobile — offline capability |
| Dark mode auto-detect | Follow system preference |
| Dashboard customization | Let users pin/rearrange KPI widgets |
| Push notifications | Browser push for fee reminders |
| WhatsApp Business API | Auto-send fee reminders to parents |

---

## 5. Code Quality Observations

### Good Practices ✅
- Proper use of `select_related()` to avoid N+1 queries
- Branch-scoped querysets prevent data leaks
- `ProtectedError` handling on branch deletion
- User action audit logging
- Clean separation of serializers from views

### Issues Found ⚠️
- **No test suite** — zero unit tests, zero integration tests
- **No CI/CD** — no GitHub Actions or deployment pipeline
- **Hardcoded mock data** in dashboard stats (`attendance_percent: 95`, `results_percent: 90`)
- **No input validation** on frontend forms — can submit empty student names
- **No pagination** — student and payment lists load ALL records at once. Will break at 1000+ records
- **No error boundaries** in React — one component crash kills the whole app
- **Mixed date formats** — some ISO, some display-formatted

---

## 6. Production Readiness Checklist

| Item | Status | Action Required |
|------|--------|-----------------|
| HTTPS/TLS | ❌ | Configure SSL certificate + enforce HTTPS |
| SECRET_KEY | ❌ | Generate proper production secret |
| DEBUG mode | ❌ | Set `DEBUG=False` for production |
| Database | ❌ | Migrate from SQLite to PostgreSQL |
| CORS policy | ❌ | Remove `CORS_ALLOW_ALL_ORIGINS` |
| Rate limiting | ❌ | Add throttling to auth endpoints |
| Token storage | ❌ | Move JWT to httpOnly cookies |
| Registration | ❌ | Remove/restrict public registration |
| Pagination | ❌ | Add to all list endpoints |
| Error tracking | ❌ | Add Sentry or equivalent |
| Logging | ❌ | Add structured logging |
| Backups | ❌ | Automated database backups |
| Tests | ❌ | Add unit + integration tests |
| CI/CD | ❌ | GitHub Actions pipeline |
| Static files | ❌ | Configure CDN/whitenoise for production |
| Token refresh | ❌ | Implement auto-refresh in frontend |

---

## 7. Prioritized Action Plan

### Phase 1: Security Hardening (1-2 days)
1. Remove or restrict `register_view` to admin-only
2. Generate proper SECRET_KEY
3. Add rate limiting to login endpoint
4. Set `DEBUG=False`, configure proper CORS
5. Add pagination to all list endpoints

### Phase 2: Mobile UX Polish (2-3 days)
1. Fix Timetable page mobile layout (card view)
2. Fix Profile page form layout (stack vertically)
3. Fix bottom nav content overlap (add padding)
4. Improve dark theme contrast for muted text
5. Format dates to human-readable strings

### Phase 3: Missing Core Features (1-2 weeks)
1. Attendance tracking module
2. Test results recording
3. Fee receipt PDF generation
4. Batch management as proper entity
5. Data export (Excel/PDF)

### Phase 4: Production Deployment (3-5 days)
1. Migrate to PostgreSQL
2. Configure HTTPS
3. Move JWT to httpOnly cookies
4. Set up CI/CD pipeline
5. Add error tracking (Sentry)
6. Deploy to cloud (Railway/Render/AWS)

---

> [!IMPORTANT]
> **Bottom line**: The app is a strong MVP with good architecture fundamentals. However, it is **NOT production-ready** due to critical security flaws (open registration, insecure secret key, no rate limiting). The mobile UX needs targeted fixes on 3 specific pages. For a coaching business, the biggest feature gaps are **attendance tracking** and **receipt generation** — these are daily operational necessities.
