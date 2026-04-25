# 4. Non-Functional Requirements (NFR)

*   **Usability & Transition UX:** Since the staff is migrating from physical registers to a digital platform, form entry speed (optimizing for keyboard navigation) and clear UI hierarchies are critical for adoption.
*   **Role-Based Data Partitioning:** Implementation of basic administrative roles to ensure data integrity (e.g., making sure Branch 1 records are organized cleanly apart from Branch 2 data, even if viewable centrally).
*   **State Reliability:** The application must ensure reliable state delivery of the in-screen and web push notifications to the respective admin sessions so that reminders are never missed.
