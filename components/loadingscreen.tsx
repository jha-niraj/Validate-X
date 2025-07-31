"use client"

import { motion } from "framer-motion"

interface LoadingScreenProps {
    routeName: string
}

const LoadingScreen = ({ routeName }: LoadingScreenProps) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-black dark:to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    className="w-16 h-16 mb-4 mx-auto"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="w-full h-full rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                </motion.div>
                <motion.h2
                    className="text-xl font-semibold text-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Loading {routeName}...
                </motion.h2>
                <motion.p
                    className="text-sm text-muted-foreground mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Please wait while we set things up
                </motion.p>
            </div>
        </div>
    )
}

export default LoadingScreen; 