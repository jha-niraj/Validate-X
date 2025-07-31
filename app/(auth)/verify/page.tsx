"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { verifyOTP, resendVerificationOTP } from "@/actions/auth.actions"

function VerifyContent() {
	const [isLoading, setIsLoading] = useState(false)
	const [isVerified, setIsVerified] = useState(false)
	const [timer, setTimer] = useState(30)
	const [canResend, setCanResend] = useState(false)
	const [email, setEmail] = useState<string | null>(null)
	const router = useRouter()
	const searchParams = useSearchParams()

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
		const emailParam = searchParams.get('email')

		if (emailParam) {
			setEmail(emailParam)
		} else {
			router.push('/signup')
		}
	}, [searchParams, router])

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
		if (value && !/^\d+$/.test(value)) return

		const newCode = [...code]
		newCode[index] = value
		setCode(newCode)

		if (value && index < 5) {
			inputRefs[index + 1].current?.focus()
		}
	}

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs[index - 1].current?.focus()
		}
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault()
		const pastedData = e.clipboardData.getData("text/plain").trim()

		if (/^\d{6}$/.test(pastedData)) {
			const digits = pastedData.split("")
			setCode(digits)

			inputRefs[5].current?.focus()
		}
	}

	const handleResend = async () => {
		if (!email) return

		try {
			const result = await resendVerificationOTP(email)

			if (result.success) {
				toast.success(result.message)
				setCanResend(false)
				setTimer(30)
				setCode(["", "", "", "", "", ""])
			} else {
				toast.error(result.error || "Failed to resend verification code")
			}
		} catch (error) {
			console.error("Resend error:", error)
			toast.error("Failed to resend verification code")
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!email) {
			toast.error("Email not found. Please go back to signup.")
			return
		}

		if (code.join("").length !== 6) {
			toast.error("Please enter all 6 digits")
			return
		}

		setIsLoading(true)

		try {
			const otp = code.join("")
			const result = await verifyOTP(email, otp)

			if (result.success) {
				setIsVerified(true)
				toast.success("Email verified successfully!")

				// Simple approach: redirect to signin with a success message
				setTimeout(() => {
					toast.success("Please sign in with your credentials")
					router.push(`/signin?verified=true&email=${encodeURIComponent(email)}`)
				}, 1500)
			} else {
				toast.error(result.error || "Invalid verification code")
				setCode(["", "", "", "", "", ""])
				inputRefs[0].current?.focus()
			}
		} catch (error) {
			console.error("Verification error:", error)
			toast.error("Failed to verify code")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col relative overflow-hidden">
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
			<div className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-md relative z-10">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300">
							ValidateX
						</h1>
						<div className="w-12 h-0.5 bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 mx-auto"></div>
					</div>
					<div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-neutral-200/20 dark:border-neutral-800/20 p-8">
						<div className="text-center mb-8">
							<h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
								{isVerified ? "Verification Successful" : "Verify your email"}
							</h2>
							<p className="text-neutral-600 dark:text-neutral-400 mt-2">
								{isVerified ? "Signing you in and redirecting to your dashboard..." : "We've sent a 6-digit code to your email"}
							</p>
						</div>

						{
							isVerified ? (
								<div className="flex flex-col items-center justify-center py-8">
									<div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
										<CheckCircle className="w-10 h-10 text-white" />
									</div>
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
					</div>
				</div>
			</div>
		</div>
	)
}

export default function Verify() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
				<div className="text-teal-600">Loading...</div>
			</div>
		}>
			<VerifyContent />
		</Suspense>
	)
}