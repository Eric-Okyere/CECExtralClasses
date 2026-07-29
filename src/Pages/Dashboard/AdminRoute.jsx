import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  // Retrieve user data/token from localStorage or your Auth Context
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Check if logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user role is admin
  if (user?.admin !== true) {
    // Redirect non-admin users to their normal dashboard or home
    return <Navigate to="/" replace />;
  }

  return children;
}