# Internal User Hierarchy and Management

## Roles

- **Owner**
  - Full access to the system.
  - Can create/manage `Admin` and `Assistant` users.
  - Can view all branches and users.
  - Can perform audit-level operations.

- **Admin**
  - Mid-tier internal user with broader rights than Assistants.
  - Can manage `Assistant` users in their own branch.
  - Can manage branch-level data: students, teachers, schedules, fees.
  - Cannot create or manage `Owner` accounts.

- **Assistant**
  - Basic internal user for daily operations.
  - Can access their own branch data and notifications.
  - Cannot manage users.

## Backend Implementation

### Models

- `authentication.User`
  - `role` now supports: `owner`, `admin`, `assistant`.
  - `branch` remains the branch assignment for users.

- `authentication.UserActionLog`
  - Captures create/update/delete/password change/logout actions.
  - Fields: `actor`, `target_user`, `action`, `details`, `timestamp`.

### API

- Added `/api/auth/users/` via new `UserViewSet`.
- Access rules:
  - `Owner`: full CRUD over users.
  - `Admin`: can CRUD only `Assistant` users in the same branch.
  - `Assistant`: can only read their own profile.
- `Admin` create requests automatically assign `assistant` role and the admin's branch.

### Permissions

- `UserManagementPermission` enforces:
  - Owner access to everything.
  - Admin access only to same-branch assistants and their own profile.
  - Assistant access only to their own profile.

## Frontend Implementation

- Added `src/pages/UsersPage.js`.
- New route: `/app/users`.
- Sidebar includes `Users` only for `Owner` and `Admin` roles.
- Page supports:
  - list users
  - create users
  - edit users
  - delete users
- Owner can create `owner`, `admin`, and `assistant` roles.
- Admin can create only `assistant` users.

## Notes

- User role checks are enforced on both frontend and backend.
- Frontend helper functions updated in `src/api.js`: `isAdmin()`, `isOwner()`, `canManageUsers()`.
- Backend route registration added in `backend/authentication/urls.py`.
