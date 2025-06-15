"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { validateResetToken, resetPassword } from "@/actions/auth.action"
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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full animate-pulse mx-auto mb-4"></div>
                    <p className="text-gray-600">Validating reset token...</p>
                </div>
            </div>
        )
    }

    if (!isValidToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                                Invalid Reset Link
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                This password reset link is invalid or has expired
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-sm text-red-800">
                                <p className="font-medium mb-1">Reset link expired</p>
                                <p>Password reset links are only valid for 24 hours for security reasons.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Link href="/auth/forgotpassword" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white">
                                Request New Reset Link
                            </Button>
                        </Link>
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

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                                Password Reset Successful
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Your password has been successfully reset
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <div className="flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-teal-600 mt-0.5" />
                                <div className="text-sm text-teal-800">
                                    <p className="font-medium mb-1">Security Notice</p>
                                    <p>Your password has been changed. You can now sign in with your new password.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href="/auth/signin" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white">
                                Sign In
                            </Button>
                        </Link>
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
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                            Set new password
                        </CardTitle>
                        <CardDescription className="text-gray-600 mt-2">
                            Create a strong password for your account
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                                    className="rounded-lg border-gray-200 focus:border-teal-300 focus:ring-teal-200 pr-10"
                                    disabled={isSubmitting}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {
                                        showNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )
                                    }
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
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
                                    className="rounded-lg border-gray-200 focus:border-teal-300 focus:ring-teal-200 pr-10"
                                    disabled={isSubmitting}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {
                                        showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )
                                    }
                                </Button>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Password requirements:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
                                    At least 8 characters long
                                </li>
                                <li className={newPassword !== confirmPassword && confirmPassword ? "text-red-600" : confirmPassword && newPassword === confirmPassword ? "text-green-600" : ""}>
                                    Both passwords must match
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-lg"
                            disabled={isSubmitting || newPassword.length < 8 || newPassword !== confirmPassword}
                        >
                            {isSubmitting ? "Resetting..." : "Reset password"}
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
        </Suspense>
    )
}