"use client"

import { useState } from "react"
import { changePassword, deleteAccount } from "@/actions/profile.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
	Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card"
import { 
	Dialog, DialogContent, DialogDescription, DialogFooter, 
	DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Shield, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react"
import { signOut } from "next-auth/react"
import { Role } from "@prisma/client"

interface SettingsFormProps {
	user: {
		id: string
		name: string | null
		email: string | null
		role: Role | null
	}
}

export function SettingsForm({ user }: SettingsFormProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [isDeleteLoading, setIsDeleteLoading] = useState(false)
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: ""
	})

	const [deleteData, setDeleteData] = useState({
		password: "",
		confirmText: ""
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

	const handleDeleteAccount = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsDeleteLoading(true)

		try {
			const result = await deleteAccount(deleteData)

			if (result.success) {
				toast.success("Account deleted successfully")
				// Sign out the user and redirect to home
				await signOut({ callbackUrl: '/' })
			} else {
				toast.error(result.error || "Failed to delete account")
			}
		} catch {
			toast.error("An error occurred while deleting account")
		} finally {
			setIsDeleteLoading(false)
		}
	}

	const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setDeleteData(prev => ({
			...prev,
			[name]: value
		}))
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
	const isSameAsCurrentPassword = passwordData.currentPassword && passwordData.newPassword && passwordData.currentPassword === passwordData.newPassword
	const canSubmit = passwordData.currentPassword && isPasswordValid && doPasswordsMatch && !isSameAsCurrentPassword

	const canDeleteAccount = deleteData.password && deleteData.confirmText === "DELETE"

	return (
		<div className="space-y-6">
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

			{/* Role Change Section - Temporarily Commented Out
			<Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
						<UserCheck className="h-5 w-5 text-blue-500" />
						Change Role
					</CardTitle>
					<CardDescription className="text-neutral-600 dark:text-neutral-400">
						Update your role to access different features
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							Current Role: <span className="capitalize">{user.userRole?.toLowerCase().replace('_', ' ') || 'Not set'}</span>
						</Label>
						<Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select your role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={UserRole.SUBMITTER}>
									<div className="flex flex-col">
										<span className="font-medium">Submitter</span>
										<span className="text-xs text-muted-foreground">Submit ideas for validation</span>
									</div>
								</SelectItem>
								<SelectItem value={UserRole.VALIDATOR}>
									<div className="flex flex-col">
										<span className="font-medium">Validator</span>
										<span className="text-xs text-muted-foreground">Validate others' ideas and earn rewards</span>
									</div>
								</SelectItem>
								<SelectItem value={UserRole.BOTH}>
									<div className="flex flex-col">
										<span className="font-medium">Both</span>
										<span className="text-xs text-muted-foreground">Submit ideas and validate others</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					
					<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
						<p className="text-sm text-blue-800 dark:text-blue-300">
							<strong>Note:</strong> Changing your role will update your access to different features like ValidateHub, submission limits, and reward eligibility.
						</p>
					</div>

					<Button 
						onClick={handleRoleChange}
						disabled={isRoleLoading || selectedRole === user.userRole}
						className="w-full"
					>
						{isRoleLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Updating Role...
							</>
						) : (
							'Update Role'
						)}
					</Button>
				</CardContent>
			</Card>
			*/}

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
									{
										showCurrentPassword ? (
											<EyeOff className="h-4 w-4 text-neutral-500" />
										) : (
											<Eye className="h-4 w-4 text-neutral-500" />
										)
									}
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
									{
										showNewPassword ? (
											<EyeOff className="h-4 w-4 text-neutral-500" />
										) : (
											<Eye className="h-4 w-4 text-neutral-500" />
										)
									}
								</Button>
							</div>
							{
								passwordData.newPassword && !isPasswordValid && (
									<p className="text-xs text-red-500">Password must be at least 6 characters long</p>
								)
							}
							{
								isSameAsCurrentPassword && (
									<p className="text-xs text-red-500">New password cannot be the same as your current password</p>
								)
							}
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
									{
										showConfirmPassword ? (
											<EyeOff className="h-4 w-4 text-neutral-500" />
										) : (
											<Eye className="h-4 w-4 text-neutral-500" />
										)
									}
								</Button>
							</div>
							{
								passwordData.confirmPassword && !doPasswordsMatch && (
									<p className="text-xs text-red-500">Passwords do not match</p>
								)
							}
						</div>
						<div className="flex justify-end pt-4">
							<Button
								type="submit"
								disabled={isLoading || !canSubmit}
								className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
							>
								{
									isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Changing...
										</>
									) : (
										"Change Password"
									)
								}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
			<Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
						<Trash2 className="h-5 w-5 text-red-500" />
						Delete Account
					</CardTitle>
					<CardDescription className="text-red-600 dark:text-red-400">
						Permanently delete your account and all associated data. This action cannot be undone.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
								<div className="space-y-2">
									<h4 className="font-medium text-red-800 dark:text-red-200">
										What will be deleted:
									</h4>
									<ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
										<li>• Your profile information and account data</li>
										<li>• All your posts and submissions</li>
										<li>• Your validation history and earned rewards</li>
										<li>• Transaction history and wallet connections</li>
										<li>• All category preferences and settings</li>
									</ul>
								</div>
							</div>
						</div>
						<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete My Account
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
										<AlertTriangle className="h-5 w-5 text-red-500" />
										Delete Account Confirmation
									</DialogTitle>
									<DialogDescription className="text-red-600 dark:text-red-400">
										This action is permanent and cannot be undone. All your data will be permanently deleted.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleDeleteAccount} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="deletePassword" className="text-sm font-medium">
											Enter your password to confirm:
										</Label>
										<Input
											id="deletePassword"
											name="password"
											type="password"
											value={deleteData.password}
											onChange={handleDeleteInputChange}
											required
											className="border-red-300 focus:border-red-500"
											placeholder="Enter your password"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="confirmText" className="text-sm font-medium">
											Type <span className="font-bold text-red-600">DELETE</span> to confirm:
										</Label>
										<Input
											id="confirmText"
											name="confirmText"
											type="text"
											value={deleteData.confirmText}
											onChange={handleDeleteInputChange}
											required
											className="border-red-300 focus:border-red-500"
											placeholder="Type DELETE to confirm"
										/>
									</div>
									<DialogFooter className="flex-col sm:flex-row gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowDeleteDialog(false)}
											disabled={isDeleteLoading}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											variant="destructive"
											disabled={isDeleteLoading || !canDeleteAccount}
											className="bg-red-600 hover:bg-red-700"
										>
											{
												isDeleteLoading ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Deleting...
													</>
												) : (
													<>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete Account
													</>
												)
											}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</CardContent>
			</Card>
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