import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useTheme } from "@/hooks/useTheme";

const links = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
];

export function Navbar(){
    const navigate = useNavigate();
    const { isDark, toggle } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const signedIn = Boolean(localStorage.getItem("token"));
    const start = () => navigate(signedIn ? "/preStudio" : "/signup");

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/85">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                <a href="#top" aria-label="Recio home"><Logo /></a>

                <div className="hidden items-center md:flex">
                    {links.map((link, i) => (
                        <span key={link.href} className="flex items-center">
                            {i > 0 && <span className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />}
                            <a href={link.href} className="px-4 text-sm text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                                {link.label}
                            </a>
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={toggle} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white">
                        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </button>
                    {!signedIn && (
                        <button type="button" onClick={() => navigate("/signin")} className="hidden cursor-pointer px-3 text-sm text-neutral-600 hover:text-neutral-950 sm:block dark:text-neutral-400 dark:hover:text-white">
                            Sign in
                        </button>
                    )}
                    <button type="button" onClick={start} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-600 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white">
                        {signedIn ? "Open studio" : "Start recording"} <ArrowRight className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu" aria-expanded={menuOpen} className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 md:hidden dark:text-neutral-300 dark:hover:bg-neutral-900">
                        {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div className="border-t border-neutral-200 px-5 py-2 md:hidden dark:border-neutral-800">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                            {link.label}
                        </a>
                    ))}
                    {!signedIn && (
                        <button type="button" onClick={() => navigate("/signin")} className="block w-full cursor-pointer py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300">
                            Sign in
                        </button>
                    )}
                </div>
            )}
        </header>
    )
}
