"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
	Clock, ThumbsUp, ThumbsDown, MinusCircle, Star, FileText,
	MessageSquare, Download, ZoomIn, ZoomOut, RotateCw,
	ChevronLeft, ChevronRight, Search, Bookmark, Highlighter,
	Users, Calendar, DollarSign
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface DocumentValidationProps {
	post: {
		id: string
		title: string
		description: string
		status: string
		type: string
		documentSubtype?: string
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
		fileType?: string
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
			}>
		}
	}
	onUpdate: () => void
}

function DocumentValidationComponent({ post, onUpdate }: DocumentValidationProps) {
	const [validationMode, setValidationMode] = useState<'normal' | 'detailed'>('normal')
	const [normalVote, setNormalVote] = useState<string>('')
	const [normalComment, setNormalComment] = useState('')
	const [detailedRating, setDetailedRating] = useState(0)
	const [detailedFeedback, setDetailedFeedback] = useState('')
	const [sectionRatings, setSectionRatings] = useState<{[key: string]: number}>({})
	const [inlineComments, setInlineComments] = useState<Array<{
		page: number
		x: number
		y: number
		comment: string
		id: string
	}>>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [zoomLevel, setZoomLevel] = useState(1)
	const [searchTerm, setSearchTerm] = useState('')
	const [showFullscreen, setShowFullscreen] = useState(false)

	const daysLeft = Math.ceil((new Date(post.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
	const normalProgress = (post.currentNormalCount / post.normalValidatorCount) * 100
	const detailedProgress = (post.currentDetailedCount / post.detailedValidatorCount) * 100

	const isPDF = post.fileType === 'application/pdf'
	const totalPages = 10 // This would come from PDF parsing

	const documentSections = [
		'Executive Summary',
		'Introduction',
		'Methodology',
		'Results/Findings',
		'Conclusion',
		'Overall Structure',
		'Clarity & Writing',
		'Visual Elements'
	]

	const handleNormalValidation = async () => {
		if (!normalVote) {
			toast.error("Please select your validation")
			return
		}

		setIsSubmitting(true)
		try {
			// Call validation API
			toast.success("Validation submitted successfully!")
			onUpdate()
		} catch (error) {
			toast.error("Failed to submit validation")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDetailedValidation = async () => {
		if (!detailedRating || !detailedFeedback.trim()) {
			toast.error("Please provide rating and feedback")
			return
		}

		setIsSubmitting(true)
		try {
			// Call detailed validation API
			toast.success("Detailed review submitted successfully!")
			onUpdate()
		} catch (error) {
			toast.error("Failed to submit detailed review")
		} finally {
			setIsSubmitting(false)
		}
	}

	const addInlineComment = (event: React.MouseEvent<HTMLDivElement>) => {
		if (validationMode !== 'detailed') return
		
		const rect = event.currentTarget.getBoundingClientRect()
		const x = ((event.clientX - rect.left) / rect.width) * 100
		const y = ((event.clientY - rect.top) / rect.height) * 100
		
		const comment = prompt("Add inline comment:")
		if (comment) {
			setInlineComments([...inlineComments, {
				page: currentPage,
				x,
				y,
				comment,
				id: Date.now().toString()
			}])
		}
	}

	const updateSectionRating = (section: string, rating: number) => {
		setSectionRatings(prev => ({
			...prev,
			[section]: rating
		}))
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="grid grid-cols-1 lg:grid-cols-4 gap-6"
			>
				{/* Main Content */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-2xl">{post.category.icon}</span>
										<Badge variant="outline">{post.category.name}</Badge>
										<Badge variant="secondary">{post.documentSubtype}</Badge>
										<Badge variant={post.status === 'OPEN' ? 'default' : 'secondary'}>
											{post.status}
										</Badge>
									</div>
									<CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
									<CardDescription className="text-base">
										{post.description}
									</CardDescription>
								</div>
							</div>
						</CardHeader>
					</Card>
				</div>

				{/* Stats Sidebar */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm flex items-center gap-2">
								<Clock className="h-4 w-4" />
								{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
							</CardTitle>
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
				</div>
			</motion.div>

			{/* Document Viewer & Validation Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="grid grid-cols-1 lg:grid-cols-3 gap-6"
			>
				{/* Document Viewer */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Document Viewer
								</CardTitle>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" asChild>
										<a href={post.fileUrl} download={post.fileName}>
											<Download className="h-4 w-4" />
										</a>
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
									>
										<ZoomIn className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
									>
										<ZoomOut className="h-4 w-4" />
									</Button>
									<Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
										<DialogTrigger asChild>
											<Button variant="outline" size="sm">
												Fullscreen
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-6xl h-[90vh]">
											<DialogHeader>
												<DialogTitle>Document - {post.fileName}</DialogTitle>
											</DialogHeader>
											<div className="flex-1 overflow-hidden">
												{/* Fullscreen document viewer would go here */}
												<div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
													<p className="text-muted-foreground">Document content in fullscreen mode</p>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</div>
							
							{/* Document Navigation */}
							{isPDF && (
								<div className="flex items-center justify-between pt-4 border-t">
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
											disabled={currentPage === 1}
										>
											<ChevronLeft className="h-4 w-4" />
										</Button>
										<span className="text-sm">
											Page {currentPage} of {totalPages}
										</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
											disabled={currentPage === totalPages}
										>
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
									
									<div className="flex items-center gap-2">
										<div className="relative">
											<Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
											<input
												type="text"
												placeholder="Search document..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="pl-10 pr-4 py-2 text-sm border rounded-md"
											/>
										</div>
									</div>
								</div>
							)}
						</CardHeader>
						<CardContent>
							{post.fileUrl ? (
								<div className="space-y-4">
									{/* Document Display */}
									<div 
										className="relative bg-white dark:bg-gray-900 border rounded-lg overflow-hidden cursor-crosshair min-h-96"
										style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
										onClick={addInlineComment}
									>
										{isPDF ? (
											// PDF viewer would be embedded here
											<div className="w-full h-96 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
												<div className="text-center">
													<FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
													<p className="text-muted-foreground">PDF Page {currentPage}</p>
													<p className="text-sm text-muted-foreground mt-2">{post.fileName}</p>
												</div>
											</div>
										) : (
											// For other document types
											<div className="w-full h-96 bg-gray-50 dark:bg-gray-800 p-6 overflow-y-auto">
												<div className="max-w-none prose dark:prose-invert">
													<h1>Document Content Preview</h1>
													<p>This would show the actual document content. For demonstration, this represents where the parsed document content would appear.</p>
													<p>Users can scroll through the content, search for specific terms, and add inline comments for detailed reviews.</p>
												</div>
											</div>
										)}
										
										{/* Inline Comments */}
										{inlineComments
											.filter(comment => comment.page === currentPage)
											.map((comment) => (
												<div
													key={comment.id}
													className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-xs font-bold"
													style={{
														left: `${comment.x}%`,
														top: `${comment.y}%`,
														transform: 'translate(-50%, -50%)'
													}}
													title={comment.comment}
												>
													💬
												</div>
											))}
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
									<p>No document available</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Validation Panel */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Validate This Document</CardTitle>
							<CardDescription>
								Choose your validation method
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs value={validationMode} onValueChange={(value) => setValidationMode(value as 'normal' | 'detailed')}>
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="normal" className="text-xs">
										Quick (₹{post.normalReward})
									</TabsTrigger>
									<TabsTrigger value="detailed" className="text-xs">
										Detailed (₹{post.detailedReward})
									</TabsTrigger>
								</TabsList>

								<TabsContent value="normal" className="space-y-4 mt-4">
									<div className="space-y-3">
										<label className="text-sm font-medium">Your validation:</label>
										<div className="grid grid-cols-3 gap-2">
											<Button
												variant={normalVote === 'LIKE' ? 'default' : 'outline'}
												size="sm"
												onClick={() => setNormalVote('LIKE')}
												className="flex items-center gap-1"
											>
												<ThumbsUp className="h-4 w-4" />
												Good
											</Button>
											<Button
												variant={normalVote === 'NEUTRAL' ? 'default' : 'outline'}
												size="sm"
												onClick={() => setNormalVote('NEUTRAL')}
												className="flex items-center gap-1"
											>
												<MinusCircle className="h-4 w-4" />
												Okay
											</Button>
											<Button
												variant={normalVote === 'DISLIKE' ? 'default' : 'outline'}
												size="sm"
												onClick={() => setNormalVote('DISLIKE')}
												className="flex items-center gap-1"
											>
												<ThumbsDown className="h-4 w-4" />
												Poor
											</Button>
										</div>
									</div>
									
									<div className="space-y-2">
										<label className="text-sm font-medium">Comment (optional):</label>
										<Textarea
											placeholder="Share your thoughts on the document quality..."
											value={normalComment}
											onChange={(e) => setNormalComment(e.target.value)}
											rows={3}
										/>
									</div>

									<Button
										onClick={handleNormalValidation}
										disabled={!normalVote || isSubmitting}
										className="w-full"
									>
										{isSubmitting ? "Submitting..." : "Submit Validation"}
									</Button>
								</TabsContent>

								<TabsContent value="detailed" className="space-y-4 mt-4">
									<div className="space-y-3">
										<label className="text-sm font-medium">Overall Rating:</label>
										<div className="flex gap-1">
											{[1, 2, 3, 4, 5].map((star) => (
												<button
													key={star}
													onClick={() => setDetailedRating(star)}
													className="text-2xl"
												>
													<Star
														className={`h-6 w-6 ${
															star <= detailedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
														}`}
													/>
												</button>
											))}
										</div>
									</div>

									{/* Section Ratings */}
									<div className="space-y-3">
										<label className="text-sm font-medium">Section Ratings:</label>
										<div className="space-y-2 max-h-40 overflow-y-auto">
											{documentSections.map((section) => (
												<div key={section} className="flex items-center justify-between text-sm">
													<span className="text-xs">{section}</span>
													<div className="flex gap-1">
														{[1, 2, 3, 4, 5].map((star) => (
															<button
																key={star}
																onClick={() => updateSectionRating(section, star)}
																className="text-sm"
															>
																<Star
																	className={`h-3 w-3 ${
																		star <= (sectionRatings[section] || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
																	}`}
																/>
															</button>
														))}
													</div>
												</div>
											))}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Detailed Feedback:</label>
										<Textarea
											placeholder="Provide comprehensive feedback on content quality, structure, clarity, accuracy, etc..."
											value={detailedFeedback}
											onChange={(e) => setDetailedFeedback(e.target.value)}
											rows={6}
										/>
									</div>

									{inlineComments.length > 0 && (
										<div className="space-y-2">
											<label className="text-sm font-medium">Inline Comments ({inlineComments.length}):</label>
											<div className="space-y-1 max-h-32 overflow-y-auto">
												{inlineComments.map((comment, index) => (
													<div key={comment.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
														<span className="font-medium">Page {comment.page}, Comment {index + 1}:</span> {comment.comment}
													</div>
												))}
											</div>
										</div>
									)}

									<div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded">
										💡 Tip: Click on the document to add inline comments for specific sections or issues.
									</div>

									<Button
										onClick={handleDetailedValidation}
										disabled={!detailedRating || !detailedFeedback.trim() || isSubmitting}
										className="w-full"
									>
										{isSubmitting ? "Submitting..." : "Submit Detailed Review"}
									</Button>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>
			</motion.div>

			{/* Existing Validations */}
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
											<Badge variant={
												validation.status === 'PENDING' ? 'secondary' :
												validation.status === 'APPROVED' ? 'default' : 'destructive'
											}>
												{validation.status}
											</Badge>
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
	)
}

export default DocumentValidationComponent
