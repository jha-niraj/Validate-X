"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
	Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	BarChart3, TrendingUp, DollarSign, Eye, Target,
	ArrowUpRight, Activity, Star,
	FileText, ThumbsUp, ThumbsDown, MinusCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { 
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
	BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts'
import { getSubmitterAnalytics } from '@/actions/analytics.actions'
import { toast } from 'sonner'
import Link from 'next/link'

interface AnalyticsData {
	overview: {
		totalPosts: number
		totalSpent: number
		totalValidations: number
		avgValidationsPerPost: number
		avgCostPerValidation: number
	}
	monthlySpending: Array<{
		month: string
		amount: number
		transactions: number
	}>
	dailyValidations: Array<{
		date: string
		validations: number
		uniqueValidators: number
	}>
	categoryPerformance: Array<{
		categoryId: string
		categoryName: string
		categoryIcon: string
		postCount: number
		avgNormalReward: number
		avgDetailedReward: number
		totalSpent: number
	}>
	validationQuality: Array<{
		vote: string | null
		count: number
	}>
	topPosts: Array<{
		id: string
		title: string
		category: string
		validationCount: number
		totalBudget: number
		createdAt: string
		status: string
	}>
	recentActivity: Array<{
		id: string
		postTitle: string
		validatorName: string
		vote: string
		type: string
		createdAt: string
		rewardAmount: number
	}>
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']

export default function AnalyticsPage() {
	const { data: session } = useSession()
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (session?.user?.id && session.user.role === 'SUBMITTER') {
			fetchAnalytics()
		}
	}, [session])

	const fetchAnalytics = async () => {
		try {
			setLoading(true)
			const result = await getSubmitterAnalytics()
			if (result.success && result.analytics) {
				setAnalytics(result.analytics as AnalyticsData)
			} else {
				toast.error(result.error || 'Failed to load analytics')
			}
		} catch (error) {
			console.error('Error fetching analytics:', error)
			toast.error('Failed to load analytics data')
		} finally {
			setLoading(false)
		}
	}

	const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
	const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN')

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p>Loading analytics...</p>
					</div>
				</div>
			</div>
		)
	}

	if (!analytics) {
		return (
			<div className="container mx-auto p-6">
				<div className="text-center py-12">
					<BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
					<h2 className="text-xl font-semibold mb-2">No Analytics Available</h2>
					<p className="text-gray-600">Start submitting posts to see your analytics data.</p>
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-7xl mx-auto p-6 space-y-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<BarChart3 className="h-8 w-8 text-blue-600" />
							Analytics Dashboard
						</h1>
						<p className="text-gray-600 mt-1">
							Track your post performance, spending, and validation insights
						</p>
					</div>
					<Button onClick={fetchAnalytics} variant="outline">
						<Activity className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</motion.div>

			{/* Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Total Posts</p>
									<p className="text-2xl font-bold">{analytics.overview.totalPosts}</p>
								</div>
								<FileText className="h-8 w-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Total Spent</p>
									<p className="text-2xl font-bold text-red-600">
										{formatCurrency(analytics.overview.totalSpent)}
									</p>
								</div>
								<DollarSign className="h-8 w-8 text-red-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Total Validations</p>
									<p className="text-2xl font-bold text-green-600">{analytics.overview.totalValidations}</p>
								</div>
								<Eye className="h-8 w-8 text-green-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Avg. Validations/Post</p>
									<p className="text-2xl font-bold">{analytics.overview.avgValidationsPerPost}</p>
								</div>
								<Target className="h-8 w-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">Cost/Validation</p>
									<p className="text-2xl font-bold text-orange-600">
										{formatCurrency(analytics.overview.avgCostPerValidation)}
									</p>
								</div>
								<TrendingUp className="h-8 w-8 text-orange-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			<Tabs defaultValue="trends" className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="trends">Trends</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
					<TabsTrigger value="posts">Top Posts</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="trends" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Monthly Spending */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="h-5 w-5" />
									Monthly Spending
								</CardTitle>
								<CardDescription>Your spending pattern over the last 6 months</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={analytics.monthlySpending}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis 
												dataKey="month" 
												tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
											/>
											<YAxis tickFormatter={(value) => `₹${value}`} />
											<Tooltip 
												formatter={(value: number) => [formatCurrency(value), 'Amount']}
												labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
											/>
											<Area type="monotone" dataKey="amount" stroke="#ef4444" fill="#ef444420" strokeWidth={2} />
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						{/* Daily Validations */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Eye className="h-5 w-5" />
									Validation Activity
								</CardTitle>
								<CardDescription>Daily validation counts for the last 30 days</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={analytics.dailyValidations}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis 
												dataKey="date" 
												tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
											/>
											<YAxis />
											<Tooltip 
												labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
											/>
											<Line type="monotone" dataKey="validations" stroke="#22c55e" strokeWidth={2} name="Validations" />
											<Line type="monotone" dataKey="uniqueValidators" stroke="#3b82f6" strokeWidth={2} name="Unique Validators" />
										</LineChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						{/* Validation Quality */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="h-5 w-5" />
									Validation Quality
								</CardTitle>
								<CardDescription>Distribution of validation votes on your posts</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={analytics.validationQuality}
												cx="50%"
												cy="50%"
												outerRadius={80}
												dataKey="count"
												nameKey="vote"
												label={({ vote, count }) => `${vote}: ${count}`}
											>
												{analytics.validationQuality.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="categories" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								Category Performance
							</CardTitle>
							<CardDescription>Performance metrics across different categories</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={analytics.categoryPerformance}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="categoryName" />
										<YAxis />
										<Tooltip 
											formatter={(value: number, name: string) => [
												name === 'totalSpent' ? formatCurrency(value) : value,
												name === 'totalSpent' ? 'Total Spent' : 'Post Count'
											]}
										/>
										<Bar dataKey="postCount" fill="#3b82f6" name="Posts" />
										<Bar dataKey="totalSpent" fill="#ef4444" name="Spent" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{analytics.categoryPerformance.map((category, index) => (
							<motion.div
								key={category.categoryId}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-3">
											<span className="text-2xl">{category.categoryIcon}</span>
											<h3 className="font-semibold">{category.categoryName}</h3>
										</div>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">Posts:</span>
												<span className="font-medium">{category.postCount}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Total Spent:</span>
												<span className="font-medium">{formatCurrency(category.totalSpent)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Avg Reward:</span>
												<span className="font-medium">
													{formatCurrency(category.avgNormalReward + category.avgDetailedReward)}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</TabsContent>

				<TabsContent value="posts" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5" />
								Top Performing Posts
							</CardTitle>
							<CardDescription>Your posts with the highest validation engagement</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{analytics.topPosts.map((post, index) => (
									<motion.div
										key={post.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
									>
										<Link href={`/post/${post.id}/details`}>
											<div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white hover:bg-gray-50">
												<div className="flex-1">
													<h4 className="font-medium line-clamp-1 mb-2">{post.title}</h4>
													<div className="flex items-center gap-2">
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
													<div className="flex items-center gap-2 mb-1">
														<Eye className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm font-medium">{post.validationCount} validations</span>
														<ArrowUpRight className="h-4 w-4 text-muted-foreground" />
													</div>
													<p className="text-xs text-muted-foreground">
														{formatCurrency(post.totalBudget)} budget
													</p>
												</div>
											</div>
										</Link>
									</motion.div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Recent Activity
							</CardTitle>
							<CardDescription>Latest validation activities on your posts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{analytics.recentActivity.map((activity, index) => (
									<motion.div
										key={activity.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: index * 0.05 }}
									>
										<div className="flex items-center gap-4 p-3 border rounded-lg">
											<div className="p-2 bg-gray-100 rounded-lg">
												{activity.vote === 'LIKE' && <ThumbsUp className="h-4 w-4 text-green-600" />}
												{activity.vote === 'DISLIKE' && <ThumbsDown className="h-4 w-4 text-red-600" />}
												{activity.vote === 'NEUTRAL' && <MinusCircle className="h-4 w-4 text-gray-600" />}
											</div>
											<div className="flex-1">
												<p className="font-medium line-clamp-1">{activity.postTitle}</p>
												<p className="text-sm text-gray-600">
													{activity.validatorName} • {activity.type.toLowerCase()} validation
												</p>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium text-green-600">
													+{formatCurrency(activity.rewardAmount)}
												</p>
												<p className="text-xs text-gray-500">
													{formatDate(activity.createdAt)}
												</p>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
