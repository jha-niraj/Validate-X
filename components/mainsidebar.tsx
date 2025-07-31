"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, ChevronRight, UserPlus, Users, BarChart3, MessageSquare, Settings, Home, Eye, Wallet } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

export interface Route {
	path: string
	name: string
	icon?: React.ReactNode
	status: string
}

interface SidebarProps {
	isCollapsed: boolean
	toggleSidebar: () => void
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
	const pathname = usePathname()
	const router = useRouter()
	const { data: session } = useSession()

	const isActiveRoute = (path: string) => {
		return pathname.includes(path)
	}

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Failed to sign out", error)
			toast.error("Failed to sign out")
		}
	}

	const handleNavigation = (path: string) => {
		router.push(`/${path}`)
	}

	const routes: Route[] = [
		{
			path: "dashboard",
			name: "Dashboard",
			icon: <Home className="h-5 w-5" />,
			status: "active"
		},
		{
			path: "validatehub",
			name: "ValidateHub",
			icon: <Eye className="h-5 w-5" />,
			status: "active"
		},
		{
			path: "wallet",
			name: "Wallet",
			icon: <Wallet className="h-5 w-5" />,
			status: "active"
		},
		{
			path: "analytics",
			name: "Analytics",
			icon: <BarChart3 className="h-5 w-5" />,
			status: "active"
		},
		{
			path: "feedback",
			name: "Feedback",
			icon: <MessageSquare className="h-5 w-5" />,
			status: "active"
		}
	];

	const displayRoutes = routes.filter((route) => route.status === "active")

	return (
		<TooltipProvider>
			<motion.div
				className="fixed top-0 left-0 h-full bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-20 sm:block hidden"
				animate={{ width: isCollapsed ? 60 : 180 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<div className="flex flex-col h-full relative">
					<div className="flex items-center justify-center p-4 h-[80px] border-b border-gray-200 dark:border-gray-800">
						<Link href={session ? "/dashboard" : "/"} className="flex gap-2 items-center justify-center group cursor-pointer">
							<Image
								src="/validatexmainlogo.png"
								alt="ShunyaTech"
								width={32}
								height={32}
								className="rounded-2xl"
							/>
							<motion.div
								animate={{
									opacity: isCollapsed ? 0 : 1,
									x: isCollapsed ? -20 : 0,
									width: isCollapsed ? 0 : "auto",
								}}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								style={{ overflow: "hidden" }}
							>
								<div className="whitespace-nowrap">
									<h1 className="text-xl font-bold text-gray-900 dark:text-white">
										ValidateX
									</h1>
								</div>
							</motion.div>
						</Link>
					</div>
					<div className="flex-grow overflow-y-auto py-6">
						{
							session ? (
								<div className={`space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
									{
										displayRoutes.map((route, index) => {
											const isActive = isActiveRoute(route.path)

											return (
												<Tooltip key={index}>
													<TooltipTrigger asChild>
														<motion.button
															onClick={() => handleNavigation(route.path)}
															className="block w-full cursor-pointer"
															whileHover={{ x: isCollapsed ? 0 : 4 }}
															whileTap={{ scale: 0.98 }}
															transition={{ duration: 0.1 }}
														>
															<div
																className={`
                                                        ${isActive
																		? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
																		: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
																	} 
                                                        flex items-center rounded-lg transition-all duration-200 cursor-pointer
                                                        ${isCollapsed ? "justify-center px-3 py-4" : "px-4 py-3"}
                                                    `}
															>
																{
																	isCollapsed ? (
																		<div className="flex items-center justify-center">
																			<div className="transition-all duration-200">
																				{route.icon}
																			</div>
																		</div>
																	) : (
																		<div className="flex items-center gap-3 w-full">
																			<div className="flex-shrink-0">
																				{route.icon}
																			</div>
																			<span className="text-sm font-medium truncate">
																				{route.name}
																			</span>
																		</div>
																	)
																}
															</div>
														</motion.button>
													</TooltipTrigger>
													{
														isCollapsed && (
															<TooltipContent side="right">
																<p>{route.name}</p>
															</TooltipContent>
														)
													}
												</Tooltip>
											)
										})
									}
								</div>
							) : (
								<div className={`${isCollapsed ? "px-2" : "px-4"} text-center`}>
									{
										!isCollapsed && (
											<motion.div
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.5 }}
												className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700"
											>
												<div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
													<UserPlus className="w-6 h-6 text-white dark:text-gray-900" />
												</div>
												<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Join ShunyaTech</h3>
												<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
													Sign in to access your projects, manage team, and track development progress.
												</p>
												<Link href="/signin">
													<Button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg">
														Sign In
													</Button>
												</Link>
											</motion.div>
										)
									}
									{
										isCollapsed && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														size="sm"
														className="w-10 h-10 p-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg"
													>
														<UserPlus className="w-4 h-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent side="right">
													<p>Sign In</p>
												</TooltipContent>
											</Tooltip>
										)
									}
								</div>
							)
						}
					</div>
					<motion.button
						onClick={toggleSidebar}
						className="absolute top-1/2 -translate-y-1/2 -right-4 p-2 bg-white dark:bg-gray-900 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 z-30 cursor-pointer"
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						animate={{ rotate: isCollapsed ? 0 : 180 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
					</motion.button>
					{
						session?.user && (
							<div className="border-t border-gray-200 dark:border-gray-800 p-4 mt-auto bg-gray-50 dark:bg-gray-800">
								<div className={`flex items-center justify-between ${isCollapsed ? "flex-col" : "flex-row"}`}>
									<div className="flex items-center space-x-3">
										<Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
											<AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name || "User"} />
											<AvatarFallback className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold">
												{
													session.user.name
														?.split(" ")
														.map((n: string) => n[0])
														.join("") || "U"
												}
											</AvatarFallback>
										</Avatar>
									</div>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleSignOut}
												className={`${isCollapsed ? "h-10 w-10 p-0" : "px-3"} hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 cursor-pointer transition-all duration-200`}
											>
												<LogOut className="h-4 w-4" />
												{!isCollapsed && <span className="ml-2 text-sm">Sign Out</span>}
											</Button>
										</TooltipTrigger>
										<TooltipContent side={isCollapsed ? "right" : "top"}>
											<p>Sign Out</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</div>
						)
					}
				</div>
			</motion.div>
			<div className="mt-6 sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-sm z-20">
				<div className="flex justify-around py-2">
					{
						displayRoutes.slice(0, 5).map((route) => {
							const isActive = isActiveRoute(route.path)
							return (
								<button
									key={route.path}
									onClick={() => handleNavigation(route.path)}
									className={`flex flex-col items-center gap-1 text-xs ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} focus:outline-none`}
								>
									{route.icon}
									<span>{route.name}</span>
								</button>
							)
						})
					}
				</div>
			</div>
		</TooltipProvider>
	)
}

export default Sidebar; 