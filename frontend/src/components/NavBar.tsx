import Moon from "@/assets/Moon";
import Sunlight from "@/assets/Sunlight";
import { Mic2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar(){
    const [theme, setTheme] = useState<string>("");
    const toggleTheme = () => {
        if (document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setTheme("light");

        } else {
        document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setTheme("dark");
        }
    };

    useEffect(() => {
        console.log("theme is changes")
    },[theme])
    return (
        <div className="w-screen h-52 flex justify-center items-center" >
            <div  className="h-24 w-full xl:w-320 fixed top-4 rounded-xl backdrop-blur-lg z-10 mt-6 shadow-sm dark:shadow-white/5" >
                <div className="flex justify-between h-24 items-center ">
                    <div className="text-4xl mx-4 my-1 font-semibold flex items-center"> 
                        <span className="p-2 shadow-sm dark:shadow-white/10 rounded-2xl m-2">
                            <Mic2Icon/>
                        </span>
                        Recio
                    </div>
                    <div className="flex gap-6 text-2xl  mr-12 font-semibold text-black dark:text-blue-100">
                        <div className="hover:shadow-sm dark:shadow-white/10 px-4 py-2 rounded-xl"><a href="#">Home</a></div>
                        <div className="hover:shadow-sm dark:shadow-white/10 px-4 py-2 rounded-xl"><a href="#features">Features</a></div>
                        <div className="hover:shadow-sm dark:shadow-white/10 px-4 py-2 rounded-xl"><a href="#pricing">Pricing</a></div>
                        <div className="hover:shadow-sm dark:shadow-white/10 px-4 py-2 rounded-xl"><a href="#Testimonials">Testimonials</a></div>
                        <div onClick={toggleTheme} className="cursor-pointer flex items-center hover:shadow-sm dark:shadow-white/10 px-2 py-2 rounded-xl">{
                            theme === "light" ? <Moon /> : <Sunlight />
                        }</div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}