import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid/missing token")
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${BackendUrl}/reset-password`, {
        newPassword,
        token,
      });
      console.log("res", res);

      toast.success("successfull")
      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
    } catch (error: any) {
        toast.error("error while reseting")
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
          Enter your new password
        </div>
        <Input
          type="password"
          placeholder="New Password"
          className="mt-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
