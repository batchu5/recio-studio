import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${BackendUrl}/forgot-password`, {
        email,
      });
      console.log("res", res);

      toast.success("email sent successfully")
    } catch (error: any) {
      toast.error("The email is wrong")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-96"
      >
        <div className="mb-2 text-lg font-semibold">
          Enter your email to reset password
        </div>
        <Input
          type="email"
          placeholder="Enter your Email"
          className="mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "Sending..." : "Send Code"}
        </Button>
      </form>
    </div>
  );
}
