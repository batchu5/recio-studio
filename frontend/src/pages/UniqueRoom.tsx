import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"

interface User{
    email: string,
    id : string,
    password: string,
    createdAt: string,
    updatedAt: string
}

export default function UniqueRoom(){
    const {roomId} = useParams();
    const [users, setUsers] = useState<User[]> ([]);
    const BackendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchusers = async () => {
            const res = await axios.post(`${BackendUrl}/fetch_users_by_roomId`, {roomId: roomId});
            console.log("data", res.data.fetchedUsers[0]);
            setUsers(res.data.fetchedUsers);
        }
        fetchusers()
    },[])

    const handleDownloadUrl = async (roomId: string, userId: string | null, type: string) => {
        try {
            const res = await axios.post(`${BackendUrl}/fetch_url_by_userId_roomId_type`, {
                roomId,
                userId,
                type
            });

            const fileUrl = res.data.url; 
            console.log("response", fileUrl);
            const response = await axios.get(fileUrl, { responseType: "blob" });
            const blob = new Blob([response.data], { type: "video/mp4" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileUrl.split("/").pop() || "video.mp4";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error("Download failed", err);
        }
    };

    return <div className="border-1 border-amber-12 p-4 m-12 rounded-xl">
        <h1 className="p-4 m-2 text-2xl text-shadow-2xs text-shadow-cyan-600">Download the tracks of Users</h1>
        {users.length > 0  &&
            <div className="text-white ">
                {users.map((user) => (
                    <div key={user.id} className="p-4 m-2 border border-neutral-800 rounded-2xl w-full  flex justify-between">
                        <div>Track of {user.email.replace("@gmail.com", "")}</div>
                        <Button className="cursor-pointer" onClick={() => handleDownloadUrl(roomId as string, user.id, "individual" )}>Download</Button>                 
                    </div>
                ))}

                {users.map((user) => (
                    <div key={user.id} className="p-4 m-2 border border-neutral-800 rounded-2xl w-full  flex justify-between">
                        <div>ScreenShare Track of {user.email.replace("@gmail.com", "")}</div>
                        <Button className="cursor-pointer" onClick={() => handleDownloadUrl(roomId as string, user.id, "individual-screen" )}>Download</Button>                 
                    </div>
                ))}

                <div className="p-4 m-2 border border-neutral-800 rounded-2xl w-full cursor-pointer flex justify-between">
                    <div>Download mixed url</div>
                    <Button className="cursor-pointer" onClick={() => handleDownloadUrl(roomId as string, null, "mixed")}>Download</Button>                 
                </div>

                

                
            </div>
        }
        
    </div>
}