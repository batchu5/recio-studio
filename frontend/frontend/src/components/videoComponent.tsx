import type { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import { useEffect, useRef } from "react";
import { cn, displayName } from "@/lib/utils";

interface VideoComponentProps {
    track : LocalVideoTrack | RemoteVideoTrack | null,
    participantIdentity : string,
    local ?: boolean,
    screen ?: boolean,
    className ?: string,
}

export default function VideoComponent({track, participantIdentity, local = false, screen = false, className} : VideoComponentProps){
    const videoElement = useRef<HTMLVideoElement | null> (null);
    const name = displayName(participantIdentity);

    useEffect(() => {
        const el = videoElement.current;
        if(el && track != null){
            track.attach(el);
        }
        return () => {
            if(el && track != null){
                track.detach(el);
            }
        }
    }, [track]);

    return (
        <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/5", className)}>
            {track ? (
                <video
                    ref={videoElement}
                    id={track.sid}
                    autoPlay
                    playsInline
                    muted={local}
                    className={cn(
                        "h-full w-full",
                        screen ? "object-contain" : "object-cover",
                        local && !screen && "-scale-x-100"
                    )}
                />
            ) : (
                <div className="flex size-20 items-center justify-center rounded-full bg-neutral-800 text-3xl font-medium uppercase text-neutral-300">
                    {name.charAt(0)}
                </div>
            )}

            <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {screen ? `${name}'s screen` : local ? `${name} (You)` : name}
            </span>
        </div>
    )
}
