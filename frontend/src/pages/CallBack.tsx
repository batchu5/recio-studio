import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
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
