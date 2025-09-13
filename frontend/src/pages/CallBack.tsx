import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const participantName = params.get("participantName") || "";

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("participantName", participantName);
      const savedRoute = localStorage.getItem("isFromProtectedRoute");
      if (savedRoute) {
        localStorage.removeItem("isFromProtectedRoute");
        navigate(savedRoute);
      } else {
        navigate("/preStudio");
      }
    } 
  }, [navigate]);

  return <div>Signing you in with Google...</div>;
}
