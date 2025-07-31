"use client"

import type React from "react"

import { Suspense, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { registerUser } from "@/actions/auth.actions"

function SignUp() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await registerUser(name, email, password)

            if (!result.success) {
                throw new Error(result.error || 'Registration failed')
            }

            console.log("Signup Result: " + result?.message);

            toast.success('Account created successfully! Please check your email for verification code.')
            router.push(`/verify?email=${encodeURIComponent(email)}`)
        } catch (error) {
            console.error('Registration error:', error)
            toast.error(error instanceof Error ? error.message : 'Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true)
        try {
            await signIn('google', {
                callbackUrl: '/dashboard'
            })
        } catch (error) {
            console.error('Google sign-up error:', error)
            toast.error('Google sign-up failed')
            setIsGoogleLoading(false)
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
            <div className="flex-1 flex items-center justify-center py-24">
                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-2">
                        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300">
                            ValidateX
                        </h1>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 mx-auto"></div>
                    </div>
                    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-neutral-200/20 dark:border-neutral-800/20 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Create your account</h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Join the future of idea validation</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-neutral-700 dark:text-neutral-300 font-medium">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300 font-medium">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300 font-medium">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    minLength={8}
                                    className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                                />
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Must be at least 8 characters</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Checkbox id="terms" required disabled={isLoading} className="mt-1" />
                                <label
                                    htmlFor="terms"
                                    className="text-sm leading-5 text-neutral-600 dark:text-neutral-400 cursor-pointer"
                                >
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-neutral-900 dark:text-white hover:underline font-medium">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-neutral-900 dark:text-white hover:underline font-medium">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Create Account"}
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                        <div className="mt-8 text-center">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Already have an account?{" "}
                                <Link href="/signin" className="text-neutral-900 dark:text-white hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                            <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mb-4">Or continue with</p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 rounded-2xl border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                onClick={handleGoogleSignUp}
                                disabled={isLoading || isGoogleLoading}
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                {isGoogleLoading ? "Signing up..." : "Continue with Google"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignUp />
        </Suspense>
    )
}