import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";
import DashboardPage from "./pages/DashboardPage";
import BranchesPage from "./pages/BranchesPage";
import StudentsPage from "./pages/StudentsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import TeachersPage from "./pages/TeachersPage";
import TeacherDetailPage from "./pages/TeacherDetailPage";
import FeesPage from "./pages/FeesPage";
import TimetablePage from "./pages/TimetablePage";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";

const wrap = (component) => <ErrorBoundary>{component}</ErrorBoundary>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={wrap(<DashboardPage />)} />
          <Route path="branches"      element={wrap(<BranchesPage />)} />
          <Route path="students"      element={wrap(<StudentsPage />)} />
          <Route path="students/:id"  element={wrap(<StudentDetailPage />)} />
          <Route path="teachers"      element={wrap(<TeachersPage />)} />
          <Route path="teachers/:id"  element={wrap(<TeacherDetailPage />)} />
          <Route path="fees"          element={wrap(<FeesPage />)} />
          <Route path="timetable"     element={wrap(<TimetablePage />)} />
          <Route path="notifications" element={wrap(<NotificationsPage />)} />
          <Route path="users"         element={wrap(<UsersPage />)} />
          <Route path="reports"       element={wrap(<ReportsPage />)} />
          <Route path="profile"       element={wrap(<ProfilePage />)} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
