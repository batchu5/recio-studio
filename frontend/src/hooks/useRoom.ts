import { checkStopWorker, saveChunk, startUploadWorker } from "@/utils/uploadworker";
import axios from "axios";
import { createLocalScreenTracks, RemoteAudioTrack, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent, type AudioTrack, type LocalVideoTrack, type RemoteVideoTrack, type VideoTrack } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

type Trackinfo = {
    trackPublications: RemoteTrackPublication,
    participantIdentity: string,
}


export  function useRoomManager(){
    const [room, setRoom] = useState<Room | undefined>(undefined); 
    const recorderMap = useRef<Record<string, MediaRecorder>>({});

    const [remoteTracks, setRemoteTracks] = useState<Trackinfo[]>([]) 
    const [localTrack, setLocalTrack] = useState<VideoTrack | undefined>(undefined);
    const [localAudioTrack, setLocalAudioTrack] = useState<AudioTrack | undefined>(undefined);
    const [isScreenSharedByOthers, setIsScreenSharedByOthers] = useState<boolean>(false);
    const [isRecordingStarted, setIsRecordinStarted] = useState<boolean>(false);
    const [isScreenShareStarted, SetIsScreenShareStarted] = useState<boolean>(false);
    const [screenTrack, setScreenTrack] = useState<LocalVideoTrack | RemoteVideoTrack | undefined>(undefined);
    const sessionIdRef = useRef<string | null>("");
    const RecordingRef = useRef<string | null>(null);
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const urlsRef = useRef<string[] | null>([]);
    const [isUploading, setIsUploading] = useState(false);
    const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_WSURL;
    const participantCount = useRef<number>(0);
    const participantName = localStorage.getItem("participantName"); 
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        console.log("room is set for the user")
    },[room]);

    useEffect(() => {
        console.log("isUploading", isUploading);
    },[isUploading])

    useEffect(() => {
        console.log("isscreenShareStarted", isScreenShareStarted)
    }, [isScreenShareStarted])

    async function handleStopScreenShare() {
        SetIsScreenShareStarted(false);
        if (screenTrack && room) {
            room.localParticipant.unpublishTrack(screenTrack as LocalVideoTrack);
            screenTrack.stop();
            setScreenTrack(undefined);

            room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify({ action: "StopscreenSharedByOtherUser" })),
                { reliable: true }
            );
        }
    }

    async function handleStartScreenShare() {
        SetIsScreenShareStarted(true);
        if (!room) return;

        if (!screenTrack) {
            console.log("ScreenTrack is empty");
            try {
                const tracks = await createLocalScreenTracks({
                    video: true,
                    audio: false,
                });
                
                const screenVideoTrack = tracks.find((t) => t.kind === "video");
                
                if (screenVideoTrack) {
                    console.log("screenVideoTrack exits so we are gonna publish it");
                    await room.localParticipant.publishTrack(screenVideoTrack);
                    setScreenTrack(screenVideoTrack as LocalVideoTrack);

                    screenVideoTrack.mediaStreamTrack.onended = () => {
                            room.localParticipant.unpublishTrack(screenVideoTrack);
                            screenVideoTrack.stop();
                            SetIsScreenShareStarted(false);
                            setScreenTrack(undefined);
                    };
                    
                    
                    if(isRecordingStarted && RecordingRef.current){
                        const stream = new MediaStream();
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
                       
                    }
                    console.log("participantIdentity", room.localParticipant.identity);
                    let partcipantId = room.localParticipant.identity;
                    room.localParticipant.publishData(
                        new TextEncoder().encode(JSON.stringify({ action: "screenSharedByOtherUser", participantId: partcipantId})),
                        { reliable: true }
                    );   
                }

            } catch (error) {
                console.log("finding the error in handleScreenShare", error);
            }
        } 
    }

    function handleScreenSharing(){
        if(isScreenShareStarted === true){
            handleStopScreenShare();
        }else{
            handleStartScreenShare();
        }
    }

    useEffect(() => {
        console.log("screen Track is changed");
    }, [screenTrack])

    async function leaveRoom() {

        await room?.disconnect();

        setRoom(undefined);
        setLocalTrack(undefined);
        setLocalAudioTrack(undefined)
        setRemoteTracks([]);
    }

    async function joinRoom() {
        sessionIdRef.current = localStorage.getItem("roomId");
        console.log("role", role);
        const room = new Room();
        setRoom(room);

        room.on(
            RoomEvent.TrackSubscribed, (track: RemoteTrack, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
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
                    const audioEl = document.createElement("audio");
                    audioEl.autoplay = true;
                    audioTrack.attach(audioEl);
                    document.body.appendChild(audioEl);
                }


                if (videoTrack) {
                    console.log("Remote video subscribed", participant.identity, videoTrack);
                    if(track.source === "camera"){
                        console.log("remote track is from camera");
                    }
                    else if (track.source === "screen_share") {
                        console.log("remote track is from screenShare");
                        setIsScreenSharedByOthers(true);
                        setScreenTrack(videoTrack);
                    }
                }
            }
        );

        room.on(RoomEvent.TrackUnsubscribed, (_track: RemoteTrack, publication: RemoteTrackPublication) => {

            const pub = publication;

            if(pub.kind === "video" ){
                if(pub.source === "screen_share"){
                    console.log("remote track is unsupscribed")
                    setIsScreenSharedByOthers(false);
                    setScreenTrack(undefined);

                }else if(pub.source === "camera"){
                    console.log("remote track is unsubscribed from the camera");
                }
                
            }
            setRemoteTracks((prev) => prev.filter((track) => track.trackPublications.trackSid !== publication.trackSid));

            if(pub.kind === "audio"){
                 const audioTrack = _track as RemoteAudioTrack;
                audioTrack.detach();
            }
        });

        room.on(RoomEvent.DataReceived, async (payload) => {
            try {
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
                    console.log("got the message from others to start the screen share");
                    console.log("particpantIdentity", msg.participantId);
                    console.log(msg);
                    console.log("remote Tracks", remoteTracks);
                    
                    const pub = remoteTracks.find((t) =>
                        t.trackPublications.kind === "video" &&
                        t.trackPublications.source === "screen_share" &&
                        t.participantIdentity === msg.partcipantId
                    );
                
                    console.log("publication", pub);
                    if (pub?.trackPublications.videoTrack) {
                        setIsScreenSharedByOthers(true);
                        setScreenTrack(pub.trackPublications.videoTrack as LocalVideoTrack);
                        console.log("setting the screen share from the recievers side");
                    }

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
            setLocalAudioTrack(room.localParticipant.audioTrackPublications.values().next().value?.audioTrack);
            participantCount.current = participantCount.current + 1;
            return room;

        } catch (error) {
            console.log("There was an error connecting to the room:", (error as Error).message);
            await leaveRoom();
        }
    }

    function handleRecording() {
        if(isRecordingStarted == false){
            startAllRecordings();
        }else{
            stopAllRecordings();
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
    
    function startRecording(videoTrack: VideoTrack | RemoteVideoTrack, audioTrack: AudioTrack | RemoteAudioTrack, participantName: string) {
        setIsRecordinStarted(true);
        const stream = new MediaStream();
        if (videoTrack) {
            stream.addTrack(videoTrack.mediaStreamTrack.clone());
        }

        if (audioTrack) {
            stream.addTrack(audioTrack.mediaStreamTrack.clone());
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

    async function stopAllRecordings() {
        setIsRecordinStarted(false);
        if (!room) {
            console.log("room is empty");
            return;
        } 
        room.localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify({ action: "stopRecording" })),
            { reliable: true }
        );
        stopLocalRecording();
    }

    async function stopLocalRecording() {
        setIsRecordinStarted(false);
        Object.values(recorderMap.current).forEach((recorder) => {
            if (recorder.state !== "inactive") recorder.stop();
            recorder.stream.getTracks().forEach((t) => t.stop());
        });
        recorderMap.current = {};
        console.log("🛑 Recording stopped for", participantName);

        if(role === "creator"){
            setIsUploading(true);
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
            setIsUploading(false);
        }
        
    }

    
    async function getUrl() {
        try {
            console.log("sessionIdRef from the geturl function",sessionIdRef.current);
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

    return {
            room,
            setRoom,
            localTrack,
            localAudioTrack,
            remoteTracks,
            screenTrack,
            isScreenShareStarted,
            isScreenSharedByOthers,
            isRecordingStarted,
            isUploading,
            joinRoom,
            leaveRoom,
            handleRecording,
            handleScreenSharing,
            participantCount
        
        };

} 