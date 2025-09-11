
import VideoComponent from "./videoComponent";
import Progress from "./ui/progressBar";
import { useEffect, useState } from "react";
import { useRoom } from "./RoomContext";
import { useSearchParams } from "react-router-dom";

export default function VideoGrid(){
    const {screenTrack, localTrack, remoteTracks, isUploading, participantCount} = useRoom();
    const participantName = localStorage.getItem("participantName");
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role");
    const [rows, setRows] = useState<number>(1);
    const [cols, setCols] = useState<number>(1);

    useEffect(() => {
            let count = (localTrack ? 1 : 0) +
                remoteTracks.filter(rt => rt.trackPublications.kind === "video" && rt.trackPublications.source === "camera" ).length;
    
            console.log("remoteTracks from useEffect of counting the participants", remoteTracks);
            console.log("count", count);
            console.log("localTrack value from userEffect of participantcount", localTrack);
            console.log("remote Tracks", remoteTracks.filter(rt => rt.trackPublications.kind === "video").length);
            console.log("participant Count is changed");
            calculateGrid(count, window.innerWidth, window.innerHeight);
    }, [participantCount,remoteTracks, localTrack])

    useEffect(() => {
        console.log("screenTrack is changes so may be I need to refresh the screen");
    }, [screenTrack])

    useEffect(() => {
        console.log("isUploading is changed from videoGrid punction", isUploading)
    },[isUploading])


    function calculateGrid(n: number, containerWidth: number, containerHeight:number) {
        if(n == 2 || n == 3){
            console.log("number of people in the call is", n);
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

    return(
        <div className="h-screen">
        {screenTrack ? (
                <div className="flex h-full ">

                    <div className="flex-1 rounded-lg overflow-hidden">
                        {role === "creator"&& isUploading  && 
                        <div className="absolute z-10 w-screen flex justify-center mt-2">
                            <div className="bg-neutral-900 px-2 py-4 rounded-xl">

                            <div className=" font-medium mb-2 text-center text-xl">
                                Videos are uploading... <span className="font-semibold text-xl">Don’t leave the room</span>
                            </div>
                            <Progress value={40} indeterminate={true} className="h-3 rounded-lg" />
                            </div>
                            
                        </div>
                    }
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
                            remoteTrack.trackPublications.kind === "video" && remoteTrack.trackPublications.source === "camera" ? (
                                <VideoComponent
                                    key={remoteTrack.trackPublications.trackSid}
                                    track={remoteTrack.trackPublications.videoTrack!}
                                    participantIdentity={remoteTrack.participantIdentity}
                                />
                            ) : null
                            
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative h-screen w-screen ">
                    {role === "creator"&& isUploading  && 
                        <div className="absolute z-10 w-screen  flex justify-center mt-2">
                            <div className="bg-neutral-900 px-2 py-4 rounded-xl">

                            <div className=" font-medium mb-2 text-center text-xl">
                                Videos are uploading... <span className="font-semibold text-xl">Don’t leave the room</span>
                            </div>
                            <Progress value={40} indeterminate={true} className="h-3 rounded-lg" />
                            </div>
                            
                        </div>
                    }
                    
                    <div className={`h-full w-full grid grid-flow-col grid-cols-${cols} gap-1 `}  >
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
                            ) : null
                        )}
                        
                    </div>
                    
                </div>
            )}
            </div>
        
    )
}