import VideoComponent from "./videoComponent";
import InviteLink from "./InviteLink";
import { useEffect, useState } from "react";
import { useRoom } from "./RoomContext";
import { UserPlus } from "lucide-react";

function gridShape(count: number, narrow: boolean) {
    if (narrow) return { cols: count > 2 ? 2 : 1, rows: Math.ceil(count / (count > 2 ? 2 : 1)) };
    const cols = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4;
    return { cols, rows: Math.ceil(count / cols) };
}

function useIsNarrow() {
    const [narrow, setNarrow] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setNarrow(window.innerWidth < 640);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return narrow;
}

export default function VideoGrid(){
    const {screenTrack, localTrack, remoteTracks, isScreenShareStarted} = useRoom();
    const participantName = localStorage.getItem("participantName") || "You";
    const roomId = localStorage.getItem("roomId");
    const narrow = useIsNarrow();

    const remoteCameras = remoteTracks.filter(
        (rt) => rt.trackPublications.kind === "video" && rt.trackPublications.source === "camera"
    );
    const screenOwner = isScreenShareStarted
        ? participantName
        : remoteTracks.find((rt) => rt.trackPublications.source === "screen_share")?.participantIdentity ?? "Someone";

    const tiles = [
        ...(localTrack ? [<VideoComponent key="local" track={localTrack} participantIdentity={participantName} local />] : []),
        ...remoteCameras.map((rt) => (
            <VideoComponent
                key={rt.trackPublications.trackSid}
                track={rt.trackPublications.videoTrack!}
                participantIdentity={rt.participantIdentity}
            />
        )),
    ];

    if (screenTrack) {
        return (
            <div className="flex h-full min-h-0 flex-col gap-3 md:flex-row">
                <div className="min-h-0 flex-1">
                    <VideoComponent track={screenTrack} participantIdentity={screenOwner} screen local={isScreenShareStarted} className="bg-black" />
                </div>
                <div className="flex shrink-0 gap-3 overflow-auto md:w-64 md:flex-col">
                    {tiles.map((tile) => (
                        <div key={tile.key} className="aspect-video w-48 shrink-0 md:w-full">{tile}</div>
                    ))}
                </div>
            </div>
        );
    }

    const { cols, rows } = gridShape(tiles.length, narrow);
    const isAlone = remoteCameras.length === 0;

    return (
        <div className="relative h-full min-h-0">
            <div
                className="grid h-full gap-3"
                style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
            >
                {tiles}
            </div>

            {isAlone && roomId && (
                <div className="absolute bottom-4 left-4 w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-2xl backdrop-blur">
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white">
                        <UserPlus className="size-4 text-red-400" />
                        You're the only one here
                    </div>
                    <p className="mb-3 text-xs text-neutral-400">Share this link so others can join the session.</p>
                    <InviteLink roomId={roomId} />
                </div>
            )}
        </div>
    )
}
