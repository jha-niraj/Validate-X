"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
	Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	ArrowLeft, Clock, MessageSquare, Star, ThumbsUp, ThumbsDown, MinusCircle,
	FileText, ExternalLink, Eye
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { motion } from "framer-motion"
import { getPostDetails } from "@/actions/post.actions"

interface PostDetails {
	id: string
	title: string
	description: string
	status: string
	category: {
		name: string
		icon?: string | null
	}
	author: {
		name: string
		image?: string | null
	}
	createdAt: string
	expiryDate: string
	totalBudget: number
	normalValidatorCount: number
	detailedValidatorCount: number
	currentNormalCount: number
	currentDetailedCount: number
	normalReward: number
	detailedReward: number
	fileUrl?: string
	fileName?: string
	linkUrl?: string
	validations: {
		normal: Array<{
			id: string
			vote: string
			comment?: string
			validator: {
				name: string
				image?: string | null
			}
			createdAt: string
		}>
		detailed: Array<{
			id: string
			feedback: string
			rating: number
			status: string
			validator: {
				name: string
				image?: string | null
			}
			createdAt: string
			isOriginal: boolean
		}>
	}
}

export default function PostDetailsPage(params: { params: Promise<{ slug: string }> }) {
	const { slug } = useParams()
	const router = useRouter()
	const [post, setPost] = useState<PostDetails | null>(null)
	const [loading, setLoading] = useState(true)

	const loadPostDetails = useCallback(async () => {
		try {
			setLoading(true)
			const result = await getPostDetails(slug as string)
			
			if (result.success && result.post) {
				setPost(result.post as PostDetails)
			} else {
				toast.error(result.error || "Failed to load post details")
				router.push('/dashboard')
			}
		} catch (error) {
			console.error("Error loading post details:", error)
			toast.error("Failed to load post details")
			router.push('/dashboard')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadPostDetails()
	}, [slug, loadPostDetails])

	if (loading) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading post details...</p>
				</div>
			</div>
		)
	}

	if (!post) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
				<Card className="p-8 text-center max-w-md">
					<CardContent>
						<h2 className="text-xl font-semibold mb-2">Post not found</h2>
						<p className="text-muted-foreground mb-4">The post you&apos;re looking for doesn&apos;t exist.</p>
						<Button onClick={() => router.back()}>Go Back</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	const normalProgress = (post.currentNormalCount / post.normalValidatorCount) * 100
	const detailedProgress = (post.currentDetailedCount / post.detailedValidatorCount) * 100
	const daysLeft = Math.ceil((new Date(post.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

	return (
		<div className="min-h-screen bg-white dark:bg-neutral-900">
			<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Button>
					<Badge variant={post.status === 'OPEN' ? 'default' : 'secondary'}>
						{post.status}
					</Badge>
					<Badge variant="outline" className="flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
					</Badge>
				</div>

				{/* Post Info */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
				>
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<span className="text-2xl">{post.category.icon}</span>
											<Badge variant="outline">{post.category.name}</Badge>
										</div>
										<CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
									</div>
								</div>
								<CardDescription className="text-base">
									{post.description}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-4">
									{post.fileUrl && (
										<Link href={post.fileUrl} target="_blank">
											<Button variant="outline" size="sm">
												<FileText className="h-4 w-4 mr-2" />
												{post.fileName}
											</Button>
										</Link>
									)}
									{post.linkUrl && (
										<Link href={post.linkUrl} target="_blank">
											<Button variant="outline" size="sm">
												<ExternalLink className="h-4 w-4 mr-2" />
												View Demo
											</Button>
										</Link>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Stats Sidebar */}
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Validation Progress</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<div className="flex justify-between text-sm mb-2">
										<span>Quick Validations</span>
										<span>{post.currentNormalCount}/{post.normalValidatorCount}</span>
									</div>
									<Progress value={normalProgress} className="mb-1" />
									<p className="text-xs text-muted-foreground">₹{post.normalReward} per validation</p>
								</div>
								<div>
									<div className="flex justify-between text-sm mb-2">
										<span>Detailed Reviews</span>
										<span>{post.currentDetailedCount}/{post.detailedValidatorCount}</span>
									</div>
									<Progress value={detailedProgress} className="mb-1" />
									<p className="text-xs text-muted-foreground">₹{post.detailedReward} per review</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Budget Overview</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span>Total Budget</span>
										<span className="font-medium">₹{post.totalBudget.toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-muted-foreground">
										<span>Spent</span>
										<span>₹{((post.currentNormalCount * post.normalReward) + (post.currentDetailedCount * post.detailedReward)).toLocaleString()}</span>
									</div>
									<div className="flex justify-between text-muted-foreground">
										<span>Remaining</span>
										<span>₹{(post.totalBudget - (post.currentNormalCount * post.normalReward) - (post.currentDetailedCount * post.detailedReward)).toLocaleString()}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</motion.div>

				{/* Validations */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Tabs defaultValue="normal" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="normal" className="flex items-center gap-2">
								<ThumbsUp className="h-4 w-4" />
								Quick Validations ({post.validations.normal.length})
							</TabsTrigger>
							<TabsTrigger value="detailed" className="flex items-center gap-2">
								<MessageSquare className="h-4 w-4" />
								Detailed Reviews ({post.validations.detailed.length})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="normal" className="mt-6">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{post.validations.normal.map((validation) => (
									<Card key={validation.id}>
										<CardContent className="p-4">
											<div className="flex items-center gap-3 mb-3">
												<div className={`p-2 rounded-full ${
													validation.vote === 'LIKE' ? 'bg-green-100 text-green-600' :
													validation.vote === 'DISLIKE' ? 'bg-red-100 text-red-600' :
													'bg-gray-100 text-gray-600'
												}`}>
													{validation.vote === 'LIKE' && <ThumbsUp className="h-4 w-4" />}
													{validation.vote === 'DISLIKE' && <ThumbsDown className="h-4 w-4" />}
													{validation.vote === 'NEUTRAL' && <MinusCircle className="h-4 w-4" />}
												</div>
												<div>
													<p className="font-medium text-sm">{validation.validator.name}</p>
													<p className="text-xs text-muted-foreground">
														{new Date(validation.createdAt).toLocaleDateString()}
													</p>
												</div>
											</div>
											{validation.comment && (
												<p className="text-sm text-muted-foreground">{validation.comment}</p>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>

						<TabsContent value="detailed" className="mt-6">
							<div className="space-y-4">
								{post.validations.detailed.map((validation) => (
									<Card key={validation.id}>
										<CardContent className="p-6">
											<div className="flex items-start justify-between mb-4">
												<div className="flex items-center gap-3">
													<div className="flex items-center gap-1">
														{[...Array(5)].map((_, i) => (
															<Star
																key={i}
																className={`h-4 w-4 ${
																	i < validation.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
																}`}
															/>
														))}
													</div>
													<span className="text-sm font-medium">{validation.validator.name}</span>
												</div>
												<div className="flex items-center gap-2">
													<Badge variant={
														validation.status === 'PENDING' ? 'secondary' :
														validation.status === 'APPROVED' ? 'default' : 'destructive'
													}>
														{validation.status}
													</Badge>
													{validation.status === 'PENDING' && (
														<Link href={`/post/${slug}/detailed-review/${validation.id}`}>
															<Button size="sm">
																<Eye className="h-4 w-4 mr-2" />
																Review
															</Button>
														</Link>
													)}
												</div>
											</div>
											<p className="text-sm text-muted-foreground leading-relaxed">
												{validation.feedback}
											</p>
											<p className="text-xs text-muted-foreground mt-3">
												Submitted on {new Date(validation.createdAt).toLocaleDateString()}
											</p>
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>
					</Tabs>
				</motion.div>
			</div>
		</div>
	)
}
