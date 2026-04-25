import React from 'react';
import { Navigate } from 'react-router-dom';

function isTokenValid() {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
