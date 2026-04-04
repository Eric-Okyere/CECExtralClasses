import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  // If there is no user in localStorage, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If there is a user, render the actual page (children)
  return children;
}