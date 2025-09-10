
import Mic from "@/assets/Mic";
import UploadIcon from "@/assets/UploadIcon";
import VideoIcon from "@/assets/Video";
import Feature from "@/components/Feature";
import { Navbar } from "@/components/NavBar";
import PricingSection from "@/components/Pricing";
import Testimonials from "./Testimonials";
import {motion} from "motion/react"
import { Button } from "@/components/ui/button";
import AnimatedText from "@/components/AnimatedText";
import Footer from "../components/Footer";
export default function LandingPage(){
    return (
        <div className="overflow-x-hidden">
            {/* Main page */}
          
                <div className="relative md:h-screen overflow-hidden bg-linear-to-b from-30% from-neutral-900 to-neutral-950 ">
                    
                    <Navbar />
                    <div className="md:flex justify-around items-center mt-24 ">
                        <div>
                            <div className="text-8xl font-bold">
                                <AnimatedText words="Record Studio-Quality Podcasts and videos from AnyWhere"/>
                            </div>
                            <div className="text-2xl mt-8 font-medium text-neutral-500">
                                Recio is the easiest way to record podcasts and videos  in studio <br/> quality from anywhere. No installs, all online
                            </div>
                            <div className="flex gap-4 mt-4 ">
                                <Button size={"lg"} className="bg-blue-500">Start Recording for free</Button>
                                <Button size={"lg"} variant={"secondary"}>Request a demo</Button>
                            </div>
                        </div>
                        <div className="p-8  rounded-2xl ">
                            <div className=" bg-neutral-800 rounded-2xl border-1 border-neutral-500 shadow-2xl shadow-white/50">
                                <div className="m-4 ">
                                    <div className="bg-black rounded-2xl border-1 border-neutral-500 ">
                                        <img src="https://img.freepik.com/free-photo/friends-family-making-videocall-catching-up_23-2149019124.jpg" className="rounded-xl p-2 hover:scale-104 hover:ease-in-out w-full"/>
                                    </div>
                                
                                </div>
                            
                            </div>
                            
                        </div>
                    </div>
                </div>

            {/*Feature section */}

            <div className="md:h-screen flex items-center justify-center max-w-screen mx-auto ">
                <motion.div>
                    <h1 className="text-center text-6xl font-bold text-shadow-md text-shadow-blue-500 mt-8 md:mt-0">WHY RECIO?</h1>
                    
                         <div className="md:flex gap-2 justify-center mt-8">
                            <Feature heading="Local Recording" description="Each participant's audio/video is recorded locally in full quality before upload" size="sm" svg={<Mic />}/>

                            <Feature heading="High-Quality Video" description="Up to 4K video and lossless WAV audio, which provides extremely sharp detail, clarity, and color accuracy." size="sm" 
                            svg={<VideoIcon />}/>

                        </div>
                        <div className="flex justify-center mt-2">
                            <Feature heading="Automatic Backup Uploads" description="Files upload in the background, even while recording is in progress ensuring that your work is continuously saved, backed up, and instantly available without interrupting your session" size="md" svg={<UploadIcon />}/>
                        </div>
                </motion.div> 
            </div>
            {/* pricing section */}
            <div className="md:h-screen  mt-8 max-w-screen">
                <h1 className="text-6xl text-center">Find the <span className="text-blue-500 font-bold">"Perfect"</span> Plan <br /> for your needs</h1>
                <div className="text-center text-neutral-500 pt-2 py-12 text-lg">Whether you're just starting out or running a large team, we’ve got you covered.</div>
                <PricingSection />
            </div>

            {/* Testimonial section */}

            <div className="w-full relative overflow-x-hidden py-8 md:h-screen lg:h-full">
                <h1 className="text-center text-6xl mb-8">Reviews from our customers</h1>
                <Testimonials animate="animate-infinite-scroll" />
                <Testimonials animate="animate-infinte-scroll-rev" />

                <div className="w-full mt-8">
                    <Footer />
                </div>
            </div>



        </div>
        
    )
}

