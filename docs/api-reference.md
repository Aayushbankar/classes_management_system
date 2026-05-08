# API Reference

Complete REST API documentation for the Classes Management System backend.

> **Interactive Docs:** When the backend is running, visit:
> - **Swagger UI:** http://localhost:8000/api/docs/
> - **ReDoc:** http://localhost:8000/api/redoc/

---

## Base URL

```
http://localhost:8000/api
```

All endpoints below are relative to this base URL.

## Authentication

All endpoints except `/auth/login/`, `/auth/register/`, and `/auth/health/` require a valid JWT token:

```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST `/auth/login/`

Authenticate and receive JWT tokens.

**Request:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Owner",
    "last_name": "Admin",
    "role": "owner",
    "branch": null
  },
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

### GET `/auth/profile/`

Retrieve the authenticated user's profile.

### PUT `/auth/profile/`

Update the authenticated user's profile.

**Request:**
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "email": "new@example.com"
}
```

### POST `/auth/change-password/`

**Request:**
```json
{
  "old_password": "current_password",
  "new_password": "new_password",
  "new_password_confirm": "new_password"
}
```

### POST `/auth/logout/`

Invalidate the current session.

### GET `/auth/health/`

Health check endpoint (no authentication required).

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## User Management

### GET `/auth/users/`

List all users (Owner/Admin only).

### POST `/auth/users/`

Create a new user.

**Request:**
```json
{
  "username": "manager1",
  "email": "manager1@example.com",
  "password": "securepass",
  "password_confirm": "securepass",
  "role": "admin",
  "branch": 1,
  "first_name": "Branch",
  "last_name": "Manager"
}
```

### PUT `/auth/users/{id}/`

Update a user record.

### DELETE `/auth/users/{id}/`

Delete a user.

---

## Branches

### GET `/branches/`

List all branches.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Downtown Center",
    "code": "DT01",
    "address": "123 Main St",
    "city": "Mumbai",
    "is_active": true
  }
]
```

### POST `/branches/`

Create a new branch.

### PUT `/branches/{id}/`

Update a branch.

### DELETE `/branches/{id}/`

Delete a branch.

---

## Students

### GET `/students/`

List students. Supports query parameter filtering:

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Filter by student name (partial match) |
| `standard` | string | Filter by class/standard |
| `branch` | integer | Filter by branch ID |

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Rahul Sharma",
    "parent_name": "Suresh Sharma",
    "contact_number": "9876543210",
    "standard": "Class 10",
    "batch_time": "07:00 AM - 09:00 AM",
    "branch": 1,
    "branch_name": "Downtown Center",
    "decided_fee": "25000.00",
    "paid_fee": "15000.00",
    "fee_left": "10000.00",
    "status": "active",
    "roll_number": "101"
  }
]
```

### GET `/students/{id}/`

Retrieve a single student's full profile.

### POST `/students/`

Create a new student.

**Request:**
```json
{
  "name": "Rahul Sharma",
  "parent_name": "Suresh Sharma",
  "contact_number": "9876543210",
  "standard": "Class 10",
  "batch_time": "07:00 AM - 09:00 AM",
  "branch": 1,
  "decided_fee": "25000.00",
  "paid_fee": "0",
  "status": "active",
  "roll_number": "101"
}
```

### PUT `/students/{id}/`

Update a student record.

### DELETE `/students/{id}/`

Delete a student.

---

## Teachers

### GET `/teachers/`

List all teachers.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Anita Verma",
    "email": "anita@example.com",
    "phone": "9123456780",
    "subject": "Mathematics",
    "assigned_standard": "Class 10",
    "branch": 1,
    "branch_name": "Downtown Center"
  }
]
```

### GET `/teachers/{id}/`

Retrieve a single teacher's profile.

### POST `/teachers/`

Create a new teacher.

### PUT `/teachers/{id}/`

Update a teacher record.

### DELETE `/teachers/{id}/`

Delete a teacher.

---

## Finance (Payments)

### GET `/finance/payments/`

List all fee payments. Supports filtering:

| Parameter | Type | Description |
|-----------|------|-------------|
| `branch` | integer | Filter by branch ID |
| `standard` | string | Filter by student standard |
| `batch` | string | Filter by batch time |

**Response (200):**
```json
[
  {
    "id": 1,
    "student": 1,
    "student_name": "Rahul Sharma",
    "student_standard": "Class 10",
    "student_branch_name": "Downtown Center",
    "student_batch_time": "07:00 AM - 09:00 AM",
    "amount": "5000.00",
    "payment_date": "2026-04-10",
    "payment_mode": "cash",
    "reference": "CASH-001"
  }
]
```

### POST `/finance/payments/`

Record a new payment.

**Request:**
```json
{
  "student": 1,
  "amount": "5000.00",
  "payment_date": "2026-04-10",
  "payment_mode": "cash",
  "reference": "CASH-001",
  "notes": "April installment"
}
```

---

## Reports & Dashboard

### GET `/reports/fees/`

Fee analytics summary. Supports branch/standard/batch filtering.

**Response (200):**
```json
{
  "total_collected_revenue": "381063.00",
  "total_expected_revenue": "390000.00",
  "pending_revenue": "8937.00"
}
```

### GET `/reports/dashboard/`

Dashboard metrics for the overview page.

---

## Schedule (Timetable)

### GET `/schedule/timetable/`

List timetable slots. Supports filtering:

| Parameter | Type | Description |
|-----------|------|-------------|
| `standard` | string | Filter by standard |
| `batch_time` | string | Filter by batch time |
| `branch` | integer | Filter by branch ID |

**Response (200):**
```json
[
  {
    "id": 1,
    "branch": 1,
    "branch_name": "Downtown Center",
    "standard": "Class 10",
    "batch_time": "07:00 AM - 09:00 AM",
    "day_of_week": "monday",
    "start_time": "07:00:00",
    "end_time": "09:00:00",
    "subject": "Mathematics",
    "teacher": 1,
    "teacher_name": "Anita Verma",
    "location": "Room 101"
  }
]
```

### POST `/schedule/timetable/`

Create a new timetable slot. The backend validates for teacher schedule conflicts.

### DELETE `/schedule/timetable/{id}/`

Delete a timetable slot.

---

## Notifications

### GET `/notifications/`

List notifications for the authenticated user.

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Fee Payment Received",
    "message": "Payment of ₹5,000 received from Rahul Sharma",
    "type": "system",
    "is_read": false,
    "created_at": "2026-04-10T08:00:00Z"
  }
]
```

### POST `/notifications/`

Create a notification (admin only).

### PUT `/notifications/{id}/`

Mark a notification as read.

---

## Token Refresh

### POST `/token/refresh/`

Refresh an expired access token.

**Request:**
```json
{
  "refresh": "<refresh_token>"
}
```

**Response (200):**
```json
{
  "access": "<new_access_token>"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error description"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — Invalid input data |
| `401` | Unauthorized — Missing or expired token |
| `403` | Forbidden — Insufficient permissions |
| `404` | Not Found — Resource does not exist |
| `500` | Server Error — Internal server error |
