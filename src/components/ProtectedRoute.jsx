// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  const isSetupComplete = Boolean(
    (user.learningProfile?.level || user.level) &&
    (user.learningProfile?.gender || user.gender)
  );

  // If user is authenticated but profile is incomplete, force redirect back to login
  if (!isSetupComplete) {
    return <Navigate to="/login" replace />;
  }

  return children;
}