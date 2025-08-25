import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import { useEffect, useRef } from "react";

interface VideoComponentProps {
    track : LocalVideoTrack | RemoteVideoTrack,
    participantIdentity : string,
    local ?: boolean
}

export default function VideoComponent({track, participantIdentity,local = false} : VideoComponentProps){
    const videoElement = useRef<HTMLVideoElement | null> (null);
    useEffect(() => {
        if(videoElement.current){
            track.attach(videoElement.current);
        }
        return () => {
            track.detach();
        }
    }, [track]);

    return (
         <div  className=" w-[300px] ">
            <video ref={videoElement} id={track.sid} className="rounded-2xl w-[300px] bg-red-300">
            </video>
            <span className="text-white bottom-2 left-2">{participantIdentity + (local ? " (You)" : "")}</span>
        </div>
    )
}