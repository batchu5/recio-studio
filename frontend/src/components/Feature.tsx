import type { ReactNode } from "react"


interface featureProps{
    heading: string,
    description: string,
    size : "sm" | "md" | "lg",
    svg : ReactNode

}



export default function Feature({heading, description, size, svg}: featureProps){
    return (
            <div className={`h-[300px] ${size === "sm" ? "w-[300px]" : "w-[600px]"} animate-rotate-border rounded-2xl overflow-hidden bg-neutral-500 p-0.5 
            bg-conic/[from_var(--border-angle)] from-black via-blue-400 to-black from-85% via-95% to-100%`}>
                <div className="rounded-2xl h-full w-full bg-gradient-to-b from-neutral-900 to-neutral-800">
                    <div className="p-8">
                            <div className="flex items-center justify-center ">
                                <div className="w-fit text-center bg-blue-500 rounded-full p-2 ">
                                      {svg}
                                </div>
                              
                            </div>
                            <div className="text-3xl text-center font-bold text-shadow-xl text-shadow-blue-400  p-6 text-blue-800">
                                {heading}
                            </div >
                            <div className="text-xl font-light  align-text-bottom  text-center text-neutral-400">{description}</div>

                    </div>
                    
                    
                </div>
            </div>
            
        
    )
}

