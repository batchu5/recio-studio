import { cn } from "@/lib/utils";

// The Recio mark: a red "recording" dot inside a ring.
export function LogoMark({ className }: { className?: string }) {
    return (
        <span className={cn("relative flex size-7 items-center justify-center rounded-full ring-2 ring-red-600 dark:ring-red-500", className)} aria-hidden="true">
            <span className="size-[45%] rounded-full bg-red-600 dark:bg-red-500" />
        </span>
    );
}

export default function Logo({ className }: { className?: string }) {
    return (
        <span className={cn("flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-neutral-950 dark:text-white", className)}>
            <LogoMark className="size-6" />
            Recio
        </span>
    );
}
