import React, { useState } from "react";
import axios, { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthLayout, Field, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/AuthLayout";
import { saveSession, takeRedirect } from "@/lib/session";

const MIN_PASSWORD = 8;

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BackendUrl}/signup`, { email, password });
      saveSession(response.data.token, response.data.user);
      navigate(takeRedirect());
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        toast.error("An account with this email already exists. Try signing in.");
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
      title="Create your studio"
      subtitle="Free plan includes 2 hours every month."
      footer={<>Already have an account? <Link to="/signin" className="font-medium text-neutral-950 underline underline-offset-4 dark:text-white">Sign in</Link></>}
    >
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        <div>
          <Field id="password" label="Password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">At least {MIN_PASSWORD} characters.</p>
        </div>
        <SubmitButton loading={loading} loadingText="Creating account…">Create account</SubmitButton>
      </form>
    </AuthLayout>
  );
}
