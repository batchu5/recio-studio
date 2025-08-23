import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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

        localStorage.setItem("roomName", roomName );
        navigate(`/dashboard?token=${token}&role=guest`);
    };
    
    return <div>
        <button onClick={joinAsGuest}>Join Room</button>
    </div>

}