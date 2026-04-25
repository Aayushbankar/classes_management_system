# 5. Base System Features

This document outlines the complete set of features and data models present in the `Student-Management-System-SMS-` base repository before any new MVP features are applied.

## 5.1 User Authentication & Roles
*   Built-in Django User Authentication (Superuser and standard User).
*   No strict multi-tenant role isolation (Branch-based logic is missing).

## 5.2 Dashboard
*   Global view displaying total counts for Registered Students and Teachers.

## 5.3 Student Management
*   **Fields:** Profile Image, Roll Number, Classroom Mapping, Gender, Date of Birth, Address.
*   **Capabilities:** Full CRUD (Create, Read, Update, Delete). Search capability by username, roll number, or class.

## 5.4 Teacher Management
*   **Fields:** Profile Image, Full Name, Email (unique), Subject, Phone, Joining Date.
*   **Capabilities:** Add missing capabilities / view teachers.

## 5.5 Classroom Organization
*   **Fields:** Class Name, Section, Total Students count, Capacity, mapped to a single Class Teacher.
*   *(Note: This acts more as a grouping parameter rather than a time-based schedule).*

## 5.6 Attendance Tracking
*   Tracks daily attendance (Present/Absent) on a per-student, per-day basis.

## 5.7 Result Processing
*   Manual entry for 7 subjects.
*   Automatic background calculation for Total Points, Percentage, and grading logic (A+, A, B, C, F).

## 5.8 Basic Fee Tracking
*   **Fields:** Total Amount, Paid Amount, Date, Remarks.
*   **Capabilities:** Compares `paid_amount` to `amount` to automatically assign "paid" or "pending" status. *(Note: lacks ledger functionality for partial installments).*

## 5.9 Assignment System
*   Teachers can upload tasks with title, description, attached documentation files, and due dates tied to a specific Classroom.

## 5.10 Notices & Notifications
*   **Notices:** General broadcast system (Title, Message, Date).
*   **Notifications:** Targeted to specific User profiles with read/unread statuses.
