import Mic from "@/assets/Mic";
import UploadIcon from "@/assets/UploadIcon";
import VideoIcon from "@/assets/Video";
import Feature from "@/components/Feature";
import { Navbar } from "@/components/NavBar";
import PricingSection from "@/components/Pricing";
import Testimonials from "./Testimonials";
import { Button } from "@/components/ui/button";
import Footer from "../components/Footer";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Ripple } from "@/components/magicui/ripple";
import { SparklesCore } from "@/components/ui/sparkles";
import { useNavigate } from "react-router-dom";

const people = [
  {
    id: 1,
    name: "John Doe",
    designation: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Jane Smith",
    designation: "Data Scientist",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    name: "Emily Davis",
    designation: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 5,
    name: "Tyler Durden",
    designation: "Soap Developer",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
  },
  {
    id: 6,
    name: "Dora",
    designation: "The Explorer",
    image:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
  },
];

export default function LandingPage(){
    const navigate = useNavigate();
    return (
        <div className="overflow-x-hidden">
          
                <div className="relative md:h-screen overflow-hidden " id="#">
                    
                    <Navbar />
                    <Ripple className="hidden xl:block "/>
                    <div className="flex justify-center h-full ">
                        <div className=" text-center relative ">
                                <div className="text-8xl font-bold  text-white mt-44 ">
                                    Record Studio-Quality <br />Podcasts and  videos<br /> from <span className="text-blue-400">AnyWhere</span> 
                                </div>
                                <div className="text-2xl mt-4 font-medium text-neutral-500">
                                    Recio is the easiest way to record podcasts and videos  in studio <br/> quality from anywhere. No installs, all online
                                </div>
                                <div className="mt-4 text-3xl text-white font-bold">
                                    Trusted By
                                </div>
                                <div className="flex justify-center mt-4">
                                    <AnimatedTooltip items={people} />
                                </div>
                                <div className="flex gap-4 mt-12  items-center justify-center">
                                    <Button size={"lg"} className="bg-blue-400 cursor-pointer" onClick={() => navigate("/signin")}>Start Recording for free</Button>
                                    <Button size={"lg"} variant={"secondary"} onClick={() => navigate("/signin")} className="cursor-pointer">Request a demo</Button>
                                </div>
                        </div>
                        
                    </div>
                </div>

            <div className="xl:h-screen flex items-center justify-center max-w-screen mx-auto bg-neutral-900" id="features">
                <div className="relative">
                         <SparklesCore
                            id="tsparticlesfullpage"
                            background="transparent"
                            minSize={0.6}
                            maxSize={1.4}
                            particleDensity={100}
                            className="w-full h-full absolute"
                            particleColor="#FFFFFF"
                        />
                        <h1 className="text-center text-6xl font-bold text-shadow-md text-shadow-blue-500 mt-8 md:mt-0">WHY RECIO?</h1>
                        {/* <div className="w-72 h-72 absolute rounded-full bg-blue-200/30 blur-2xl top-1/3 "></div> */}
                         <div className="md:flex gap-2 justify-center mt-8 backdrop-blur-2xl">
                            <Feature heading="Local Recording" description="Each participant's audio/video is recorded locally in full quality before upload" size="sm" svg={<Mic />}/>

                            <Feature heading="High-Quality Video" description="Up to 4K video and lossless WAV audio, which provides extremely sharp detail, clarity, and color accuracy." size="sm" 
                            svg={<VideoIcon />}/>

                        </div>
                        <div className="flex justify-center mt-4 backdrop-blur-2xl">
                            <Feature heading="Automatic Backup Uploads" description="Files upload in the background, even while recording is in progress ensuring that your work is continuously saved, backed up, and instantly available without interrupting your session" size="md" svg={<UploadIcon />}/>
                        </div>
                </div> 
            </div>
            <div className=" max-w-screen py-16 " id="pricing">
                <h1 className="text-6xl text-center">Find the <span className="text-blue-500 font-bold">"Perfect"</span> Plan <br /> for your needs</h1>
                <div className="text-center text-neutral-500 pt-2 py-12 text-lg">Whether you're just starting out or running a large team, we’ve got you covered.</div>
                <PricingSection />
            </div>


            <div className="w-full relative mt-8 py-8  lg:h-full bg-neutral-900" id="Testimonials">
                <h1 className="text-center text-6xl mb-8">Reviews from our customers</h1>
                <Testimonials animate="animate-infinite-scroll" />
                <div className="mt-4 h-1"></div>
                <Testimonials animate="animate-infinte-scroll-rev" />

                <div className="w-full mt-8">
                    <Footer />
                </div>
            </div>



        </div>
        
    )
}

