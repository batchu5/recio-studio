
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface roomProps { 
  url : string,
  roomName: string,
  roomId: string
}

export default function PreStudio(){
    const [roomName, setRoomName] = useState<string>(`Test_Room${Date.now()}`);
    const [urls, setUrls] = useState<roomProps[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
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
    
    const handleSelectedRoom = (roomId: string) => {
      setSelectedRoom(roomName);
      navigate(`/preStudio/${roomId}`);
    }

    return <div className="">
      <div  className="py-8 rounded-2xl px-4 text-center">
        <span className="mb-2 text-2xl ">Create a new Room</span>
        <div className="flex gap-4 justify-center">
          <Input type="text" onChange={(e) => setRoomName(e.target.value)} placeholder="Enter the RoomName" className="mt-2 w-fit"/>
          <span className="flex items-center justify-center ">
            <Button onClick={joinAsCreator} className="mt-2 bg-cyan-600"> <Plus  className=" size-6"/> Create the room </Button>
          </span>

        </div>
      </div>

      <div>
        <h1 className="text-2xl mb-4 px-4 text-[#39AAAA]">Previous rooms</h1>
        {urls.length === 0 && 
          <div className=" flex items-center justify-center text-neutral-600 text-center text-2xl"> 
            No previous Rooms found
          </div>
        }
        {!selectedRoom && <div className="md:grid md:grid-cols-3 px-6 py-2">
          { 
            urls.map((room) => 
            <div className="ml-4 border border-neutral-500 rounded-2xl mt-4"> 
                <span className="text-xl px-2 pt-2 underline cursor-pointer flex items-start justify-start" onClick={() => {handleSelectedRoom(room.roomId)}}>{room.roomName}</span>
              <video src={room.url} controls className="w-full h-[250px] object-center rounded-xl "/>
            </div>)
          }

        </div>}
        

      </div>

    </div>
}