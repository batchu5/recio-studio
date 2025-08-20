import axios from "axios";
import { LocalVideoTrack, RemoteAudioTrack, RemoteParticipant, RemoteTrack, RemoteTrackPublication, RemoteVideoTrack, Room, RoomEvent, type AudioTrack, type VideoTrack } from "livekit-client";
import {  useRef, useState } from "react";
import VideoComponent from "../components/videoComponent";
import AudioComponent from "../components/AudioComponent";
import { useRecoilValue } from "recoil";
import { userIdAtom } from "../atoms/userId";
import { saveChunk, startUploadWorker } from "../utils/uploadworker";

type Trackinfo = {
  trackPublications : RemoteTrackPublication,
  participantIdentity : string,
}

export default function Dashboard() {
  const [room, setRoom] = useState<Room | undefined> (undefined);
  const [localTrack, setLocalTrack] = useState<LocalVideoTrack | undefined>(undefined);
  const [remoteTracks, setRemoteTracks] = useState<Trackinfo[]>([]);
  const sessionIdRef = useRef<string>("abc123"); 
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const [recordingUrl, setRecordingUrl] = useState<string>("");

  const participantName = useRecoilValue(userIdAtom);
  const [isRecordingStarted, setIsRecordinStarted] = useState<boolean>(false);
  const [roomName, setRoomName] = useState("Test Room");

  const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_WSURL;
  const recorderRef = useRef<MediaRecorder | null>(null);


  async function getToken(roomName: string, participantName: string){

    try {
      const res = await axios.post(`${BackendUrl}/getToken`, {roomName, participantId: participantName},{
        headers: {
          "Content-Type": "application/json"
        }
      })
      return res.data.token;
    } catch (error) {
        console.log("error occured bhahu", error);
    }
    
  }

  async function leaveRoom() {
        // Leave the room by calling 'disconnect' method over the Room object
        await room?.disconnect();

        // Reset the state
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

            let audioTrack: RemoteAudioTrack | undefined;
            let videoTrack: RemoteVideoTrack | undefined;

            if (pub.kind === "audio" && track.kind === "audio") {
            audioTrack = track as RemoteAudioTrack;
            }

            if (pub.kind === "video" && track.kind === "video") {
            videoTrack = track as RemoteVideoTrack;
            }

            if (isRecordingStarted && (videoTrack || audioTrack)) {
                startRecording(videoTrack!, audioTrack!, participant.identity);
            }
        }
    );



    room.on(RoomEvent.TrackUnsubscribed, (_track: RemoteTrack, publication: RemoteTrackPublication) => {
        setRemoteTracks((prev) => prev.filter((track) => track.trackPublications.trackSid !== publication.trackSid));
    });

    try{
      const token = await getToken(roomName, participantName);

      await room.connect(LIVEKIT_URL, token);
      await room.localParticipant.enableCameraAndMicrophone();
      setLocalTrack(room.localParticipant.videoTrackPublications.values().next().value?.videoTrack);

    }catch (error) {
        console.log("There was an error connecting to the room:", (error as Error).message);
        await leaveRoom();
    }

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

  function stopRecording(recorder: MediaRecorder | null) {
        setIsRecordinStarted(false);
        if (!recorder) return;
        if (recorder.state !== "inactive") {
            recorder.stop();
        }
        recorder.stream.getTracks().forEach(track => track.stop());
        console.log("🛑 Recording stopped.");
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
                            <div>
                                <label htmlFor="room-name">Room</label>
                                <input
                                    id="room-name"
                                    className="form-control"
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    required
                                />
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
                                {!room && <div>Room is empty </div>} 
                                {room && (
                                    
                                    <button
                                        onClick={() => {
                                        recorderRef.current = startRecording(
                                            localTrack!,
                                            //@ts-ignore
                                            room.localParticipant.audioTrackPublications.values().next().value?.audioTrack,
                                            participantName
                                        );
                                        }}
                                    >
                                        Start Recording
                                    </button>
                                )}
                                {room && (
                                <button
                                    onClick={() => {
                                    stopRecording(recorderRef.current);
                                    recorderRef.current = null;
                                    }}
                                >
                                    End Recording
                                </button>
                                )}
                                url of the recording: {recordingUrl}

                                <button onClick={getUrl}>Get URL</button>
                        </div>
                    </div>
                    <div id="layout-container">
                        {localTrack && (
                            <VideoComponent track={localTrack} participantIdentity={participantName} local={true} />
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
