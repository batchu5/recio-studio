import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function JoinAsGuest(){

    const { roomId } = useParams();
    const participantName = localStorage.getItem("participantName");
    const navigate = useNavigate();
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        console.log("not working", roomId)
    },[])

    const joinAsGuest = async () => {
        if(!roomId){
            return;
        }
        console.log("callnig the joinAsGuest")
        const { token } = await axios.post(`${BackendUrl}/getToken`, {
            roomId,
            participantName: participantName,
            role: "guest"
        }).then(res => res.data);

        localStorage.setItem("roomId", roomId);
        navigate(`/dashboard?token=${token}&role=guest`);
    };
    
    return <div className="h-screen w-screen flex justify-center items-center">
        <Button onClick={joinAsGuest}>Join Room As Guest</Button>
    </div>

}