import type { ReactNode } from "react"
import {  easeIn, easeInOut, motion} from "motion/react";

interface featureProps{
    heading: string,
    description: string,
    size : "sm" | "md" | "lg",
    svg : ReactNode

}

const variants = {
    offscreen:{
        y: 100
    },
    onscreen:{
        y: 0
    }

}

const childVariants= {
    initial: { scale: 1, opacity: 0.6, borderRadius: "0%" },
    hover: { scale: 1.1, opacity: 1, borderRadius: "100%", color: "#3b82f6" },
}

export default function Feature({heading, description, size, svg}: featureProps){
    return (
            <motion.div 
            initial={"offscreen"}
            whileInView={"onscreen"}
            viewport={{once: true}}
            variants={variants}
            whileHover={"hover"}
            
            
            transition={{
                duration: 0.4,
                ease: easeInOut
            }}
            
            className={`h-[300px] ${size === "sm" ? "w-full md:w-[300px]" : "w-full md:w-[600px]"} animate-rotate-border rounded-2xl overflow-hidden bg-neutral-500 p-0.5 
            bg-conic/[from_var(--border-angle)] from-black via-blue-400 to-black from-85% via-95% to-100%`}>

                <div className="rounded-2xl h-full w-full bg-gradient-to-b from-neutral-900 to-neutral-800">
                    <div className="p-8">
                            <div className="flex items-center justify-center ">
                                <motion.div className="w-fit text-center bg-blue-800 rounded-2xl p-1 " variants={childVariants}>
                                      {svg}
                                </motion.div>
                              
                            </div>
                            <motion.div className="text-3xl text-center font-bold text-shadow-xl text-shadow-blue-400  p-6 text-blue-800 hover:text-blue-600" >
                                {heading}
                            </motion.div >
                            <div className="text-xl font-light  align-text-bottom  text-center text-neutral-400">{description}</div>

                    </div>
                    
                    
                </div>
            </motion.div>
            
        
    )
}

