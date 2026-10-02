import React from "react";
import { Navigate } from "react-router-dom";

import { getRole, getToken } from "../utils/auth";

export default function ProtectedRoute({ children, role }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  if (role && getRole() !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}