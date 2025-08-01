"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Plus, TrendingUp, Users, Lightbulb, Star, MessageSquare, Eye, CheckCircle,
	PenTool, Clock, DollarSign, Trophy, Zap, BookOpen, Filter, BarChart3
} from "lucide-react"
import { toast } from "sonner"
import { getSubmitterDashboard, getValidatorDashboard, getBothDashboard } from "@/actions/dashboard.actions"
import Link from "next/link"

interface DashboardData {
	user: {
		name: string
		userRole: string | null
		totalBalance: any // Prisma Decimal
		availableBalance: any // Prisma Decimal
		reputationScore: number
		totalIdeasSubmitted: number
		totalValidations: number
	}
	posts?: any[]
	validations?: any[]
	availablePosts?: any[]
	analytics?: any
	recentValidations?: any[]
	categories?: any[]
	validatorData?: any
}

export default function DashboardPage() {
	const { data: session } = useSession()
	const searchParams = useSearchParams()
	const [showCreatePrompt, setShowCreatePrompt] = useState(false)
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Check if user came from onboarding with createPost=true
		if (searchParams.get('createPost') === 'true') {
			setShowCreatePrompt(true)
			toast.success("Welcome! Ready to submit your first idea?")
		}
	}, [searchParams])

	useEffect(() => {
		async function fetchDashboardData() {
			if (!session?.user) return

			try {
				setLoading(true)

				// Get user role from session or database
				let userData
				// For now, default to both role since userRole is not in session
				// In a real app, you'd fetch this from the database or store it in session
				userData = await getBothDashboard()

				setDashboardData(userData)
			} catch (error) {
				console.error("Error fetching dashboard data:", error)
				toast.error("Failed to load dashboard data")
			} finally {
				setLoading(false)
			}
		}

		fetchDashboardData()
	}, [session])

	if (!session) {
		redirect("/signin")
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-bl dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-lg text-muted-foreground">Loading your dashboard...</p>
				</div>
			</div>
		)
	}

	if (!dashboardData) {
		return (
			<div className="min-h-screen bg-gradient-to-bl dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center">
				<Card className="p-8 text-center">
					<CardContent>
						<p className="text-lg text-muted-foreground mb-4">Failed to load dashboard data</p>
						<Button onClick={() => window.location.reload()}>
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	const { user } = dashboardData

	return (
		<div className="min-h-screen bg-white dark:bg-neutral-900">
			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
						<Badge variant="secondary" className="capitalize">
							{user.userRole?.toLowerCase().replace('_', ' ') || 'User'}
						</Badge>
					</div>
					<p className="text-muted-foreground">
						{user.userRole === 'SUBMITTER' && "Submit ideas and get valuable feedback from validators"}
						{user.userRole === 'VALIDATOR' && "Validate ideas and earn rewards for quality feedback"}
						{user.userRole === 'BOTH' && "Submit ideas and validate others' concepts to maximize your impact"}
					</p>
				</div>
				{
					showCreatePrompt && (user.userRole === 'SUBMITTER' || user.userRole === 'BOTH') && (
						<Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
							<CardContent className="p-6">
								<div className="flex items-start gap-4">
									<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
										<Lightbulb className="h-6 w-6 text-green-600" />
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-semibold mb-2">Ready to share your first idea?</h3>
										<p className="text-gray-600 dark:text-gray-400 mb-4">
											Get valuable feedback from our community of validators and improve your concepts.
										</p>
										<div className="flex gap-3">
											<Link href="/post/create">
												<Button className="flex items-center gap-2">
													<Plus className="h-4 w-4" />
													Create Your First Post
												</Button>
											</Link>
											<Button variant="outline" onClick={() => setShowCreatePrompt(false)}>
												Maybe Later
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
									<DollarSign className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">₹{Number(user.availableBalance).toFixed(2)}</p>
									<p className="text-sm text-muted-foreground">Available Balance</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
									<Eye className="h-5 w-5 text-green-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{user.totalValidations}</p>
									<p className="text-sm text-muted-foreground">Validations</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
									<Lightbulb className="h-5 w-5 text-purple-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{user.totalIdeasSubmitted}</p>
									<p className="text-sm text-muted-foreground">Ideas Submitted</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
									<Star className="h-5 w-5 text-yellow-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{user.reputationScore}</p>
									<p className="text-sm text-muted-foreground">Reputation</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				{
					user.userRole === 'BOTH' ? (
						<BothDashboard data={dashboardData} />
					) : user.userRole === 'SUBMITTER' ? (
						<SubmitterDashboard data={dashboardData} />
					) : (
						<ValidatorDashboard data={dashboardData} />
					)
				}
			</div>
		</div>
	)
}

// Submitter Dashboard Component
function SubmitterDashboard({ data }: { data: DashboardData }) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PenTool className="h-5 w-5" />
						Quick Actions
					</CardTitle>
					<CardDescription>
						Submit ideas and manage your posts
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Link href="/post/create">
						<Button className="w-full justify-start" size="lg">
							<Plus className="mr-2 h-5 w-5" />
							Submit New Idea
						</Button>
					</Link>
					<Link href="/wallet">
						<Button variant="outline" className="w-full justify-start" size="lg">
							<DollarSign className="mr-2 h-5 w-5" />
							View Wallet
						</Button>
					</Link>
					<Link href="/validatehub">
						<Button variant="outline" className="w-full justify-start" size="lg">
							<Eye className="mr-2 h-5 w-5" />
							Browse ValidateHub
						</Button>
					</Link>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Your Recent Posts
					</CardTitle>
					<CardDescription>
						Track your submissions and their progress
					</CardDescription>
				</CardHeader>
				<CardContent>
					{
						data.posts && data.posts.length > 0 ? (
							<div className="space-y-4">
								{
									data.posts.slice(0, 5).map((post) => (
										<div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex-1">
												<h4 className="font-medium line-clamp-1">{post.title}</h4>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														{post.category}
													</Badge>
													<Badge variant={
														post.status === 'OPEN' ? 'default' :
															post.status === 'CLOSED' ? 'secondary' :
																'outline'
													} className="text-xs">
														{post.status}
													</Badge>
												</div>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium">{post.validationCount} validations</p>
												<p className="text-xs text-muted-foreground">
													₹{Number(post.totalBudget).toFixed(0)} budget
												</p>
											</div>
										</div>
									))
								}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p className="text-lg font-medium mb-2">No posts yet</p>
								<p className="text-sm">
									Start by submitting your first idea
								</p>
							</div>
						)
					}
				</CardContent>
			</Card>
		</div>
	)
}

// Validator Dashboard Component  
function ValidatorDashboard({ data }: { data: DashboardData }) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5" />
						Available for Validation
					</CardTitle>
					<CardDescription>
						Posts waiting for your expert feedback
					</CardDescription>
				</CardHeader>
				<CardContent>
					{
						data.availablePosts && data.availablePosts.length > 0 ? (
							<div className="space-y-4">
								{
									data.availablePosts.slice(0, 5).map((post) => (
										<div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex-1">
												<h4 className="font-medium line-clamp-1">{post.title}</h4>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														{post.category}
													</Badge>
													<p className="text-xs text-muted-foreground">
														by {post.authorName}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium text-green-600">
													₹{Number(post.normalReward).toFixed(0)} - ₹{Number(post.detailedReward).toFixed(0)}
												</p>
												<p className="text-xs text-muted-foreground">
													{post.validationCount} validations
												</p>
											</div>
										</div>
									))
								}
								<Link href="/validatehub">
									<Button className="w-full mt-4">
										View All Available Posts
									</Button>
								</Link>
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p className="text-lg font-medium mb-2">No posts available</p>
								<p className="text-sm">
									Check back later for new validation opportunities
								</p>
							</div>
						)
					}
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle className="h-5 w-5" />
						Recent Validations
					</CardTitle>
					<CardDescription>
						Your validation history and earnings
					</CardDescription>
				</CardHeader>
				<CardContent>
					{
						data.validations && data.validations.length > 0 ? (
							<div className="space-y-4">
								{
									data.validations.slice(0, 5).map((validation) => (
										<div key={validation.id} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex-1">
												<h4 className="font-medium line-clamp-1">{validation.postTitle}</h4>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														{validation.postCategory}
													</Badge>
													<Badge variant={
														validation.status === 'APPROVED' ? 'default' :
															validation.status === 'PENDING' ? 'secondary' :
																'destructive'
													} className="text-xs">
														{validation.status}
													</Badge>
												</div>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium text-green-600">
													₹{Number(validation.rewardAmount).toFixed(2)}
												</p>
												<p className="text-xs text-muted-foreground">
													{validation.type}
												</p>
											</div>
										</div>
									))
								}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p className="text-lg font-medium mb-2">No validations yet</p>
								<p className="text-sm">
									Start validating posts to earn rewards
								</p>
							</div>
						)
					}
				</CardContent>
			</Card>
		</div>
	)
}

// Both Roles Dashboard Component
function BothDashboard({ data }: { data: DashboardData }) {
	return (
		<Tabs defaultValue="submitter" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="submitter" className="flex items-center gap-2">
					<Lightbulb className="h-4 w-4" />
					Submitter
				</TabsTrigger>
				<TabsTrigger value="validator" className="flex items-center gap-2">
					<Eye className="h-4 w-4" />
					Validator
				</TabsTrigger>
			</TabsList>
			<TabsContent value="submitter" className="mt-6">
				<SubmitterDashboard data={data} />
			</TabsContent>
			<TabsContent value="validator" className="mt-6">
				<ValidatorDashboard data={{
					...data,
					validations: data.validatorData?.validations,
					availablePosts: data.validatorData?.availablePosts
				}} />
			</TabsContent>
		</Tabs>
	)
}