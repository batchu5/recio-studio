import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useRoom } from "./RoomContext";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

export default function PermissionCheck(){
    const videoRef = useRef<HTMLVideoElement | null>(null); 
    const {joinRoom} = useRoom();
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const origin = window.location.origin; 
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role");

    async function enablePermission() {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setHasPermission(true);

        } catch (error) {
            console.log("error while setting up the permission", error)
        }
    }

    
    useEffect(() => {
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
            }
    }, [stream]);

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="bg-black p-4 flex">
                <div className="flex justify-center ">
                    <div className="">
                        <h1 className=" text-2xl ">Let's check your  Camera and mic...</h1>
                        
                        {!hasPermission
                            ? (
                                <div className="flex justify-center mt-2">
                                    <Button onClick={enablePermission} className="w-full">
                                        Click here to check
                                    </Button>
                                </div>
                            ): (<div className="flex justify-center" >
                                <video ref={videoRef} autoPlay playsInline className="w-[200px] h-[160px] rounded-2xl "></video>
                            </div>)
                        }
                        <div className="flex justify-center my-2" >
                            <Button onClick={joinRoom} className="w-full" disabled={!hasPermission}>Join Room</Button>
                        </div>
                        <div>
                            {
                                role === "creator" && <Button className="w-full" 
                                    onClick={() => {
                                        toast.success("link copied");
                                        navigator.clipboard.writeText(`${origin}/join/${localStorage.getItem("roomId")}`);
                                    }}>
                                        Share url with others
                                    </Button>
                            }
                            
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}