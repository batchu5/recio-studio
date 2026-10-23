import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import { cn } from "@/lib/utils";

export function AuthLayout({ title, subtitle, children, footer }: { title: string, subtitle?: string, children: ReactNode, footer?: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col bg-white px-5 text-neutral-950 dark:bg-neutral-950 dark:text-white">
            <header className="mx-auto flex h-16 w-full max-w-6xl items-center">
                <Link to="/" aria-label="Recio home"><Logo /></Link>
            </header>
            <main className="flex flex-1 items-center justify-center py-10">
                <div className="w-full max-w-sm">
                    <h1 className="text-center font-serif text-4xl">{title}</h1>
                    {subtitle && <p className="mt-3 text-center text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                    {footer && <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">{footer}</div>}
                </div>
            </main>
        </div>
    );
}

export function GoogleButton() {
    return (
        <button
            type="button"
            onClick={() => { window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`; }}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
            <img src="/google-logo.svg" alt="" className="size-4" />
            Continue with Google
        </button>
    );
}

export function OrDivider() {
    return (
        <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            or
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>
    );
}

export function Field({ label, id, className, ...props }: React.ComponentProps<"input"> & { label: string, id: string }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</label>
            <input
                id={id}
                {...props}
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3.5 text-sm text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300 dark:focus:ring-white/10"
            />
        </div>
    );
}

export function SubmitButton({ loading, children, loadingText, className }: { loading: boolean, children: ReactNode, loadingText: string, className?: string }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className={cn("h-11 w-full cursor-pointer rounded-full bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60", className)}
        >
            {loading ? loadingText : children}
        </button>
    );
}
