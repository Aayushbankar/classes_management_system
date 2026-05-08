# 6. Work To Do (Targeting MVP / Round 1 Evaluation)

This document maps the exact gap analysis and tasks required to convert the base system to map the requirements stated in files `1-4`.

## 6.1 High Effort Tasks
### 1. Role-Based Data Partitioning (Branch System)
*   **Task:** Introduce `Branch` model.
*   **Task:** Extend `User` profile to distinguish `BranchManager` from central Administrator.
*   **Task:** Retrofit all base models (`Student`, `Teacher`, `ClassRoom`, `Fee`) across the Django app to include a `ForeignKey` to `Branch`.
*   **Task:** Rewrite View sets to filter all queries explicitly by the `request.user.branch`.

### 2. Dynamic Fee Management Dashboard (Power BI Style Experience)
*   **Task:** Deprecate the simple fee logic. Construct a `FeePayment` Ledger model for partial payments (Cash, Cheque, UPI).
*   **Task:** Build an interactive, "Power BI-like" Dashboard experience. Instead of static Django templates, implement a rich charting library (e.g., **ApexCharts** or **Chart.js**) to render Expected vs Collected revenue gauges and charts.
*   **Task:** Implement **AJAX-based Dynamic Cross-Filtering**. When a user selects a Branch or Standard filter, the page should not reload; instead, it performs an async request and fluidly animates the UI updates for both the charts and the data grid below it to mimic the feel of a BI tool.

## 6.2 Medium Effort Tasks
### 3. Class Timetable Management
*   **Task:** Create a `TimeTableSlot` model defining `DayOfWeek`, `StartTime`, `EndTime`, `Subject`, `Teacher`.
*   **Task:** Implement **Conflict Resolution**: Validate upon saving that the incoming `Teacher` is not already scheduled on the same `Day` and `Time` across any branch.
*   **Task:** Create an interactive UI to display timetables hierarchically (`Branch -> Standard -> Slots`).

### 4. Test Scheduling & Smart Reminders ("Sunday/Monday Rule")
*   **Task:** Build the `TestSchedule` model (Date, Syllabus, Standard).
*   **Task:** Inject a Background Worker logic into the stack. A cron job or Celery worker must run daily to scan for tests X days out and automatically post "In-App" records into the existing `Notification` table to alert staff.

## 6.3 Low/Medium Effort Tasks
### 5. Smooth Student Onboarding
*   **Task:** Adapt the existing backend Add Student form to be purely keyboard navigable (tab indexes).
*   **Task:** Generate a Bulk **CSV file Upload View** mapping CSV headers into the extended `Student` models natively.

### 6. DevOps & Infrastructure
*   **Task:** **Dockerize the Application.** Write the `Dockerfile` and `docker-compose.yml` to package Django along with its workers (Celery/Redis) and web servers (Gunicorn) targeting the Round 1 deployment evaluation.
