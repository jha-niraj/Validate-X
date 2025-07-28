"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { validateResetToken, resetPassword } from "@/actions/auth.actions"
import { toast } from "sonner"

function ResetPassword() {
    const searchParams = useSearchParams()

    const [token, setToken] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        const tokenParam = searchParams.get('token')
        if (tokenParam) {
            setToken(tokenParam)
            validateToken(tokenParam)
        } else {
            setIsValidToken(false)
        }
    }, [searchParams])

    const validateToken = async (tokenValue: string) => {
        try {
            const result = await validateResetToken(tokenValue)
            setIsValidToken(result.valid)
        } catch (error) {
            console.error('Error validating token:', error)
            setIsValidToken(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            toast.error("Invalid reset token")
            return
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await resetPassword(token, newPassword)

            if (result.success) {
                setIsSuccess(true)
                toast.success(result.message)
            } else {
                toast.error(result.error || "Failed to reset password")
            }
        } catch (error) {
            console.error('Error resetting password:', error)
            toast.error("Failed to reset password")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isValidToken === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-neutral-600 to-neutral-800 dark:from-neutral-300 dark:to-neutral-500 rounded-full animate-pulse mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">Validating reset token...</p>
                </div>
            </div>
        )
    }

    if (!isValidToken) {
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
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm font-medium">Back to home</span>
                    </Link>
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
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Invalid Reset Link</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mt-2">This password reset link is invalid or has expired</p>
                            </div>

                            <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow-xl">
                                    <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                                </div>

                                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                                    <div className="text-sm text-red-800 dark:text-red-200">
                                        <p className="font-medium mb-1">Reset link expired</p>
                                        <p>Password reset links are only valid for 24 hours for security reasons.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 w-full">
                                    <Link href="/forgotpassword" className="w-full block">
                                        <Button className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg">
                                            Request New Reset Link
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                    
                                    <div className="text-center">
                                        <Link 
                                            href="/signin" 
                                            className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                        >
                                            ← Back to sign in
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isSuccess) {
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
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm font-medium">Back to home</span>
                    </Link>
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
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Password Reset Successful</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mt-2">Your password has been successfully reset</p>
                            </div>

                            <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                                    <CheckCircle className="w-10 h-10 text-white" />
                                </div>

                                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                                    <div className="flex items-start space-x-3">
                                        <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                        <div className="text-sm text-green-800 dark:text-green-200">
                                            <p className="font-medium mb-1">Security Notice</p>
                                            <p>Your password has been changed. You can now sign in with your new password.</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/signin" className="w-full">
                                    <Button className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg">
                                        Sign In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
                <Link 
                    href="/"
                    className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium">Back to home</span>
                </Link>
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
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Set new password</h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Create a strong password for your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300 font-medium">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pr-12"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-neutral-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-neutral-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-neutral-700 dark:text-neutral-300 font-medium">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pr-12"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-neutral-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-neutral-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-2">
                                <p className="font-medium">Password requirements:</p>
                                <ul className="space-y-1 ml-4">
                                    <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? "text-green-600 dark:text-green-400" : ""}`}>
                                        <div className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? "bg-green-600" : "bg-neutral-400"}`}></div>
                                        At least 8 characters long
                                    </li>
                                    <li className={`flex items-center gap-2 ${newPassword !== confirmPassword && confirmPassword ? "text-red-600 dark:text-red-400" : confirmPassword && newPassword === confirmPassword ? "text-green-600 dark:text-green-400" : ""}`}>
                                        <div className={`w-1 h-1 rounded-full ${confirmPassword && newPassword === confirmPassword ? "bg-green-600" : newPassword !== confirmPassword && confirmPassword ? "bg-red-600" : "bg-neutral-400"}`}></div>
                                        Both passwords must match
                                    </li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg"
                                disabled={isSubmitting || newPassword.length < 8 || newPassword !== confirmPassword}
                            >
                                {isSubmitting ? "Resetting..." : "Reset password"}
                                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>

                            <div className="text-center">
                                <Link 
                                    href="/signin" 
                                    className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                >
                                    ← Back to sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
                <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
            </div>
        }>
            <ResetPassword />
        </Suspense>
    )
}