# Frontend Guide

Architecture, conventions, and design system for the Classes Management System React frontend.

---

## Overview

The frontend is a **React 19** single-page application (SPA) built with:

- **React Router v7** for client-side routing
- **Vanilla CSS** with CSS custom properties for theming
- **Recharts** for data visualization
- **Bootstrap 5** for grid and utility classes
- **xlsx** for Excel export functionality

No external state management library is used — each page manages its own state via React hooks.

---

## Directory Structure

```
src/
├── components/             # Reusable UI components
│   └── FeeReceipt.js       # Print-ready fee receipt
├── pages/                  # Route-level page components
│   ├── DashboardPage.js    # Main analytics dashboard
│   ├── StudentsPage.js     # Student directory & CRUD
│   ├── StudentDetailPage.js# Individual student profile
│   ├── TeachersPage.js     # Teacher directory & CRUD
│   ├── TeacherDetailPage.js# Individual teacher profile
│   ├── FeesPage.js         # Revenue dashboard & payment ledger
│   ├── FeesPage.css        # Fee-specific styles
│   ├── TimetablePage.js    # Weekly timetable manager
│   ├── BranchesPage.js     # Branch management
│   ├── BranchesPage.css    # Branch-specific styles
│   ├── UsersPage.js        # User administration
│   ├── NotificationsPage.js# Notification center
│   ├── ReportsPage.js      # Reports & export
│   └── ProfilePage.js      # User profile settings
├── utils/                  # Utility modules
│   ├── export.js           # Excel export (XLSX)
│   └── format.js           # Currency & number formatting
├── App.js                  # Router & route definitions
├── Layout.js               # Shell: sidebar, topbar, theme, mobile nav
├── ErrorBoundary.js        # React error boundary
├── ProtectedRoute.js       # Auth guard for routes
├── api.js                  # API client with JWT management
├── config.js               # Environment-based configuration
├── index.js                # React entry point
├── index.css               # Global styles & design system
├── login.js                # Login page
├── login.css               # Login-specific styles
└── logo.png                # Application logo
```

---

## API Client (`api.js`)

The `api.js` module provides a centralized API layer with JWT authentication:

### Key Exports

| Function | Purpose |
|----------|---------|
| `fetchJson(path)` | `GET` request, returns parsed JSON |
| `fetchList(path)` | `GET` request for array endpoints |
| `postJson(path, data)` | `POST` request with JSON body |
| `putJson(path, data)` | `PUT` request with JSON body |
| `deleteJson(path)` | `DELETE` request |
| `isAdmin()` | Check if current user has admin/owner role |
| `getCurrentUser()` | Get current user profile from localStorage |
| `canManageUsers()` | Check if user can manage other users |

### Usage

```javascript
import { fetchList, postJson, isAdmin } from '../api';

// Fetch data
const students = await fetchList('/students/');

// Create record
await postJson('/students/', { name: 'New Student', ... });

// Check permissions
if (isAdmin()) {
  // Show admin controls
}
```

### Authentication Flow

1. On login, tokens are stored in `localStorage`
2. All `fetch*` functions automatically inject the `Authorization: Bearer` header
3. On 401 response, the user is redirected to the login page

---

## Design System

### CSS Custom Properties (Tokens)

The design system is built entirely on CSS custom properties defined in `index.css`. This enables runtime theme switching without JavaScript CSS-in-JS.

#### Core Tokens

```css
--primary          /* Primary brand color */
--primary-soft     /* Soft/muted primary for backgrounds */
--surface          /* Card/component background */
--background       /* Page background */
--text             /* Primary text color */
--text-muted       /* Secondary text color */
--border           /* Border and divider color */
--danger           /* Error/destructive action color */
```

#### Component Classes

| Class | Purpose |
|-------|---------|
| `.glass-card` | Glassmorphism card with backdrop blur |
| `.stat-card` | Dashboard statistic card |
| `.btn-premium` | Primary action button with gradient |
| `.input-premium` | Styled form input with focus ring |
| `.data-grid-table` | Data table with hover states |
| `.dashboard-grid` | Responsive metric card grid |
| `.animate-fade-in` | Entrance animation |
| `.hover-lift` | Subtle lift effect on hover |

### Themes

Themes are activated by setting `data-theme` on `<html>`:

| Theme | Attribute Value |
|-------|----------------|
| Modern Azure | `azure` |
| Midnight Pro | `midnight` |
| Royal Velvet | `velvet` |
| Crimson Sunset | `crimson` |

```javascript
document.documentElement.setAttribute('data-theme', 'midnight');
```

---

## Adding a New Page

### 1. Create the Page Component

Create `src/pages/NewPage.js`:

```javascript
import React, { useEffect, useState } from 'react';
import { fetchList, isAdmin } from '../api';

function NewPage() {
  const [data, setData] = useState([]);
  const admin = isAdmin();

  useEffect(() => {
    fetchList('/your-endpoint/').then(setData).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <p className="subtitle">Category</p>
        <h2 className="fs-1">Page Title</h2>
      </div>

      <div className="glass-card">
        {/* Page content */}
      </div>
    </div>
  );
}

export default NewPage;
```

### 2. Add the Route

In `src/App.js`, add a route inside the `<Layout>` wrapper:

```javascript
import NewPage from './pages/NewPage';

// Inside <Routes>:
<Route path="/app/new-page" element={<NewPage />} />
```

### 3. Add Navigation Link

In `src/Layout.js`, add a navigation item to the sidebar links array.

---

## Page Patterns

### Data Table Page (e.g., StudentsPage)

```
┌─────────────────────────────────┐
│ [Subtitle]                      │
│ Page Title         [Export] [+] │
├─────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐    │  ← Stat cards
│ │ Stat │ │ Stat │ │ Stat │    │
│ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────┤
│ Search [____] Filter [v] [v]   │  ← Search & filters
├─────────────────────────────────┤
│ ┌─────────────────────────────┐│  ← Data table (desktop)
│ │ Name │ Standard │ Actions  ││  ← Card list (mobile)
│ │──────│──────────│──────────││
│ │ ...  │ ...      │ Edit Del ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

### Dashboard Page (e.g., FeesPage)

```
┌─────────────────────────────────┐
│ [Subtitle]                      │
│ Dashboard Title                 │
├──────────┬──────────────────────┤
│ Filters  │ ┌────┐ ┌────┐      │  ← Stat cards
│ --------│ │Stat│ │Stat│       │
│ Branch   │ └────┘ └────┘      │
│ Standard │ ┌──────────────────┐│  ← Charts
│ Batch    │ │  Area Chart      ││
│ Search   │ └──────────────────┘│
│          │ ┌──────────────────┐│  ← Transaction table
│          │ │  Data Table      ││
│          │ └──────────────────┘│
└──────────┴──────────────────────┘
```

---

## Responsive Design

The app uses a **mobile-first** approach:

- **Mobile (`< 768px`):** Bottom navigation bar, card-based data views, stacked layouts
- **Tablet (`768px - 1024px`):** Sidebar collapses, table views enabled
- **Desktop (`> 1024px`):** Full sidebar, multi-column dashboard grids

Key responsive utilities:
- `.d-none .d-md-block` — Show on desktop, hide on mobile
- `.d-md-none` — Show on mobile, hide on desktop
- `.dashboard-grid` — Auto-responsive grid with `auto-fill` columns

---

## Export Functionality

Data export is handled by `src/utils/export.js` using the `xlsx` library:

```javascript
import { exportToExcel, STUDENT_COLS } from '../utils/export';

// Export filtered data to Excel
exportToExcel(filteredStudents, STUDENT_COLS, 'students');
```

Pre-defined column configs: `STUDENT_COLS`, `TEACHER_COLS`, `PAYMENT_COLS`.
