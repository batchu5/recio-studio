
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PreStudio(){
    const [roomName, setRoomName] = useState<string>(`Test_Room${Date.now()}`);
    const participantName = localStorage.getItem("participantName");
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    
    const joinAsCreator = async () => {
      console.log("participantName:", participantName);
      const { token, room } = await axios.post(`${BackendUrl}/getToken`, {
        roomName: roomName,
        participantName: participantName,
        role: "creator"
      }).then(res => res.data);

      const shareLink = `${window.location.origin}/join/${room.name}`;
      localStorage.setItem("roomName", room.name);
      localStorage.setItem("roomId", room.id);
      navigate(`/dashboard?token=${token}&role=creator`);
    
      console.log("Share this link with guests:", shareLink);

    };

    return <div className="flex justify-center items-center h-screen w-screen">
      <div  className="px-4 py-8 rounded-2xl border border-neutral-300">
        <span className="mb-2">Enter the roomName  </span>
        <Input type="text" onChange={(e) => setRoomName(e.target.value)} placeholder="RoomName" className="mt-2"/>
        <div className="flex items-center justify-center">

        <Button onClick={joinAsCreator} className="mt-2"> Join the room </Button>
        </div>

      </div>
        
    </div>
}