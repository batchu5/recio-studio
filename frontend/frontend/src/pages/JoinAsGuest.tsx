import { useNavigate, useParams } from "react-router-dom";
import axios, { isAxiosError } from "axios";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import AppHeader from "@/components/AppHeader";
import { LogoMark } from "@/components/Logo";

export default function JoinAsGuest(){

    const { roomId } = useParams();
    const navigate = useNavigate();
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const [joining, setJoining] = useState(false);
    const email = localStorage.getItem("participantName");

    const joinAsGuest = async () => {
        if(!roomId || joining){
            return;
        }
        setJoining(true);
        try {
            const { token, room } = await axios.post(`${BackendUrl}/getToken`, {
                roomId,
                role: "guest"
            }).then(res => res.data);

            localStorage.setItem("roomId", room.id);
            localStorage.setItem("roomName", room.name);
            navigate(`/dashboard?token=${token}&role=guest`);
        } catch (err) {
            toast.error(isAxiosError(err) && err.response?.status === 400 ? "This room doesn't exist or the link is wrong." : "Couldn't join the room. Please try again.");
            setJoining(false);
        }
    };

    return (
        <div className="flex min-h-dvh flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
            <AppHeader />
            <main className="flex flex-1 items-center justify-center px-5 py-16">
                <div className="w-full max-w-md text-center">
                    <LogoMark className="mx-auto size-11" />
                    <h1 className="mt-8 font-serif text-4xl">You've been invited to record</h1>
                    <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                        You'll join as <span className="break-all font-medium text-neutral-950 dark:text-white">{email}</span>. Your camera and mic are recorded in full quality on your device.
                    </p>
                    <button type="button" onClick={joinAsGuest} disabled={joining} className="mt-9 inline-flex h-12 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60">
                        {joining && <Loader2 className="size-4 animate-spin" />}
                        {joining ? "Joining…" : "Continue"}
                    </button>
                </div>
            </main>
        </div>
    )

}
