"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

export default function Waiting() {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const router = useRouter()

    const steps = [
        "Setting up your account...",
        "Preparing your learning environment...",
        "Customizing your experience...",
        "Almost there...",
    ]

    useEffect(() => {
        const timer = setTimeout(() => {
            if (progress < 100) {
                setProgress((prev) => {
                    const newProgress = prev + 1

                    // Update step based on progress
                    if (newProgress > 75) setCurrentStep(3)
                    else if (newProgress > 50) setCurrentStep(2)
                    else if (newProgress > 25) setCurrentStep(1)

                    return newProgress
                })
            } else {
                // Redirect when complete
                router.push("/onboarding")
            }
        }, 50)

        return () => clearTimeout(timer)
    }, [progress, router])

    return (
        <div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 pointer-events-none">
                <svg
                    className="w-full h-full text-neutral-950 dark:text-white opacity-[0.02]"
                    viewBox="0 0 696 316"
                    fill="none"
                >
                    <path
                        d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M-375 -183C-375 -183 -307 222 157 349C621 476 689 881 689 881"
                        stroke="currentColor"
                        strokeWidth="0.6"
                    />
                    <path
                        d="M-370 -177C-370 -177 -302 228 162 355C626 482 694 887 694 887"
                        stroke="currentColor"
                        strokeWidth="0.7"
                    />
                </svg>
            </div>

            {/* Header with back button */}
            <div className="relative z-10 p-6">
                <button 
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md relative z-10">
                    {/* ValidateX branding */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300">
                            ValidateX
                        </h1>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 mx-auto"></div>
                    </div>

                    {/* Auth card */}
                    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-neutral-200/20 dark:border-neutral-800/20 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Setting up your account</h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Please wait while we prepare your account</p>
                        </div>

                        <div className="flex flex-col items-center justify-center py-8 space-y-8">
                            <div className="relative w-32 h-32">
                                {
                                    progress < 100 ? (
                                        <div className="w-full h-full">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-24 h-24 rounded-full border-4 border-teal-200"></div>
                                            </div>
                                            <div className="absolute top-0 left-1/2 -ml-2 w-4 h-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-16 h-16 text-white" />
                                        </div>
                                    )
                                }
                            </div>
                            <div className="w-full space-y-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{progress}% complete</span>
                                    <span>{progress < 100 ? "Please wait..." : "Complete!"}</span>
                                </div>
                                <Progress
                                    value={progress}
                                    className="h-2 bg-teal-100 bg-gradient-to-r from-teal-500 to-emerald-600"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-teal-600 font-medium">{steps[currentStep]}</p>
                                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}