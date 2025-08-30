"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
	Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	ArrowLeft, Check, X, Star, ChevronLeft, ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getDetailedValidations } from "@/actions/post.actions"
import { updateValidationStatus } from "@/actions/validation.actions"
import { ValidationStatus } from "@prisma/client"

interface DetailedReview {
	id: string
	feedback: string
	rating: number
	status: string
	validator: {
		name: string
		image?: string | null
		reputationScore: number
	}
	createdAt: string
	originalityScore?: number
	isOriginal: boolean
}

interface PostInfo {
	id: string
	title: string
	description: string
}

export default function DetailedReviewPage(params: { params: Promise<{ slug: string }> }) {
	const { slug } = useParams()
	const router = useRouter()
	const [reviews, setReviews] = useState<DetailedReview[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [processing, setProcessing] = useState(false)
	const [postInfo, setPostInfo] = useState<PostInfo | null>(null)
	const [rejectionReason, setRejectionReason] = useState("")
	const [showRejectDialog, setShowRejectDialog] = useState(false)

	const loadValidations = useCallback(async () => {
		try {
			setLoading(true)
			const result = await getDetailedValidations(slug as string)
			
			if (result.success && result.validations && result.postInfo) {
				setReviews(result.validations)
				setPostInfo(result.postInfo)
			} else {
				toast.error(result.error || "Failed to load validations")
				router.push('/dashboard')
			}
		} catch (error) {
			console.error("Error loading validations:", error)
			toast.error("Failed to load validations")
			router.push('/dashboard')
		} finally {
			setLoading(false)
		}
	}, []);

	useEffect(() => {
		loadValidations()
	}, [slug, loadValidations])

	const currentReview = reviews[currentIndex]

	const handleApprove = async () => {
		if (!currentReview) return
		
		setProcessing(true)
		try {
			const result = await updateValidationStatus(
				currentReview.id, 
				ValidationStatus.APPROVED,
				"Approved by post author"
			)
			
			if (result.success) {
				toast.success(`Review by ${currentReview.validator.name} approved! Validator will receive reward.`)
				moveToNext()
			} else {
				toast.error(result.error || "Failed to approve review")
			}
		} catch (error) {
			console.error("Error approving review:", error)
			toast.error("Failed to approve review")
		} finally {
			setProcessing(false)
		}
	}

	const handleReject = async () => {
		if (!currentReview || !rejectionReason.trim()) {
			toast.error("Please provide a reason for rejection")
			return
		}
		
		setProcessing(true)
		try {
			const result = await updateValidationStatus(
				currentReview.id, 
				ValidationStatus.REJECTED,
				rejectionReason
			)
			
			if (result.success) {
				toast.success(`Review by ${currentReview.validator.name} rejected`)
				setShowRejectDialog(false)
				setRejectionReason("")
				moveToNext()
			} else {
				toast.error(result.error || "Failed to reject review")
			}
		} catch (error) {
			console.error("Error rejecting review:", error)
			toast.error("Failed to reject review")
		} finally {
			setProcessing(false)
		}
	}

	const moveToNext = () => {
		if (currentIndex < reviews.length - 1) {
			setCurrentIndex(currentIndex + 1)
		} else {
			// All reviews processed
			toast.success("All reviews have been processed!")
			router.push(`/post/${slug}/details`)
		}
	}

	const moveToPrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1)
		}
	}

	const handleSwipe = (info: PanInfo) => {
		if (info.offset.x > 100) {
			// Swipe right - approve
			handleApprove()
		} else if (info.offset.x < -100) {
			// Swipe left - reject
			setShowRejectDialog(true)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading reviews...</p>
				</div>
			</div>
		)
	}

	if (!currentReview) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
				<Card className="p-8 text-center max-w-md">
					<CardContent>
						<h2 className="text-xl font-semibold mb-2">No reviews to process</h2>
						<p className="text-muted-foreground mb-4">All detailed reviews have been processed.</p>
						<Button onClick={() => router.push(`/validation/${slug}/details`)}>
							Back to Post Details
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Details
					</Button>
					<div className="flex items-center gap-2">
						<Badge variant="outline">
							{currentIndex + 1} of {reviews.length} reviews
						</Badge>
					</div>
				</div>

				{/* Post Info */}
				{postInfo && (
					<Card className="mb-6 bg-white/80 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="text-lg">{postInfo.title}</CardTitle>
							<CardDescription>{postInfo.description}</CardDescription>
						</CardHeader>
					</Card>
				)}

				{/* Review Card */}
				<div className="relative h-[600px] flex items-center justify-center">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentReview.id}
							initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
							animate={{ opacity: 1, scale: 1, rotateY: 0 }}
							exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
							transition={{ duration: 0.3 }}
							drag="x"
							dragConstraints={{ left: 0, right: 0 }}
							onDragEnd={(_, info) => handleSwipe(info)}
							className="w-full max-w-2xl cursor-grab active:cursor-grabbing"
						>
							<Card className="bg-white dark:bg-neutral-800 shadow-2xl border-0">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Avatar className="h-12 w-12">
												<AvatarImage src={currentReview.validator.image || undefined} />
												<AvatarFallback>
													{currentReview.validator.name.split(' ').map(n => n[0]).join('')}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="font-semibold">{currentReview.validator.name}</h3>
												<div className="flex items-center gap-1">
													<Star className="h-4 w-4 text-yellow-400 fill-current" />
													<span className="text-sm text-muted-foreground">
														{currentReview.validator.reputationScore}
													</span>
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="flex items-center gap-1 mb-1">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className={`h-4 w-4 ${
															i < currentReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
														}`}
													/>
												))}
											</div>
											<p className="text-xs text-muted-foreground">
												{new Date(currentReview.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
										<p className="text-sm leading-relaxed">{currentReview.feedback}</p>
									</div>
									
									{currentReview.originalityScore && (
										<div className="flex items-center justify-between text-sm">
											<span>Originality Score:</span>
											<Badge variant={currentReview.originalityScore > 0.8 ? 'default' : 'secondary'}>
												{(currentReview.originalityScore * 100).toFixed(0)}%
											</Badge>
										</div>
									)}
									
									<div className="flex items-center gap-2 text-sm">
										<span>Marked as Original:</span>
										{currentReview.isOriginal ? (
											<Badge variant="default" className="bg-green-100 text-green-800">
												✓ Yes
											</Badge>
										) : (
											<Badge variant="destructive">
												✗ No
											</Badge>
										)}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center justify-center gap-6 mt-8">
					<Button
						size="lg"
						variant="outline"
						onClick={moveToPrevious}
						disabled={currentIndex === 0}
						className="h-14 w-14 rounded-full border-2"
					>
						<ChevronLeft className="h-6 w-6" />
					</Button>
					
					<Button
						size="lg"
						variant="destructive"
						onClick={() => setShowRejectDialog(true)}
						disabled={processing}
						className="h-16 w-16 rounded-full"
					>
						<X className="h-8 w-8" />
					</Button>
					
					<Button
						size="lg"
						variant="default"
						onClick={handleApprove}
						disabled={processing}
						className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700"
					>
						{processing ? (
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
						) : (
							<Check className="h-8 w-8" />
						)}
					</Button>
					
					<Button
						size="lg"
						variant="outline"
						onClick={moveToNext}
						disabled={currentIndex === reviews.length - 1}
						className="h-14 w-14 rounded-full border-2"
					>
						<ChevronRight className="h-6 w-6" />
					</Button>
				</div>

				{/* Swipe Instructions */}
				<div className="text-center mt-6">
					<p className="text-sm text-muted-foreground">
						💡 Tip: Swipe right to approve, swipe left to reject, or use the buttons below
					</p>
				</div>

				{/* Reject Dialog */}
				{showRejectDialog && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md"
						>
							<h3 className="text-lg font-semibold mb-4">Reject Review</h3>
							<div className="space-y-4">
								<div>
									<Label htmlFor="reason">Reason for rejection</Label>
									<Textarea
										id="reason"
										placeholder="Please provide a reason for rejecting this review..."
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										className="mt-2"
									/>
								</div>
								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => {
											setShowRejectDialog(false)
											setRejectionReason("")
										}}
										disabled={processing}
									>
										Cancel
									</Button>
									<Button
										variant="destructive"
										onClick={handleReject}
										disabled={processing || !rejectionReason.trim()}
									>
										{processing ? "Rejecting..." : "Reject Review"}
									</Button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</div>
		</div>
	)
}
