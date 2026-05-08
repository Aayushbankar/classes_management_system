# Eklavya App - Comprehensive Application Review

## 1. Application Ratings

### **Security: 4.0 / 5.0**
- **Pros:** The backend is protected by Simple JWT using `HttpOnly`, `Secure` cookies, eliminating the primary XSS vector for token theft. Password validators are active in Django. Role-based checks (`isAdmin()`) are enforced on the frontend.
- **Remaining Security Concerns:** 
  1. **Development Configurations in Production:** `DEBUG` mode might accidentally be left active in production if environment variables are not strictly managed, leading to potential data and stack trace leaks.
  2. **Lack of Rate Limiting:** No built-in rate limiting (throttling) on the backend login/authentication endpoints, making the app susceptible to brute-force attacks.
  3. **CORS & Security Headers:** Potential lack of strict Cross-Origin Resource Sharing (CORS) limits and missing critical security headers (Content Security Policy, HSTS, etc.).
  4. **Missing Audit Trails:** High-risk actions (e.g., modifying fees, deleting students) lack a robust audit logging system.

### **UI & Aesthetics: 5.0 / 5.0**
- **Pros:** The application features a stunning, premium "glassmorphism" aesthetic. The theming system (Cyberpunk, Azure, Midnight, Emerald) is beautifully executed. The Dashboard feels like a professional, high-density Power BI enterprise tool.

### **Modularity: 3.5 / 5.0**
- **Pros:** Clear separation of concerns between pages (Students, Teachers, Timetable, Fees). The use of reusable components like `TeacherCard` and `StudentCard` is good.
- **Cons:** Dropdown options (like Classes, Subjects, and Time Batches) are hardcoded across multiple files. These should be centralized in a `constants.js` file or fetched dynamically from the backend to avoid code duplication.

### **Architecture: 4.5 / 5.0**
- **Pros:** Solid decoupling of Django REST Framework and React.
- **Cons:** Modals are currently rendered deeply within the React component tree. This caused severe `position: fixed` bugs earlier when placed inside CSS `transform` containers. Modals should be refactored to use **React Portals** (`ReactDOM.createPortal`) to guarantee they render at the root DOM level.

---

## 2. Identified Problems, Bugs & Errors (Current)


### **Logical Errors & UI Bugs**
1. **Missing Relational Data (Timetable):** Some timetable slots show a teacher emoji (👩‍🏫) followed by a dash ("—"). This indicates that the teacher relational data is either missing from the database or not being successfully serialized and joined by the backend API.
2. **Hardcoded Dropdowns (Tech Debt):** Dropdown choices such as Standards, Subjects, and Batches are hardcoded in multiple components instead of being centralized or data-driven from the backend.

---

## 3. Recommended Action Plan

1. **Component Refactor (Medium):** Migrate all custom Modals to use `ReactDOM.createPortal` for robust mobile rendering. Centralize the Dropdown constants into a `src/utils/constants.js` file.
2. **Security (High):** Implement Rate Limiting using Django Rest Framework throttling classes to protect against credential stuffing/brute force attacks on `/api/auth/login/`.
