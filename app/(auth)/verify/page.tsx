"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "@/components/authlayout"
import { ArrowRight, Mail, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Verify() {
    const [isLoading, setIsLoading] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [timer, setTimer] = useState(30)
    const [canResend, setCanResend] = useState(false)
    const router = useRouter()

    // Create refs for each input
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]

    const [code, setCode] = useState(["", "", "", "", "", ""])

    useEffect(() => {
        if (timer > 0 && !canResend) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        } else if (timer === 0 && !canResend) {
            setCanResend(true)
        }
    }, [timer, canResend])

    const handleInputChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text/plain").trim()

        // Check if pasted content is a 6-digit number
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("")
            setCode(digits)

            // Focus the last input
            inputRefs[5].current?.focus()
        }
    }

    const handleResend = () => {
        setCanResend(false)
        setTimer(30)
        // Simulate resending code
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Check if code is complete
        if (code.join("").length !== 6) {
            setIsLoading(false)
            return
        }

        // Simulate verification
        setTimeout(() => {
            setIsLoading(false)
            setIsVerified(true)

            // Redirect to onboarding after showing success
            setTimeout(() => {
                router.push("/onboarding")
            }, 2000)
        }, 1500)
    }

    const floatingElements = [
        <motion.div
            key="floating-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute top-1/4 left-1/4 animate-float"
        >
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-teal-500" />
            </div>
        </motion.div>,
        <motion.div
            key="floating-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute top-1/3 right-1/4 animate-float-delayed"
        >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-emerald-500" />
            </div>
        </motion.div>,
        <motion.div
            key="floating-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute bottom-1/3 left-1/5 animate-float-slow"
        >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-teal-500" />
            </div>
        </motion.div>,
    ]

    return (
        <AuthLayout
            title={isVerified ? "Verification Successful" : "Verify your email"}
            subtitle={isVerified ? "Redirecting you to complete your profile..." : "We've sent a 6-digit code to your email"}
            floating={floatingElements}
        >
            {
            isVerified ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mb-6"
                    >
                        <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <p className="text-teal-600 font-medium">Your email has been verified!</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center space-x-2">
                        {
                        code.map((digit, index) => (
                            <Input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-12 h-12 text-center text-lg font-bold rounded-xl border-teal-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            />
                        ))
                        }
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl"
                        disabled={isLoading || code.join("").length !== 6}
                    >
                        {isLoading ? "Verifying..." : "Verify Email"}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive the code?</p>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleResend}
                            disabled={!canResend}
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-sm"
                        >
                            <RefreshCw className={`mr-2 h-3 w-3 ${!canResend && "animate-spin"}`} />
                            {canResend ? "Resend Code" : `Resend in ${timer}s`}
                        </Button>
                    </div>
                </form>
            )
            }
        </AuthLayout>
    )
}