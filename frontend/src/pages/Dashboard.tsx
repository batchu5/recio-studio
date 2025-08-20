import axios from "axios";
import {  RemoteAudioTrack, RemoteParticipant, RemoteTrack, RemoteTrackPublication, RemoteVideoTrack, Room, RoomEvent, type AudioTrack, type VideoTrack } from "livekit-client";
import {  useEffect, useRef, useState } from "react";
import VideoComponent from "../components/videoComponent";
import AudioComponent from "../components/AudioComponent";

import { saveChunk, startUploadWorker } from "../utils/uploadworker";
import {  useSearchParams } from "react-router-dom";

type Trackinfo = {
  trackPublications : RemoteTrackPublication,
  participantIdentity : string,
}

export default function Dashboard() {

    const recorderMap = useRef<Record<string, MediaRecorder>>({});
    const [room, setRoom] = useState<Room | undefined> (undefined);
    const [localTrack, setLocalTrack] = useState<VideoTrack | undefined>(undefined);

    const [remoteTracks, setRemoteTracks] = useState<Trackinfo[]>([]);
    const sessionIdRef = useRef<string>("abc123"); 
    const RecordingRef = useRef<string | null>(null);
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    const [recordingUrl, setRecordingUrl] = useState<string>("");

    const participantName = localStorage.getItem("participantName");
    const [isRecordingStarted, setIsRecordinStarted] = useState<boolean>(false);
    const roomName = localStorage.getItem("roomName")
    const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_WSURL;

    useEffect(() => {
        console.log("role", role);
    })

    async function leaveRoom() {
            await room?.disconnect();

            setRoom(undefined);
            setLocalTrack(undefined);
            setRemoteTracks([]);
    }

    async function joinRoom(){
        sessionIdRef.current = crypto.randomUUID();
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

                let audioTrack: RemoteAudioTrack | undefined ;
                let videoTrack: RemoteVideoTrack | undefined ;

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

        room.on(RoomEvent.DataReceived, (payload) => {
            try {
                console.log("Got the data from the creator to start the recording asf");
                const msg = JSON.parse(new TextDecoder().decode(payload));
                if (msg.action === "startRecording") {
                    RecordingRef.current = msg.recordingId;
                    sessionIdRef.current = msg.recordingId;
                    startLocalRecording();
                }
                if (msg.action === "stopRecording") {
                    stopLocalRecording();
                }
            } catch (err) {
                console.error("Bad data message", err);
            }
        });

        try{
            if(!token){
                console.log("token is undefined", token);
                return;
            }
            
            await room.connect(LIVEKIT_URL, token);
            await room.localParticipant.enableCameraAndMicrophone();
            setLocalTrack(room.localParticipant.videoTrackPublications.values().next().value?.videoTrack);

        }catch (error) {
            console.log("There was an error connecting to the room:", (error as Error).message);
            await leaveRoom();
        }
    } 

    function startAllRecordings() {
        RecordingRef.current = crypto.randomUUID();
        sessionIdRef.current = RecordingRef.current;
        console.log("recording started", isRecordingStarted);
        setIsRecordinStarted(true);

        if (!room) return;
        room.localParticipant.publishData(
            new TextEncoder().encode(JSON.stringify({ action: "startRecording", recordingId : RecordingRef.current })),
            { reliable: true }
        );
        startLocalRecording();
    }

    function stopAllRecordings() {
        setIsRecordinStarted(false);
        if (!room) return;
        room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({ action: "stopRecording" })),
        { reliable: true }
        );
        stopLocalRecording();
    }

    function startLocalRecording() {
        console.log("starting the recording");
        if (!room) return;
        setIsRecordinStarted(true);

        if (!sessionIdRef.current) {
            console.warn("No shared recordingId yet; not starting recording.");
            return;
        }

        const localVideoPub = Array.from(room.localParticipant.videoTrackPublications.values())[0];
        const localAudioPub = Array.from(room.localParticipant.audioTrackPublications.values())[0];

        const localVideoTrack = localVideoPub?.track  as VideoTrack;
        const localAudioTrack = localAudioPub?.track  as AudioTrack;

        const identity = room.localParticipant.identity || participantName || "anonymous";

        if (localVideoTrack || localAudioTrack) {
            recorderMap.current[identity] = startRecording(localVideoTrack, localAudioTrack, identity);
        }

    }

    function stopLocalRecording() {
        setIsRecordinStarted(false);
        Object.values(recorderMap.current).forEach((recorder) => {
        if (recorder.state !== "inactive") recorder.stop();
        recorder.stream.getTracks().forEach((t) => t.stop());
        });
        recorderMap.current = {};
        console.log("🛑 Recording stopped for", participantName);
    }

    function startRecording(videoTrack : VideoTrack | RemoteVideoTrack, audioTrack : AudioTrack | RemoteAudioTrack, participantName : string){
            setIsRecordinStarted(true);
            const stream = new MediaStream();
            if(videoTrack){
                stream.addTrack(videoTrack.mediaStreamTrack);
            }

            if(audioTrack){
                stream.addTrack(audioTrack.mediaStreamTrack);
            }

            const recorder = new MediaRecorder(stream, {"mimeType" : "video/webm; codecs=vp8,opus"})
            recorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    const blob = event.data;
                        await saveChunk(sessionIdRef.current, participantName, blob);
                    }
                };
            recorder.start(5000);
            
            startUploadWorker();
            return recorder;
    }

    async function getUrl(){
        try {
            console.log(sessionIdRef.current);
            const sessionId = sessionIdRef.current;
            const res = await axios.post(`${BackendUrl}/api/get_url`, {session_id :sessionId},{
                headers: {
                "Content-Type": "application/json"
                }
            })
            setRecordingUrl(res.data.url);
        console.log(res.data);
        } catch (error) {
            console.log("error occured bhahu", error);
        }
    }

    return (
        <>
            {!room ? (
                <div id="join">
                    <div id="join-dialog">
                        <h2>Join a Video Room</h2>
                        <form
                            onSubmit={(e) => {
                                joinRoom();
                                e.preventDefault();
                            }}
                        >
                            <div>
                              Participant:  {participantName}
                                
                            </div>
                            
                            <button
                                className="btn btn-lg btn-success"
                                type="submit"
                                disabled={!roomName || !participantName}
                            >
                                Join!
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div id="room">
                    <div id="room-header">
                        <h2 id="room-title">{roomName}</h2>
                        <button className="btn btn-danger" id="leave-room-button" onClick={leaveRoom}>
                            Leave Room
                        </button>
                        <div>
                                {
                                    role === "creator" &&  (
                                    <div>
                                        <button onClick={startAllRecordings}>
                                            Start recording all
                                        </button>

                                        <button onClick={stopAllRecordings}>
                                            End recording all
                                        </button>

                                        url of the recording: {recordingUrl}
                                        <button onClick={getUrl}>Get URL</button>
                                    </div>
                                )}
                                
                        </div>
                    </div>
                    <div id="layout-container">
                        {localTrack && (
                            <VideoComponent track={localTrack} participantIdentity={participantName || "Test User"} local={true} />
                        )}
                        {remoteTracks.map((remoteTrack) =>
                            remoteTrack.trackPublications.kind === "video" ? (
                                <VideoComponent
                                    key={remoteTrack.trackPublications.trackSid}
                                    track={remoteTrack.trackPublications.videoTrack!}
                                    participantIdentity={remoteTrack.participantIdentity}
                                />
                            ) : (
                                <AudioComponent
                                    key={remoteTrack.trackPublications.trackSid}
                                    track={remoteTrack.trackPublications.audioTrack!}
                                />
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );

  
}
