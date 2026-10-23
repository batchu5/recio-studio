import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveSession, takeRedirect } from "@/lib/session";

export default function Callback() {
  const navigate = useNavigate();
  // StrictMode runs effects twice in development; the second run would find the
  // fragment already cleared and wrongly send the user to sign in.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // The backend puts the token in the URL fragment so it never reaches server logs.
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    const email = params.get("email") || "";
    const userId = params.get("userId") || "";
    window.history.replaceState(null, "", window.location.pathname);

    if (token) {
      saveSession(token, { id: userId, email });
      navigate(takeRedirect(), { replace: true });
    } else {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  return <div className="flex min-h-dvh items-center justify-center bg-white text-sm text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400">Signing you in…</div>;
}
