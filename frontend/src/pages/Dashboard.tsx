import VideoGrid from "@/components/VideoGrid";
import Controls from "@/components/Controls";
import RoomHeader from "@/components/RoomHeader";
import UploadStatus from "@/components/UploadStatus";
import { useEffect } from "react";
import PermissionCheck from "@/components/PermissionCheck";
import { useRoom } from "@/components/RoomContext";

export default function Dashboard() {
    const {room, hasUnsavedRecording} = useRoom();

    // Closing or reloading the tab before chunks are uploaded would lose part of the recording.
    useEffect(() => {
        if (!hasUnsavedRecording) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [hasUnsavedRecording]);

    if (!room) {
        return <PermissionCheck />;
    }

    // The studio is always dark, whatever theme the rest of the app uses.
    return (
        <div className="dark flex h-dvh w-full flex-col overflow-hidden bg-neutral-950 text-white">
            <RoomHeader />
            <main className="relative min-h-0 flex-1 px-4">
                <UploadStatus />
                <VideoGrid />
            </main>
            <Controls />
        </div>
    );
}
