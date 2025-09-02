import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { screenShareAtom } from "@/atoms/screenShared";

export default function JoinAsGuest(){

    const { roomName } = useParams();
    const participantName = localStorage.getItem("participantName");
    const navigate = useNavigate();
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const screenShare = useRecoilValue(screenShareAtom);
    const setScreenShare = useSetRecoilState(screenShareAtom);

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
        setScreenShare((prev) => [
            ...prev,
            { userId: localStorage.getItem("userId") || "", isScreenShare: false }
        ]);
        console.log(screenShare);

        
        navigate(`/dashboard?token=${token}&role=guest`);
    };
    
    return <div>
        <button onClick={joinAsGuest}>Join Room</button>
    </div>

}