import { MicOff, Video, VideoOff, Mic, ScreenShare, ScreenShareOff, PhoneOff, Circle, Square } from "lucide-react";
import { useState } from "react";
import { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import { useRoom } from "./RoomContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

// Red is reserved for recording and leaving. A muted mic or camera shows as a
// white button with a crossed-out icon instead, so it's never mistaken for those.
function ControlButton({ label, active = false, danger = false, disabled = false, onClick, children, className }: {
    label: string,
    active?: boolean,
    danger?: boolean,
    disabled?: boolean,
    onClick: () => void,
    children: React.ReactNode,
    className?: string,
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "inline-flex h-12 min-w-12 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-5",
                danger ? "bg-red-600 text-white hover:bg-red-500" : active ? "bg-white text-neutral-900 hover:bg-neutral-200" : "bg-white/10 text-white hover:bg-white/15",
                className
            )}
        >
            {children}
        </button>
    );
}

export default function Controls() {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isvideoOn, setIsVideoOn] = useState(true);
    const { localAudioTrack, localTrack, handleScreenSharing, isScreenShareStarted, isScreenSharedByOthers, handleRecording, isRecordingStarted, leaveRoom, hasUnsavedRecording } = useRoom();
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role")
    const navigate = useNavigate();

    async function handleMic() {
        if (!localAudioTrack) return;
        if (isMicOn) {
            setIsMicOn(false);
            await (localAudioTrack as LocalAudioTrack).mute();
        } else {
            setIsMicOn(true);
            await (localAudioTrack as LocalAudioTrack).unmute();
        }
    }

    async function handleVideo() {
        if (!localTrack) return;
        if (isvideoOn) {
            setIsVideoOn(false);
            await (localTrack as LocalVideoTrack).mute();
        } else {
            setIsVideoOn(true);
            await (localTrack as LocalVideoTrack).unmute();
        }
    }

    async function handleLeave() {
        await leaveRoom();
        navigate("/preStudio");
    }

    const leaveLabel = isRecordingStarted
        ? "Stop the recording before leaving"
        : hasUnsavedRecording
            ? "Wait until your recording is saved"
            : "Leave room";

    return (
        <footer className="flex h-20 shrink-0 items-center justify-center gap-2 px-4 sm:gap-3">
            <ControlButton label={isMicOn ? "Mute microphone" : "Unmute microphone"} active={!isMicOn} onClick={handleMic}>
                {isMicOn ? <Mic /> : <MicOff />}
            </ControlButton>
            <ControlButton label={isvideoOn ? "Turn off camera" : "Turn on camera"} active={!isvideoOn} onClick={handleVideo}>
                {isvideoOn ? <Video /> : <VideoOff />}
            </ControlButton>
            <ControlButton
                label={isScreenSharedByOthers ? "Someone else is sharing their screen" : isScreenShareStarted ? "Stop sharing" : "Share screen"}
                active={isScreenShareStarted}
                disabled={isScreenSharedByOthers}
                onClick={handleScreenSharing}
            >
                {isScreenShareStarted ? <ScreenShareOff /> : <ScreenShare />}
            </ControlButton>

            {role === "creator" && (
                <ControlButton
                    label={isRecordingStarted ? "Stop recording" : "Start recording"}
                    active={isRecordingStarted}
                    onClick={handleRecording}
                    className="px-4"
                >
                    {isRecordingStarted ? <Square className="fill-red-500 text-red-500" /> : <Circle className="fill-red-500 text-red-500" />}
                    <span className="hidden sm:inline">{isRecordingStarted ? "Stop" : "Record"}</span>
                </ControlButton>
            )}

            <span className="mx-1 h-8 w-px bg-white/10" aria-hidden="true" />

            <ControlButton label={leaveLabel} danger disabled={hasUnsavedRecording} onClick={handleLeave} className="px-5">
                <PhoneOff />
                <span className="hidden sm:inline">Leave</span>
            </ControlButton>
        </footer>
    );
}
