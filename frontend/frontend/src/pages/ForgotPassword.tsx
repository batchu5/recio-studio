import { useState } from "react";
import axios, { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MailCheck } from "lucide-react";
import { AuthLayout, Field, SubmitButton } from "@/components/auth/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BackendUrl}/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      toast.error(isAxiosError(err) && err.response?.status === 400 ? "No account uses this email." : "Couldn't send the email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const backToSignIn = <Link to="/signin" className="font-medium text-neutral-950 underline underline-offset-4 dark:text-white">Back to sign in</Link>;

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`We sent a reset link to ${email}. It's valid for 15 minutes.`} footer={backToSignIn}>
        <MailCheck className="mx-auto size-10 text-red-600 dark:text-red-400" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link." footer={backToSignIn}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        <SubmitButton loading={loading} loadingText="Sending…">Send reset link</SubmitButton>
      </form>
    </AuthLayout>
  );
}
