import type { LocalAudioTrack, RemoteAudioTrack } from "livekit-client";
import { useEffect, useRef } from "react";

interface AudioComponentProps {
    track: LocalAudioTrack | RemoteAudioTrack; 
    participantIdentity : string,
}

export default function AudioComponent({ track, participantIdentity }: AudioComponentProps) {
    const audioElement = useRef<HTMLAudioElement | null>(null); 
    

    useEffect(() => {
        if (audioElement.current) {
            track.attach(audioElement.current); 
        }

        return () => {
            track.detach(); 
        };
    }, [track]);

    return (
        <div className="relative rounded-xl bg-neutral-300 overflow-hidden ">
            <audio ref={audioElement} id={track.sid} className="rounded-2xl "/>;
            <span className="absolute text-white bottom-2 left-2 bg-black/50 px-2 py-1 rounded">{participantIdentity}</span>
        </div>
    )
    
    
    
}