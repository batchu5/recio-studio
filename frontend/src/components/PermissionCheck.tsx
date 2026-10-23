import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, VideoOff } from "lucide-react";
import { useRoom } from "./RoomContext";
import InviteLink from "./InviteLink";
import AppHeader from "./AppHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PermissionCheck(){
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const {joinRoom} = useRoom();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    const navigate = useNavigate();
    const roomName = localStorage.getItem("roomName") || "Recording studio";
    const roomId = localStorage.getItem("roomId");

    async function enablePermission() {
        setError(null);
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(userStream);
        } catch (err) {
            const name = (err as DOMException)?.name;
            setError(
                name === "NotAllowedError"
                    ? "Camera and microphone access was blocked. Allow it from the address bar and try again."
                    : name === "NotFoundError"
                        ? "No camera or microphone was found on this device."
                        : "Couldn't start your camera. Close other apps using it and try again."
            );
        }
    }

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Release the preview camera when leaving the lobby; the room opens its own tracks.
    useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

    async function handleJoin() {
        setJoining(true);
        stream?.getTracks().forEach((t) => t.stop());
        const joined = await joinRoom();
        // joinRoom swaps this screen for the room right away, so report failures with a toast.
        if (!joined) {
            toast.error("Couldn't connect to the room. Check your connection and try again.");
        }
    }

    return (
        <div className="flex min-h-dvh flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
            <AppHeader />
            <main className="flex flex-1 items-center justify-center px-5 py-10">
                <div className="grid w-full max-w-5xl gap-10 md:grid-cols-[1.35fr_1fr] md:items-center">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-neutral-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
                        {stream ? (
                            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-400">
                                <VideoOff className="size-7" />
                                <span className="text-sm">Camera is off</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-5">
                        <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Ready to join?</p>
                            <h1 className="mt-2 break-words font-serif text-4xl">{roomName}</h1>
                            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
                                Check your camera and mic first. Each person is recorded locally in full quality.
                            </p>
                        </div>

                        {error && (
                            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300" role="alert">{error}</p>
                        )}

                        {!stream ? (
                            <button type="button" onClick={enablePermission} className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 font-medium text-white transition-colors hover:bg-red-500">
                                <Camera className="size-4" /> Enable camera & mic
                            </button>
                        ) : (
                            <button type="button" onClick={handleJoin} disabled={joining} className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60">
                                {joining ? <><Loader2 className="size-4 animate-spin" /> Joining…</> : "Join room"}
                            </button>
                        )}

                        {roomId && (
                            <div className="border-t border-neutral-200 pt-5 dark:border-neutral-800">
                                <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">Invite others</p>
                                <InviteLink roomId={roomId} />
                            </div>
                        )}

                        <button type="button" onClick={() => navigate("/preStudio")} className="cursor-pointer self-start text-sm text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                            ← Back to rooms
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
