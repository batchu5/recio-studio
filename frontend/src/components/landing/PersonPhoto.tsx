import { useState } from "react";
import { cn } from "@/lib/utils";

// A person's photo that falls back to their initial if the image can't load.
export default function PersonPhoto({ src, initial, className }: { src: string, initial: string, className?: string }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div className={cn("flex items-center justify-center bg-neutral-700", className)}>
                <span className="flex size-12 items-center justify-center rounded-full bg-white/15 text-lg font-medium text-white">{initial}</span>
            </div>
        );
    }
    return <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn("object-cover", className)} />;
}
