"use client"

import { ProfileForm } from "./profileform"
import { SettingsForm } from "./settingsform"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Settings, Calendar, MapPin, Globe, Wallet, Trophy, MessageSquare, Lightbulb, Shield } from "lucide-react"
import Link from "next/link"

interface MainProfileProps {
	user: any;
	stats: any;
}

export function MainProfile({ user, stats }: MainProfileProps) {
	return (
		<div className="min-h-screen bg-white dark:bg-neutral-950">
			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				<div className="flex flex-col lg:flex-row gap-8">
					<div className="lg:w-1/3">
						<Card className="sticky top-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-neutral-200/20 dark:border-neutral-800/20">
							<CardHeader className="text-center">
								<div className="relative mx-auto">
									<Avatar className="h-32 w-32 mx-auto border-4 border-white dark:border-neutral-800 shadow-xl">
										<AvatarImage src={user.image || undefined} alt={user.name || "User"} />
										<AvatarFallback className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-2xl font-bold">
											{user.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
										</AvatarFallback>
									</Avatar>
								</div>
								<CardTitle className="text-2xl font-bold mt-4 text-neutral-900 dark:text-white">
									{user.name}
								</CardTitle>
								<CardDescription className="text-lg text-neutral-600 dark:text-neutral-400">
									{user.email}
								</CardDescription>
								{
									user.bio && (
										<p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 italic">
											&quot;{user.bio}&quot;
										</p>
									)
								}
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-center">
									<Badge variant="outline" className="flex items-center gap-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
										<Shield className="h-4 w-4" />
										{user.role === 'ADMIN' ? 'Administrator' : 'Community Member'}
									</Badge>
								</div>

								<Separator className="bg-neutral-200 dark:bg-neutral-800" />

								<div className="space-y-3">
									{
										user.location && (
											<div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
												<MapPin className="h-4 w-4 text-teal-500" />
												<span>{user.location}</span>
											</div>
										)
									}
									{
										user.website && (
											<div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
												<Globe className="h-4 w-4 text-teal-500" />
												<Link
													href={user.website}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
												>
													{user.website.replace(/^https?:\/\//, '')}
												</Link>
											</div>
										)
									}
									{
										user.walletAddress && (
											<div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
												<Wallet className="h-4 w-4 text-teal-500" />
												<span className="font-mono text-xs">
													{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
												</span>
											</div>
										)
									}
									{
										stats && (
											<div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
												<Calendar className="h-4 w-4 text-teal-500" />
												<span>Member since {stats.memberSince}</span>
											</div>
										)
									}
								</div>
								{
									user.skills && user.skills.length > 0 && (
										<>
											<Separator className="bg-neutral-200 dark:bg-neutral-800" />
											<div className="space-y-2">
												<h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">Skills</h4>
												<div className="flex flex-wrap gap-2">
													{
														user.skills.map((skill: string, index: number) => (
															<Badge
																key={index}
																variant="secondary"
																className="text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
															>
																{skill}
															</Badge>
														))
													}
												</div>
											</div>
										</>
									)
								}
								{
									user.interests && user.interests.length > 0 && (
										<>
											<Separator className="bg-neutral-200 dark:bg-neutral-800" />
											<div className="space-y-2">
												<h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">Interests</h4>
												<div className="flex flex-wrap gap-2">
													{
														user.interests.map((interest: string, index: number) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
															>
																{interest}
															</Badge>
														))
													}
												</div>
											</div>
										</>
									)
								}

								<Separator className="bg-neutral-200 dark:bg-neutral-800" />

								<div className="space-y-2">
									<h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
										ValidateX Statistics
									</h4>
									<div className="grid grid-cols-2 gap-4 text-center">
										<div className="space-y-1">
											<div className="flex items-center justify-center gap-1">
												<MessageSquare className="h-4 w-4 text-blue-500" />
												<p className="text-2xl font-bold text-blue-600">
													{user.totalValidations}
												</p>
											</div>
											<p className="text-xs text-neutral-500 dark:text-neutral-400">Validations</p>
										</div>
										<div className="space-y-1">
											<div className="flex items-center justify-center gap-1">
												<Lightbulb className="h-4 w-4 text-emerald-500" />
												<p className="text-2xl font-bold text-emerald-600">
													{user.totalIdeasSubmitted}
												</p>
											</div>
											<p className="text-xs text-neutral-500 dark:text-neutral-400">Ideas</p>
										</div>
										<div className="col-span-2 space-y-1">
											<div className="flex items-center justify-center gap-1">
												<Trophy className="h-4 w-4 text-yellow-500" />
												<p className="text-2xl font-bold text-yellow-600">
													{user.reputationScore}
												</p>
											</div>
											<p className="text-xs text-neutral-500 dark:text-neutral-400">Reputation Score</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="lg:w-2/3">
						<Tabs defaultValue="profile" className="w-full">
							<TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-800">
								<TabsTrigger
									value="profile"
									className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900"
								>
									<User className="h-4 w-4" />
									Profile
								</TabsTrigger>
								<TabsTrigger
									value="settings"
									className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900"
								>
									<Settings className="h-4 w-4" />
									Settings
								</TabsTrigger>
							</TabsList>
							<TabsContent value="profile" className="mt-3">
								<Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-neutral-200/20 dark:border-neutral-800/20">
									<CardHeader>
										<CardTitle className="text-neutral-900 dark:text-white">
											Profile Information
										</CardTitle>
										<CardDescription className="text-neutral-600 dark:text-neutral-400">
											Update your profile information, skills, and interests to help others understand your expertise
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ProfileForm user={user} />
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="settings" className="mt-3">
								<Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-neutral-200/20 dark:border-neutral-800/20">
									<CardHeader>
										<CardTitle className="text-neutral-900 dark:text-white">
											Account Settings
										</CardTitle>
										<CardDescription className="text-neutral-600 dark:text-neutral-400">
											Manage your account preferences and security settings
										</CardDescription>
									</CardHeader>
									<CardContent>
										<SettingsForm user={user} />
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</div>
	)
}