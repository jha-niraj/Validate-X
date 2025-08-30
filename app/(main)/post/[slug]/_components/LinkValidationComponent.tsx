"use client"

import { useState, useRef, useEffect } from "react"
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
	Clock, ThumbsUp, ThumbsDown, MinusCircle, Star, ExternalLink,
	MessageSquare, Globe, Smartphone, Monitor, Tablet,
	Camera, RefreshCw, ArrowLeft, ArrowRight, Home, Eye
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import Image from "next/image"

interface LinkValidationProps {
	post: {
		id: string
		title: string
		description: string
		status: string
		type: string
		linkSubtype?: string
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
			}>
		}
	}
	onUpdate: () => void
}

function LinkValidationComponent({ post, onUpdate }: LinkValidationProps) {
	const [validationMode, setValidationMode] = useState<'normal' | 'detailed'>('normal')
	const [normalVote, setNormalVote] = useState<string>('')
	const [normalComment, setNormalComment] = useState('')
	const [detailedRating, setDetailedRating] = useState(0)
	const [detailedFeedback, setDetailedFeedback] = useState('')
	const [checklistItems, setChecklistItems] = useState<{ [key: string]: boolean }>({})
	const [screenshots, setScreenshots] = useState<string[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
	const [isFullscreen, setIsFullscreen] = useState(false)
	const [browserHistory, setBrowserHistory] = useState<string[]>([])
	const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
	const iframeRef = useRef<HTMLIFrameElement>(null)

	const daysLeft = Math.ceil((new Date(post.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
	const normalProgress = (post.currentNormalCount / post.normalValidatorCount) * 100
	const detailedProgress = (post.currentDetailedCount / post.detailedValidatorCount) * 100

	const usabilityChecklist = [
		'Navigation is intuitive and easy to find',
		'Page loads quickly',
		'Content is readable and well-formatted',
		'Links and buttons work correctly',
		'Forms are functional (if any)',
		'Mobile responsive design',
		'No broken images or elements',
		'Contact information is easily accessible',
		'Search functionality works (if present)',
		'Overall user experience is positive'
	]

	const functionalityChecklist = [
		'All main features are working',
		'User registration/login functions properly',
		'Payment process is secure and functional',
		'Search and filtering work correctly',
		'Data submission forms work',
		'File uploads work (if applicable)',
		'API integrations function properly',
		'Error handling is appropriate',
		'Performance is acceptable',
		'Security measures are evident'
	]

	const designChecklist = [
		'Visual design is appealing',
		'Color scheme is consistent',
		'Typography is readable',
		'Layout is well-organized',
		'Images are high quality',
		'Responsive design works across devices',
		'Accessibility features are present',
		'Loading states are handled well',
		'Interactive elements are clear',
		'Overall design is professional'
	]

	useEffect(() => {
		if (post.linkUrl && !browserHistory.includes(post.linkUrl)) {
			setBrowserHistory([post.linkUrl])
			setCurrentHistoryIndex(0)
		}
	}, [post.linkUrl, browserHistory])

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
				console.log("Failed to submit detailed review: " + error);
				toast.error("Failed to submit detailed review")
			} finally {
				setIsSubmitting(false)
			}
		}

		const toggleChecklistItem = (item: string) => {
			setChecklistItems(prev => ({
				...prev,
				[item]: !prev[item]
			}))
		}

		const takeScreenshot = async () => {
			try {
				// In a real implementation, this would capture the iframe content
				// For demo purposes, we'll simulate adding a screenshot
				const mockScreenshot = `/api/screenshot/${Date.now()}.png`
				setScreenshots(prev => [...prev, mockScreenshot])
				toast.success("Screenshot captured!")
			} catch (error) {
				console.log("Failed to capture screenshot: " + error);
				toast.error("Failed to capture screenshot")
			}
		}

		const navigateToUrl = (url: string) => {
			if (url && url !== browserHistory[currentHistoryIndex]) {
				const newHistory = browserHistory.slice(0, currentHistoryIndex + 1)
				newHistory.push(url)
				setBrowserHistory(newHistory)
				setCurrentHistoryIndex(newHistory.length - 1)
			}
		}

		const goBack = () => {
			if (currentHistoryIndex > 0) {
				setCurrentHistoryIndex(prev => prev - 1)
			}
		}

		const goForward = () => {
			if (currentHistoryIndex < browserHistory.length - 1) {
				setCurrentHistoryIndex(prev => prev + 1)
			}
		}

		const refreshPage = () => {
			if (iframeRef.current) {
				iframeRef.current.src = iframeRef.current.src
			}
		}

		const getDeviceClass = () => {
			switch (currentDevice) {
				case 'mobile':
					return 'w-80 h-96'
				case 'tablet':
					return 'w-96 h-72'
				default:
					return 'w-full h-96'
			}
		}

		const currentUrl = browserHistory[currentHistoryIndex] || post.linkUrl

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
											<Badge variant="secondary">{post.linkSubtype}</Badge>
											<Badge variant={post.status === 'OPEN' ? 'default' : 'secondary'}>
												{post.status}
											</Badge>
										</div>
										<CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
										<CardDescription className="text-base">
											{post.description}
										</CardDescription>
										{post.linkUrl && (
											<div className="mt-3">
												<a
													href={post.linkUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 text-primary hover:underline"
												>
													<ExternalLink className="h-4 w-4" />
													{post.linkUrl}
												</a>
											</div>
										)}
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
										<span>Quick Tests</span>
										<span>{post.currentNormalCount}/{post.normalValidatorCount}</span>
									</div>
									<Progress value={normalProgress} className="mb-1" />
									<p className="text-xs text-muted-foreground">₹{post.normalReward} per test</p>
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

				{/* Website Browser & Validation Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="grid grid-cols-1 lg:grid-cols-3 gap-6"
				>
					{/* Website Browser */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2">
										<Globe className="h-5 w-5" />
										Website Browser
									</CardTitle>
									<div className="flex items-center gap-2">
										{/* Device Selection */}
										<div className="flex border rounded">
											<Button
												variant={currentDevice === 'desktop' ? 'default' : 'ghost'}
												size="sm"
												onClick={() => setCurrentDevice('desktop')}
											>
												<Monitor className="h-4 w-4" />
											</Button>
											<Button
												variant={currentDevice === 'tablet' ? 'default' : 'ghost'}
												size="sm"
												onClick={() => setCurrentDevice('tablet')}
											>
												<Tablet className="h-4 w-4" />
											</Button>
											<Button
												variant={currentDevice === 'mobile' ? 'default' : 'ghost'}
												size="sm"
												onClick={() => setCurrentDevice('mobile')}
											>
												<Smartphone className="h-4 w-4" />
											</Button>
										</div>

										<Button variant="outline" size="sm" onClick={takeScreenshot}>
											<Camera className="h-4 w-4" />
										</Button>

										<Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
											<DialogTrigger asChild>
												<Button variant="outline" size="sm">
													<Eye className="h-4 w-4" />
												</Button>
											</DialogTrigger>
											<DialogContent className="max-w-6xl h-[90vh]">
												<DialogHeader>
													<DialogTitle>Fullscreen Browser</DialogTitle>
												</DialogHeader>
												<div className="flex-1 overflow-hidden">
													{currentUrl && (
														<iframe
															src={currentUrl}
															className="w-full h-full border-0"
															title="Website Preview"
														/>
													)}
												</div>
											</DialogContent>
										</Dialog>
									</div>
								</div>

								{/* Browser Controls */}
								<div className="flex items-center gap-2 pt-4 border-t">
									<Button
										variant="outline"
										size="sm"
										onClick={goBack}
										disabled={currentHistoryIndex <= 0}
									>
										<ArrowLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={goForward}
										disabled={currentHistoryIndex >= browserHistory.length - 1}
									>
										<ArrowRight className="h-4 w-4" />
									</Button>
									<Button variant="outline" size="sm" onClick={refreshPage}>
										<RefreshCw className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigateToUrl(post.linkUrl || '')}
									>
										<Home className="h-4 w-4" />
									</Button>
									<Input
										value={currentUrl || ''}
										onChange={(e) => navigateToUrl(e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && navigateToUrl((e.target as HTMLInputElement).value)}
										className="flex-1"
										placeholder="Enter URL..."
									/>
								</div>
							</CardHeader>
							<CardContent>
								{currentUrl ? (
									<div className="space-y-4">
										{/* Website Preview */}
										<div className={`mx-auto border rounded-lg overflow-hidden ${getDeviceClass()}`}>
											<iframe
												ref={iframeRef}
												src={currentUrl}
												className="w-full h-full border-0"
												title="Website Preview"
												sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
											/>
										</div>

										{/* Screenshots Gallery */}
										{screenshots.length > 0 && (
											<div className="space-y-2">
												<h4 className="font-medium text-sm">Screenshots ({screenshots.length})</h4>
												<div className="flex gap-2 overflow-x-auto">
													{screenshots.map((screenshot, index) => (
														<div key={index} className="flex-shrink-0">
															<Image
																src={screenshot}
																alt={`Screenshot ${index + 1}`}
																width={80}
																height={60}
																className="border rounded object-cover"
															/>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								) : (
									<div className="text-center py-8 text-muted-foreground">
										<Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
										<p>No website URL provided</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Validation Panel */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Test & Validate</CardTitle>
								<CardDescription>
									Test the website and provide feedback
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs value={validationMode} onValueChange={(value) => setValidationMode(value as 'normal' | 'detailed')}>
									<TabsList className="grid w-full grid-cols-2">
										<TabsTrigger value="normal" className="text-xs">
											Quick Test (₹{post.normalReward})
										</TabsTrigger>
										<TabsTrigger value="detailed" className="text-xs">
											Detailed Review (₹{post.detailedReward})
										</TabsTrigger>
									</TabsList>

									<TabsContent value="normal" className="space-y-4 mt-4">
										<div className="space-y-3">
											<label className="text-sm font-medium">Overall Experience:</label>
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
											<label className="text-sm font-medium">Quick Feedback:</label>
											<Textarea
												placeholder="Share your thoughts on usability, design, functionality..."
												value={normalComment}
												onChange={(e) => setNormalComment(e.target.value)}
												rows={4}
											/>
										</div>

										<Button
											onClick={handleNormalValidation}
											disabled={!normalVote || isSubmitting}
											className="w-full"
										>
											{isSubmitting ? "Submitting..." : "Submit Test Results"}
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
															className={`h-6 w-6 ${star <= detailedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
																}`}
														/>
													</button>
												))}
											</div>
										</div>

										{/* Checklist Sections */}
										<div className="space-y-3">
											<label className="text-sm font-medium">Testing Checklist:</label>
											<Tabs defaultValue="usability" className="w-full">
												<TabsList className="grid w-full grid-cols-3">
													<TabsTrigger value="usability" className="text-xs">UX</TabsTrigger>
													<TabsTrigger value="functionality" className="text-xs">Function</TabsTrigger>
													<TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
												</TabsList>

												<TabsContent value="usability" className="mt-3 max-h-32 overflow-y-auto">
													{usabilityChecklist.map((item) => (
														<div key={item} className="flex items-center space-x-2 mb-2">
															<Checkbox
																id={item}
																checked={checklistItems[item] || false}
																onCheckedChange={() => toggleChecklistItem(item)}
															/>
															<label htmlFor={item} className="text-xs">{item}</label>
														</div>
													))}
												</TabsContent>

												<TabsContent value="functionality" className="mt-3 max-h-32 overflow-y-auto">
													{functionalityChecklist.map((item) => (
														<div key={item} className="flex items-center space-x-2 mb-2">
															<Checkbox
																id={item}
																checked={checklistItems[item] || false}
																onCheckedChange={() => toggleChecklistItem(item)}
															/>
															<label htmlFor={item} className="text-xs">{item}</label>
														</div>
													))}
												</TabsContent>

												<TabsContent value="design" className="mt-3 max-h-32 overflow-y-auto">
													{designChecklist.map((item) => (
														<div key={item} className="flex items-center space-x-2 mb-2">
															<Checkbox
																id={item}
																checked={checklistItems[item] || false}
																onCheckedChange={() => toggleChecklistItem(item)}
															/>
															<label htmlFor={item} className="text-xs">{item}</label>
														</div>
													))}
												</TabsContent>
											</Tabs>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-medium">Detailed Review:</label>
											<Textarea
												placeholder="Provide comprehensive feedback on website quality, user experience, performance, security, etc..."
												value={detailedFeedback}
												onChange={(e) => setDetailedFeedback(e.target.value)}
												rows={5}
											/>
										</div>

										{screenshots.length > 0 && (
											<div className="space-y-2">
												<label className="text-sm font-medium">Screenshots ({screenshots.length}):</label>
												<div className="text-xs text-muted-foreground">
													Screenshots will be included with your review
												</div>
											</div>
										)}

										<div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded">
											💡 Tip: Test the website across different device sizes and take screenshots of any issues
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
								<Globe className="h-4 w-4" />
								Quick Tests ({post.validations.normal.length})
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
												<div className={`p-2 rounded-full ${validation.vote === 'LIKE' ? 'bg-green-100 text-green-600' :
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
																className={`h-4 w-4 ${i < validation.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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

export default LinkValidationComponent;