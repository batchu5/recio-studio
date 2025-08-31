import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userIdAtom } from "../atoms/userId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setUserId = useSetRecoilState(userIdAtom)
  const navigate = useNavigate();
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BackendUrl}/signin`, {
        email,
        password,
      });

      setUserId(response.data.user.email);
      console.log("participant email", response.data.user.email);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("participantName", response.data.user.email);
      navigate("/preStudio");

    } catch (error: any) {
      if (error.response) {
        console.log({ "error": error })
      }
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center ">
      <div className="rounded-xl w-[252px] bg-linear-to-tr from-70% from-black to-cyan-300  h-[250px]">
        <div className="rounded-xl  w-[251px] bg-linear-to-bl from-70% from-black to-cyan-300 h-[249px] mt-[1px] mr-[1px]">

        <div className="px-8 py-8 rounded-xl bg-black w-[250px] h-[248px] ml-[1px] mb-[1px]">
          <div className="">
          <h1 className="text-2xl text-center font-bold">Welcome</h1>
          <h3 className="mb-6 text-neutral-400">Signup to your account to continue</h3>

          <form onSubmit={handleSubmit} className="">
            <div>
              <label>Username</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email" />

            </div>

            <div>
              <label>Password</label>
              <Input
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-xs cursor-pointer hover:text-cyan-300 text-neutral-500 text-right mt-1">Forget Password</div>

            <Button className="w-full mt-4 bg-[#099DA6] hover:bg-cyan-300" onSubmit={handleSubmit}>Signup</Button>
          </form>

        </div>

        </div>
        
        </div>

      </div>
     </div>

  );
}
