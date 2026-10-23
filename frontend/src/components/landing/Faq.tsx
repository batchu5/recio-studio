import { Plus } from "lucide-react";

const questions = [
    {
        q: "How is this different from recording a Zoom or Meet call?",
        a: "Call recorders capture the compressed stream that travels over the internet, so a weak connection means a blurry recording. Recio records each person's camera and mic directly on their own device and uploads it separately, so the quality doesn't depend on the connection.",
    },
    {
        q: "What happens if my internet drops during a session?",
        a: "Recording keeps going. Every few seconds the recording is saved in your browser, and uploads resume as soon as you're back online. Keep the tab open until Recio shows \"Recording saved\".",
    },
    {
        q: "Do my guests need to install anything?",
        a: "No. Guests open your invite link in their browser. They sign in with Google or email so their recording is tied to them, and that's it.",
    },
    {
        q: "What do I get after a session?",
        a: "A combined side-by-side video, plus a separate WebM file for each person's camera and screen share. We email you a link when the tracks have been merged.",
    },
    {
        q: "Which browsers are supported?",
        a: "Recio works best in Chrome, Edge and other Chromium-based browsers. Firefox works too. Safari support is limited for now.",
    },
];

export default function Faq() {
    return (
        <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-serif text-4xl text-neutral-950 sm:text-5xl dark:text-white">You might be wondering.</h2>
            <div className="mt-12 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                {questions.map((item) => (
                    <details key={item.q} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl text-neutral-950 dark:text-white [&::-webkit-details-marker]:hidden">
                            {item.q}
                            <Plus className="size-5 shrink-0 text-neutral-400 transition-transform group-open:rotate-45" />
                        </summary>
                        <p className="mt-3 pr-10 leading-relaxed text-neutral-600 dark:text-neutral-400">{item.a}</p>
                    </details>
                ))}
            </div>
        </div>
    );
}
