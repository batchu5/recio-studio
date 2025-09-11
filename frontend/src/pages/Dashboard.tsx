
import VideoGrid from "@/components/VideoGrid";
import Controls from "@/components/Controls";
import { useEffect } from "react";
import PermissionCheck from "@/components/PermissionCheck";
import { useRoom } from "@/components/RoomContext";

export default function Dashboard() {
    const {room} = useRoom();

    useEffect(() => {
        console.log("room is changed from dasboard")
    }, [room]);

    return (
        <>
            {!room ? (
                <PermissionCheck />
            ) : (
                <div className="h-screen w-screen">
                    <VideoGrid />
                    <Controls />
                </div>

            )}
        </>
    );


}
