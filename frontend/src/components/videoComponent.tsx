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
        <div className="rounded-xl bg-blue-200  relative">
            <video ref={videoElement} id={track.sid} className="rounded-2xl h-[300px]">
            </video>
            <span className="absolute text-white bottom-2 left-2 ">{participantIdentity + (local ? " (You)" : "")}</span>
        </div>
    )
}