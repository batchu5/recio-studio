import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { toast } from 'react-toastify';
import { ArrowLeft, Download, Film, Loader2, Monitor, Video } from "lucide-react";
import { displayName } from "@/lib/utils";
import AppHeader from "@/components/AppHeader";

interface User{
    email: string,
    id : string,
}

type TrackType = "individual" | "individual-screen" | "mixed";

export default function UniqueRoom(){
    const {roomId} = useParams();
    const [users, setUsers] = useState<User[]> ([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    useEffect(() => {
        axios.post(`${BackendUrl}/fetch_users_by_roomId`, {roomId: roomId})
            .then((res) => setUsers(res.data.fetchedUsers ?? []))
            .catch((err) => toast.error(err.response?.status === 403 ? "You weren't part of this room." : "Couldn't load this room."))
            .finally(() => setLoading(false));
    },[BackendUrl, roomId])

    const handleDownloadUrl = async (userId: string | null, type: TrackType, fileName: string) => {
        const key = `${userId}-${type}`;
        setDownloading(key);
        try {
            const res = await axios.post(`${BackendUrl}/fetch_url_by_userId_roomId_type`, {
                roomId,
                userId,
                type
            });

            if(res.data == null){
                toast.info("This track isn't available. It may still be processing, or nothing was recorded.")
                return;
            }

            const response = await axios.get(res.data.url, { responseType: "blob" });
            const blob = new Blob([response.data], { type: "video/webm" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}.webm`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error("Download failed", err);
            toast.error("Download failed. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    function DownloadButton({ userId, type, fileName, label }: { userId: string | null, type: TrackType, fileName: string, label: string }) {
        const busy = downloading === `${userId}-${type}`;
        return (
            <button type="button" disabled={downloading !== null} onClick={() => handleDownloadUrl(userId, type, fileName)} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-300 dark:hover:text-white">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {label}
            </button>
        );
    }

    return (
        <div className="min-h-dvh bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
            <AppHeader />
            <main className="mx-auto max-w-3xl px-5 pb-20 pt-10">
                <button type="button" onClick={() => navigate("/preStudio")} className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                    <ArrowLeft className="size-4" /> Back to rooms
                </button>

                <h1 className="mt-6 font-serif text-4xl sm:text-5xl">Session tracks</h1>
                <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">Download the combined video, or each person's separate high-quality tracks for editing.</p>

                {loading ? (
                    <div className="mt-6 space-y-3">
                        {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />)}
                    </div>
                ) : users.length > 0 && (
                    <>
                        <section className="mt-10 flex flex-col gap-4 rounded-2xl bg-neutral-100 p-6 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-900">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-full bg-red-600/10 text-red-600 dark:text-red-400"><Film className="size-5" /></span>
                                <div>
                                    <p className="font-medium">Combined video</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Everyone side by side, mixed audio</p>
                                </div>
                            </div>
                            <DownloadButton userId={null} type="mixed" fileName="recio-combined" label="Download" />
                        </section>

                        <h2 className="mt-12 font-serif text-2xl">Individual tracks</h2>
                        <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                            {users.map((user) => {
                                const name = displayName(user.email);
                                return (
                                    <li key={user.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-medium uppercase dark:bg-neutral-800">{name.charAt(0)}</span>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{name}</p>
                                                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <DownloadButton userId={user.id} type="individual" fileName={`${name}-camera`} label="Camera" />
                                            <DownloadButton userId={user.id} type="individual-screen" fileName={`${name}-screen`} label="Screen" />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="mt-3 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="inline-flex items-center gap-1"><Video className="size-3.5" /> Camera and mic</span>
                            <span className="inline-flex items-center gap-1"><Monitor className="size-3.5" /> Screen share, if used</span>
                        </p>
                    </>
                )}
            </main>
        </div>
    )
}
