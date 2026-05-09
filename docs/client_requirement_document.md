# SOFTWARE DEVELOPMENT AGREEMENT

# STATEMENT OF WORK & DELIVERABLE SPECIFICATION

---

**PROJECT:** Eklavya Classes — Digital Management System

**DOCUMENT VERSION:** 2.0 — Final

**DATE:** May 10, 2026

**PREPARED FOR:** Eklavya Classes, Bhavnagar, Gujarat (hereinafter referred to as "The Client")

**PREPARED BY:** D&A Software Solutions, Bhavnagar, Gujarat (hereinafter referred to as "The Developer")

DEVELOPER CONTACT DETAILS:
- Darshan Savani — Co-Founder, Development & Systems — +91 9898837154 — savanidarshan18@gmail.com
- Aayush Bankar — Co-Founder, Engineering & Data — +91 6351400725 — aayushbankar42@gmail.com

---

## 1. EXECUTIVE SUMMARY

The Eklavya Classes Management System is a custom-built, web-based administrative platform developed to digitize and streamline the day-to-day operations of a multi-branch coaching institute. The system replaces physical record-keeping registers with a secure, role-controlled digital dashboard accessible from any device including desktop computers, tablets, and mobile phones.

### 1.1 Business Problems Addressed

- Elimination of manual fee registers, reducing human errors and preventing lost records
- Real-time financial visibility across all branches for the Owner
- Centralized student and teacher directories with instant search capability
- Automated internal notification system for staff coordination
- Professional computer-generated fee receipts replacing handwritten slips
- One-click Excel export capability for CA/accountant handover
- Branch-wise data isolation ensuring clean separation of records

### 1.2 Key Outcomes Delivered

- Live production deployment on cloud infrastructure
- 10+ fully functional modules across frontend and backend
- Three-tier role-based access control system (Owner, Admin, Assistant)
- Multi-branch data isolation with centralized Owner overview
- Mobile-first responsive design operational on all screen sizes
- Six premium visual themes for user preference
- Production-grade security with JWT authentication, rate limiting, and audit trails

---

## 2. PROJECT SCOPE AND OBJECTIVES

### 2.1 Original Client Requirements

The Client identified three core operational pillars for the Minimum Viable Product (MVP):

**Pillar 1 — Fee Management Dashboard**
Organized, high-level and granular view of financial health across branches. Manual payment ledger for Cash, Cheque, and UPI transactions. Interactive filters by Branch, Standard, and Batch Timing. Analytics charts representing revenue data visually.

**Pillar 2 — Class Timetable Management**
Centralized hub to view, manage, and assign class schedules. Hierarchical view categorized by Branch and Standard. Each time slot maps to both a Subject and a Teacher.

**Pillar 3 — Test Scheduling and Notifications**
Module to schedule weekly and monthly tests per Standard and Branch. Smart reminder system with in-app notification bell for staff alerts.

### 2.2 Target Audience

This system is designed exclusively for internal administrative use. The primary users are the Owner, Branch Administrators, and Branch Assistants. Students and parents do NOT have login portals in the current scope.

### 2.3 Additional Modules Delivered Beyond Original Scope

During the development process, the following additional modules were identified as operational necessities and were built and delivered:

- Complete Student Management with CRUD operations and CSV bulk import
- Complete Teacher Management with CRUD operations
- Branch Management with full CRUD operations
- User Management with three-tier access control system
- User Profile and Password Security Management
- Financial Reports Module
- Global Command Palette Search (Ctrl+K shortcut)
- Excel Export functionality for Students, Teachers, and Payment records
- Professional Fee Receipt Printing with branded layout
- Six Premium UI Themes with instant switching
- Error Boundary Protection preventing application crashes
- Production Cloud Deployment with Docker containerization
- Auto-generated API Documentation (OpenAPI/Swagger)

---

## 3. SYSTEM USERS AND ACCESS CONTROL

### 3.1 Role Hierarchy

The system implements a three-tier access hierarchy:

- OWNER — Full system access across all branches, all data, and all users
- ADMIN — Branch-level access for managing students, teachers, fees, and assistant users within their assigned branch
- ASSISTANT — Read-only access to their assigned branch data with limited operational capabilities

### 3.2 Complete Access Control Matrix

AUTHENTICATION AND PROFILE

- Login / Logout — Owner: Yes, Admin: Yes, Assistant: Yes
- View Own Profile — Owner: Yes, Admin: Yes, Assistant: Yes
- Edit Own Profile (Name, Email) — Owner: Yes, Admin: Yes, Assistant: Yes
- Change Own Password — Owner: Yes, Admin: Yes, Assistant: Yes

DASHBOARD

- View Dashboard and KPIs — Owner: All branches, Admin: Own branch, Assistant: Own branch
- View Revenue Charts — Owner: Yes, Admin: Yes, Assistant: Yes
- View Upcoming Test Reminders — Owner: Yes, Admin: Yes, Assistant: Yes

STUDENT MANAGEMENT

- View Student Directory — Owner: All branches, Admin: Own branch, Assistant: Own branch
- Create / Edit Student — Owner: Yes, Admin: Yes, Assistant: No
- Delete Student — Owner: Yes, Admin: Yes, Assistant: No
- Import Students via CSV — Owner: Yes, Admin: Yes, Assistant: No
- Export Students to Excel — Owner: Yes, Admin: Yes, Assistant: Yes

TEACHER MANAGEMENT

- View Teacher Directory — Owner: All branches, Admin: Own branch, Assistant: Own branch
- Create / Edit / Delete Teacher — Owner: Yes, Admin: Yes, Assistant: No
- Export Teachers to Excel — Owner: Yes, Admin: Yes, Assistant: Yes

FEE MANAGEMENT

- View Fee Dashboard and Charts — Owner: All branches, Admin: Own branch, Assistant: Own branch
- Record Fee Payment — Owner: Yes, Admin: Yes, Assistant: No
- Print Fee Receipt — Owner: Yes, Admin: Yes, Assistant: Yes
- Export Payments to Excel — Owner: Yes, Admin: Yes, Assistant: Yes

TIMETABLE

- View Weekly Timetable — Owner: All branches, Admin: Own branch, Assistant: Own branch
- Create / Delete Timetable Slot — Owner: Yes, Admin: Yes, Assistant: No

BRANCH MANAGEMENT

- View All Branches — Owner: All, Admin: Own branch, Assistant: Own branch
- Create / Edit / Delete Branch — Owner: Yes, Admin: Yes, Assistant: No

USER MANAGEMENT

- View Users Page — Owner: Yes, Admin: Yes, Assistant: No (Page Hidden)
- Create User (any role) — Owner: Yes, Admin: No, Assistant: No
- Create Assistant User — Owner: Yes, Admin: Yes (own branch only), Assistant: No
- Edit / Delete User — Owner: Yes, Admin: Yes (assistants in branch), Assistant: No

NOTIFICATIONS

- View Notifications — Owner: All, Admin: All, Assistant: Own
- Mark Notification as Read — Owner: Yes, Admin: Yes, Assistant: Yes

SYSTEM FEATURES

- Global Search (Ctrl+K) — Owner: Yes, Admin: Yes, Assistant: Yes
- Switch UI Theme — Owner: Yes, Admin: Yes, Assistant: Yes
- Fee Reports Page — Owner: Yes, Admin: Yes, Assistant: Yes

### 3.3 Data Visibility Rules (Branch Scoping)

- Students — Owner: All branches, Admin: Own branch only, Assistant: Own branch only
- Teachers — Owner: All branches, Admin: Own branch only, Assistant: Own branch only
- Fee Payments — Owner: All branches, Admin: Own branch students, Assistant: Own branch students
- Timetable Slots — Owner: All branches, Admin: Own branch only, Assistant: Own branch only
- Branches — Owner: All, Admin: Own only, Assistant: Own only
- Users — Owner: All users, Admin: Own branch + self, Assistant: Self only
- Notifications — Owner: All, Admin: All, Assistant: Own + targeted

### 3.4 Security Features Implemented

- JWT-based token authentication with automatic refresh
- Server-side role enforcement on every API endpoint
- Branch-scoped data isolation enforced at database query level
- User registration restricted to Admin and Owner roles only
- API rate limiting — 20 requests/minute for anonymous, 200 requests/minute for authenticated users
- Password validation with minimum length and common password checks
- Complete audit logging of all user management actions (UserActionLog)
- CORS configuration for cross-origin security
- HSTS headers with secure cookies in production mode
- XSS and Clickjacking protection headers
- CSV upload validation for file size, type, and encoding
- Server-side role re-validation on every application load
- React Error Boundaries preventing cascading application crashes

---

## 4. DELIVERED MODULES — COMPLETE FUNCTIONAL SPECIFICATIONS

### 4.1 Login and Authentication Module

- Login method: Username and Password
- Token type: JWT with access token (60-minute lifetime) and refresh token (24-hour lifetime)
- Password visibility toggle available
- Error handling for invalid credentials and connection failures
- Branded login page with Eklavya logo and watermark background

### 4.2 Analytics Dashboard

- Four KPI Cards: Total Students, Total Teachers, Active Branches, Revenue Collected
- Mini sparkline area charts embedded on each KPI card
- Weekly Revenue Trend: Interactive area chart with gradient fill and hover tooltips
- Collection Rate: Donut/pie chart showing collected vs pending percentage
- Upcoming Tests Section: Next 7 days' test schedule with reminder day badges
- All data fetched in real-time from backend APIs

### 4.3 Student Management Module

DATA FIELDS CAPTURED:
- Student Full Name (required, minimum 2 characters)
- Parent / Guardian Name
- Contact Number (validated format)
- Standard / Class
- Batch Timing
- Roll Number
- Branch Assignment
- Decided Fee Amount (INR)
- Paid Fee Amount (INR)
- Status (Active / Inactive)
- Admission Date
- Address
- Critical Notes

STANDARDS SUPPORTED:
Class 1, Class 2, Class 3, Class 4, Class 5, Class 6, Class 7, Class 8, Class 9, Class 10, Class 11 (Science), Class 11 (Commerce), Class 11 (Arts), Class 12 (Science), Class 12 (Commerce), Class 12 (Arts), NEET, JEE, Foundation, Other

BATCH TIMES SUPPORTED:
07:00 AM – 09:00 AM, 09:00 AM – 11:00 AM, 11:00 AM – 01:00 PM, 01:00 PM – 03:00 PM, 04:00 PM – 06:00 PM, 06:00 PM – 08:00 PM, Special Batch, Crash Course

OPERATIONS:
- Create new student with form validation
- Edit existing student record
- Delete student with confirmation dialog
- Bulk import students from CSV/Excel file (maximum 5MB, UTF-8 encoding)
- Export entire student directory to Excel (.xlsx) with auto-width columns
- Search by student name with 300ms debounce
- Filter by Standard and Branch
- Visual fee progress bar per student (percentage paid, color-coded green/amber/red)
- Automatic fee payment record creation when initial paid fee is greater than zero
- Desktop view: Professional data grid table
- Mobile view: Card-based layout with inline fee progress indicators

### 4.4 Teacher Management Module

DATA FIELDS CAPTURED:
- Teacher Full Name (required, minimum 2 characters)
- Email Address (unique, validated format)
- Phone Number (validated format)
- Subject Specialization (required)
- Assigned Standard / Class
- Branch Assignment

SUBJECTS SUPPORTED:
Mathematics, Physics, Chemistry, Biology, Science, English, Social Studies, Hindi, Marathi, Computer Science / IT, Accountancy, Economics, Business Studies, Physical Education, Drawing / Art, Music, Other

OPERATIONS:
- Create new teacher with form validation
- Edit existing teacher record
- Delete teacher with confirmation dialog
- Export entire teacher directory to Excel (.xlsx)
- Search by name, email, or phone number
- Filter by subject and branch
- Desktop view: Data grid table
- Mobile view: Card-based layout

### 4.5 Fee Management and Revenue Dashboard

REVENUE KPI CARDS:
- Total Collected Amount (INR, formatted)
- Total Expected Revenue (INR, formatted)
- Collection Efficiency Percentage
- Total Pending Amount (INR, formatted)
- Total transaction count

ANALYTICS CHARTS:
- Revenue Collection Timeline: Area chart showing daily collection amounts, auto-grouped by date, with gradient fill and custom tooltips showing INR values
- Payment Mode Distribution: Donut/pie chart breaking down Cash vs UPI vs Cheque vs Other, showing both percentage and absolute INR amounts

INTERACTIVE FILTERS:
- Branch filter (dropdown of all branches)
- Standard filter (Class 9, Class 10, Class 11, Class 12)
- Batch Time filter (dynamically populated based on branch and standard selection)
- Desktop: Persistent left sidebar filter panel
- Mobile: Top-drawer slide-out filter panel with close button

PAYMENT RECORDING:
- Modal form triggered by "Record Payment" button
- Student selection: Type-ahead search dropdown (shows name + standard + branch, max 30 results)
- Amount field (INR, must be greater than zero)
- Payment date picker
- Payment mode selector: Cash, UPI, Cheque, Other
- Reference / Transaction ID field (optional, for UPI ID or cheque number)
- Form validation with error messages
- Backend automatically creates staff notification on each payment

TRANSACTION LEDGER:
- Full data table with columns: Student Name (linked to profile), Branch and Batch, Date, Payment Mode (color-coded badge), Amount (INR formatted), Print Receipt button
- Searchable across student name, reference, mode, branch, standard, and batch

FEE RECEIPT PRINTING:
- Professional print-optimized layout
- Eklavya branding header with "COACHING MANAGEMENT SYSTEM" subtitle
- Receipt number and date
- Student details section: Name, Standard, Batch, Branch, Roll Number
- Payment details table: Amount Paid, Payment Mode, Reference/TXN ID, Notes
- Highlighted "AMOUNT RECEIVED" banner with large font
- Footer with "Computer-generated receipt" note and Authorized Signature line
- Uses browser print with CSS media queries (hides all other page content)

EXCEL EXPORT:
- One-click export of all filtered payment records
- Columns: Student Name, Amount (INR), Payment Date, Mode, Reference/TXN ID, Notes
- Auto-width columns for readability
- Filename format: fee_payments_YYYY-MM-DD.xlsx

### 4.6 Timetable Management Module

VIEW:
- Weekly grid grouped by day of week (Monday through Saturday)
- Each day section shows all scheduled slots
- Desktop: Table with columns — Time, Subject (with branch name), Standard (badge), Teacher, Room
- Mobile: Card per slot with emoji-labeled metadata (clock, teacher, location)

SLOT DATA FIELDS:
- Branch (required)
- Standard (required)
- Batch Time
- Day of Week (Monday through Saturday)
- Start Time (required)
- End Time (required)
- Subject (required)
- Teacher (optional, dropdown from teacher directory)
- Room / Location
- Notes

OPERATIONS:
- Create new slot via modal form (Admin/Owner only)
- Delete slot with confirmation (Admin/Owner only)
- Filter by Standard, Batch/Time, and Branch
- KPI showing total scheduled slots

### 4.7 Branch Management Module

DATA FIELDS:
- Branch Name (unique, required)
- Branch Code (unique, required)
- Full Postal Address
- City
- Operational Status (Active/Inactive toggle)

OPERATIONS:
- Create new branch
- Edit branch details
- Delete branch (protected — cannot delete if students or teachers exist)
- KPI cards: Total Centers count, Operational count
- Search by name, code, city, or address

### 4.8 User Administration Module

DATA FIELDS:
- Username (unique)
- Email Address
- First Name
- Last Name
- Role (Owner / Admin / Assistant)
- Assigned Branch
- Password with confirmation

ROLE-BASED RESTRICTIONS:
- Owner can create users of any role (Owner, Admin, Assistant)
- Admin can only create Assistant users within their own branch
- Admin's branch is auto-assigned and cannot be changed
- Assistant users cannot access this page (hidden from navigation)
- Every user creation, edit, and deletion is logged in the audit trail

INTERFACE:
- User cards with avatar (initials), name, role badge, email, branch, and username
- Search by username, email, name, role, or branch
- Desktop: "Add User" button in header
- Mobile: Floating Action Button (FAB) at bottom-right corner
- Modal form for create and edit operations

### 4.9 Profile and Security Module

PROFILE CARD:
- Large avatar circle with auto-generated initials from name
- Full name display (or username as fallback)
- Username with @ prefix and branch name
- Role badge with color coding (Owner: amber, Admin: indigo, Assistant: gray)

ACCESS LEVEL DISPLAY:
- Visual permission matrix showing: View Data, Edit Records, Manage Users, Delete Records, All Branches, System Settings
- Each permission shows green checkmark (allowed) or red cross (denied)
- Description text explaining the role's capabilities

PROFILE EDITING:
- Editable fields: First Name, Last Name, Email Address
- Email validation (required, valid format)
- Save button with loading state

PASSWORD CHANGE:
- Current password field (required)
- New password field with real-time strength meter
- Strength meter criteria: Length 8+, Length 12+, Uppercase letters, Numbers, Special characters
- Strength levels: Weak (red), Medium (amber), Strong (green)
- Confirm password field with mismatch detection
- Change button with loading state

### 4.10 Notifications Module

- Full notification feed with title, message body, and relative timestamp ("5m ago", "2h ago", "3d ago")
- Unread notification counter badge displayed on sidebar (desktop) and header (mobile)
- Per-notification "Mark as Read" button
- System auto-generates notifications on fee payment recording
- Visual distinction: Unread items have primary-color border and full opacity; Read items have muted border and reduced opacity
- KPI cards: Total notifications count, Unread count (red if > 0, green if 0)

### 4.11 Reports Module

- Fee Summary KPI cards: Expected Revenue, Collected Amount, Pending Amount, Collection Rate (%)
- Large collection progress bar with percentage label
- Detailed breakdown list: Expected Revenue, Total Collected, Total Pending (each with formatted INR values)
- Currency formatting: Values above 1 Lakh shown as "X.XL", above 1000 shown as "X.XK"

### 4.12 Global Search — Command Palette

- Keyboard shortcut: Ctrl+K opens search overlay
- Mobile: Search icon button in navigation header
- Dismiss: ESC key or clicking outside the palette
- Page search: Instant client-side filtering across all 10 application pages
- Data search: Backend API search across students, teachers, and records with 300ms debounce
- Each result shows icon, title, and subtitle
- Click any result to navigate directly to the relevant page or record
- ESC badge indicator in the search bar

### 4.13 UI/UX and Design System

THEMES (6 TOTAL):
- Modern Azure (default light theme)
- Midnight Pro (dark theme)
- Royal Velvet (purple-toned theme)
- Crimson Sunset (warm red-orange theme)
- Emerald Forest (green nature theme)
- Cyberpunk Neon (vibrant neon dark theme)

RESPONSIVE LAYOUT:
- Desktop (1024px+): Fixed sidebar navigation with all page links, theme selector, and sign-out button
- Tablet/Mobile: Hamburger menu with slide-out drawer, bottom navigation bar with 5 quick-access links (Dashboard, Students, Teachers, Timetable, Fees)

DESIGN FEATURES:
- Glass morphism card design system throughout the application
- Fade-in page transition animations
- Hover-lift effect on interactive cards
- Pulse animation on primary action buttons
- Custom-styled scrollbars matching theme colors
- INR currency formatting with Indian number system (Lakhs, Thousands)
- Relative time display for timestamps ("Just now", "5m ago", "2d ago")
- Premium input styling with focus states and validation error indicators

---

## 5. DATA ARCHITECTURE

### 5.1 Database Models

USER MODEL:
Fields — Username (unique), Email (unique), Password (hashed), First Name, Last Name, Role (owner/admin/assistant), Branch (foreign key), Created At, Updated At

USER ACTION LOG MODEL:
Fields — Actor (user who performed action), Target User (user affected), Action Type (create/update/delete/password_change/login/logout), Details (text), Timestamp

BRANCH MODEL:
Fields — Name (unique), Code (unique), Address, City, Is Active (boolean), Created At, Updated At

STUDENT MODEL:
Fields — Branch (foreign key, protected), Name, Parent Name, Contact Number, Address, Standard, Batch Time, Roll Number, Admission Date, Decided Fee (decimal), Paid Fee (decimal), Status (active/inactive), Critical Notes, Created At, Updated At
Computed Property — Fee Left = Decided Fee minus Paid Fee (minimum zero)

TEACHER MODEL:
Fields — Branch (foreign key), Name, Email (unique), Phone, Subject, Assigned Standard, Joining Date, Is Active, Created At, Updated At

FEE PAYMENT MODEL:
Fields — Student (foreign key, cascading delete), Amount (decimal), Payment Date, Payment Mode (cash/cheque/upi/other), Reference, Notes, Created At

TIMETABLE SLOT MODEL:
Fields — Branch (foreign key, protected), Standard, Batch Time, Day of Week (monday through sunday), Start Time, End Time, Subject, Teacher (foreign key, optional), Location, Notes, Created At, Updated At

TEST SCHEDULE MODEL:
Fields — Branch (foreign key, protected), Standard, Title, Description, Test Date, Reminder Days Before (default 2), Created At

NOTIFICATION MODEL:
Fields — Title, Message, User (foreign key), Is Read (boolean), Created At

### 5.2 Key Business Rules Enforced in Backend

1. Fee Left Calculation: fee_left = decided_fee minus paid_fee, with a floor of zero rupees
2. Branch Scoping: All API queries filter data by the requesting user's branch for non-Owner roles
3. Cascading Deletes: Deleting a Student automatically deletes all their Fee Payment records
4. Protected Deletes: Branches cannot be deleted if they have students, teachers, or users attached
5. Auto-Notification: Creating a Fee Payment automatically generates a system notification for all staff
6. Role Enforcement: Backend permission classes check user role on every single API endpoint
7. Audit Logging: Every user create, update, delete, and password change action is recorded with actor, target, action type, and timestamp
8. Pagination: All list APIs paginate at 50 records per page

---

## 6. TECHNOLOGY STACK

### 6.1 Frontend Technologies

- React.js version 19.x — Primary UI framework
- React Router version 7.x — Client-side navigation and routing
- Bootstrap version 5.3.x — Grid system and base component library
- React Bootstrap version 2.10.x — React bindings for Bootstrap components
- Recharts version 3.x — Interactive data visualization (Area charts, Pie charts)
- XLSX version 0.18.x — Client-side Excel file generation and download
- Custom Vanilla CSS — 43KB+ design system stylesheet with CSS custom properties

### 6.2 Backend Technologies

- Python 3.10+ — Programming language
- Django version 4.2.x LTS — Web application framework (Long Term Support release)
- Django REST Framework version 3.14.x — RESTful API layer
- SimpleJWT version 5.3.x — JWT-based authentication
- drf-spectacular version 0.27+ — Automatic OpenAPI/Swagger documentation generation
- Gunicorn version 22+ — Production-grade WSGI HTTP server
- WhiteNoise version 6.6+ — Efficient static file serving
- django-cors-headers version 4.3.x — Cross-Origin Resource Sharing management
- python-decouple version 3.8 — Environment variable configuration

### 6.3 Database

- PostgreSQL version 15+ — Production database (cloud-hosted)
- SQLite — Local development database
- psycopg2-binary version 2.9+ — PostgreSQL database adapter
- dj-database-url version 2.1+ — Database URL configuration parser

### 6.4 Infrastructure and Deployment

- Docker — Application containerization with Dockerfile and docker-compose
- Render — Cloud Platform-as-a-Service hosting (production)
- WhiteNoise — Compressed manifest static file storage
- Gunicorn — Multi-worker WSGI process manager
- Environment Variables — All sensitive configuration via .env files

---

## 7. DELIVERABLE ACCEPTANCE MATRIX

### 7.1 Original SRS Requirements — Delivery Status

FEE MANAGEMENT:
- Fee Management Dashboard with filters — DELIVERED (100%)
- Manual Payment Ledger for Cash, Cheque, UPI — DELIVERED (100%)
- Revenue Analytics Charts — DELIVERED (100%)
- Student Data Grid with visual fee cues — DELIVERED (100%)

STUDENT ONBOARDING:
- Student Manual Entry Form — DELIVERED (100%)
- Bulk CSV Import with validation — DELIVERED (100%)

TIMETABLE MANAGEMENT:
- Timetable Hierarchical View (Branch to Standard) — DELIVERED (100%)
- Timetable Resource Mapping (Subject + Teacher) — DELIVERED (100%)
- Timetable Slot Creation and Deletion UI — DELIVERED (100%)
- Teacher Conflict Resolution (overlapping schedules) — NOT IMPLEMENTED (0%)

TEST SCHEDULING AND NOTIFICATIONS:
- Test Schedule Board — BACKEND API ONLY (50%)
- Smart Reminders (automated X days before via background worker) — DASHBOARD DISPLAY ONLY (40%)
- In-App Notification Bell with unread counter — DELIVERED (100%)
- Web Push Notifications (browser-level) — NOT IMPLEMENTED (0%)

### 7.2 Additional Deliverables Beyond Original SRS

All items below have been DELIVERED and are OPERATIONAL:

- Complete Student CRUD with form validation
- Complete Teacher CRUD with form validation
- Complete Branch CRUD
- Three-tier User Management system (Owner/Admin/Assistant)
- User Profile editing and Password Management with strength meter
- Professional Fee Receipt Printing (branded, print-optimized)
- Excel Export for Students, Teachers, and Fee Payments
- Global Command Palette Search (Ctrl+K)
- Six Premium UI Themes with instant switching
- Fully Mobile-Responsive Design (sidebar, drawer, bottom nav)
- Financial Reports Page with KPIs and progress bars
- Complete Audit Trail Logging for user management actions
- Production Cloud Deployment on Render
- Docker Containerization with docker-compose
- Auto-generated API Documentation (OpenAPI/Swagger)
- React Error Boundaries on all pages
- Server-side role re-validation on application load
- API rate limiting for abuse prevention
- Production security headers (HSTS, XSS protection, Clickjacking prevention)

---

## 8. KNOWN LIMITATIONS AND EXCLUSIONS

The following items are explicitly NOT included in the current deliverable and are outside the agreed scope:

- Student or Parent Login Portal — System is for internal admin use only
- Daily Attendance Tracking — No attendance module for students or staff
- Exam Results and Grading System — No results recording or grade calculation
- SMS or WhatsApp Notifications — Only in-app notifications are supported
- Automated Cron-Based Test Reminders — No background worker for scheduled alerts
- Teacher Schedule Conflict Detection — No validation for overlapping assignments
- Test Scheduling Frontend Page — Backend model exists but no dedicated UI page
- Student Photograph or Media Upload — No image/file upload capability
- Expense or Salary/Payroll Tracking — System tracks income (fees) only
- Academic Calendar or Holiday Management — No calendar module
- Automated Database Backup — No automated backup mechanism
- Multi-Language Support — English language only
- Offline or PWA Mode — Requires internet connection

---

## 9. FUTURE SCOPE (PHASE 2 — SEPARATELY QUOTED)

The following features may be developed as Phase 2 enhancements under a separate agreement:

HIGH PRIORITY:
- Test Scheduling CRUD Frontend UI — Estimated 2 to 3 days
- Automated Test Reminders via Background Worker — Estimated 3 to 5 days
- Student Attendance Tracking Module — Estimated 5 to 7 days

MEDIUM PRIORITY:
- SMS and WhatsApp Integration for fee reminders — Estimated 3 to 5 days
- Exam Results and Grade Processing Module — Estimated 5 to 7 days
- Student Photo Upload and ID Card Generation — Estimated 2 to 3 days
- Expense and Payroll Tracking Module — Estimated 5 to 7 days

LOW PRIORITY:
- Teacher Schedule Conflict Detection — Estimated 1 to 2 days
- Automated Database Backup System — Estimated 1 to 2 days
- Progressive Web App (PWA) with Offline Support — Estimated 2 to 3 days

---

## 10. SUPPORT AND WARRANTY TERMS

- Bug Fix Warranty Period: 30 days from the date of final acceptance
- Scope of Warranty: Covers defects and bugs in delivered features only; does not cover new feature requests or enhancements
- Support Channel: WhatsApp / Phone — Darshan (+91 9898837154) or Aayush (+91 6351400725)
- Response Time: Critical issues within 24 hours, Normal issues within 48 hours
- Hosting and Server Costs: To be borne by the Client (Render subscription or equivalent)
- Source Code Ownership: Complete source code and all project files shall be delivered to the Client upon receipt of final payment
- Training: One walkthrough session to demonstrate all features and operations to the Client's staff

---

## 11. COMMERCIAL TERMS

Total Project Cost: Rs. _________________ (Rupees ___________________________________ Only)

Payment Schedule:

- Advance Payment: Rs. _________________ (on signing of this agreement)
- Final Payment: Rs. _________________ (on delivery and acceptance)

OR

- One-Time Payment: Rs. _________________ (on delivery and acceptance)
- Monthly Maintenance (Optional): Rs. _________________ per month (covers bug fixes, minor updates, and hosting support)

---

## 12. ACCEPTANCE AND SIGNATURES

By signing below, both parties acknowledge that the features and specifications listed in this document represent the complete scope of work delivered under the current engagement. Any additional features or modifications beyond this scope shall be subject to a separate agreement and quotation.


PARTY A — CLIENT (EKLAVYA CLASSES, BHAVNAGAR)


Authorized Signatory 1:

Name: _____________________________________________

Designation: _____________________________________________

Date: _____________________________________________

Signature: _____________________________________________


Authorized Signatory 2:

Name: _____________________________________________

Designation: _____________________________________________

Date: _____________________________________________

Signature: _____________________________________________


---


PARTY B — DEVELOPER (D&A SOFTWARE SOLUTIONS, BHAVNAGAR)


Darshan Savani
Co-Founder, Development & Systems
D&A Software Solutions
Contact: +91 9898837154
Email: savanidarshan18@gmail.com

Date: _____________________________________________

Signature: _____________________________________________


Aayush Bankar
Co-Founder, Engineering & Data
D&A Software Solutions
Contact: +91 6351400725
Email: aayushbankar42@gmail.com

Date: _____________________________________________

Signature: _____________________________________________


---

Document Reference: EKL-CMS-2026-SOW-v2.0

Prepared by D&A Software Solutions — Proudly Serving Bhavnagar, Gujarat

This is a controlled document. Unauthorized reproduction or distribution is prohibited.
