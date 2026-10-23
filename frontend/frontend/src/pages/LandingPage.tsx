import { Navbar } from "@/components/NavBar";
import StudioMock from "@/components/landing/StudioMock";
import Features from "@/components/landing/Features";
import Faq from "@/components/landing/Faq";
import PricingSection from "@/components/Pricing";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

export default function LandingPage(){
    const navigate = useNavigate();
    const signedIn = Boolean(localStorage.getItem("token"));
    const start = () => navigate(signedIn ? "/preStudio" : "/signup");

    return (
        <div id="top" className="min-h-dvh bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
            <Navbar />

            <main>
                <section className="px-5 pb-10 pt-20 text-center sm:pt-28">
                    <h1 className="mx-auto max-w-3xl font-serif text-[2.6rem] leading-[1.08] tracking-tight text-balance sm:text-6xl">
                        Record studio-quality podcasts from anywhere
                    </h1>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-neutral-600 dark:text-neutral-400">
                        Every guest is recorded on their own device, in full quality. Send a link, hit record, download separate tracks.
                    </p>
                    <button
                        type="button"
                        onClick={start}
                        className="mt-9 inline-flex cursor-pointer items-center rounded-full bg-red-600 px-7 py-3 font-medium text-white transition-colors hover:bg-red-500"
                    >
                        {signedIn ? "Open your studio" : "Start recording for free"}
                    </button>
                    <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Free plan includes 2 hours every month. No card required.</p>
                </section>

                <section id="how-it-works" className="mx-auto max-w-5xl scroll-mt-20 px-5 pb-28 pt-6">
                    <StudioMock />
                </section>

                <section className="border-t border-neutral-200 px-5 py-24 dark:border-neutral-800">
                    <p className="mx-auto max-w-3xl text-center font-serif text-3xl leading-snug text-balance text-neutral-950 sm:text-4xl dark:text-white">
                        For people who record conversations,
                        <span className="text-neutral-400 dark:text-neutral-500"> while others are still fixing their audio.</span>
                    </p>
                </section>

                <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-28">
                    <Features />
                </section>

                <section className="border-y border-neutral-200 bg-neutral-50 px-5 py-20 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
                        <div>
                            <h2 className="font-serif text-3xl text-neutral-950 dark:text-white">What people use Recio for.</h2>
                            <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">Podcasts, interviews, video courses, remote panels and customer stories.</p>
                        </div>
                        <div>
                            <h2 className="font-serif text-3xl text-neutral-950 dark:text-white">Who it is built for.</h2>
                            <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">Podcasters, journalists, educators, creators and small media teams.</p>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="scroll-mt-20 px-5 py-28">
                    <PricingSection />
                </section>

                <section id="faq" className="scroll-mt-20 border-t border-neutral-200 px-5 py-28 dark:border-neutral-800">
                    <Faq />
                </section>
            </main>

            <Footer />
        </div>
    )
}
