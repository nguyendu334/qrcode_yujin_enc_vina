/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";

export default function RoleRoute({ roles, children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
