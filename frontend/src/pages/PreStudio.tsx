
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PreStudio(){
    const [roomName, setRoomName] = useState<string>(`Test_Room${Date.now()}`);
    const [urls, setUrls] = useState<string[]>([]);
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

    useEffect(() => {

      const fetch = async() => {
        const res = await axios.post(`${BackendUrl}/prev_mixed_urls`, {
          participantName : participantName
        })

        setUrls(res.data.fetchedUrls)
      }

      fetch();
  
    },[]);
    const getRooms = async () => {
        const result = await axios.post(`${BackendUrl}/prev_mixed_urls`, {
          participantName: participantName
        }) 

        console.log("mixed Urls", result.data);
    }

    return <div className="  ">
      <div  className="px-4 py-8 rounded-2xl ">
        <span className="mb-2">Enter the roomName  </span>
        <Input type="text" onChange={(e) => setRoomName(e.target.value)} placeholder="RoomName" className="mt-2"/>
        <div className="flex items-center justify-center">

        <Button onClick={getRooms} className="mt-2 mr-1">Get previous rooms data</Button>

        <Button onClick={joinAsCreator} className="mt-2"> Join the room </Button>
        </div>

      </div>

      <div>
        <h1 className="text-2xl mb-4">Rooms Created</h1>
        <div className="grid grid-cols-3">
          {
            urls.map((url) => 
            <div> 
              <video src={url} width="300px" height={"300px"} controls className="rounded-xl"/>
            </div>)
          }

        </div>
        

      </div>

    </div>
}