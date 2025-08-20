import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userIdAtom } from "../atoms/userId";
import axios from "axios";

export default function JoinAsGuest(){

    const { roomName } = useParams();
    const participantName = useRecoilValue(userIdAtom);
    const navigate = useNavigate();
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;

    const joinAsGuest = async () => {

        if(!roomName){
            return;
        }
        const { token } = await axios.post(`${BackendUrl}/getToken`, {
            roomName,
            participantId: participantName,
            role: "guest"
        }).then(res => res.data);

        localStorage.setItem("roomName", roomName );
        navigate(`/dashboard?token=${token}&role=guest`);
    };
    
    return <div>
        <button onClick={joinAsGuest}>Join Room</button>
    </div>

}