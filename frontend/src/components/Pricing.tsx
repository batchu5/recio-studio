import { Check } from "lucide-react"
import { useNavigate } from "react-router-dom"

const included = [
    { title: "Local recording", body: "Every guest recorded on their own device." },
    { title: "Separate tracks", body: "Each person's camera and screen as their own file." },
    { title: "Background uploads", body: "Saved as you go, safe through Wi-Fi drops." },
    { title: "Invite with a link", body: "Guests join from the browser, nothing to install." },
    { title: "Screen sharing", body: "Recorded as its own track next to the cameras." },
    { title: "Email when it's ready", body: "We merge the tracks and send you the link." },
]

export default function PricingSection(){
    const navigate = useNavigate();
    const signedIn = Boolean(localStorage.getItem("token"));

    return (
        <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">Pricing</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-neutral-950 sm:text-5xl dark:text-white">
                The free plan:<br />2 hours every month.
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">Every feature included. No card required.</p>

            <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 text-left sm:grid-cols-2 lg:grid-cols-3 dark:border-neutral-800 dark:bg-neutral-800">
                {included.map((item) => (
                    <li key={item.title} className="flex gap-3 bg-white p-6 dark:bg-neutral-950">
                        <Check className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                            <p className="font-medium text-neutral-950 dark:text-white">{item.title}</p>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{item.body}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                onClick={() => navigate(signedIn ? "/preStudio" : "/signup")}
                className="mt-10 inline-flex cursor-pointer items-center rounded-full bg-red-600 px-7 py-3 font-medium text-white transition-colors hover:bg-red-500"
            >
                Start recording for free
            </button>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Need more hours? Pro is $15/month.</p>
        </div>
    )
}
