import { MicOff, Video, VideoOff, Mic, ScreenShare, PhoneOff, Disc2 } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import { useRoom } from "./RoomContext";
import { useSearchParams } from "react-router-dom";

export default function Controls() {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isvideoOn, setIsVideoOn] = useState(true);
    const { localAudioTrack, localTrack, handleScreenSharing, isScreenShareStarted, isScreenSharedByOthers, handleRecording, isRecordingStarted, leaveRoom, isUploading } = useRoom();
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role")

    useEffect(() => {
        console.log("video is changed I should make it mute or unmute")
    }, [isvideoOn])

    useEffect(() => {
        console.log("Mic is changed I should make it mute or unmute");
    }, [isMicOn])

    async function handleMic() {
        if (isMicOn) {
            console.log("mic is on");
            setIsMicOn(false);
            await (localAudioTrack as LocalAudioTrack).mute();
            console.log("localTrack after marking it as on", localAudioTrack);
        } else {
            console.log("mic is off")
            setIsMicOn(true);
            await (localAudioTrack as LocalAudioTrack).unmute();
            console.log("localtrack after marking it as off", localAudioTrack);
        }
    }

    async function handleVideo() {
        if (isvideoOn) {
            console.log("video is on");
            setIsVideoOn(false);
            await (localTrack as LocalVideoTrack).mute();
            console.log("localTrack after marking it as on", LocalVideoTrack);
        } else {
            console.log("video is off");
            setIsVideoOn(true);
            await (localTrack as LocalVideoTrack).unmute();
            console.log("localTrack after marking it as off", LocalVideoTrack);
        }
    }

    return <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2  px-4 py-2 rounded-2xl shadow-lg ">
        <Button onClick={handleMic} className="bg-neutral-800 hover:bg-neutral-600 cursor-pointer">
            {isMicOn ? <Mic className=" hover:bg-cyan-600 text-white" /> : <MicOff className="text-white" />}
        </Button>
        <Button onClick={handleVideo} className="bg-neutral-800 hover:bg-neutral-600 cursor-pointer">
            {isvideoOn ? <Video className="text-white" /> : <VideoOff className="text-white" />}
        </Button>

        <div onClick={handleScreenSharing}>
            {
                !isScreenShareStarted ?
                    <Button disabled={isScreenSharedByOthers} className="bg-neutral-800 text-white hover:bg-neutral-600 cursor-pointer">
                        <ScreenShare className="text-white" />
                        Screen Share
                    </Button> :
                    <Button disabled={isScreenSharedByOthers} className="bg-neutral-800 text-white hover:bg-neutral-600 cursor-pointer">
                        Stop Screen Share
                    </Button>
            }
        </div>

        {role === "creator" && (
            <div className="flex gap-2">
                <div onClick={handleRecording}>
                    {!isRecordingStarted ?
                        <Button className="bg-neutral-800 text-white hover:bg-neutral-600 cursor-pointer">
                            <Disc2 className="text-rose-500" />
                            Start recording
                        </Button > :
                        <Button className="bg-neutral-800 text-white hover:bg-neutral-600 cursor-pointer">End recording</Button>
                    }</div>
            </div>
        )}

        <Button variant="destructive" onClick={leaveRoom} disabled={isUploading} className="cursor-pointer">
            <PhoneOff />
            Leave Room
        </Button>
    </div>
}