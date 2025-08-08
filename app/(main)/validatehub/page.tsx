'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
	ThumbsUp, ThumbsDown, MinusCircle, Clock, Filter,
	Eye, FileText, ExternalLink, Star, CheckCircle, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, PanInfo } from 'framer-motion'
import { getPostsForValidation, getCategories } from '@/actions/post.actions'
import { createNormalValidation } from '@/actions/validation.actions'
import Link from 'next/link'

interface Post {
	id: string
	title: string
	description: string
	fileUrl?: string | null
	fileName?: string | null
	linkUrl?: string | null
	normalReward: number
	detailedReward: number
	currentNormalCount: number
	currentDetailedCount: number
	normalValidatorCount: number
	detailedValidatorCount: number
	expiryDate: string
	category: {
		name: string
		icon?: string
	}
	author: {
		name: string
		image?: string
		reputationScore: number
	}
}

interface Category {
	id: string
	name: string
	icon?: string
}

export default function ValidateHubPage() {
	const { data: session } = useSession()
	const [posts, setPosts] = useState<Post[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [currentPostIndex, setCurrentPostIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [detailsOpen, setDetailsOpen] = useState(false)
	const [normalVoteDialogOpen, setNormalVoteDialogOpen] = useState(false)
	const [pendingVote, setPendingVote] = useState<'LIKE' | 'DISLIKE' | 'NEUTRAL' | null>(null)
	const [submitting, setSubmitting] = useState(false)

	// Validation form state
	const [validationForm, setValidationForm] = useState({
		shortComment: ''
	})

	useEffect(() => {
		loadCategories()
		loadPosts()
	}, [selectedCategories])

	const loadCategories = async () => {
		try {
			const result = await getCategories()
			if (result.success && result.categories) {
				setCategories(result.categories as Category[])
			}
		} catch (error) {
			console.error('Failed to load categories')
		}
	}

	const loadPosts = async () => {
		try {
			setLoading(true)
			const result = await getPostsForValidation(
				selectedCategories.length > 0 ? selectedCategories : undefined
			)
			if (result.success && result.posts) {
				const transformedPosts = result.posts.map((post: any) => ({
					...post,
					fileUrl: post.fileUrl || undefined,
					fileName: post.fileName || undefined,
					expiryDate: post.expiryDate instanceof Date ? post.expiryDate.toISOString() : post.expiryDate
				}))
				setPosts(transformedPosts)
				setCurrentPostIndex(0)
			}
		} catch (error) {
			toast.error('Failed to load posts')
		} finally {
			setLoading(false)
		}
	}

	const currentPost = posts[currentPostIndex]

	const handleSwipe = (direction: 'left' | 'right' | 'up', info: PanInfo) => {
		const threshold = 100
		const velocity = Math.abs(info.velocity.x) + Math.abs(info.velocity.y)

		if (velocity > threshold) {
			if (direction === 'right') {
				handleVote('LIKE')
			} else if (direction === 'left') {
				handleVote('DISLIKE')
			} else if (direction === 'up') {
				handleVote('NEUTRAL')
			}
		}
	}

	const handleVote = (vote: 'LIKE' | 'DISLIKE' | 'NEUTRAL') => {
		setPendingVote(vote)
		setNormalVoteDialogOpen(true)
	}

	const confirmNormalVote = async () => {
		if (!currentPost || !pendingVote) return

		setSubmitting(true)
		try {
			const result = await createNormalValidation({
				postId: currentPost.id,
				vote: pendingVote,
				shortComment: validationForm.shortComment || undefined
			})

			if (result.success) {
				toast.success(`Voted ${pendingVote.toLowerCase()}! ₹${result.creditedAmount?.toFixed(2) || 0} credited to your wallet`)
				setNormalVoteDialogOpen(false)
				nextPost()
				resetForm()
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			toast.error('Failed to submit vote')
		} finally {
			setSubmitting(false)
		}
	}

	const handleDetailedValidation = (postId: string) => {
		// Redirect to detailed validation page
		window.location.href = `/validatehub/${postId}`
	}

	const nextPost = () => {
		if (currentPostIndex < posts.length - 1) {
			setCurrentPostIndex(currentPostIndex + 1)
		} else {
			// Load more posts or show completion message
			toast.info('No more posts available. Great work!')
		}
	}

	const resetForm = () => {
		setValidationForm({
			shortComment: ''
		})
	}

	const formatCurrency = (amount: any) => {
		return `₹${Number(amount).toFixed(2)}`
	}

	const calculateTimeRemaining = (expiryDate: string) => {
		const now = new Date()
		const expiry = new Date(expiryDate)
		const diff = expiry.getTime() - now.getTime()

		if (diff <= 0) return 'Expired'

		const hours = Math.floor(diff / (1000 * 60 * 60))
		const days = Math.floor(hours / 24)

		if (days > 0) return `${days}d remaining`
		return `${hours}h remaining`
	}

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
						<p>Loading validation opportunities...</p>
					</div>
				</div>
			</div>
		)
	}

	if (!currentPost) {
		return (
			<div className="max-w-7xl mx-auto p-6">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<Eye className="h-8 w-8" />
							ValidateHub
						</h1>
						<p className="text-gray-600 mt-1">
							Swipe or click to validate ideas and earn rewards
						</p>
					</div>
				</div>

				<div className="flex gap-6">
					{/* Main Content Area - 2/3 width */}
					<div className="w-2/3">
						{/* Preview Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<Card className="h-[600px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
								<div className="text-center space-y-6 max-w-md">
									<motion.div
										animate={{
											scale: [1, 1.1, 1],
											rotate: [0, 5, -5, 0]
										}}
										transition={{
											duration: 4,
											repeat: Infinity,
											ease: "easeInOut"
										}}
									>
										<CheckCircle className="h-24 w-24 mx-auto text-green-500" />
									</motion.div>

									<div className="space-y-3">
										<h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">All Caught Up!</h2>
										<p className="text-lg text-gray-600 dark:text-gray-400">
											No validation opportunities available right now
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-500">
											Check back later or try adjusting your filters
										</p>
									</div>

									{/* Demo Actions */}
									<div className="flex justify-center gap-4">
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Button
												onClick={loadPosts}
												className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
											>
												<RefreshCw className="h-4 w-4 mr-2" />
												Refresh Posts
											</Button>
										</motion.div>
									</div>

									{/* Demo Validation Actions (Preview) */}
									<div className="pt-6 border-t border-gray-200 dark:border-gray-700">
										<p className="text-xs text-gray-500 mb-3">Preview: How validation works</p>
										<div className="flex justify-center gap-3 opacity-60">
											<motion.div
												whileHover={{ y: -2 }}
												className="flex flex-col items-center gap-1"
											>
												<Button size="sm" variant="outline" className="text-green-600 border-green-300">
													<ThumbsUp className="h-4 w-4" />
												</Button>
												<span className="text-xs">Approve</span>
											</motion.div>
											<motion.div
												whileHover={{ y: -2 }}
												className="flex flex-col items-center gap-1"
											>
												<Button size="sm" variant="outline" className="text-gray-600 border-gray-300">
													<MinusCircle className="h-4 w-4" />
												</Button>
												<span className="text-xs">Neutral</span>
											</motion.div>
											<motion.div
												whileHover={{ y: -2 }}
												className="flex flex-col items-center gap-1"
											>
												<Button size="sm" variant="outline" className="text-red-600 border-red-300">
													<ThumbsDown className="h-4 w-4" />
												</Button>
												<span className="text-xs">Reject</span>
											</motion.div>
										</div>
									</div>
								</div>
							</Card>
						</motion.div>
					</div>

					{/* Sidebar - 1/3 width */}
					<div className="w-1/3 space-y-6">
						{/* Filters Card */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Filter className="h-5 w-5" />
										Filters
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label className="text-sm font-medium">Category</Label>
										<Select value={selectedCategories.length > 0 ? selectedCategories.join(',') : 'all'} onValueChange={(value) => setSelectedCategories(value && value !== 'all' ? value.split(',') : [])}>
											<SelectTrigger>
												<SelectValue placeholder="All Categories" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Categories</SelectItem>
												{categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.icon} {category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label className="text-sm font-medium">Validation Type</Label>
										<Select defaultValue="all">
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Types</SelectItem>
												<SelectItem value="normal">Quick Validation</SelectItem>
												<SelectItem value="detailed">Detailed Review</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label className="text-sm font-medium">Reward Range</Label>
										<Select defaultValue="all">
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Rewards</SelectItem>
												<SelectItem value="low">₹10 - ₹50</SelectItem>
												<SelectItem value="medium">₹50 - ₹100</SelectItem>
												<SelectItem value="high">₹100+</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Stats Card */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Star className="h-5 w-5" />
										Your Stats
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Total Validations</span>
										<span className="font-medium">0</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Earnings Today</span>
										<span className="font-medium text-green-600">₹0</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Success Rate</span>
										<span className="font-medium">-</span>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Info Card */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
						>
							<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
								<CardHeader>
									<CardTitle className="text-blue-700 dark:text-blue-300">How it Works</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
									<div className="flex items-start gap-2">
										<CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
										<span>Review ideas and provide feedback</span>
									</div>
									<div className="flex items-start gap-2">
										<CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
										<span>Earn rewards for quality validations</span>
									</div>
									<div className="flex items-start gap-2">
										<CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
										<span>Build your reputation score</span>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-7xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Eye className="h-8 w-8" />
						ValidateHub
					</h1>
					<p className="text-gray-600 mt-1">
						Swipe or click to validate ideas and earn rewards
					</p>
				</div>
			</div>

			<div className="flex gap-6">
				{/* Main Content Area - 2/3 width */}
				<div className="w-2/3">
					<div className="mb-6">
						<div className="flex items-center justify-between text-sm text-gray-500 mb-2">
							<span>Post {currentPostIndex + 1} of {posts.length}</span>
							<span>{calculateTimeRemaining(currentPost.expiryDate)}</span>
						</div>
						<Progress value={(currentPostIndex / posts.length) * 100} className="h-2" />
					</div>
					<motion.div
						key={currentPost.id}
						className="relative"
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						onDragEnd={(_, info) => {
							if (info.offset.x > 100) {
								handleSwipe('right', info)
							} else if (info.offset.x < -100) {
								handleSwipe('left', info)
							} else if (info.offset.y < -100) {
								handleSwipe('up', info)
							}
						}}
						whileDrag={{ rotate: 0 }}
					>
						<Card className="w-full border-2 border-gray-200 hover:border-gray-300 transition-colors">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-xl mb-2">{currentPost.title}</CardTitle>
										<div className="flex items-center gap-2 mb-3">
											<Badge variant="secondary">{currentPost.category.name}</Badge>
											<Badge variant="outline" className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{calculateTimeRemaining(currentPost.expiryDate)}
											</Badge>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Avatar className="h-10 w-10">
											<AvatarImage src={currentPost.author.image} />
											<AvatarFallback>{currentPost.author.name[0]}</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium text-sm">{currentPost.author.name}</p>
											<p className="text-xs text-gray-500">Rep: {currentPost.author.reputationScore}</p>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-gray-700 leading-relaxed line-clamp-4">
										{currentPost.description}
									</p>
									{
										(currentPost.fileUrl || currentPost.linkUrl) && (
											<div className="flex gap-2">
												{
													currentPost.fileUrl && (
														<Badge variant="outline" className="flex items-center gap-1">
															<FileText className="h-3 w-3" />
															File attached
														</Badge>
													)
												}
												{
													currentPost.linkUrl && (
														<Link href={currentPost?.linkUrl} target="_blank">
															<Badge variant="outline" className="flex items-center gap-1">
																<ExternalLink className="h-3 w-3" />
																Link included
															</Badge>
														</Link>
													)
												}
											</div>
										)
									}
									<div className="grid grid-cols-2 gap-4 pt-4 border-t">
										<div className="text-center">
											<div className="text-lg font-bold text-green-600">
												{formatCurrency(currentPost.normalReward)}
											</div>
											<div className="text-sm text-gray-500">Quick Vote</div>
											<div className="text-xs text-gray-400">
												{currentPost.currentNormalCount}/{currentPost.normalValidatorCount}
											</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-bold text-blue-600">
												{formatCurrency(currentPost.detailedReward)}
											</div>
											<div className="text-sm text-gray-500">Detailed Review</div>
											<div className="text-xs text-gray-400">
												{currentPost.currentDetailedCount}/{currentPost.detailedValidatorCount}
											</div>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm">Quick Comment (Optional)</Label>
										<Textarea
											placeholder="Add a quick note..."
											value={validationForm.shortComment}
											onChange={(e) => setValidationForm(prev => ({ ...prev, shortComment: e.target.value }))}
											className="resize-none"
											rows={2}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
					<div className="flex items-center justify-center gap-4 mt-6">
						<Button
							variant="outline"
							size="lg"
							className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
							onClick={() => handleVote('DISLIKE')}
							disabled={submitting}
						>
							<ThumbsDown className="h-5 w-5" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="bg-gray-50 border-gray-200 hover:bg-gray-100"
							onClick={() => handleVote('NEUTRAL')}
							disabled={submitting}
						>
							<MinusCircle className="h-5 w-5" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
							onClick={() => handleVote('LIKE')}
							disabled={submitting}
						>
							<ThumbsUp className="h-5 w-5" />
						</Button>
						<Link href={`/validatehub/${currentPost.id}`}>
							<Button size="lg" className="bg-blue-600 hover:bg-blue-700">
								<Star className="h-5 w-5 mr-2" />
								Detailed Review
							</Button>
						</Link>
					</div>

					<div className="text-center mt-8 text-sm text-gray-500">
						<p>💡 Pro tip: Swipe right to like, left to dislike, or up for neutral</p>
					</div>
				</div>

				{/* Sidebar - 1/3 width */}
				<div className="w-1/3 space-y-6">
					{/* Filters Card */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Filter className="h-5 w-5" />
									Filters
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label className="text-sm font-medium">Category</Label>
									<Select value={selectedCategories.length > 0 ? selectedCategories.join(',') : 'all'} onValueChange={(value) => setSelectedCategories(value && value !== 'all' ? value.split(',') : [])}>
										<SelectTrigger>
											<SelectValue placeholder="All Categories" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Categories</SelectItem>
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.icon} {category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label className="text-sm font-medium">Validation Type</Label>
									<Select defaultValue="all">
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Types</SelectItem>
											<SelectItem value="normal">Quick Validation</SelectItem>
											<SelectItem value="detailed">Detailed Review</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label className="text-sm font-medium">Reward Range</Label>
									<Select defaultValue="all">
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Rewards</SelectItem>
											<SelectItem value="low">₹10 - ₹50</SelectItem>
											<SelectItem value="medium">₹50 - ₹100</SelectItem>
											<SelectItem value="high">₹100+</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Stats Card */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="h-5 w-5" />
									Your Stats
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Total Validations</span>
									<span className="font-medium">0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Earnings Today</span>
									<span className="font-medium text-green-600">₹0</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Success Rate</span>
									<span className="font-medium">-</span>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Info Card */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
					>
						<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
							<CardHeader>
								<CardTitle className="text-blue-700 dark:text-blue-300">How it Works</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
								<div className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span>Review ideas and provide feedback</span>
								</div>
								<div className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span>Earn rewards for quality validations</span>
								</div>
								<div className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
									<span>Build your reputation score</span>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>

			{/* Normal Vote Dialog */}
			<Dialog open={normalVoteDialogOpen} onOpenChange={setNormalVoteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Quick Validation - {pendingVote}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
							<div className="w-2 h-2 rounded-full bg-green-500"></div>
							<span className="text-sm text-green-700">
								You'll earn ₹{currentPost ? Number(currentPost.normalReward).toFixed(2) : '0'} immediately upon submission
							</span>
						</div>

						<div>
							<Label>Why did you choose "{pendingVote?.toLowerCase()}"? (Optional)</Label>
							<Textarea
								placeholder="Share your reasoning briefly..."
								value={validationForm.shortComment}
								onChange={(e) => setValidationForm(prev => ({ ...prev, shortComment: e.target.value }))}
								className="mt-2"
								rows={3}
							/>
						</div>

						<div className="flex gap-3">
							<Button
								onClick={confirmNormalVote}
								className="flex-1"
								disabled={submitting}
							>
								{submitting ? (
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<CheckCircle className="h-4 w-4 mr-2" />
								)}
								Submit & Earn ₹{currentPost ? Number(currentPost.normalReward).toFixed(2) : '0'}
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setNormalVoteDialogOpen(false)
									setPendingVote(null)
								}}
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}