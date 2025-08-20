import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userIdAtom } from "../atoms/userId";

export default function Signin() {
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

    }catch (error: any) {
        if (error.response) {
            console.log({"error" : error})
        } 
    }
  };

  return (
    <div>
      <h2>Signin</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Signin</button>
      </form>
    </div>
  );
}
