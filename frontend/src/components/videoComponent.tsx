import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import { useEffect, useRef } from "react";

interface VideoComponentProps {
    track : LocalVideoTrack | RemoteVideoTrack | null,
    participantIdentity : string,
    local ?: boolean
}

export default function VideoComponent({track, participantIdentity,local = false} : VideoComponentProps){
    const videoElement = useRef<HTMLVideoElement | null> (null);
    useEffect(() => {
        if(videoElement.current && track != null){
            track.attach(videoElement.current);
        }
        return () => {
            if(videoElement.current && track != null){
                track.detach(videoElement.current);
            }
        }
    }, [track]);

    return (
        <div className="relative rounded-xl h-full w-full bg-neutral-600  flex justify-center">
            {track ? <video ref={videoElement} id={track.sid} className="rounded-2xl h-full"/> :
                <video ref={videoElement} className="w-full h-full rounded-2xl">

                </video>
            }
            
            <span className="absolute text-white bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
                {participantIdentity + (local ? " (You)" : "")}
            </span>
        </div>
    )
}