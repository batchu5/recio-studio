import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthLayout, Field, SubmitButton } from "@/components/auth/AuthLayout";

const MIN_PASSWORD = 8;

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const token = new URLSearchParams(window.location.search).get("token");
  const navigate = useNavigate();
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await axios.post(`${BackendUrl}/reset-password`, { newPassword, token });
      toast.success("Password updated. Sign in with your new password.");
      navigate("/signin");
    } catch {
      toast.error("This reset link is invalid or has expired. Request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Link not valid"
        subtitle="This reset link is missing its code. Request a new one."
        footer={<Link to="/forgotpassword" className="font-medium text-neutral-950 underline underline-offset-4 dark:text-white">Request a new link</Link>}
      >
        {null}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Field id="new-password" label="New password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">At least {MIN_PASSWORD} characters.</p>
        </div>
        <SubmitButton loading={loading} loadingText="Saving…">Save password</SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
