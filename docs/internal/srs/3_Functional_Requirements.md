# 3. Functional Requirements (Core Services)

### 3.1 Fee Management & Analytics Dashboard
**Goal:** Provide an organized, high-level and granular view of financial health across branches.
*   **Manual Payment Ledger:** Admins manually record cash, cheque, or external UPI transactions against a student's profile. (No online payment gateway integrations are required).
*   **Interactive Filters:** Drill down the fee data dashboard by:
    *   *Branch:* e.g., Branch 1, Branch 2.
    *   *Standard:* 7th, 8th, 9th, 10th, 11th, 12th.
    *   *Batch Timing:* Predefined slots (7 AM - 9 AM, 9 AM - 1 PM, 4 PM - 6 PM, 6 PM - 8 PM).
*   **Data Grid (Student Level):** Once filters are applied, display a localized tabular view indicating: `Sr No | Student Name | Total Fees | Paid | Pending Amount`. Visual cues for overdue students should be included.
*   **Analytics Graph:** Visual charts representing Total Expected Revenue vs. Actually Collected Revenue vs. Pending Revenue.

### 3.2 Student Onboarding & Data Migration
**Goal:** Smooth workflow for transitioning offline student records into the digital system.
*   **Manual Entry Form:** A dedicated digital admission form to onboard students individually. This is the primary onboarding option for day-to-day use.
*   **Bulk CSV Import:** Secondary offline migration support to load existing physical records from Excel/CSV when needed.

### 3.3 Class Timetable Management
**Goal:** A centralized hub to view, manage, and assign class schedules.
*   **Hierarchical View:** Ability to view the respective timetable categorized by `Branch` and nested by `Standard`.
*   **Resource Allocation:** Every scheduled time slot must map to both a specific **Subject** AND a specific **Teacher Profile**. 
*   **Conflict Resolution:** Basic UI validation should exist to prevent assigning the same teacher to two different classes occurring simultaneously.

### 3.4 Test Scheduling & Push Notification System
**Goal:** Keep track of upcoming exams and actively remind staff/teachers about test schedules.
*   **Test Schedule Board:** A module explicitly to schedule weekly/monthly tests per Standard/Branch.
*   **Smart Reminders (The "Sunday/Monday" rule):** If a test is scheduled on a specific date (e.g., Sunday), the internal system registers an automated pipeline to alert staff starting X days prior (e.g., Monday).
*   **In-App Alerts:** The primary delivery method for these notifications is Web App Push Notifications and an In-Screen notification bell within the logged-in dashboard.
