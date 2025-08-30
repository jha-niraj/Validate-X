'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
	ThumbsUp, ThumbsDown, Clock, Eye, FileText, ExternalLink, 
	Star, CheckCircle, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, PanInfo } from 'framer-motion'
import { getPostsForValidation } from '@/actions/post.actions'
import Link from 'next/link'

interface Post {
	id: string
	title: string
	description: string
	fileUrl?: string | null
	fileName?: string | null
	linkUrl?: string | null
	normalReward?: number
	detailedReward?: number
	currentNormalCount?: number
	currentDetailedCount?: number
	normalValidatorCount?: number
	detailedValidatorCount?: number
	expiryDate: string
	category?: {
		name: string
		icon?: string | null
	}
	author?: {
		name: string
		image?: string | null
		reputationScore?: number
	}
}

export default function PostPage() {
	// const { data: session } = useSession()
	const [posts, setPosts] = useState<Post[]>([])
	const [currentPostIndex, setCurrentPostIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [selectedCategories] = useState<string[]>([])
	const [normalVoteDialogOpen, setNormalVoteDialogOpen] = useState(false)
	const [pendingVote, setPendingVote] = useState<'LIKE' | 'DISLIKE' | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const loadPosts = useCallback(async () => {
		try {
			setLoading(true)
			const result = await getPostsForValidation(
				selectedCategories.length > 0 ? selectedCategories : undefined
			)
			if (result.success && result.posts) {
				const transformedPosts = result.posts.map((post: {
					id: string;
					title: string;
					description: string;
					fileUrl?: string | null;
					fileName?: string | null;
					linkUrl?: string | null;
					normalReward?: number;
					detailedReward?: number;
					currentNormalCount?: number;
					currentDetailedCount?: number;
					normalValidatorCount?: number;
					detailedValidatorCount?: number;
					expiryDate: Date | string;
					category?: { name: string; icon?: string | null };
					author?: { name: string; image?: string | null; reputationScore?: number };
				}) => ({
					id: post.id,
					title: post.title,
					description: post.description,
					fileUrl: post.fileUrl || undefined,
					fileName: post.fileName || undefined,
					linkUrl: post.linkUrl || undefined,
					normalReward: post.normalReward || 0,
					detailedReward: post.detailedReward || 0,
					currentNormalCount: post.currentNormalCount || 0,
					currentDetailedCount: post.currentDetailedCount || 0,
					normalValidatorCount: post.normalValidatorCount || 1,
					detailedValidatorCount: post.detailedValidatorCount || 1,
					expiryDate: post.expiryDate instanceof Date ? post.expiryDate.toISOString() : post.expiryDate,
					category: post.category || { name: 'General', icon: '📄' },
					author: {
						name: post.author?.name || 'Anonymous',
						image: post.author?.image || undefined,
						reputationScore: post.author?.reputationScore || 0
					}
				}))
				setPosts(transformedPosts)
				setCurrentPostIndex(0)
			}
		} catch (error) {
			console.log("Error while loading posts:", error)
			toast.error('Failed to load posts')
		} finally {
			setLoading(false)
		}
	}, [selectedCategories]);

	useEffect(() => {
		loadPosts()
	}, [selectedCategories, loadPosts])

	const currentPost = posts[currentPostIndex]

	const handleSwipe = (direction: 'left' | 'right', info: PanInfo) => {
		const threshold = 100
		const velocity = Math.abs(info.velocity.x)

		if (velocity > threshold) {
			if (direction === 'right') {
				handleVote('LIKE')
			} else if (direction === 'left') {
				handleVote('DISLIKE')
			}
		}
	}

	const handleVote = (vote: 'LIKE' | 'DISLIKE') => {
		if (vote === 'DISLIKE') {
			// Skip post with animation
			skipPostWithAnimation()
		} else if (vote === 'LIKE') {
			// Show dialog for redirection to detailed validation
			setPendingVote(vote)
			setNormalVoteDialogOpen(true)
		}
	}

	const skipPostWithAnimation = () => {
		setSubmitting(true)
		setTimeout(() => {
			nextPost()
			setSubmitting(false)
		}, 300)
	}

	const confirmNormalVote = async () => {
		if (!currentPost || !pendingVote) return

		setSubmitting(true)
		setNormalVoteDialogOpen(false)
		
		// Redirect to post details page for validation
		window.location.href = `/post/${currentPost.id}`
	}

	const nextPost = () => {
		if (currentPostIndex < posts.length - 1) {
			setCurrentPostIndex(currentPostIndex + 1)
		} else {
			// Load more posts or show completion message
			toast.info('No more posts available. Great work!')
		}
	}

	const formatCurrency = (amount: number) => {
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
			<div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p>Loading validation opportunities...</p>
				</div>
			</div>
		)
	}

	if (!currentPost) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-900">
				<div className="max-w-4xl mx-auto p-6">
					<div className="flex items-center justify-center min-h-screen">
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
									Check back later for more posts to validate
								</p>
							</div>

							<Button
								onClick={loadPosts}
								className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
							>
								<RefreshCw className="h-4 w-4 mr-2" />
								Refresh Posts
							</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white dark:bg-neutral-900">
			<div className="max-w-4xl mx-auto p-6">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
						<div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
							<Eye className="h-6 w-6 text-white" />
						</div>
						Post Validation
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-lg">
						Swipe through ideas and earn rewards for your feedback
					</p>
				</div>

				{/* Progress */}
				<div className="mb-8">
					<div className="text-center mb-4">
						<div className="flex items-center justify-center gap-4 mb-3">
							<div className="text-sm font-medium text-gray-600 dark:text-gray-400">
								{currentPostIndex + 1} of {posts.length}
							</div>
							<div className="text-xs text-gray-500">
								{Math.round(((currentPostIndex + 1) / posts.length) * 100)}% complete
							</div>
						</div>
						<div className="w-full max-w-sm mx-auto">
							<Progress 
								value={((currentPostIndex + 1) / posts.length) * 100} 
								className="h-2 bg-gray-200 dark:bg-gray-700"
							/>
						</div>
					</div>
				</div>

				{/* Card Stack */}
				<div className="flex justify-center mb-8">
					<motion.div
						key={currentPost.id}
						className="relative w-full max-w-md"
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						onDragEnd={(_, info) => {
							if (info.offset.x > 100) {
								handleSwipe('right', info)
							} else if (info.offset.x < -100) {
								handleSwipe('left', info)
							}
						}}
						whileDrag={{ 
							scale: 1.05
						}}
						animate={{ 
							x: 0, 
							rotate: 0,
							scale: 1
						}}
						transition={{ 
							type: "spring", 
							stiffness: 300, 
							damping: 30 
						}}
					>
						<Card className="w-full h-[500px] border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
							<CardHeader className="pb-4">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-2xl font-bold mb-3 leading-tight">{currentPost.title}</CardTitle>
										<div className="flex items-center gap-3 mb-4">
											<Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
												{currentPost.category?.name || 'General'}
											</Badge>
											<Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
												<Clock className="h-4 w-4" />
												{calculateTimeRemaining(currentPost.expiryDate)}
											</Badge>
										</div>
									</div>
									<div className="flex items-center gap-3 ml-4">
										<Avatar className="h-12 w-12 border-2 border-white shadow-lg">
											<AvatarImage src={currentPost.author?.image || undefined} />
											<AvatarFallback className="font-bold">{currentPost.author?.name?.[0] || 'U'}</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-semibold text-sm">{currentPost.author?.name || 'Anonymous'}</p>
											<div className="flex items-center gap-1">
												<Star className="h-3 w-3 text-yellow-500 fill-current" />
												<p className="text-xs text-gray-500">{currentPost.author?.reputationScore || 0}</p>
											</div>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="prose prose-sm max-w-none">
										<p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
											{currentPost.description}
										</p>
									</div>
									
									{(currentPost.fileUrl || currentPost.linkUrl) && (
										<div className="flex gap-3">
											{currentPost.fileUrl && (
												<div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
													<FileText className="h-4 w-4 text-blue-600" />
													<span className="text-sm font-medium text-blue-700 dark:text-blue-300">Document attached</span>
												</div>
											)}
											{currentPost.linkUrl && (
												<Link href={currentPost.linkUrl} target="_blank">
													<div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
														<ExternalLink className="h-4 w-4 text-purple-600" />
														<span className="text-sm font-medium text-purple-700 dark:text-purple-300">Visit link</span>
													</div>
												</Link>
											)}
										</div>
									)}
								</div>

								<div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
									<div className="text-center">
										<div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
											{formatCurrency(currentPost.detailedReward || 0)}
										</div>
										<div className="text-sm font-medium text-gray-600 dark:text-gray-400">Validation Reward</div>
										<div className="text-xs text-gray-500 mt-1">
											{currentPost.currentDetailedCount || 0}/{currentPost.detailedValidatorCount || 1} validators
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center justify-center gap-8 mb-8">
					<motion.div
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
					>
						<Button
							variant="outline"
							size="lg"
							className="w-16 h-16 rounded-full bg-red-50 border-red-200 hover:bg-red-100 text-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
							onClick={() => handleVote('DISLIKE')}
							disabled={submitting}
						>
							<ThumbsDown className="h-6 w-6" />
						</Button>
					</motion.div>
					
					<motion.div
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
					>
						<Button
							variant="outline"
							size="lg"
							className="w-16 h-16 rounded-full bg-green-50 border-green-200 hover:bg-green-100 text-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
							onClick={() => handleVote('LIKE')}
							disabled={submitting}
						>
							<ThumbsUp className="h-6 w-6" />
						</Button>
					</motion.div>
				</div>

				<div className="text-center text-sm text-gray-500">
					<p>💡 Swipe right to like, left to skip</p>
				</div>
			</div>

			{/* Normal Vote Dialog */}
			<Dialog open={normalVoteDialogOpen} onOpenChange={setNormalVoteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ThumbsUp className="h-5 w-5 text-green-600" />
							Great Choice!
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
							<CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
							<div>
								<p className="font-medium text-green-800">Post Validation Required</p>
								<p className="text-sm text-green-700">
									You&apos;ll be redirected to provide detailed feedback and earn rewards
								</p>
							</div>
						</div>

						<div className="p-4 bg-gray-50 rounded-lg">
							<h4 className="font-medium text-gray-800 mb-2">What happens next:</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									Review the post in detail
								</li>
								<li className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									Provide comprehensive feedback
								</li>
								<li className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									Earn ₹{currentPost ? Number(currentPost.detailedReward || 0).toFixed(2) : '0'} upon completion
								</li>
							</ul>
						</div>

						<div className="flex gap-3">
							<Button
								onClick={confirmNormalVote}
								className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
								disabled={submitting}
							>
								{submitting ? (
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Eye className="h-4 w-4 mr-2" />
								)}
								Continue to Validation
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
