import React, { useState } from "react";
import axios, { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthLayout, Field, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/AuthLayout";
import { saveSession, takeRedirect } from "@/lib/session";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BackendUrl}/signin`, { email, password });
      saveSession(response.data.token, response.data.user);
      navigate(takeRedirect());
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        toast.error("Wrong email or password.");
      } else if (isAxiosError(err) && !err.response) {
        toast.error("Network error. Check your connection and try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your studio."
      footer={<>Don't have an account? <Link to="/signup" className="font-medium text-neutral-950 underline underline-offset-4 dark:text-white">Sign up</Link></>}
    >
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        <div>
          <Field id="password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="mt-2 text-right">
            <Link to="/forgotpassword" className="text-sm text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">Forgot password?</Link>
          </div>
        </div>
        <SubmitButton loading={loading} loadingText="Signing in…">Sign in</SubmitButton>
      </form>
    </AuthLayout>
  );
}
