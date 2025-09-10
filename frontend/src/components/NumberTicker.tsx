import { animate, useInView, useIsomorphicLayoutEffect, type KeyframeOptions } from "motion/react"
import { useRef } from "react";

interface NumberProps{
    from: number,
    to: number,
    className : string,
    animationOptions ?: KeyframeOptions
}

export default function NumberTicker({from, to, animationOptions, className}: NumberProps){
    const ref = useRef<HTMLSpanElement| null>(null);
    const inView = useInView(ref, {once: true});

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if(!element) return;

        element.textContent = String(from)

        const controls = animate(from, to, {
            duration: 1.5,
            ease:"easeOut",
            ...animationOptions,
            onUpdate(value){
                element.textContent = value.toFixed((0));
            }
        })
        console.log("controls", controls);


    }, [ref, inView, from, to])

    return <div className={`${className}`}>
        $<span ref={ref} ></span>.00
    </div>

}

