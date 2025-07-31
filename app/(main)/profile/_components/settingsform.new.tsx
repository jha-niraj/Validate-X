"use client"

import { useState } from "react"
import { changePassword } from "@/actions/profile.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Shield, Eye, EyeOff } from "lucide-react"

interface SettingsFormProps {
    user: {
        id: string
        name: string | null
        email: string | null
    }
}

export function SettingsForm({ user }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await changePassword(passwordData)

            if (result.success) {
                toast.success("Password changed successfully!")
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                })
            } else {
                toast.error(result.error || "Failed to change password")
            }
        } catch {
            toast.error("An error occurred while changing password")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const isPasswordValid = passwordData.newPassword.length >= 6
    const doPasswordsMatch = passwordData.newPassword === passwordData.confirmPassword
    const canSubmit = passwordData.currentPassword && isPasswordValid && doPasswordsMatch

    return (
        <div className="space-y-6">
            {/* Account Information */}
            <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                        Account Information
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                        Your basic account details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Name
                            </Label>
                            <Input
                                value={user.name || ""}
                                disabled
                                className="bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Email
                            </Label>
                            <Input
                                value={user.email || ""}
                                disabled
                                className="bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        To change your name or email, please update your profile information in the Profile tab.
                    </p>
                </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-teal-500" />
                        Change Password
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                Current Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400 pr-10"
                                    placeholder="Enter your current password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4 text-neutral-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-neutral-500" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400 pr-10"
                                    placeholder="Enter a new password (min 6 characters)"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4 text-neutral-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-neutral-500" />
                                    )}
                                </Button>
                            </div>
                            {passwordData.newPassword && !isPasswordValid && (
                                <p className="text-xs text-red-500">Password must be at least 6 characters long</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400 pr-10"
                                    placeholder="Confirm your new password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-neutral-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-neutral-500" />
                                    )}
                                </Button>
                            </div>
                            {passwordData.confirmPassword && !doPasswordsMatch && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading || !canSubmit}
                                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Changing...
                                    </>
                                ) : (
                                    "Change Password"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                Security Tips
                            </h4>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <li>• Use a strong, unique password for your ValidateX account</li>
                                <li>• Never share your password with anyone</li>
                                <li>• Consider using a password manager for better security</li>
                                <li>• If you suspect unauthorized access, change your password immediately</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
