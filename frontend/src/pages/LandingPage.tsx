
import Mic from "@/assets/Mic";
import UploadIcon from "@/assets/UploadIcon";
import VideoIcon from "@/assets/Video";
import Feature from "@/components/Feature";
import { GridBeams } from "@/components/magicui/grid-beams";
import { Navbar } from "@/components/NavBar";

export default function LandingPage(){
    return (
        <div>
            <GridBeams>
                <div className="relative h-screen overflow-hidden bg-black/50">
                    <Navbar />
                    <div className="flex justify-around items-center mt-24 ">
                        <div className="text-8xl font-semibold">
                            Record <br /> Studio-Quality <br /> Conversations <br /> <span className="text-blue-500">from AnyWhere</span>
                        </div>
                        <div className="">
                            <div className="bg-neutral-800 rounded-2xl border-1 border-neutral-500 shadow-2xl shadow-blue-900/30">
                                <div className="m-4 ">
                                    <div className="bg-black rounded-2xl border-1 border-neutral-500 ">
                                        <img src="https://img.freepik.com/free-photo/friends-family-making-videocall-catching-up_23-2149019124.jpg" className="rounded-xl p-2 hover:scale-104 hover:ease-in-out"/>
                                    </div>
                                
                                </div>
                            
                            </div>
                            <div className="flex justify-end rotate-3">
                                <div className="bg-neutral-700 rounded-2xl border-1  border-neutral-500 w-[300px] h-[205px] -translate-y-36 translate-x-12">
                                <div className="m-4 ">
                                    <div className="bg-black rounded-2xl border-1 border-neutral-500">
                                        <img src="https://img.freepik.com/free-photo/medium-shot-man-wearing-headphones_23-2148924741.jpg?t=st=1755471451~exp=1755475051~hmac=2e401058eed84433697de0aeb6db78781209f97a262d1de86588c72d511a9f2a" 
                                        className=" rounded-xl p-2  hover:scale-108 hover:ease-in-out"/>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </GridBeams>
            <div className="h-screen">
                    <h1 className="text-center text-6xl font-bold text-shadow-md text-shadow-blue-500 mt-8">WHY RECIO?</h1>
                    <div className="">
                         <div className="flex gap-2 justify-center mt-8">
                            <Feature heading="Local Recording" description="Each participant's audio/video is recorded locally in full quality before upload" size="sm" svg={<Mic />}/>
                            <Feature heading="High-Quality Video" description="Up to 4K video and lossless WAV audio, which provides extremely sharp detail, clarity, and color accuracy." size="sm" 
                            svg={<VideoIcon />}/>
                        </div>
                        <div className="flex justify-center mt-2">
                            <Feature heading="Automatic Backup Uploads" description="Files upload in the background, even while recording is in progress ensuring that your work is continuously saved, backed up, and instantly available without interrupting your session" size="md" svg={<UploadIcon />}/>
                        </div>

                    </div>
                   
                   
            </div>

            

        </div>
        
    )
}

