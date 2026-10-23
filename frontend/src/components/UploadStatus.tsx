import { CheckCircle2, CloudUpload, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Progress from "./ui/progressBar";
import { useRoom } from "./RoomContext";

// Shown after recording stops, while the locally buffered chunks finish uploading.
export default function UploadStatus() {
    const { uploadStatus, isRecordingStarted } = useRoom();
    const [justFinished, setJustFinished] = useState(false);
    const wasUploading = useRef(false);

    const uploading = !isRecordingStarted && (uploadStatus.running || uploadStatus.pending > 0);

    useEffect(() => {
        if (uploading) {
            wasUploading.current = true;
            setJustFinished(false);
        } else if (wasUploading.current) {
            wasUploading.current = false;
            setJustFinished(true);
            const id = setTimeout(() => setJustFinished(false), 4000);
            return () => clearTimeout(id);
        }
    }, [uploading]);

    if (!uploading && !justFinished) return null;

    const total = uploadStatus.uploaded + uploadStatus.pending;
    const percent = total > 0 ? (uploadStatus.uploaded / total) * 100 : 0;

    return (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4" role="status" aria-live="polite">
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur">
                {justFinished ? (
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                        <div>
                            <p className="text-sm font-medium text-white">Recording saved</p>
                            <p className="text-xs text-neutral-400">It's safe to leave the room now.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 flex items-start gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                                <CloudUpload className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white">Saving your recording</p>
                                <p className="text-xs text-neutral-400">
                                    {uploadStatus.pending > 0
                                        ? `${uploadStatus.pending} ${uploadStatus.pending === 1 ? "part" : "parts"} left · keep this tab open`
                                        : "Finishing up · keep this tab open"}
                                </p>
                            </div>
                            <Loader2 className="size-4 shrink-0 animate-spin text-neutral-500" />
                        </div>
                        <Progress value={uploadStatus.pending > 0 ? percent : 100} indeterminate={total === 0} />
                    </>
                )}
            </div>
        </div>
    );
}
