import { useEffect, useState } from "react";
import { Check, Circle, Copy, Download, Mic, PhoneOff, ScreenShare, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import PersonPhoto from "./PersonPhoto";
import { people } from "./people";

const steps = [
    { label: "Create a room", caption: "Name your session and you're in the studio." },
    { label: "Guest joins with a link", caption: "Send one link. They join from the browser." },
    { label: "Hit record", caption: "Everyone is recorded on their own device, in full quality." },
    { label: "Download separate tracks", caption: "Get each person's file, plus a combined video." },
];

const STEP_MS = 3800;

function Tile({ name, initial, photo, recording }: { name: string, initial: string, photo: string, recording: boolean }) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-neutral-800">
            <PersonPhoto src={photo} initial={initial} className="absolute inset-0 size-full" />
            <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white sm:text-xs">{name}</span>
            {recording && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                    <span className="size-1.5 rounded-full bg-red-500" /> Local
                </span>
            )}
        </div>
    );
}

function Downloads() {
    const rows = [
        { name: "Combined video", meta: "Side by side, mixed audio" },
        { name: "You · camera", meta: "Your own track" },
        { name: "Sam · camera", meta: "Sam's own track" },
    ];
    return (
        <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-sm space-y-2">
                {rows.map((row, i) => (
                    <div key={row.name} className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10" style={{ animationDelay: `${i * 80}ms` }}>
                        <div>
                            <p className="text-xs font-medium text-white sm:text-sm">{row.name}</p>
                            <p className="text-[10px] text-neutral-400 sm:text-xs">{row.meta}</p>
                        </div>
                        <span className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-medium text-neutral-900 sm:text-xs">
                            <Download className="size-3" /> .webm
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StudioMock() {
    const [step, setStep] = useState(0);
    const [auto, setAuto] = useState(true);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!auto) return;
        const id = setInterval(() => setStep((s) => (s + 1) % steps.length), STEP_MS);
        return () => clearInterval(id);
    }, [auto]);

    useEffect(() => {
        if (step !== 2) return;
        setSeconds(0);
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [step]);

    const guestJoined = step >= 1;
    const recording = step === 2;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2" role="tablist" aria-label="How a session works">
                {steps.map((s, i) => (
                    <span key={s.label} className="flex items-center">
                        {i > 0 && <span className="mx-2 hidden h-px w-6 bg-neutral-300 sm:block dark:bg-neutral-700" aria-hidden="true" />}
                        <button
                            type="button"
                            role="tab"
                            aria-selected={step === i}
                            onClick={() => { setStep(i); setAuto(false); }}
                            className={cn(
                                "cursor-pointer rounded-full px-3 py-1 font-serif text-base transition-colors sm:text-lg",
                                step === i ? "text-neutral-950 underline decoration-red-500 decoration-2 underline-offset-[6px] dark:text-white" : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                            )}
                        >
                            {s.label}
                        </button>
                    </span>
                ))}
            </div>
            <p className="mt-3 text-center text-sm text-neutral-500 dark:text-neutral-400" aria-live="polite">{steps[step]!.caption}</p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex h-9 items-center gap-2 border-b border-neutral-200 px-4 dark:border-neutral-800">
                    <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[11px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">recio.app/studio</span>
                </div>

                <div className="flex aspect-[16/10] flex-col bg-neutral-950 text-white sm:aspect-[16/9]">
                    <div className="flex h-10 shrink-0 items-center justify-between px-4 sm:h-12">
                        <div className="flex items-center gap-2 text-xs font-medium sm:text-sm">
                            Episode 12
                            {recording && (
                                <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-300 ring-1 ring-red-500/30 sm:text-xs">
                                    <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                                    REC 00:{String(seconds).padStart(2, "0")}
                                </span>
                            )}
                        </div>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] sm:text-xs">Invite</span>
                    </div>

                    <div className="relative min-h-0 flex-1 px-3 sm:px-4">
                        {step === 3 ? (
                            <Downloads />
                        ) : (
                            <div className={cn("grid h-full gap-2 sm:gap-3", guestJoined ? "grid-cols-2" : "grid-cols-1")}>
                                <Tile name={people.you.name} initial={people.you.initial} photo={people.you.photo()} recording={recording} />
                                {guestJoined && <Tile name={people.sam.name} initial={people.sam.initial} photo={people.sam.photo()} recording={recording} />}
                            </div>
                        )}

                        {step === 0 && (
                            <div className="absolute bottom-3 left-5 w-[min(18rem,calc(100%-2.5rem))] rounded-xl bg-neutral-900/95 p-3 ring-1 ring-white/10">
                                <p className="text-[11px] font-medium sm:text-xs">Invite people</p>
                                <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/5 py-1 pl-2 pr-1 ring-1 ring-white/10">
                                    <span className="min-w-0 flex-1 truncate text-[10px] text-neutral-300 sm:text-xs">recio.app/join/7f3a91</span>
                                    <span className="flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-900"><Copy className="size-3" /> Copy</span>
                                </div>
                            </div>
                        )}
                        {step === 1 && (
                            <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-neutral-900/95 px-3 py-1 text-[10px] ring-1 ring-white/10 sm:text-xs">
                                <Check className="size-3 text-emerald-400" /> Sam joined
                            </div>
                        )}
                    </div>

                    <div className="flex h-12 shrink-0 items-center justify-center gap-1.5 sm:h-16 sm:gap-2.5">
                        {[Mic, Video, ScreenShare].map((Icon, i) => (
                            <span key={i} className="flex size-7 items-center justify-center rounded-full bg-white/10 sm:size-10"><Icon className="size-3.5 sm:size-4" /></span>
                        ))}
                        <span className={cn("flex h-7 items-center gap-1.5 rounded-full px-3 text-[10px] font-medium sm:h-10 sm:text-xs", recording ? "bg-white text-neutral-900" : "bg-white/10")}>
                            <Circle className="size-3 fill-red-500 text-red-500" /> {recording ? "Stop" : "Record"}
                        </span>
                        <span className="flex size-7 items-center justify-center rounded-full bg-red-600 sm:size-10"><PhoneOff className="size-3.5 sm:size-4" /></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
