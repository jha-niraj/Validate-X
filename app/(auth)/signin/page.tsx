"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/authlayout"
import { ArrowRight, BookOpen, Globe, Mic, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

export default function SignIn() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                throw new Error('Invalid email or password')
            }

            if (result?.ok) {
                toast.success('Welcome back!')
                router.push('/dashboard')
            }

        } catch (error) {
            console.error('Sign-in error:', error)
            toast.error(error instanceof Error ? error.message : 'Sign-in failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        try {
            await signIn('google', {
                callbackUrl: '/dashboard'
            })
        } catch (error) {
            console.error('Google sign-in error:', error)
            toast.error('Google sign-in failed')
            setIsGoogleLoading(false)
        }
    }

    const floatingElements = [
        <motion.div
            key="floating-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute top-20 left-20 animate-float"
        >
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Mic className="w-6 h-6 text-white" />
            </div>
        </motion.div>,
        <motion.div
            key="floating-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute top-40 right-32 animate-float-delayed"
        >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
            </div>
        </motion.div>,
        <motion.div
            key="floating-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute bottom-32 left-40 animate-float-slow"
        >
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Globe className="w-7 h-7 text-white" />
            </div>
        </motion.div>,
        <motion.div
            key="floating-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-40 right-20 animate-float-reverse"
        >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
            </div>
        </motion.div>,
    ]

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to continue your language learning journey"
            floating={floatingElements}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="rounded-xl border-teal-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="rounded-xl border-teal-200 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </form>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
            <div className="pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500 mb-4">Or continue with</p>
                <div className="grid grid-cols-1 gap-4">
                    <Button 
                        type="button"
                        variant="outline" 
                        className="rounded-xl border-teal-200 hover:bg-teal-50"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                        {isGoogleLoading ? "Signing in..." : "Google"}
                    </Button>
                </div>
            </div>
        </AuthLayout>
    )
}