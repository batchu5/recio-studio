
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface roomProps { 
  url : string,
  roomName: string
}

export default function PreStudio(){
    const [roomName, setRoomName] = useState<string>(`Test_Room${Date.now()}`);
    const [urls, setUrls] = useState<roomProps[]>([]);
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
    

    return <div className="  ">
      <div  className="py-8 rounded-2xl px-4 text-center">
        <span className="mb-2 text-2xl ">Create a new Room</span>
        <div className="flex gap-4 justify-center">
          <Input type="text" onChange={(e) => setRoomName(e.target.value)} placeholder="RoomName" className="mt-2 w-fit"/>
          <span className="flex items-center justify-center ">
            <Button onClick={joinAsCreator} className="mt-2 bg-cyan-300" > Join the room </Button>
          </span>

        </div>
        

      </div>

      <div>
        <h1 className="text-2xl mb-4 px-4 text-cyan-200">Previous rooms</h1>
        <div className="grid grid-cols-3 px-6">
          {
            urls.map((room) => 
            <div className=""> 
              <span className="text-xl  pb-10 ml-4 ">{room.roomName}</span>
              <video src={room.url} controls className="w-full h-[300px] object-cover rounded-xl mt-2"/>
            </div>)
            
          }

        </div>
        

      </div>

    </div>
}