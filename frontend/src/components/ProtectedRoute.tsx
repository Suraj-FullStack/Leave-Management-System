// Guards routes: redirects unauthenticated users to /login.
// If allowedRoles is set, also checks the user's role.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Role } from "../types";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { isAuthenticated, user } = useAuth();

  // Still hydrating from localStorage — show spinner briefly
  if (isAuthenticated === undefined) {
    return <LoadingSpinner label="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
