import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const currentUrl = window.location.pathname;   


  if (!token) {
    localStorage.setItem("isFromProtectedRoute", currentUrl);
    return <Navigate to="/signup" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
