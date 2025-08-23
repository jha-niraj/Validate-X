"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MainLanding } from "@/components/mainlanding";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WordRotate } from "./ui/word-rotate";
import { addToWaitingList, getWaitingListCount } from "@/actions/waitinglist.actions";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
            } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
            } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
            } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950 dark:text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {
                    paths.map((path) => (
                        <motion.path
                            key={path.id}
                            d={path.d}
                            stroke="currentColor"
                            strokeWidth={path.width}
                            strokeOpacity={0.1 + path.id * 0.03}
                            initial={{ pathLength: 0.3, opacity: 0.6 }}
                            animate={{
                                pathLength: 1,
                                opacity: [0.3, 0.6, 0.3],
                                pathOffset: [0, 1, 0],
                            }}
                            transition={{
                                duration: 20 + Math.random() * 10,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                        />
                    ))
                }
            </svg>
        </div>
    );
}

export function MainLandingPage({
    title = "Validate",
    subtitle = "Blockchain-Powered Idea Validation Platform",
    showWaitingArea = false
}: {
    title?: string;
    subtitle?: string;
    showWaitingArea?: boolean;
}) {
    const words = title.split(" ");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [waitingListCount, setWaitingListCount] = useState(0);

    useEffect(() => {
        if (showWaitingArea) {
            const fetchCount = async () => {
                const result = await getWaitingListCount();
                if (result.success) {
                    setWaitingListCount(result.count);
                }
            };
            fetchCount();
        }
    }, [showWaitingArea]);

    const handleWaitingListSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await addToWaitingList(email);

            if (result.success) {
                setShowSuccessDialog(true);
                setEmail("");
                toast.success(result.message);

                const countResult = await getWaitingListCount();
                if (countResult.success) {
                    setWaitingListCount(countResult.count);
                }
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Error submitting to waiting list:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="relative min-h-screen w-full flex items-center justify-center overflow-auto bg-white dark:bg-neutral-950 py-24 md:py-28">
                <div className="absolute inset-0">
                    <FloatingPaths position={1} />
                    <FloatingPaths position={-1} />
                </div>
                <section className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="flex flex-col gap-4 items-center justify-center mb-8">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
                                {
                                    words.map((word, wordIndex) => (
                                        <span
                                            key={wordIndex}
                                            className="inline-block mr-4 last:mr-0"
                                        >
                                            {
                                                word.split("").map((letter, letterIndex) => (
                                                    <motion.span
                                                        key={`${wordIndex}-${letterIndex}`}
                                                        initial={{ y: 100, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{
                                                            delay:
                                                                wordIndex * 0.1 +
                                                                letterIndex * 0.03,
                                                            type: "spring",
                                                            stiffness: 150,
                                                            damping: 25,
                                                        }}
                                                        className="inline-block text-transparent bg-clip-text 
                                            bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                            dark:from-white dark:to-white/80"
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                ))
                                            }
                                        </span>
                                    ))
                                }
                            </h1>
                            <WordRotate
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-black dark:text-white
                                    inline-block text-transparent bg-clip-text 
                                            bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                            dark:from-white dark:to-white/80
                                "
                                words={["Ideas", "Projects", "Thoughts", "Anything", "Everything"]}
                            />
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="text-xl md:text-2xl mb-6 text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto"
                        >
                            {subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8 mb-8 max-w-5xl mx-auto"
                        >
                            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl p-6 border border-neutral-200/20 dark:border-neutral-800/20">
                                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl mb-4 flex items-center justify-center">
                                    <span className="text-white text-xl">💡</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Submit Ideas</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">Share your innovations and get valuable feedback from our diverse community of validators.</p>
                            </div>
                            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl p-6 border border-neutral-200/20 dark:border-neutral-800/20">
                                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center">
                                    <span className="text-white text-xl">⛓️</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Blockchain Rewards</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">Earn crypto rewards for validating ideas. Transparent payments via Polygon blockchain.</p>
                            </div>
                            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl p-6 border border-neutral-200/20 dark:border-neutral-800/20">
                                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-4 flex items-center justify-center">
                                    <span className="text-white text-xl">🌍</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-200">Global Community</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">Connect with students, startups, NGOs, and creators worldwide for diverse perspectives.</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            {
                                !showWaitingArea ? (
                                    <>
                                        <div
                                            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                                            bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                                            text-black dark:text-white transition-all duration-300 
                                            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                                            hover:shadow-md dark:hover:shadow-neutral-800/50"
                                            >
                                                <Link href="/signup">
                                                    <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                                        Start Validating
                                                    </span>
                                                    <span
                                                        className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                                    transition-all duration-300"
                                                    >
                                                        →
                                                    </span>
                                                </Link>
                                            </Button>
                                        </div>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="px-8 py-6 text-lg font-semibold rounded-2xl border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                            <Link href="/signin">
                                                Sign In
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <div className="w-full max-w-md">
                                        <form onSubmit={handleWaitingListSubmit} className="flex flex-col sm:flex-row gap-4">
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="flex-1 px-6 py-4 text-lg rounded-2xl border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-black/90 backdrop-blur-sm"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 text-white dark:from-white dark:to-neutral-200 dark:hover:from-neutral-100 dark:hover:to-neutral-300 dark:text-black"
                                            >
                                                {isLoading ? "Joining..." : "Join Waitlist"}
                                            </Button>
                                        </form>
                                        <div className="text-center space-y-2 mt-4">
                                            {
                                                waitingListCount > 0 && (
                                                    <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-full border border-teal-200 dark:border-teal-800">
                                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                                        <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                                                            {waitingListCount.toLocaleString()} {waitingListCount === 1 ? 'person has' : 'people have'} already joined
                                                        </span>
                                                    </div>
                                                )
                                            }
                                            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                                                Be the first to know when we launch
                                            </p>
                                        </div>
                                    </div>
                                )
                            }
                        </motion.div>
                    </motion.div>
                </section>
                <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center">🎉 You&apos;re on the list!</DialogTitle>
                            <DialogDescription className="text-center">
                                Thank you for joining our waiting list. We&apos;ll notify you as soon as ValidateX launches!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center mt-4">
                            <Button
                                onClick={() => setShowSuccessDialog(false)}
                                className="bg-gradient-to-r from-neutral-900 to-neutral-700 hover:from-neutral-800 hover:to-neutral-600 text-white dark:from-white dark:to-neutral-200 dark:hover:from-neutral-100 dark:hover:to-neutral-300 dark:text-black"
                            >
                                Great!
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            {!showWaitingArea && <MainLanding />}
        </>
    );
}