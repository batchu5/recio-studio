const REDIRECT_KEY = "isFromProtectedRoute";

export function saveSession(token: string, user: { id: string; email: string }) {
  localStorage.setItem("token", token);
  localStorage.setItem("participantName", user.email);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userId", user.id);
}

// Where to go after signing in: the protected page that sent the user here, or the studio.
export function takeRedirect() {
  const target = localStorage.getItem(REDIRECT_KEY);
  localStorage.removeItem(REDIRECT_KEY);
  return target || "/preStudio";
}
