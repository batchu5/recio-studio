import { useRef, useState } from "react";
import {saveChunk, startUploadWorker} from "../utils/uploadworker"
import axios from "axios";

export default function SelfRecording() {
  const [url, setUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sessionIdRef = useRef<string | null>(null); 

  const handleStartRecording = async () => {
    chunksRef.current = [];
    sessionIdRef.current = crypto.randomUUID(); 

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9,opus",
    });


    recorder.ondataavailable = async(e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        console.log("blob recieved");
        if(!sessionIdRef.current){
          console.log("sessionIdRef is null");
          return;
        }
        await saveChunk(sessionIdRef.current, "123", e.data, "camera");
        
      }
    };

    startUploadWorker();

    recorder.onstop = () => {
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(blob);
        setUrl(videoUrl);
      }
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current = recorder;
    recorder.start(3000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleGetUrl = async() => {
      const result = await axios.post("http://localhost:3000/get_url", {session_id: sessionIdRef.current});

    console.log(result);
  }


  return (
    <div>
      <button onClick={handleStartRecording}>Start Recording</button>
      <button onClick={handleStopRecording}>Stop Recording</button>

      <button onClick={handleGetUrl}>Get the url of the recording</button>

      {url && <video src={url} controls />}
    </div>
  );
}
