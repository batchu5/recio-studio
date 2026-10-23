import { useEffect, useRef, useState } from "react";
import { UserPlus, Users, X } from "lucide-react";
import { useRoom } from "./RoomContext";
import InviteLink from "./InviteLink";
import { LogoMark } from "./Logo";

function formatElapsed(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const h = Math.floor(m / 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m % 60)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function RecordingTimer() {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const startedAt = Date.now();
        const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-300 ring-1 ring-red-500/30">
            <span className="size-2 animate-pulse rounded-full bg-red-500" />
            REC <span className="tabular-nums">{formatElapsed(elapsed)}</span>
        </span>
    );
}

export default function RoomHeader() {
    const { remoteTracks, isRecordingStarted } = useRoom();
    const [inviteOpen, setInviteOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const roomName = localStorage.getItem("roomName") || "Recording studio";
    const roomId = localStorage.getItem("roomId");
    const participants = 1 + new Set(remoteTracks.map((rt) => rt.participantIdentity)).size;

    useEffect(() => {
        if (!inviteOpen) return;
        const onClick = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setInviteOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setInviteOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [inviteOpen]);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-3">
                <LogoMark className="size-6 shrink-0" />
                <h1 className="truncate text-base font-medium text-white">{roomName}</h1>
                {isRecordingStarted && <RecordingTimer />}
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-neutral-300 sm:inline-flex" title="People in this room">
                    <Users className="size-3.5" />
                    {participants}
                </span>

                <div className="relative" ref={popoverRef}>
                    <button
                        type="button"
                        onClick={() => setInviteOpen((open) => !open)}
                        aria-expanded={inviteOpen}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
                    >
                        <UserPlus className="size-4" />
                        <span className="hidden sm:inline">Invite</span>
                    </button>

                    {inviteOpen && (
                        <div className="absolute right-0 top-full z-30 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-neutral-900 p-4 shadow-2xl">
                            <div className="mb-1 flex items-center justify-between">
                                <h2 className="text-sm font-medium text-white">Invite people</h2>
                                <button type="button" onClick={() => setInviteOpen(false)} aria-label="Close" className="cursor-pointer rounded-md p-1 text-neutral-400 hover:bg-white/10 hover:text-white">
                                    <X className="size-4" />
                                </button>
                            </div>
                            <p className="mb-3 text-xs text-neutral-400">Anyone with this link can join after signing in.</p>
                            <InviteLink roomId={roomId} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
