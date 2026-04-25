# Backend API Contract and Data Schema

## 1. Overview

This document defines the exact backend data models and REST API contracts for the Eklavya Classes admin platform MVP.

The backend will be built as a Django + DRF headless API with the following core focus:
- Fees management and analytics
- Student onboarding with CSV import
- Branch and user management
- Test scheduling and reminder notifications
- Timetable conflict validation
- In-app notifications
- Audit metadata and soft-delete support

---

## 2. User Roles and Access

### Roles
- `admin`
  - Full access to all branches and all data
- `branch_manager`
  - Access only to own branch data

### Branch access rules
- `branch_manager` can only read and write records for their branch
- `admin` can access all branches

---

## 3. Data Models

### 3.1 Branch

Fields:
- `id` (UUID or integer)
- `name` (string)
- `code` (string)
- `address` (text)
- `contact_phone` (string)
- `contact_email` (string)
- `is_active` (boolean)
- `created_at` (datetime)
- `updated_at` (datetime)

### 3.2 User

Fields:
- `id`
- `username`
- `email`
- `role` (`admin`, `branch_manager`)
- `branch` (FK to Branch, nullable for admin)
- `first_name`
- `last_name`
- `is_active`
- `created_at`
- `updated_at`

### 3.3 Student

Fields:
- `id`
- `branch` (FK to Branch)
- `name`
- `parent_name`
- `contact_number`
- `address`
- `standard` (string or choice)
- `batch_time` (string/choice)
- `decided_fee` (decimal)
- `paid_fee` (decimal)
- `fee_left` (decimal, computed)
- `status` (`active`, `inactive`, `alumni`)
- `critical_notes` (text)
- `roll_number` (string or integer)
- `admission_date` (date)
- `is_deleted` (boolean)
- `created_at`
- `updated_at`
- `created_by` (FK User)
- `updated_by` (FK User)

### 3.4 Teacher

Fields:
- `id`
- `branch` (FK)
- `name`
- `email`
- `phone`
- `subject`
- `joining_date`
- `created_at`
- `updated_at`
- `is_deleted`

### 3.5 Classroom

Fields:
- `id`
- `branch` (FK)
- `standard`
- `section`
- `batch_time`
- `capacity`
- `class_teacher` (FK to Teacher)
- `created_at`
- `updated_at`
- `is_deleted`

### 3.6 FeePayment

Fields:
- `id`
- `branch` (FK)
- `student` (FK)
- `payment_mode` (`cash`, `cheque`, `upi`)
- `payment_date` (date)
- `amount_due` (decimal)
- `amount_paid` (decimal)
- `pending_amount` (decimal)
- `reference` (string)
- `remarks` (text)
- `status` (`paid`, `partial`, `pending`, `overdue`)
- `created_by` (FK User)
- `created_at`
- `updated_at`
- `is_deleted`

### 3.7 TimetableSlot

Fields:
- `id`
- `branch` (FK)
- `standard`
- `day_of_week` (`Monday`...`Sunday`)
- `start_time` (time)
- `end_time` (time)
- `subject`
- `teacher` (FK)
- `room` (string)
- `created_at`
- `updated_at`
- `is_deleted`

### 3.8 TestSchedule

Fields:
- `id`
- `branch` (FK)
- `standard`
- `subject`
- `test_date` (date)
- `syllabus` (text)
- `notification_start_date` (date)
- `created_by` (FK User)
- `created_at`
- `updated_at`
- `is_deleted`

### 3.9 Notification

Fields:
- `id`
- `branch` (FK)
- `recipient` (FK User, nullable for broadcast)
- `title` (string)
- `message` (text)
- `type` (`reminder`, `system`, `manual`)
- `source` (`test_schedule`, `admin_action`, `system`)
- `is_read` (boolean)
- `created_at`
- `updated_at`
- `is_deleted`

### 3.10 Audit and Soft Delete

Common fields for major models:
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
- `is_deleted`

---

## 4. API Endpoints

### 4.1 Authentication

#### POST /api/auth/login/

Request:
```json
{
  "username": "admin",
  "password": "admin"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Owner",
    "last_name": "Admin",
    "role": "admin",
    "branch": null
  },
  "access": "<jwt_token>",
  "refresh": "<refresh_token>"
}
```

#### GET /api/auth/profile/

Response:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Owner",
  "last_name": "Admin",
  "role": "admin",
  "branch": null,
  "is_active": true
}
```

#### PUT /api/auth/profile/

Request:
```json
{
  "first_name": "Owner",
  "last_name": "Admin",
  "email": "owner@example.com"
}
```

#### POST /api/auth/change-password/

Request:
```json
{
  "old_password": "admin",
  "new_password": "newpass123",
  "new_password_confirm": "newpass123"
}
```

### 4.2 Branches

#### GET /api/branches/
Response:
```json
[
  {"id": 1, "name": "Branch 1", "code": "B1", "contact_phone": "1234567890"},
  {"id": 2, "name": "Branch 2", "code": "B2", "contact_phone": "0987654321"}
]
```

#### POST /api/branches/
Request:
```json
{
  "name": "Branch 3",
  "code": "B3",
  "address": "123 Main St",
  "contact_phone": "1112223333",
  "contact_email": "branch3@example.com"
}
```

### 4.3 Users

#### GET /api/users/
Response:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "branch": null
  },
  {
    "id": 2,
    "username": "manager1",
    "email": "manager1@example.com",
    "role": "branch_manager",
    "branch": 1
  }
]
```

#### POST /api/users/
Request:
```json
{
  "username": "manager1",
  "email": "manager1@example.com",
  "password": "managerpass",
  "role": "branch_manager",
  "branch": 1,
  "first_name": "Branch",
  "last_name": "Manager"
}
```

### 4.4 Students

#### GET /api/students/?branch=1&standard=10&batch_time=7-9
Response:
```json
[
  {
    "id": 101,
    "branch": 1,
    "name": "Rahul Sharma",
    "parent_name": "Suresh Sharma",
    "contact_number": "9876543210",
    "address": "Delhi",
    "standard": "10",
    "batch_time": "7 AM - 9 AM",
    "decided_fee": "25000.00",
    "paid_fee": "15000.00",
    "fee_left": "10000.00",
    "status": "active",
    "critical_notes": "Pending science books",
    "roll_number": "10A-23"
  }
]
```

#### POST /api/students/
Manual student onboarding via this endpoint is the primary data entry method for the system. It supports full student profile creation one record at a time.

Request:
```json
{
  "branch": 1,
  "name": "Rahul Sharma",
  "parent_name": "Suresh Sharma",
  "contact_number": "9876543210",
  "address": "Delhi",
  "standard": "10",
  "batch_time": "7 AM - 9 AM",
  "decided_fee": "25000.00",
  "paid_fee": "15000.00",
  "status": "active",
  "critical_notes": "Pending science books",
  "roll_number": "10A-23",
  "admission_date": "2026-04-01"
}
```

#### POST /api/students/import/
Optional bulk import support for migrating offline records from CSV/Excel into the system.
Request: multipart/form-data with `file` field containing CSV/Excel.

Response:
```json
{
  "created_count": 120,
  "skipped_count": 3,
  "errors": [
    {"row": 15, "message": "Missing contact_number"}
  ]
}
```

### 4.5 Teachers

#### GET /api/teachers/
Response:
```json
[
  {
    "id": 10,
    "branch": 1,
    "name": "Anita Verma",
    "email": "anita@example.com",
    "phone": "9123456780",
    "subject": "Mathematics"
  }
]
```

#### POST /api/teachers/
Request:
```json
{
  "branch": 1,
  "name": "Anita Verma",
  "email": "anita@example.com",
  "phone": "9123456780",
  "subject": "Mathematics",
  "joining_date": "2025-06-15"
}
```

### 4.6 Classrooms

#### GET /api/classrooms/
Response:
```json
[
  {
    "id": 5,
    "branch": 1,
    "standard": "10",
    "section": "A",
    "batch_time": "7 AM - 9 AM",
    "capacity": 40,
    "class_teacher": 10
  }
]
```

### 4.7 Finance / Fees

#### GET /api/fees/?branch=1&standard=10
Response:
```json
[
  {
    "id": 501,
    "student": 101,
    "student_name": "Rahul Sharma",
    "payment_mode": "cash",
    "payment_date": "2026-04-10",
    "amount_due": "25000.00",
    "amount_paid": "15000.00",
    "pending_amount": "10000.00",
    "status": "partial",
    "reference": "CASH123",
    "remarks": "First installment"
  }
]
```

#### POST /api/fees/
Request:
```json
{
  "branch": 1,
  "student": 101,
  "payment_mode": "cash",
  "payment_date": "2026-04-10",
  "amount_due": "25000.00",
  "amount_paid": "15000.00",
  "reference": "CASH123",
  "remarks": "First installment"
}
```

#### POST /api/fees/{id}/payments/
Request:
```json
{
  "amount_paid": "5000.00",
  "payment_mode": "upi",
  "payment_date": "2026-04-15",
  "reference": "UPI789",
  "remarks": "Second installment"
}
```

#### GET /api/dashboard/fee-summary/?branch=1&standard=10
Response:
```json
{
  "expected_revenue": "500000.00",
  "collected_revenue": "320000.00",
  "pending_revenue": "180000.00",
  "overdue_count": 18
}
```

### 4.8 Timetable

#### GET /api/timetable/?branch=1&standard=10
Response:
```json
[
  {
    "id": 101,
    "branch": 1,
    "standard": "10",
    "day_of_week": "Monday",
    "start_time": "07:00:00",
    "end_time": "09:00:00",
    "subject": "Mathematics",
    "teacher": 10,
    "teacher_name": "Anita Verma",
    "room": "Room 101"
  }
]
```

#### POST /api/timetable/
Request:
```json
{
  "branch": 1,
  "standard": "10",
  "day_of_week": "Monday",
  "start_time": "07:00:00",
  "end_time": "09:00:00",
  "subject": "Mathematics",
  "teacher": 10,
  "room": "Room 101"
}
```

Validation:
- must fail if the selected `teacher` already has another slot at the same day/time
- response returns 400 with conflict details

### 4.9 Test Scheduling

#### GET /api/tests/?branch=1&standard=10
Response:
```json
[
  {
    "id": 201,
    "branch": 1,
    "standard": "10",
    "subject": "Mathematics",
    "test_date": "2026-05-10",
    "syllabus": "Chapter 1-5",
    "notification_start_date": "2026-05-03"
  }
]
```

#### POST /api/tests/
Request:
```json
{
  "branch": 1,
  "standard": "10",
  "subject": "Mathematics",
  "test_date": "2026-05-10",
  "syllabus": "Chapter 1-5"
}
```

Behavior:
- backend calculates `notification_start_date` automatically based on lead time
- for Sunday tests, start reminders 7 days before

### 4.10 Notifications

#### GET /api/notifications/?branch=1&is_read=false
Response:
```json
[
  {
    "id": 301,
    "branch": 1,
    "recipient": 2,
    "title": "Math Test Reminder",
    "message": "Math test scheduled for 10 May. Reminder begins today.",
    "type": "reminder",
    "source": "test_schedule",
    "is_read": false,
    "created_at": "2026-05-03T08:00:00Z"
  }
]
```

#### POST /api/notifications/
Request:
```json
{
  "branch": 1,
  "recipient": 2,
  "title": "Manual Alert",
  "message": "Please update the fee records.",
  "type": "manual",
  "source": "admin_action"
}
```

#### PUT /api/notifications/{id}/read/
Request:
```json
{
  "is_read": true
}
```

### 4.11 Dashboard and Reports

#### GET /api/dashboard/revenue/?branch=1
Response:
```json
{
  "expected": "500000.00",
  "collected": "320000.00",
  "pending": "180000.00",
  "overdue": "50000.00"
}
```

#### GET /api/dashboard/student-status/?branch=1
Response:
```json
{
  "active_students": 320,
  "new_enrollments": 12,
  "pending_fee_students": 45
}
```

#### GET /api/reports/fees/?branch=1&standard=10
Response:
```json
{
  "rows": [
    {"student_id": 101, "student_name": "Rahul Sharma", "total_fee": "25000.00", "paid": "15000.00", "pending": "10000.00", "status": "partial"}
  ],
  "summary": {"total_expected": "25000.00", "total_collected": "15000.00", "total_pending": "10000.00"}
}
```

---

## 5. API Behavior Rules

### Branch Manager filtering
- `branch_manager` requests are automatically filtered to `request.user.branch`
- they cannot create or update records for another branch

### Student fee consistency
- `fee_left = decided_fee - paid_fee`
- `status` is derived:
  - `paid` if `fee_left == 0`
  - `partial` if `fee_left > 0` and `paid_fee > 0`
  - `pending` if `paid_fee == 0`
  - `overdue` if pending and due date passes (optional)

### Timetable conflict validation
- fail save if teacher has another slot with overlapping day/time
- optionally allow `override_conflict` only for admin in future

### Test reminder schedule
- backend generates `Notification` records when tests cross the reminder threshold
- default rule: `notification_start_date = test_date - 7 days` for Sunday tests and other schedules

### Audit / soft delete
- all major records include `is_deleted`
- deleted records are hidden from standard list endpoints
- `created_by`, `updated_by`, `created_at`, `updated_at` are stored for history

---

## 6. Frontend contract notes

### Expected frontend data requirements
- `Student` list view: student name, parent name, contact, standard, batch time, decided fee, paid fee, fee left, status
- `Fee dashboard` filters: branch, standard, batch time
- `Fee dashboard` analytics: expected, collected, pending, overdue counts
- `Timetable` view: schedule slot data grouped by day and standard
- `Test reminders` view: upcoming test date, subject, standard, reminder start date
- `Notifications` view: unread badge, list of notifications, read/unread toggle

### API readiness for future frontend
- the endpoints are designed to be used by React later
- query parameters and pagination will be added during implementation
- frontend can consume `GET` list endpoints and `POST` action endpoints without additional changes

---

## 7. Required tasks before coding

1. Create models for all listed entities
2. Add serializers for the exact response payloads
3. Implement permissions and branch filtering
4. Implement validation logic for timetable conflicts
5. Implement CSV import handling for students
6. Implement test reminder notification logic
7. Implement dashboard summary endpoints
8. Add soft delete and audit metadata to major models

---

## 8. Deliverables

### Core MVP deliverables
- login and role-based backend access
- branch management
- student onboarding and CSV import
- fee ledger and analytics
- timetable scheduling with conflict validation
- test schedule creation and reminder notifications
- in-app notification system
- audit metadata and soft delete

### Nice-to-have deliverables
- report export endpoints
- branch consolidated dashboards
- notification unread badge count endpoint
- basic OpenAPI schema for backend

---

## 9. Notes

- This contract is backend-first and assumes frontend is built later.
- It is modeled after the client requirements and original design notes.
- All endpoints and payloads can be adjusted during implementation if needed.
