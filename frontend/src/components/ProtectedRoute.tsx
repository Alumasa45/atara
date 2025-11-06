import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const location = useLocation();
  // When redirecting to the login page, clear any modal/background state
  // so the App's `location.state.background` doesn't cause Routes to
  // render the wrong (background) location and produce the "No routes
  // matched location \"/login\"" warning.
  if (!auth.token) return <Navigate to="/login" replace state={{}} />;
  return <>{children}</>;
}
