# Eklavya App - Comprehensive Application Review

## 1. Application Ratings

### **Security: 3.0 / 5.0**
- **Pros:** The backend is protected by Simple JWT. Password validators are active in Django. Role-based checks (`isAdmin()`) are enforced on the frontend.
- **Cons:** The frontend stores JWT access and refresh tokens directly in `localStorage` (`src/api.js`). This makes the application highly vulnerable to Cross-Site Scripting (XSS) attacks. For enterprise coaching software, tokens should be migrated to `HttpOnly` secure cookies. Additionally, `DEBUG` might accidentally be left on in production if environment variables are not strictly enforced.

### **UI & Aesthetics: 5.0 / 5.0**
- **Pros:** The application features a stunning, premium "glassmorphism" aesthetic. The theming system (Cyberpunk, Azure, Midnight, Emerald) is beautifully executed. The Dashboard feels like a professional, high-density Power BI enterprise tool.
- **Cons:** None. All mobile overlaps, styling inconsistencies, and chart layout warnings have been fully resolved.

### **Modularity: 3.5 / 5.0**
- **Pros:** Clear separation of concerns between pages (Students, Teachers, Timetable, Fees). The use of reusable components like `TeacherCard` and `StudentCard` is good.
- **Cons:** Dropdown options (like Classes, Subjects, and Time Batches) are hardcoded across multiple files. These should be centralized in a `constants.js` file or fetched dynamically from the backend to avoid code duplication.

### **Architecture: 4.0 / 5.0**
- **Pros:** Solid decoupling of Django REST Framework and React. The frontend `api.js` automatically handles token refreshes efficiently. 
- **Cons:** Modals are currently rendered deeply within the React component tree. This caused severe `position: fixed` bugs earlier when placed inside CSS `transform` containers. Modals should be refactored to use **React Portals** (`ReactDOM.createPortal`) to guarantee they render at the root DOM level.

---

## 2. Identified Problems & Bugs

### **Data & Logic Bugs**
1. **Timetable Duplications:** The `TimetablePage` displays duplicate entries (e.g., Mathematics showing up twice on the same day/slot).
2. **Missing Relational Data:** Some timetable slots show a teacher emoji (👩‍🏫) followed by a dash ("—"). This indicates that the teacher relational data is either missing from the database or not being successfully serialized and joined by the backend API.
3. **Form Reset Logic:** When closing a modal using the "X" button and reopening it, the form state isn't always fully cleared, meaning previous partially-typed inputs might unexpectedly persist. 

---

### **Recommendations for Next Phase**
- **High:** Refactor `src/api.js` and the Django backend to use HttpOnly cookies for JWT authentication before deploying to production.
- **Medium:** Extract `TEACHER_SUBJECTS`, `STANDARDS`, and `BATCH_TIMES` arrays into a shared utility file.
