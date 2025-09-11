import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function JoinAsGuest(){

    const { roomName } = useParams();
    const participantName = localStorage.getItem("participantName");
    const navigate = useNavigate();
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;

    const joinAsGuest = async () => {
        if(!roomName){
            return;
        }
        const { token } = await axios.post(`${BackendUrl}/getToken`, {
            roomName,
            participantName: participantName,
            role: "guest"
        }).then(res => res.data);

        const res = await axios.post(`${BackendUrl}/fetch_roomId_by_roomName`, {
            roomName: roomName
        })

        console.log("res", res.data);
        localStorage.setItem("roomName", roomName);
        localStorage.setItem("roomId", res.data.roomId);
        navigate(`/dashboard?token=${token}&role=guest`);
    };
    
    return <div className="h-screen w-screen flex justify-center items-center">
        <Button onClick={joinAsGuest}>Join Room As Guest</Button>
    </div>

}