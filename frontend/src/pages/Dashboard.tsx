import axios from "axios";
import { RemoteAudioTrack, RemoteParticipant, RemoteTrack, RemoteTrackPublication, RemoteVideoTrack, Room, RoomEvent, createLocalScreenTracks, LocalVideoTrack, type AudioTrack, type VideoTrack } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import VideoComponent from "../components/videoComponent";
import { Disc2 } from "lucide-react";
import { checkStopWorker, saveChunk, startUploadWorker, } from "../utils/uploadworker";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

type Trackinfo = {
    trackPublications: RemoteTrackPublication,
    participantIdentity: string,
}

export default function Dashboard() {
    const recorderMap = useRef<Record<string, MediaRecorder>>({});
    const [screenTrack, setScreenTrack] = useState<LocalVideoTrack | undefined>(undefined);
    const [room, setRoom] = useState<Room | undefined>(undefined);
    const [localTrack, setLocalTrack] = useState<VideoTrack | undefined>(undefined);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [remoteTracks, setRemoteTracks] = useState<Trackinfo[]>([]);
    const sessionIdRef = useRef<string | null>("");
    const RecordingRef = useRef<string | null>(null);
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const urlsRef = useRef<string[] | null>([]);

    const participantName = localStorage.getItem("participantName");
    const [isRecordingStarted, setIsRecordinStarted] = useState<boolean>(false);
    const roomName = localStorage.getItem("roomName")
    const [rows, setRows] = useState<number>(1);
    const [cols, setCols] = useState<number>(1);
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_WSURL;
    const [isScreenSharedByOthers, setIsScreenSharedByOthers] = useState<boolean>(false);

    const participantCount = useRef<number>(0);
  

    async function handleStopScreenShare() {
        if (screenTrack && room) {
            room.localParticipant.unpublishTrack(screenTrack);
            screenTrack.stop();
            setScreenTrack(undefined);

            room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify({ action: "StopscreenSharedByOtherUser" })),
                { reliable: true }
            );
        }
    }

    function calculateGrid(n: number, containerWidth: number, containerHeight:number) {
        if(n == 2 || n == 3){
            setRows(1);
            setCols(2);
            return;
        }
        let gridCols = Math.ceil(Math.sqrt(n));
        let gridRows = Math.ceil(n / cols);
        if (containerWidth > containerHeight) {
            gridCols = Math.max(cols, rows);
            gridRows = Math.ceil(n / cols);
        } else {
            gridCols = Math.max(rows, cols);
            gridRows = Math.ceil(n / rows);
        }
        console.log("innerwidth", innerWidth);
        console.log("innerHeight", innerHeight);
        console.log("gridRows", gridRows);
        console.log("gridCols", gridCols);
        setRows(gridRows);
        setCols(gridCols);
    }

    useEffect(() => {
        let count = (localTrack ? 1 : 0) + (screenTrack ? 1 : 0) +
            remoteTracks.filter(rt => rt.trackPublications.kind === "video").length;

        console.log("participant Count is changed")
        calculateGrid(count, window.innerWidth, window.innerHeight);
    }, [participantCount, remoteTracks, localTrack])

    async function handleScreenShare() {
        if (!room) return;

        if (!screenTrack) {
            try {
                const tracks = await createLocalScreenTracks({
                    video: true,
                    audio: false,
                });
                const stream = new MediaStream();
                const screenVideoTrack = tracks.find((t) => t.kind === "video");
                if (screenVideoTrack) {

                    await room.localParticipant.publishTrack(screenVideoTrack);
                    setScreenTrack(screenVideoTrack as LocalVideoTrack);

                    stream.addTrack(screenVideoTrack.mediaStreamTrack);

                    const screenRecorder = new MediaRecorder(stream, { "mimeType": "video/webm; codecs=vp8,opus" });
                    const participantName = localStorage.getItem("userId") + "-screen" || "";

                    console.log("Gonna send the screenShare to the recorder may be");
                    screenRecorder.ondataavailable = async (event) => {
                        if (event.data.size > 0 && sessionIdRef.current) {
                            const blob = event.data;
                            await saveChunk(sessionIdRef.current, participantName, blob, "screenShare")
                        }
                    }

                    screenRecorder.start(5000);
                    screenVideoTrack.mediaStreamTrack.onended = () => {
                        room.localParticipant.unpublishTrack(screenVideoTrack);
                        screenVideoTrack.stop();
                        setScreenTrack(undefined);
                    };
                }

                room.localParticipant.publishData(
                    new TextEncoder().encode(JSON.stringify({ action: "screenSharedByOtherUser" })),
                    { reliable: true }
                );

            } catch (error) {
                console.log("finding the error in handleScreenShare", error);
            }
        } else {
            if (screenTrack) {

            }
        }
    }

    useEffect(() => {
        console.log("screen Track is changed");
    }, [screenTrack])

    useEffect(() => {
        console.log("role", role);
        console.log("roomName", roomName);
    })

    async function leaveRoom() {

        await room?.disconnect();

        setRoom(undefined);
        setLocalTrack(undefined);
        setRemoteTracks([]);
    }

    async function joinRoom() {
        sessionIdRef.current = localStorage.getItem("roomId");
        const room = new Room();
        setRoom(room);

        room.on(
            RoomEvent.TrackSubscribed,
            (track: RemoteTrack, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
                console.log("Track subscribed:", pub.kind, participant.identity);

                setRemoteTracks((prev) => [
                    ...prev,
                    { trackPublications: pub, participantIdentity: participant.identity },
                ]);

                let audioTrack: RemoteAudioTrack | undefined;
                let videoTrack: RemoteVideoTrack | undefined;

                if (pub.kind === "audio" && track.kind === "audio") {
                    audioTrack = track as RemoteAudioTrack;
                }

                if (pub.kind === "video" && track.kind === "video") {
                    videoTrack = track as RemoteVideoTrack;
                }

                if (audioTrack) {
                    console.log("Remote audio subscribed", participant.identity, audioTrack);
                }
                if (videoTrack) {
                    console.log("Remote video subscribed", participant.identity, videoTrack);
                }
            }
        );

        room.on(RoomEvent.TrackUnsubscribed, (_track: RemoteTrack, publication: RemoteTrackPublication) => {
            setRemoteTracks((prev) => prev.filter((track) => track.trackPublications.trackSid !== publication.trackSid));
        });

        room.on(RoomEvent.DataReceived, async (payload) => {
            try {
                console.log("Got the data from the creator to start the recording asf");
                const msg = JSON.parse(new TextDecoder().decode(payload));
                if (msg.action === "startRecording") {
                    RecordingRef.current = msg.recordingId;
                    sessionIdRef.current = msg.recordingId;

                    if (!room) {
                        console.log("Joining room first...");
                        const r = await joinRoom();
                        if (r) {
                            r.on("connected", () => {
                                startLocalRecording(r);
                            });
                        }
                    } else {
                        console.log("Room exists here..", room);
                        startLocalRecording(room);
                    }
                }
                else if (msg.action === "stopRecording") {
                    stopLocalRecording();
                } else if (msg.action === "screenSharedByOtherUser") {
                    setIsScreenSharedByOthers(true);
                } else if (msg.action === "StopscreenSharedByOtherUser") {
                    setIsScreenSharedByOthers(false);
                }
            } catch (err) {
                console.error("Bad data message", err);
            }
        });

        try {
            if (!token) {
                console.log("token is undefined", token);
                return;
            }

            await room.connect(LIVEKIT_URL, token);
            await room.localParticipant.enableCameraAndMicrophone();
            setLocalTrack(room.localParticipant.videoTrackPublications.values().next().value?.videoTrack);
            participantCount.current = participantCount.current + 1;
            return room;

        } catch (error) {
            console.log("There was an error connecting to the room:", (error as Error).message);
            await leaveRoom();
        }
    }

    function startAllRecordings() {
        RecordingRef.current = localStorage.getItem("roomId");
        sessionIdRef.current = RecordingRef.current;
        console.log("recording started", isRecordingStarted);
        setIsRecordinStarted(true);

        if (!room) return;
        room.localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify({ action: "startRecording", recordingId: RecordingRef.current })),
            { reliable: true }
        );
        startLocalRecording(room);
    }

    async function stopAllRecordings() {

        setIsRecordinStarted(false);
        if (!room) return;
        room.localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify({ action: "stopRecording" })),
            { reliable: true }
        );
        stopLocalRecording();
    }

    function startLocalRecording(currentRoom: Room) {
        console.log("starting the recording");
        if (!currentRoom) {
            console.log("Room is empty");
            return;
        }
        setIsRecordinStarted(true);

        if (!sessionIdRef.current) {
            console.warn("No shared recordingId yet; not starting recording.");
            return;
        }

        const localVideoPub = Array.from(currentRoom.localParticipant.videoTrackPublications.values())[0];
        const localAudioPub = Array.from(currentRoom.localParticipant.audioTrackPublications.values())[0];

        const localVideoTrack = localVideoPub?.track as VideoTrack;
        const localAudioTrack = localAudioPub?.track as AudioTrack;

        const identity = currentRoom.localParticipant.identity || participantName || "anonymous";

        if (localVideoTrack || localAudioTrack) {
            recorderMap.current[identity] = startRecording(localVideoTrack, localAudioTrack, identity);
        }

        if (screenTrack) {
            const screenIdentity = `${identity}-screen`;
            recorderMap.current[screenIdentity] = startRecording(screenTrack, localAudioTrack, screenIdentity);
        }

    }

    async function stopLocalRecording() {
        setIsRecordinStarted(false);
        Object.values(recorderMap.current).forEach((recorder) => {
            if (recorder.state !== "inactive") recorder.stop();
            recorder.stream.getTracks().forEach((t) => t.stop());
        });
        recorderMap.current = {};
        console.log("🛑 Recording stopped for", participantName);

        while (true) {
            const isWorkerStopped = checkStopWorker();
            if (isWorkerStopped) {
                console.log("stopworker is true from the dashboard stopLocalRecording so gonna call getUrl and getmergedurl");
                await getUrl();

                if (!urlsRef.current) {
                    console.log("urlsref is nuill");
                    return;
                }
                await getMergedUrl(urlsRef.current);
                break;
            }
            await new Promise((r) => setTimeout(r, 1000));
        }
    }

    function startRecording(videoTrack: VideoTrack | RemoteVideoTrack, audioTrack: AudioTrack | RemoteAudioTrack, participantName: string) {
        setIsRecordinStarted(true);
        const stream = new MediaStream();
        if (videoTrack) {
            stream.addTrack(videoTrack.mediaStreamTrack);
        }

        if (audioTrack) {
            stream.addTrack(audioTrack.mediaStreamTrack);
        }

        const recorder = new MediaRecorder(stream, { "mimeType": "video/webm; codecs=vp8,opus" })
        recorder.ondataavailable = async (event) => {
            if (event.data.size > 0 && sessionIdRef.current) {
                const blob = event.data;
                await saveChunk(sessionIdRef.current, participantName, blob, "camera");
            }
        };
        recorder.start(5000);

        startUploadWorker();
        return recorder;
    }

    async function getUrl() {
        try {
            console.log(sessionIdRef.current);
            const sessionId = sessionIdRef.current;
            const res = await axios.post(`${BackendUrl}/api/get_url`, { sessionId: sessionId }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })

            console.log(res.data);
            urlsRef.current = res.data.urls;
        } catch (error) {
            console.log("error occured bhahu", error);
        }
    }

    async function getMergedUrl(urls: string[]) {
        try {
            const sessionId = sessionIdRef.current;

            if (urls.length == 0) {
                console.log("urls length is 0 bro check it out");
                return;
            }

            const finalurl = await axios.post(`${BackendUrl}/api/get_merged_url`, { session_Id: sessionId, urlF: urls });
            console.log("finalurl from getMergedUrl", finalurl);

        } catch (error) {
            console.log("error from the getMergedUrl", error);
        }
    }

    async function enablePermission() {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setHasPermission(true);

        } catch (error) {
            console.log("error while setting up the permission", error)
        }
    }

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <>
            {!room ? (
                <div className="h-screen flex items-center justify-center">
                    <div className="bg-black p-4 flex">
                        <div className="flex justify-center ">
                            <div className="">
                                <h1 className=" text-2xl ">Let's check your  Camera and mic...</h1>
                                {!hasPermission
                                    ? (
                                        <div className="flex justify-center mt-2">
                                            <Button onClick={enablePermission} className="w-full">
                                                Click here to check
                                            </Button>
                                        </div>
                                    )
                                    : (<div className="flex justify-center">
                                        <video ref={videoRef} autoPlay playsInline className="w-[200px] h-[160px] rounded-2xl "></video>
                                    </div>)
                                }
                                <div className="flex justify-center mt-2">
                                    <Button onClick={joinRoom} className="w-full">Join Room</Button>
                                </div>
                            </div>

                        </div>


                    </div>
                </div>
            ) : (
                <div className="">
                    <main className="">
                        {screenTrack ? (
                            <div className="flex h-full bg-amber-500">
                                <div className="flex-1 bg-red-600 rounded-lg overflow-hidden">
                                    <VideoComponent
                                        track={screenTrack}
                                        participantIdentity={`${participantName || "You"} (Screen)`}
                                        local
                                    />
                                </div>
                                <div className="flex flex-col w-1/5 gap-2 ml-2 overflow-y-auto">
                                    {localTrack && (
                                        <VideoComponent
                                            track={localTrack}
                                            participantIdentity={participantName || "Test User"}
                                            local
                                        />
                                    )}
                                    {remoteTracks.map((remoteTrack) =>
                                        remoteTrack.trackPublications.kind === "video" ? (
                                            <VideoComponent
                                                key={remoteTrack.trackPublications.trackSid}
                                                track={remoteTrack.trackPublications.videoTrack!}
                                                participantIdentity={remoteTrack.participantIdentity}
                                            />
                                        ) : (
                                            // <AudioComponent
                                            //     key={remoteTrack.trackPublications.trackSid}
                                            //     track={remoteTrack.trackPublications.audioTrack!}
                                            //     participantIdentity={remoteTrack.participantIdentity}
                                            // />
                                            <div> Hello</div>
                                        
                                        )
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="">
                                <div className={`h-screen w-screen grid grid-rows-${rows} grid-cols-${cols} gap-1 `}>
                                    
                                    {remoteTracks.map((remoteTrack) =>
                                        remoteTrack.trackPublications.kind === "video" ? (
                                            <VideoComponent
                                            key={remoteTrack.trackPublications.trackSid}
                                            track={remoteTrack.trackPublications.videoTrack!}
                                            participantIdentity={remoteTrack.participantIdentity}
                                            />
                                        ) : null
                                    )}
                                    {localTrack && (
                                        <VideoComponent
                                            track={localTrack}
                                            participantIdentity={participantName || "Test User"}
                                            local
                                        />
                                    )}
                                   
                                </div>

                            </div>
                           
                        )}
                    </main>
                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-blue-600 px-4 py-2 rounded-2xl shadow-lg">
                        <Button variant="destructive" onClick={leaveRoom}>
                            Leave Room
                        </Button>
                        <Button disabled={isScreenSharedByOthers} onClick={handleScreenShare}>
                            Start Screen Share
                        </Button>
                        <Button disabled={isScreenSharedByOthers} onClick={handleStopScreenShare}>
                            Stop Screen Share
                        </Button>
                        {role === "creator" && (
                            <div className="flex gap-2">
                                <Button onClick={startAllRecordings}>
                                    <Disc2 className="text-red-500" />
                                    Start recording all
                                </Button>
                                <Button onClick={stopAllRecordings}>End recording all</Button>
                            </div>
                        )}
                    </div>
                </div>

            )}
        </>
    );


}
