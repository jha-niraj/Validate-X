"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
	ArrowLeft, Star, FileText, ExternalLink, Calendar, 
	DollarSign, Users, CheckCircle, Clock, Upload
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { motion } from "framer-motion"
import { getPostForDetailedValidation, createDetailedValidation } from "@/actions/validation.actions"

interface PostData {
	id: string
	title: string
	description: string
	categoryId: string
	fileUrl?: string | null
	fileName?: string | null
	linkUrl?: string | null
	detailedReward: number
	enableDetailedFeedback: boolean
	detailedFeedbackStructure?: string
	detailedValidatorCount: number
	currentDetailedCount: number
	createdAt: Date
	author: {
		id: string
		name: string
		email: string
		image?: string | null
		reputationScore?: number
	}
	category: {
		name: string
		icon?: string | null
	}
	detailedValidationCount: number
	maxDetailedValidations: number
	feedbackStructure: {
		categories?: Array<{
			name: string
			description: string
			required: boolean
		}>
		questions?: Array<{
			question: string
			type: 'text' | 'rating' | 'select'
			options?: string[]
			required: boolean
		}>
	}
}

export default function DetailedValidationPage() {
	const params = useParams()
	const router = useRouter()
	const { data: session } = useSession()
	const [post, setPost] = useState<PostData | null>(null)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)

	// Form state
	const [feedback, setFeedback] = useState("")
	const [rating, setRating] = useState(3)
	const [isOriginal, setIsOriginal] = useState(false)
	const [categoryResponses, setCategoryResponses] = useState<Record<string, string>>({})
	const [questionResponses, setQuestionResponses] = useState<Record<string, any>>({})
	const [feedbackFile, setFeedbackFile] = useState<File | null>(null)

	useEffect(() => {
		loadPost()
	}, [params.slug])

	const loadPost = async () => {
		try {
			setLoading(true)
			// Use the slug as postId for now, in a real app you'd convert slug to ID
			const result = await getPostForDetailedValidation(params.slug as string)
			
			if (result.success && result.post) {
				setPost(result.post as PostData)
				// Initialize responses for structured feedback
				if (result.post.feedbackStructure) {
					const categories = result.post.feedbackStructure.categories || []
					const questions = result.post.feedbackStructure.questions || []
					
					const catResponses: Record<string, string> = {}
					categories.forEach((cat: any) => {
						catResponses[cat.name] = ""
					})
					setCategoryResponses(catResponses)

					const qResponses: Record<string, any> = {}
					questions.forEach((q: any, index: number) => {
						qResponses[`q_${index}`] = q.type === 'rating' ? 3 : ""
					})
					setQuestionResponses(qResponses)
				}
			} else {
				toast.error(result.error || "Failed to load post")
				router.push('/validatehub')
			}
		} catch (error) {
			toast.error("Failed to load post")
			router.push('/validatehub')
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async () => {
		if (!post) {
			toast.error("Post data not available")
			return
		}

		if (!feedback.trim()) {
			toast.error("Please provide detailed feedback")
			return
		}

		// Validate required structured responses
		if (post.feedbackStructure) {
			const requiredCategories = post.feedbackStructure.categories?.filter(c => c.required) || []
			for (const category of requiredCategories) {
				if (!categoryResponses[category.name]?.trim()) {
					toast.error(`Please provide feedback for: ${category.name}`)
					return
				}
			}

			const requiredQuestions = post.feedbackStructure.questions?.filter(q => q.required) || []
			for (let i = 0; i < requiredQuestions.length; i++) {
				const response = questionResponses[`q_${i}`]
				if (!response || (typeof response === 'string' && !response.trim())) {
					toast.error(`Please answer: ${requiredQuestions[i].question}`)
					return
				}
			}
		}

		setSubmitting(true)
		try {
			// Prepare responses array for the server action
			const responses: Array<{
				questionId: string
				questionText: string
				response: string
				rating?: number
			}> = []
			
			// Add category responses
			if (post.feedbackStructure?.categories) {
				post.feedbackStructure.categories.forEach((category: any, index: number) => {
					responses.push({
						questionId: `category_${index}`,
						questionText: category.name,
						response: categoryResponses[category.name] || ""
					})
				})
			}
			
			// Add question responses
			if (post.feedbackStructure?.questions) {
				post.feedbackStructure.questions.forEach((question: any, index: number) => {
					responses.push({
						questionId: `question_${index}`,
						questionText: question.question,
						response: questionResponses[`q_${index}`] || "",
						rating: question.type === 'rating' ? (questionResponses[`q_${index}`] || 3) : undefined
					})
				})
			}

			const result = await createDetailedValidation({
				postId: post.id,
				responses,
				overallRating: rating,
				overallComment: feedback,
				fileAttachments: feedbackFile ? [{ 
					url: '', // Will be uploaded separately
					filename: feedbackFile.name,
					type: feedbackFile.type 
				}] : undefined
			})

			if (result.success) {
				toast.success(`Detailed validation submitted! You'll receive ₹${post.detailedReward} after approval.`)
				router.push('/validatehub')
			} else {
				toast.error(result.error || "Failed to submit validation")
			}
		} catch (error) {
			toast.error("Failed to submit validation")
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading post details...</p>
				</div>
			</div>
		)
	}

	if (!post) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
				<Card className="p-8 text-center max-w-md">
					<CardContent>
						<h2 className="text-xl font-semibold mb-2">Post not found</h2>
						<p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or isn't available for detailed validation.</p>
						<Button onClick={() => router.push('/validatehub')}>
							Back to ValidateHub
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div className="flex items-center gap-2">
						<Badge variant="outline">Detailed Validation</Badge>
						<Badge variant="secondary">₹{post.detailedReward} Reward</Badge>
					</div>
				</div>

				{/* Post Information */}
				<Card className="mb-6 bg-white/80 backdrop-blur-sm">
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-2xl">{post.category.icon}</span>
									<Badge variant="outline">{post.category.name}</Badge>
								</div>
								<CardTitle className="text-xl mb-2">{post.title}</CardTitle>
								<CardDescription className="text-base">
									{post.description}
								</CardDescription>
							</div>
						</div>
						
						<div className="flex items-center gap-4 mt-4 pt-4 border-t">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10">
									<AvatarImage src={post.author.image!} />
									<AvatarFallback>
										{post.author.name.split(' ').map(n => n[0]).join('')}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium">{post.author.name}</p>
									<div className="flex items-center gap-1">
										<Star className="h-3 w-3 text-yellow-400 fill-current" />
										<span className="text-sm text-muted-foreground">{post.author.reputationScore || 0}</span>
									</div>
								</div>
							</div>
							
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									<span>Posted {new Date(post.createdAt).toLocaleDateString()}</span>
								</div>
								<div className="flex items-center gap-1">
									<DollarSign className="h-4 w-4" />
									<span>₹{post.detailedReward} reward</span>
								</div>
							</div>
						</div>

						{/* File and Link attachments */}
						{(post.fileUrl || post.linkUrl) && (
							<div className="flex gap-2 mt-4">
								{post.fileUrl && (
									<Button variant="outline" size="sm" asChild>
										<Link href={post.fileUrl} target="_blank">
											<FileText className="h-4 w-4 mr-2" />
											{post.fileName || 'View File'}
										</Link>
									</Button>
								)}
								{post.linkUrl && (
									<Button variant="outline" size="sm" asChild>
										<Link href={post.linkUrl} target="_blank">
											<ExternalLink className="h-4 w-4 mr-2" />
											View Link
										</Link>
									</Button>
								)}
							</div>
						)}
					</CardHeader>
				</Card>

				{/* Validation Form */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<Card className="bg-white/80 backdrop-blur-sm">
						<CardHeader>
							<CardTitle>Provide Detailed Validation</CardTitle>
							<CardDescription>
								Give comprehensive feedback to help improve this idea. Your detailed analysis will be reviewed by the submitter.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Structured Feedback Categories */}
							{post.feedbackStructure?.categories && (
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Feedback Categories</h3>
									{post.feedbackStructure.categories.map((category: any, index: number) => (
										<div key={index} className="space-y-2">
											<Label className="flex items-center gap-2">
												{category.name}
												{category.required && <span className="text-red-500">*</span>}
											</Label>
											<p className="text-sm text-muted-foreground">{category.description}</p>
											<Textarea
												placeholder={`Provide feedback for ${category.name}...`}
												value={categoryResponses[category.name] || ""}
												onChange={(e) => setCategoryResponses(prev => ({
													...prev,
													[category.name]: e.target.value
												}))}
												className="min-h-[80px]"
											/>
										</div>
									))}
								</div>
							)}

							{/* Structured Questions */}
							{post.feedbackStructure?.questions && (
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Specific Questions</h3>
									{post.feedbackStructure.questions.map((question: any, index: number) => (
										<div key={index} className="space-y-2">
											<Label className="flex items-center gap-2">
												{question.question}
												{question.required && <span className="text-red-500">*</span>}
											</Label>
											
											{question.type === 'text' && (
												<Textarea
													placeholder="Your answer..."
													value={questionResponses[`q_${index}`] || ""}
													onChange={(e) => setQuestionResponses(prev => ({
														...prev,
														[`q_${index}`]: e.target.value
													}))}
												/>
											)}
											
											{question.type === 'rating' && (
												<div className="flex items-center gap-2">
													<Select
														value={questionResponses[`q_${index}`]?.toString() || "3"}
														onValueChange={(value) => setQuestionResponses(prev => ({
															...prev,
															[`q_${index}`]: parseInt(value)
														}))}
													>
														<SelectTrigger className="w-32">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="1">1 - Poor</SelectItem>
															<SelectItem value="2">2 - Fair</SelectItem>
															<SelectItem value="3">3 - Good</SelectItem>
															<SelectItem value="4">4 - Very Good</SelectItem>
															<SelectItem value="5">5 - Excellent</SelectItem>
														</SelectContent>
													</Select>
													<div className="flex">
														{[1, 2, 3, 4, 5].map((star) => (
															<Star
																key={star}
																className={`h-4 w-4 ${
																	star <= (questionResponses[`q_${index}`] || 3)
																		? 'text-yellow-400 fill-current'
																		: 'text-gray-300'
																}`}
															/>
														))}
													</div>
												</div>
											)}
											
											{question.type === 'select' && question.options && (
												<Select
													value={questionResponses[`q_${index}`] || ""}
													onValueChange={(value) => setQuestionResponses(prev => ({
														...prev,
														[`q_${index}`]: value
													}))}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select an option..." />
													</SelectTrigger>
													<SelectContent>
														{question.options && question.options.map((option: string, optIndex: number) => (
															<SelectItem key={optIndex} value={option}>
																{option}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
										</div>
									))}
								</div>
							)}

							{/* Main Feedback */}
							<div className="space-y-2">
								<Label>Overall Detailed Feedback *</Label>
								<Textarea
									placeholder="Provide comprehensive feedback about this idea. Include your thoughts on viability, market potential, implementation challenges, strengths, and areas for improvement..."
									value={feedback}
									onChange={(e) => setFeedback(e.target.value)}
									className="min-h-[120px]"
								/>
								<p className="text-sm text-muted-foreground">
									Minimum 100 characters. Be specific and constructive.
								</p>
							</div>

							{/* Overall Rating */}
							<div className="space-y-2">
								<Label>Overall Rating *</Label>
								<div className="flex items-center gap-4">
									<Select
										value={rating.toString()}
										onValueChange={(value) => setRating(parseInt(value))}
									>
										<SelectTrigger className="w-48">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">1 - Poor Idea</SelectItem>
											<SelectItem value="2">2 - Needs Major Work</SelectItem>
											<SelectItem value="3">3 - Good Potential</SelectItem>
											<SelectItem value="4">4 - Very Promising</SelectItem>
											<SelectItem value="5">5 - Excellent Idea</SelectItem>
										</SelectContent>
									</Select>
									<div className="flex">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className={`h-5 w-5 ${
													star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
												}`}
											/>
										))}
									</div>
								</div>
							</div>

							{/* Originality Check */}
							<div className="flex items-center space-x-2">
								<Checkbox
									id="originality"
									checked={isOriginal}
									onCheckedChange={(checked) => setIsOriginal(checked === true)}
								/>
								<Label htmlFor="originality" className="text-sm">
									I certify that this is original, non-plagiarized feedback based on my own analysis
								</Label>
							</div>

							{/* File Upload */}
							<div className="space-y-2">
								<Label>Supporting Documents (Optional)</Label>
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
									<Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
									<p className="text-sm text-gray-600 mb-2">
										Upload additional analysis, mockups, or research documents
									</p>
									<input
										type="file"
										accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
										onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
										className="hidden"
										id="feedback-file"
									/>
									<Label htmlFor="feedback-file" className="cursor-pointer">
										<Button variant="outline" size="sm" type="button">
											Choose File
										</Button>
									</Label>
									{feedbackFile && (
										<p className="text-sm text-green-600 mt-2">
											Selected: {feedbackFile.name}
										</p>
									)}
								</div>
							</div>

							{/* Submit Button */}
							<div className="flex gap-3 pt-4">
								<Button
									variant="outline"
									onClick={() => router.back()}
									disabled={submitting}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									onClick={handleSubmit}
									disabled={submitting || !feedback.trim() || feedback.length < 100}
									className="flex-1"
								>
									{submitting ? "Submitting..." : "Submit Detailed Validation"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	)
}
