import {motion, stagger, useAnimate} from "motion/react"
import { useEffect } from "react";

export default function AnimatedText({words}: {words: string}){
    const [scope, animate] = useAnimate();

    useEffect(() => {
        startAnimating();
    },[])

    const startAnimating = () => {
        animate(
            "span", {
                opacity: 1,
                filter: "blur(0px)",
                y:0
            },{
                duration: 0.5,
                ease: "easeInOut",
                delay: stagger(0.05)
            }
        );
    };
    return (
            <div className="text-white text-5xl flex justify-center items-center " ref={scope}>
                <motion.div  >
                    {words.split(" ").map((word, index) => 
                        <motion.span key={index} style={{
                            opacity: 0,
                            filter: "blur(10px)",
                            y: 10
                        }} className={`${index === words.split(" ").length - 1 ? "text-blue-500": ""}`}> {word} </motion.span>
                    )}
                </motion.div>

            </div>
            
    )
}