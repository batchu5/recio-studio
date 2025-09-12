
import { Mic2Icon } from "lucide-react";

export function Navbar(){
    return (
        <div className="w-screen h-52 flex justify-center items-center ">
            <div  className="h-24 w-full xl:w-320 fixed top-4 rounded-xl backdrop-blur-lg z-10 mt-6 shadow-sm shadow-white/5" >
                <div className="flex justify-between h-24 items-center ">
                    <div className="text-4xl mx-4 my-1 font-semibold flex items-center"> 
                        <span className="p-2 shadow-sm shadow-white/10 rounded-2xl m-2">
                            <Mic2Icon/>
                        </span> 
                        Recio
                    </div>
                    <div className="flex gap-6 text-2xl  mr-12 font-semibold text-blue-100">
                        <div className="hover:shadow-sm shadow-white/10 px-4 py-2 rounded-xl"><a href="#">Home</a></div>
                        <div className="hover:shadow-sm shadow-white/10 px-4 py-2 rounded-xl"><a href="#features">Features</a></div>
                        <div className="hover:shadow-sm shadow-white/10 px-4 py-2 rounded-xl"><a href="#pricing">Pricing</a></div>
                        <div className="hover:shadow-sm shadow-white/10 px-4 py-2 rounded-xl"><a href="#Testimonials">Testimonials</a></div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}