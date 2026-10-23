import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import PersonPhoto from "./PersonPhoto";
import { people } from "./people";

function Panel({ children }: { children: ReactNode }) {
    return (
        <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl bg-neutral-100 p-6 sm:p-10 dark:bg-neutral-900">
            {children}
        </div>
    );
}

function MiniTile({ label, sharp }: { label: string, sharp: boolean }) {
    return (
        <figure className="w-36 sm:w-48">
            <figcaption className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">{label}</figcaption>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                <div className="aspect-video overflow-hidden">
                    {/* The call version is the same photo, requested tiny and blurred, like a compressed stream. */}
                    <PersonPhoto
                        src={sharp ? people.sam.photo(480, 270) : people.sam.photo(64, 36)}
                        initial={people.sam.initial}
                        className={cn("size-full", !sharp && "scale-110 blur-[2px] saturate-75")}
                    />
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Sam</span>
                    <span className={sharp ? "font-medium text-emerald-600 dark:text-emerald-400" : ""}>{sharp ? "1080p" : "360p"}</span>
                </div>
            </div>
        </figure>
    );
}

function LocalRecordingVisual() {
    return (
        <div className="flex items-center gap-4 sm:gap-8">
            <MiniTile label="What the call sends" sharp={false} />
            <span className="h-px w-6 bg-neutral-300 sm:w-10 dark:bg-neutral-700" aria-hidden="true" />
            <MiniTile label="What Recio records" sharp />
        </div>
    );
}

function UploadVisual() {
    const parts = [true, true, true, true, false, false];
    return (
        <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-900 dark:text-white">Saving your recording</span>
                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><WifiOff className="size-3.5" /> Offline</span>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-1.5">
                {parts.map((done, i) => (
                    <span key={i} className={cn("h-2 rounded-full", done ? "bg-red-500" : "bg-neutral-200 dark:bg-neutral-700")} />
                ))}
            </div>
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">4 of 6 parts uploaded. The rest is safe in your browser and uploads when you're back online.</p>
        </div>
    );
}

function TracksVisual() {
    const tracks = [
        { name: "You", bars: [3, 6, 4, 8, 5, 2, 7, 4, 6, 3, 5, 8, 4, 2] },
        { name: "Sam", bars: [2, 2, 5, 3, 7, 6, 3, 2, 4, 7, 5, 3, 6, 4] },
        { name: "Screen", bars: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    ];
    return (
        <div className="w-full max-w-md space-y-2">
            {tracks.map((track) => (
                <div key={track.name} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
                    <span className="w-14 text-xs font-medium text-neutral-700 dark:text-neutral-200">{track.name}</span>
                    <span className="flex h-8 flex-1 items-center gap-[3px]" aria-hidden="true">
                        {track.bars.map((h, i) => (
                            <span key={i} className="flex-1 rounded-full bg-neutral-300 dark:bg-neutral-600" style={{ height: `${h * 12}%` }} />
                        ))}
                    </span>
                    <span className="text-[11px] text-neutral-400">.webm</span>
                </div>
            ))}
        </div>
    );
}

function InviteVisual() {
    return (
        <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">Invite people</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-neutral-50 py-1.5 pl-3 pr-1.5 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                <span className="min-w-0 flex-1 truncate text-xs text-neutral-500 dark:text-neutral-400">recio.app/join/7f3a91</span>
                <span className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white"><Copy className="size-3" /> Copy</span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400"><Check className="size-3.5 text-emerald-500" /> Sam joined from Chrome. Nothing to install.</p>
        </div>
    );
}

const features = [
    {
        id: "local",
        nav: "Local recording",
        title: "Recorded on each device, not over the call.",
        body: "Video calls squeeze everyone's picture to fit the connection. Recio records each person's camera and mic right on their own device, so what you publish is as sharp as what their camera captured.",
        visual: <LocalRecordingVisual />,
    },
    {
        id: "uploads",
        nav: "Never lose a take",
        title: "Your recording is safe, even when Wi-Fi isn't.",
        body: "Every few seconds the recording is saved in the browser and uploaded in the background. If the connection drops, nothing is lost. Uploads pick up where they left off, and Recio tells you when it's safe to leave.",
        visual: <UploadVisual />,
    },
    {
        id: "tracks",
        nav: "Separate tracks",
        title: "A separate track for everyone.",
        body: "After the session you get each person's camera, their screen share and a combined side-by-side video. Edit voices independently, fix one person's audio, or cut between angles.",
        visual: <TracksVisual />,
    },
    {
        id: "invite",
        nav: "Invite with a link",
        title: "One link. No installs.",
        body: "Share the room link and your guest joins from the browser. No app to download, no settings to explain.",
        visual: <InviteVisual />,
    },
];

export default function Features() {
    const [active, setActive] = useState(features[0]!.id);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActive(visible[0].target.id);
            },
            { rootMargin: "-30% 0px -55% 0px" }
        );
        features.forEach((f) => {
            const el = document.getElementById(f.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="grid gap-12 lg:grid-cols-[200px_1fr] lg:gap-16">
            <nav className="hidden lg:block" aria-label="Features">
                <ul className="sticky top-28 space-y-1 border-l border-neutral-200 dark:border-neutral-800">
                    {features.map((f) => (
                        <li key={f.id}>
                            <a
                                href={`#${f.id}`}
                                className={cn(
                                    "-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors",
                                    active === f.id ? "border-red-600 text-neutral-950 dark:border-red-500 dark:text-white" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                                )}
                            >
                                {f.nav}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="space-y-24">
                {features.map((f) => (
                    <section key={f.id} id={f.id} className="scroll-mt-28">
                        <p className="text-sm font-medium text-red-600 lg:hidden dark:text-red-400">{f.nav}</p>
                        <h3 className="mt-1 font-serif text-3xl leading-tight text-neutral-950 sm:text-4xl dark:text-white">{f.title}</h3>
                        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">{f.body}</p>
                        <Panel>{f.visual}</Panel>
                    </section>
                ))}
            </div>
        </div>
    );
}
