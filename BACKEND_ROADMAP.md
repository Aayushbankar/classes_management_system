# Backend Roadmap & Technical Specification

## 1. Objective

Build a complete enterprise-grade backend for the Eklavya Classes administrative dashboard. The backend will support branch-aware operations, fee management, student onboarding, timetable scheduling, test reminders, notifications, and role-based access.

This roadmap includes:
- architecture and app design
- data models
- API routes
- feature delivery phases
- implementation tasks
- future enhancements

---

## 2. High-Level Architecture

### 2.1 Platform
- Django 4.x backend
- Django REST Framework for API
- PostgreSQL (or SQLite for dev)
- JWT authentication with refresh tokens
- Celery + Redis for background scheduling
- CORS support for React frontend
- Environment-based config using `.env`

### 2.2 Key Design Principles
- modular apps per domain
- branch-level data isolation
- role-based authorization
- API-first headless design
- reliable notification delivery
- clear audit and entity ownership

---

## 3. Application Modules

### 3.1 authentication
- custom `User` model with roles
- JWT login, refresh, logout
- profile retrieval and update
- password change
- role and branch assignment

### 3.2 branches
- branch metadata and admin-level branch listing
- branch filtering support for all relevant resources

### 3.3 students
- student profile data and onboarding
- bulk CSV/Excel import
- branch / standard / batch relationships
- search and list filtering

### 3.4 teachers
- teacher profile management
- subject specialization
- branch and schedule assignments

### 3.5 finance
- fee ledger model supporting partial payments
- manual payment entry for cash/cheque/UPI
- fee status calculation and overdue classification
- dashboard metrics for expected vs collected vs pending

### 3.6 timetable
- schedule slots with day/time/subject/teacher
- branch and standard hierarchy
- conflict validation on teacher assignments

### 3.7 tests
- exam/test scheduling per branch and standard
- syllabus and notification metadata
- upcoming tests endpoint

### 3.8 notifications
- in-app alert records
- read/unread state
- scheduled reminder creation
- branch-level notification delivery

### 3.9 reports
- dashboard summary endpoints
- analytics queries for revenue and student status
- optional CSV export endpoints

---

## 4. Data Model Specification

### 4.1 Branch
- `id`
- `name`
- `code`
- `address`
- `contact_details`
- `is_active`
- `created_at`, `updated_at`

### 4.2 User
- `id`
- `username`
- `email`
- `role` (`admin`, `branch_manager`, `teacher`)
- `branch` FK
- `first_name`, `last_name`
- `is_active`
- `created_at`, `updated_at`

### 4.3 Student
- `id`
- `branch` FK
- `name`
- `roll_number`
- `standard`
- `section`
- `batch_time`
- `dob`
- `gender`
- `address`
- `phone`
- `parent_name`
- `parent_phone`
- `admission_date`
- `status`
- `profile_image`
- `created_at`, `updated_at`

### 4.4 Teacher
- `id`
- `branch` FK
- `name`
- `email`
- `phone`
- `subject`
- `joining_date`
- `profile_image`
- `created_at`, `updated_at`

### 4.5 Classroom
- `id`
- `branch` FK
- `standard`
- `section`
- `capacity`
- `class_teacher` FK to Teacher
- `batch_time`
- `created_at`, `updated_at`

### 4.6 FeePayment
- `id`
- `branch` FK
- `student` FK
- `amount_due`
- `amount_paid`
- `pending_amount`
- `payment_mode` (`cash`, `cheque`, `upi`)
- `payment_date`
- `reference`
- `remarks`
- `status` (`paid`, `partial`, `pending`, `overdue`)
- `created_by` FK to User
- `created_at`, `updated_at`

### 4.7 TimetableSlot
- `id`
- `branch` FK
- `standard`
- `day_of_week`
- `start_time`
- `end_time`
- `subject`
- `teacher` FK
- `room`
- `created_at`, `updated_at`

### 4.8 TestSchedule
- `id`
- `branch` FK
- `standard`
- `subject`
- `test_date`
- `syllabus`
- `created_by` FK to User
- `status`
- `created_at`, `updated_at`

### 4.9 Notification
- `id`
- `branch` FK
- `recipient` FK to User (nullable for broadcast)
- `title`
- `message`
- `type` (`reminder`, `system`, `manual`)
- `source` (`test_schedule`, `workflow`, `admin`)
- `is_read`
- `created_at`, `updated_at`

### 4.10 Optional models
- `Attendance`
- `Result`
- `Notice`
- `ImportJob`

---

## 5. API Route Specification

### 5.1 Authentication
- `POST /api/auth/login/`
- `POST /api/auth/register/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/profile/`
- `PUT /api/auth/profile/`
- `POST /api/auth/change-password/`
- `POST /api/auth/logout/`
- `GET /api/auth/health/`

### 5.2 Branches
- `GET /api/branches/`
- `GET /api/branches/{id}/`
- `POST /api/branches/`
- `PUT /api/branches/{id}/`
- `DELETE /api/branches/{id}/`

### 5.3 Students
- `GET /api/students/`
- `GET /api/students/{id}/`
- `POST /api/students/`
- `PUT /api/students/{id}/`
- `DELETE /api/students/{id}/`
- `POST /api/students/import/` (optional, offline migration support)
- `GET /api/students/{id}/fees/`

### 5.4 Teachers
- `GET /api/teachers/`
- `GET /api/teachers/{id}/`
- `POST /api/teachers/`
- `PUT /api/teachers/{id}/`
- `DELETE /api/teachers/{id}/`

### 5.5 Classrooms
- `GET /api/classrooms/`
- `GET /api/classrooms/{id}/`
- `POST /api/classrooms/`
- `PUT /api/classrooms/{id}/`
- `DELETE /api/classrooms/{id}/`

### 5.6 Finance
- `GET /api/fees/`
- `GET /api/fees/{id}/`
- `POST /api/fees/`
- `PUT /api/fees/{id}/`
- `DELETE /api/fees/{id}/`
- `POST /api/fees/{id}/payments/`
- `GET /api/dashboard/fee-summary/`

### 5.7 Timetable
- `GET /api/timetable/`
- `GET /api/timetable/{id}/`
- `POST /api/timetable/`
- `PUT /api/timetable/{id}/`
- `DELETE /api/timetable/{id}/`
- `GET /api/timetable/conflicts/`

### 5.8 Test Scheduling
- `GET /api/tests/`
- `GET /api/tests/{id}/`
- `POST /api/tests/`
- `PUT /api/tests/{id}/`
- `DELETE /api/tests/{id}/`
- `GET /api/tests/upcoming/`

### 5.9 Notifications
- `GET /api/notifications/`
- `GET /api/notifications/{id}/`
- `POST /api/notifications/`
- `PUT /api/notifications/{id}/read/`
- `DELETE /api/notifications/{id}/`

### 5.10 Dashboard / Reports
- `GET /api/dashboard/revenue/`
- `GET /api/dashboard/student-status/`
- `GET /api/dashboard/test-reminders/`
- `GET /api/reports/fees/`
- `GET /api/reports/timetable/`

---

## 6. Phase-Based Delivery Roadmap

### Phase 1: Core foundation
- [ ] Finalize backend architecture and app modules
- [ ] Implement authentication and custom user roles
- [ ] Create branch model and branch-level filtering
- [ ] Build student CRUD API (manual student onboarding is the primary path)
- [ ] Build teacher CRUD API
- [ ] Create classroom/standard model and API
- [ ] Add `FeePayment` ledger model and basic fee APIs
- [ ] Add `GET /api/auth/health/`

### Phase 2: Operational workflows
- [ ] Add bulk student import API (secondary offline migration support)
- [ ] Add timetable slot model and conflict validation
- [ ] Add test schedule model and service
- [ ] Create notification model
- [ ] Create in-app notification read/unread workflow
- [ ] Add dashboard summary endpoints
- [ ] Add branch/standard filter support across key endpoints

### Phase 3: Enterprise polish
- [ ] Add Celery worker and scheduled reminder job
- [ ] Add API pagination, filtering, search, and ordering
- [ ] Add OpenAPI / Swagger docs
- [ ] Add audit metadata and soft delete support if required
- [ ] Create Docker dev/prod setup
- [ ] Add logging and basic monitoring

### Phase 4: Optional advanced delivery
- [ ] CSV / Excel download and export endpoints
- [ ] Multi-branch consolidated analytics report
- [ ] Role-based dashboards per admin/manager
- [ ] History and activity log for key records
- [ ] Admin UI enhancements for smarter filter state

---

## 7. Technical tasks and implementation checklist

### Setup and configuration
- [ ] Create Django apps: `authentication`, `branches`, `students`, `teachers`, `finance`, `timetable`, `tests`, `notifications`, `reports`
- [ ] Configure `AUTH_USER_MODEL`
- [ ] Configure DRF default auth and permissions
- [ ] Configure CORS and env variables

### Authentication & authorization
- [ ] Build custom user model with roles
- [ ] Add branch relationship to users
- [ ] Implement JWT login and refresh
- [ ] Create permission classes for admin/branch manager/teacher
- [ ] Add profile endpoints

### Core domain models
- [ ] Build `Branch` model
- [ ] Build `Student` model
- [ ] Build `Teacher` model
- [ ] Build `Classroom` model
- [ ] Build `FeePayment` ledger model
- [ ] Build `TimetableSlot` model
- [ ] Build `TestSchedule` model
- [ ] Build `Notification` model

### Data import and onboarding
- [ ] Implement CSV upload endpoint for students
- [ ] Validate imported columns and rows
- [ ] Create import summary response

### Payment and fee workflow
- [ ] Build partial payment logic and status calculator
- [ ] Build ledger entry API
- [ ] Add overdue classification on retrieval
- [ ] Add analytics endpoint for fee summary

### Schedule management
- [ ] Build timetable CRUD
- [ ] Add teacher conflict validation
- [ ] Add branch/standard timetable listing

### Test scheduling and reminders
- [ ] Build test schedule CRUD
- [ ] Build upcoming tests API
- [ ] Add scheduled reminder generator for notifications

### Notifications and alerts
- [ ] Build notification CRUD
- [ ] Add API for unread count
- [ ] Add API for marking notifications read
- [ ] Add branch-aware notification delivery

### Dashboard and reports
- [ ] Implement dashboard endpoints
- [ ] Build fee summary API
- [ ] Build student and branch analytics endpoints
- [ ] Add report export endpoints

### Enterprise delivery
- [ ] Add Celery + Redis worker
- [ ] Create periodic reminder tasks
- [ ] Add Dockerfiles and `docker-compose.yml`
- [ ] Create API docs and schema
- [ ] Add logging and environment-specific settings

---

## 8. Quality and enterprise consideration

### Security
- secure JWT handling
- role-based permissions
- branch-level data isolation
- no public student portal in MVP

### Scalability
- modular app architecture
- clear resource-based APIs
- background worker for async tasks
- pagination and filtering

### Reliability
- validation and business rules in serializers
- conflict detection in timetable
- audit fields on all records
- branch-aware query filtering

### Maintainability
- separate apps per domain
- reusable serializer components
- shared utility modules for filters and permissions
- clear API route naming

---

## 9. Extra features we can deliver later

1. **Teacher login portal**
2. **Student/parent portal**
3. **Online payment gateway integration**
4. **Attendance and result analytics**
5. **SMS/WhatsApp notifications**
6. **Role-based dashboards and widgets**
7. **Soft delete + historical audit trail**
8. **Multi-branch consolidated reporting**
9. **Export to Excel / PDF**
10. **Real-time push notifications with WebSockets**

---

## 10. Notes for resuming development

- Current app is only auth + login/dashboard skeleton.
- We must build the full domain model stack from scratch.
- This plan assumes internal admin users only.
- Backend must remain headless and API-driven for React frontend.
- Future work should include Celery for reminders and Docker for deployment.
