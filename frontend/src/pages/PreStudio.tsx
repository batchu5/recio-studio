import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Film, Loader2, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import AppHeader from "@/components/AppHeader";

interface roomProps {
  url : string,
  roomName: string,
  roomId: string
}

const MAX_ROOM_NAME = 60;

export default function PreStudio(){
    const [roomName, setRoomName] = useState<string>("");
    const [creating, setCreating] = useState(false);
    const [urls, setUrls] = useState<roomProps[]>([]);
    const [loadingRecordings, setLoadingRecordings] = useState(true);
    const participantName = localStorage.getItem("participantName");
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const trimmedName = roomName.trim();

    const joinAsCreator = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!trimmedName || creating) return;
      setCreating(true);

      try{
        const { token, room } = await axios.post(`${BackendUrl}/getToken`, {
          roomName: trimmedName,
          role: "creator"
        }).then(res => res.data);
        localStorage.setItem("roomName", room.name);
        localStorage.setItem("roomId", room.id);
        navigate(`/dashboard?token=${token}&role=creator`);
      }catch (err) {
          const response = isAxiosError(err) ? err.response : undefined;
          if (response?.status === 409) {
            toast.error("You already have a room with this name. Pick another one.");
          } else if (response) {
            toast.error("Couldn't create the room. Please try again.");
          } else {
            toast.error("Network error. Check your connection and try again.");
          }
          setCreating(false);
      }
    };

    useEffect(() => {
      axios.post(`${BackendUrl}/prev_mixed_urls`)
        .then((res) => setUrls(res.data.fetchedUrls ?? []))
        .catch(() => toast.error("Couldn't load your recordings"))
        .finally(() => setLoadingRecordings(false));
    },[BackendUrl]);

    function signOut() {
      ["token", "participantName", "userEmail", "userId", "roomId", "roomName"].forEach((key) => localStorage.removeItem(key));
      navigate("/signin");
    }

    return (
      <div className="min-h-dvh bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <AppHeader>
          <span className="hidden max-w-56 truncate px-2 text-sm text-neutral-500 sm:inline dark:text-neutral-400">{participantName}</span>
          <button type="button" onClick={signOut} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white">
            <LogOut className="size-4" /> Sign out
          </button>
        </AppHeader>

        <main className="mx-auto max-w-5xl px-5 pb-20">
          <section className="pt-14 sm:pt-20">
            <h1 className="font-serif text-4xl sm:text-5xl">Start a new session</h1>
            <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">Name your room, then invite guests with a link.</p>

            <form onSubmit={joinAsCreator} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <label htmlFor="room-name" className="sr-only">Room name</label>
              <input
                id="room-name"
                type="text"
                value={roomName}
                maxLength={MAX_ROOM_NAME}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Weekly podcast, Episode 12"
                autoComplete="off"
                className="h-12 flex-1 rounded-full border border-neutral-300 bg-white px-5 text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-300 dark:focus:ring-white/10"
              />
              <button
                type="submit"
                disabled={!trimmedName || creating}
                title={!trimmedName ? "Enter a room name first" : undefined}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 px-7 font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creating && <Loader2 className="size-4 animate-spin" />}
                {creating ? "Creating…" : "Create room"}
              </button>
            </form>
          </section>

          <section className="mt-20">
            <h2 className="font-serif text-3xl">Your recordings</h2>

            {loadingRecordings ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
                ))}
              </div>
            ) : urls.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-neutral-100 px-6 py-16 text-center dark:bg-neutral-900">
                <Film className="size-7 text-neutral-400" />
                <p className="mt-4 font-serif text-xl">No recordings yet</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Finished sessions show up here once they're processed.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {urls.map((room) => (
                  <article key={room.roomId} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    <video src={room.url} controls preload="metadata" className="aspect-video w-full bg-black object-contain" />
                    <div className="flex items-center justify-between gap-3 p-4">
                      <h3 className="truncate font-medium" title={room.roomName}>{room.roomName}</h3>
                      <button type="button" onClick={() => navigate(`/preStudio/${room.roomId}`)} className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-sm text-red-600 hover:text-red-500 dark:text-red-400">
                        Tracks <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    )
}
