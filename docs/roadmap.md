# Roadmap

Current status and planned features for the Classes Management System.

---

## ✅ Completed

### Core Platform
- [x] JWT authentication with role-based access (Owner/Admin/Assistant)
- [x] Multi-branch support with branch-level data isolation
- [x] Development launcher script (`run.py`)
- [x] Docker & Docker Compose configuration

### Student Management
- [x] Student CRUD with search and filtering
- [x] Student detail profiles
- [x] Fee tracking per student (decided fee, paid fee, fee left)
- [x] Excel export for student data

### Teacher Management
- [x] Teacher CRUD with subject assignments
- [x] Teacher detail profiles
- [x] Search by name, subject, and branch filtering

### Finance & Fees
- [x] Payment recording (cash, UPI, cheque)
- [x] Revenue dashboard with charts (area chart, pie chart)
- [x] Collection efficiency tracking
- [x] Transaction ledger with search
- [x] Fee receipt printing
- [x] Excel export for payment data
- [x] Searchable student selector in payment modal

### Timetable
- [x] Weekly timetable with day-wise grouping
- [x] Standard, batch, and branch filtering
- [x] Teacher conflict detection

### UI & Experience
- [x] Glassmorphism design system
- [x] 4 switchable themes (Azure, Midnight, Velvet, Crimson)
- [x] Mobile-first responsive layout
- [x] Bottom navigation for mobile
- [x] Global search across all data pages
- [x] Smooth animations and transitions

### Infrastructure
- [x] OpenAPI/Swagger documentation (`/api/docs/`)
- [x] Branch management (CRUD)
- [x] User management (CRUD with role assignment)
- [x] In-app notifications

---

## 🔄 In Progress

- [ ] Centralize dropdown constants (standards, subjects, batch times)
- [ ] Migrate modals to React Portals for better mobile rendering
- [ ] Add rate limiting to authentication endpoints

---

## 📋 Planned

### Near-Term
- [ ] Attendance tracking module
- [ ] Test/exam scheduling with reminders
- [ ] Bulk student import via CSV/Excel
- [ ] SMS/WhatsApp notification integration
- [ ] Password reset via email

### Mid-Term
- [ ] Student/parent portal (read-only access)
- [ ] Teacher login portal
- [ ] Online payment gateway integration (Razorpay/Stripe)
- [ ] Multi-branch consolidated reporting
- [ ] Audit trail for critical actions

### Long-Term
- [ ] Real-time push notifications (WebSockets)
- [ ] Performance analytics and result tracking
- [ ] Mobile app (React Native)
- [ ] AI-powered insights and predictions
