import { motion, AnimatePresence } from "motion/react";


export default function Mic() {
    return <AnimatePresence>
        <motion.div className="text-white p-1"
            initial={{
                x: 0,
                y: 0,
            }}
            whileHover={{
                x: [0, 0, 0,],
                y: [0, -6, 0,],
            
            }}
            transition={{
                ease: "easeInOut",
                duration: 0.2
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-microphone">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M19 9a1 1 0 0 1 1 1a8 8 0 0 1 -6.999 7.938l-.001 2.062h3a1 1 0 0 1 0 2h-8a1 1 0 0 1 0 -2h3v-2.062a8 8 0 0 1 -7 -7.938a1 1 0 1 1 2 0a6 6 0 0 0 12 0a1 1 0 0 1 1 -1m-7 -8a4 4 0 0 1 4 4v5a4 4 0 1 1 -8 0v-5a4 4 0 0 1 4 -4" />
            </svg>

        </motion.div>

    </AnimatePresence>

}