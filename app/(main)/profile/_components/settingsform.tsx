"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
// import { Alert, AlertDescription } from "@/components/ui/alert" // Temporarily removed
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Shield, Trash2, AlertTriangle } from "lucide-react"
import { changePassword } from "@/actions/profile.action"

interface SettingsFormProps {
    user: {
        id: string
        name: string | null
        email: string | null
        role: string
    }
}

export function SettingsForm({ user }: SettingsFormProps) {
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const [deleteConfirmation, setDeleteConfirmation] = useState("")

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsChangingPassword(true)

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
            setIsChangingPassword(false)
        }
    }

    const handleDeleteAccount = async () => {
        // Delete account functionality removed for security
        toast.error("Account deletion is not available. Please contact support.")
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Account Information
                    </CardTitle>
                    <CardDescription>
                        Your account details and role
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Email</Label>
                            <p className="text-sm text-gray-900">{user.email}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Role</Label>
                            <p className="text-sm text-gray-900">{user.role}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter your current password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter your new password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm your new password"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                            className="w-full md:w-auto"
                        >
                            {
                                isChangingPassword ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Changing Password...
                                    </>
                                ) : (
                                    "Change Password"
                                )
                            }
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible and destructive actions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950/10">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. This will permanently delete your account
                                        and remove all your data from our servers.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="deleteConfirmation">
                                            Type <strong>DELETE</strong> to confirm:
                                        </Label>
                                        <Input
                                            id="deleteConfirmation"
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            placeholder="DELETE"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmation !== "DELETE"}
                                    >
                                        {deleteConfirmation !== "DELETE" ? (
                                            <>
                                                Delete Account
                                            </>
                                        ) : (
                                            "Delete Account"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 