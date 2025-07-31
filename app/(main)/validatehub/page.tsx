'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
	ThumbsUp,
	ThumbsDown,
	MinusCircle,
	Clock,
	DollarSign,
	Filter,
	Eye,
	FileText,
	ExternalLink,
	Star,
	Heart,
	X,
	CheckCircle,
	AlertCircle,
	Upload,
	RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, PanInfo } from 'framer-motion'
import { getPostsForValidation, getCategories } from '@/actions/post.actions'
import { createValidation } from '@/actions/validation.actions'
import { ValidationType } from '@prisma/client'

interface Post {
	id: string
	title: string
	description: string
	fileUrl?: string | null
	fileName?: string | null
	linkUrl?: string | null
	normalReward: any
	detailedReward: any
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
	const [validationMode, setValidationMode] = useState<'normal' | 'detailed'>('normal')
	const [detailsOpen, setDetailsOpen] = useState(false)
	const [validationOpen, setValidationOpen] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	// Validation form state
	const [validationForm, setValidationForm] = useState({
		vote: '',
		shortComment: '',
		detailedFeedback: '',
		rating: 3,
		isOriginal: false,
		feedbackFile: null as File | null
	})

	useEffect(() => {
		loadCategories()
		loadPosts()
	}, [selectedCategories])

	const loadCategories = async () => {
		try {
			const result = await getCategories()
			if (result.success && result.categories) {
				setCategories(result.categories)
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

	const handleVote = async (vote: string) => {
		if (!currentPost) return

		setSubmitting(true)
		try {
			const result = await createValidation({
				postId: currentPost.id,
				type: ValidationType.NORMAL,
				vote,
				shortComment: validationForm.shortComment || undefined
			})

			if (result.success) {
				toast.success(`Voted ${vote.toLowerCase()}! ₹${Number(currentPost.normalReward).toFixed(2)} earned`)
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

	const handleDetailedValidation = async () => {
		if (!currentPost) return

		if (!validationForm.detailedFeedback.trim()) {
			toast.error('Please provide detailed feedback')
			return
		}

		setSubmitting(true)
		try {
			const result = await createValidation({
				postId: currentPost.id,
				type: ValidationType.DETAILED,
				detailedFeedback: validationForm.detailedFeedback,
				rating: validationForm.rating,
				shortComment: validationForm.shortComment || undefined,
				isOriginal: validationForm.isOriginal
			})

			if (result.success) {
				toast.success(`Detailed feedback submitted! ₹${Number(currentPost.detailedReward).toFixed(2)} pending approval`)
				setValidationOpen(false)
				nextPost()
				resetForm()
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			toast.error('Failed to submit detailed validation')
		} finally {
			setSubmitting(false)
		}
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
			vote: '',
			shortComment: '',
			detailedFeedback: '',
			rating: 3,
			isOriginal: false,
			feedbackFile: null
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
			<div className="container mx-auto p-6">
				<div className="text-center py-12">
					<CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
					<h2 className="text-2xl font-bold mb-2">All caught up!</h2>
					<p className="text-gray-600 mb-4">No more posts available for validation right now.</p>
					<Button onClick={loadPosts}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
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

				<div className="flex items-center gap-3">
					<Select value={selectedCategories.join(',')} onValueChange={(value) => setSelectedCategories(value ? value.split(',') : [])}>
						<SelectTrigger className="w-48">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="Filter by category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">All Categories</SelectItem>
							{categories.map(category => (
								<SelectItem key={category.id} value={category.id}>
									{category.icon} {category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm">
								<FileText className="h-4 w-4 mr-2" />
								View Details
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>{currentPost.title}</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Badge variant="secondary">{currentPost.category.name}</Badge>
									<span className="text-sm text-gray-500">
										{calculateTimeRemaining(currentPost.expiryDate)}
									</span>
								</div>

								<div className="prose max-w-none">
									<p>{currentPost.description}</p>
								</div>

								{currentPost.fileUrl && (
									<div className="border rounded-lg p-4">
										<p className="text-sm font-medium mb-2">Attached File:</p>
										<a
											href={currentPost.fileUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-blue-600 hover:underline"
										>
											<ExternalLink className="h-4 w-4" />
											{currentPost.fileName || 'View File'}
										</a>
									</div>
								)}

								{currentPost.linkUrl && (
									<div className="border rounded-lg p-4">
										<p className="text-sm font-medium mb-2">Reference Link:</p>
										<a
											href={currentPost.linkUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-blue-600 hover:underline"
										>
											<ExternalLink className="h-4 w-4" />
											{currentPost.linkUrl}
										</a>
									</div>
								)}

								<div className="flex items-center gap-4 pt-4 border-t">
									<div className="flex items-center gap-2">
										<Avatar className="h-8 w-8">
											<AvatarImage src={currentPost.author.image} />
											<AvatarFallback>{currentPost.author.name[0]}</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium text-sm">{currentPost.author.name}</p>
											<p className="text-xs text-gray-500">
												Reputation: {currentPost.author.reputationScore}
											</p>
										</div>
									</div>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Progress */}
			<div className="mb-6">
				<div className="flex items-center justify-between text-sm text-gray-500 mb-2">
					<span>Post {currentPostIndex + 1} of {posts.length}</span>
					<span>{calculateTimeRemaining(currentPost.expiryDate)}</span>
				</div>
				<Progress value={(currentPostIndex / posts.length) * 100} className="h-2" />
			</div>

			{/* Main Card */}
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
				<Card className="w-full max-w-2xl mx-auto border-2 border-gray-200 hover:border-gray-300 transition-colors">
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

							{(currentPost.fileUrl || currentPost.linkUrl) && (
								<div className="flex gap-2">
									{currentPost.fileUrl && (
										<Badge variant="outline" className="flex items-center gap-1">
											<FileText className="h-3 w-3" />
											File attached
										</Badge>
									)}
									{currentPost.linkUrl && (
										<Badge variant="outline" className="flex items-center gap-1">
											<ExternalLink className="h-3 w-3" />
											Link included
										</Badge>
									)}
								</div>
							)}

							{/* Rewards */}
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

							{/* Quick Comment */}
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

			{/* Action Buttons */}
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

				<Dialog open={validationOpen} onOpenChange={setValidationOpen}>
					<DialogTrigger asChild>
						<Button size="lg" className="bg-blue-600 hover:bg-blue-700">
							<Star className="h-5 w-5 mr-2" />
							Detailed Review
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Detailed Validation</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label>Rating (1-5)</Label>
								<div className="flex gap-2 mt-2">
									{[1, 2, 3, 4, 5].map(rating => (
										<Button
											key={rating}
											variant={validationForm.rating >= rating ? "default" : "outline"}
											size="sm"
											onClick={() => setValidationForm(prev => ({ ...prev, rating }))}
										>
											<Star className="h-4 w-4" />
										</Button>
									))}
								</div>
							</div>

							<div>
								<Label>Detailed Feedback *</Label>
								<Textarea
									placeholder="Provide detailed feedback, suggestions, or analysis..."
									value={validationForm.detailedFeedback}
									onChange={(e) => setValidationForm(prev => ({ ...prev, detailedFeedback: e.target.value }))}
									className="mt-2"
									rows={4}
								/>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="original"
									checked={validationForm.isOriginal}
									onChange={(e) => setValidationForm(prev => ({ ...prev, isOriginal: e.target.checked }))}
								/>
								<Label htmlFor="original" className="text-sm">
									I certify this is my original feedback (20% bonus for human-verified content)
								</Label>
							</div>

							<div className="flex gap-3">
								<Button
									onClick={handleDetailedValidation}
									className="flex-1"
									disabled={submitting}
								>
									{submitting ? (
										<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<CheckCircle className="h-4 w-4 mr-2" />
									)}
									Submit Review
								</Button>
								<Button
									variant="outline"
									onClick={() => setValidationOpen(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Swipe Instructions */}
			<div className="text-center mt-8 text-sm text-gray-500">
				<p>💡 Pro tip: Swipe right to like, left to dislike, or up for neutral</p>
			</div>
		</div>
	)
}
