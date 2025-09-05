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
            if(videoElement.current){
                track.detach(videoElement.current);
            }
        }
    }, [track]);

    return (
        <div className="relative rounded-xl h-full  flex justify-center">
            <video ref={videoElement} id={track.sid} className="rounded-2xl h-full"/>
            <span className="absolute text-white bottom-2 left-2 bg-black/50 px-2 py-1 rounded">{participantIdentity + (local ? " (You)" : "")}</span>
        </div>
    )
}