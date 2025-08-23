
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PreStudio(){
    const [roomName, setRoomName] = useState<string>(`Test_Room${Date.now()}`);
    const participantName = localStorage.getItem("participantName");
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    
    const joinAsCreator = async () => {

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

    return <div>
        participant Identity : {participantName}
        Enter the roomName : <input type="text" onChange={(e) => setRoomName(e.target.value)}/>

        <button onClick={joinAsCreator}> Join the room </button>
    </div>
}