import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { toast } from "react-toastify";
import { cn, inviteLinkFor } from "@/lib/utils";

export default function InviteLink({ roomId, className }: { roomId: string | null; className?: string }) {
    const [copied, setCopied] = useState(false);
    const link = inviteLinkFor(roomId);

    async function copy() {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success("Invite link copied");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy, select the link and copy it manually");
        }
    }

    if (!link) return null;

    return (
        <div className={cn("flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1 pl-4 dark:border-neutral-800 dark:bg-neutral-900", className)}>
            <Link2 className="size-4 shrink-0 text-neutral-500" />
            <input
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                aria-label="Invite link"
                className="min-w-0 flex-1 truncate bg-transparent text-sm text-neutral-700 outline-none dark:text-neutral-300"
            />
            <button
                type="button"
                onClick={copy}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
            >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
            </button>
        </div>
    );
}
