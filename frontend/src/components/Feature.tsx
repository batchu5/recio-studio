import type { ReactNode } from "react"
import { motion} from "motion/react";

interface featureProps{
    heading: string,
    description: string,
    size : "sm" | "md" | "lg",
    svg : ReactNode

}

export default function Feature({heading, description, size, svg}: featureProps){
    return (
            <motion.div  className={`h-[300px] ${size === "sm" ? "w-full md:w-[300px]" : "w-full md:w-[600px]"}  rounded-2xl overflow-hidden  backdrop-blur-2xl bg-white dark:bg-black p-0.5 `}>

                <div className="rounded-2xl h-full w-full backdrop-blur-2xl ">
                    <div className="p-8 backdrop-blur-2xl" >
                            <div className="flex items-center justify-center ">
                                <motion.div className="w-fit text-center bg-blue-500 dark:bg-blue-800 rounded-2xl p-1 " >
                                      {svg}
                                </motion.div>
                              
                            </div>
                            <motion.div className="text-3xl text-center font-bold text-shadow-xl text-shadow-blue-400  p-6 text-blue-800 hover:text-blue-600" >
                                {heading}
                            </motion.div >
                            <div className="text-xl font-light  align-text-bottom  text-center text-neutral-700 dark:text-neutral-400">{description}</div>

                    </div>
                    
                    
                </div>
            </motion.div>
            
        
    )
}

