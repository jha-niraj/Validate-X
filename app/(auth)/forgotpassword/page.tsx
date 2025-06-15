"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { requestPasswordReset } from "@/actions/auth.action"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [resetUrl, setResetUrl] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await requestPasswordReset(email)

            if (result.success) {
                setIsSubmitted(true)
                // For development - show reset URL
                if (result.resetUrl) {
                    setResetUrl(result.resetUrl)
                }
                toast.success(result.message)
            } else {
                toast.error(result.error || "Failed to send reset email")
            }
        } catch (error) {
            console.error('Error requesting password reset:', error)
            toast.error("Failed to send reset email")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                                Check Your Email
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                We&apos;ve sent password reset instructions to <strong>{email}</strong>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <div className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-teal-600 mt-0.5" />
                                <div className="text-sm text-teal-800">
                                    <p className="font-medium mb-1">Check your email</p>
                                    <p>If an account with that email exists, you&apos;ll receive a password reset link within a few minutes.</p>
                                </div>
                            </div>
                        </div>
                        {
                        resetUrl && process.env.NODE_ENV === 'development' && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">Development Mode</p>
                                        <p className="mb-2">Since email is not configured, here&apos;s your reset link:</p>
                                        <Link
                                            href={resetUrl}
                                            className="text-teal-600 hover:text-teal-700 underline break-all"
                                        >
                                            {resetUrl}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                        }
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-center text-sm text-gray-600">
                            Didn&apos;t receive an email? Check your spam folder or{" "}
                            <button
                                onClick={() => {
                                    setIsSubmitted(false)
                                    setEmail("")
                                }}
                                className="font-medium text-teal-600 hover:text-teal-700 underline"
                            >
                                try again
                            </button>
                        </div>
                        <div className="text-center text-sm">
                            <Link href="/auth/signin" className="flex items-center justify-center text-gray-600 hover:text-teal-600 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-teal-500/10 to-emerald-500/10 rounded-tl-full"></div>
            <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0 relative">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                            Reset your password
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-2">
                            Enter your email address and we&apos;ll send you a link to reset your password
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="rounded-lg border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send reset link"}
                        </Button>
                        <div className="text-center text-sm">
                            <Link href="/auth/signin" className="flex items-center justify-center text-gray-600 hover:text-teal-600 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

