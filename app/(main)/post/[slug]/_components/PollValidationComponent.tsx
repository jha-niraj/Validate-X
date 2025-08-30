"use client"

import { useState, useEffect } from "react"
import { 
	Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
	Clock, Star, BarChart3,
	MessageSquare, Vote, ArrowUpDown
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { 
	DragDropContext, Droppable, Draggable, DroppableProvided, 
	DraggableProvided, DraggableStateSnapshot 
} from '@hello-pangea/dnd'

interface PollValidationProps {
	post: {
		id: string
		title: string
		description: string
		status: string
		type: string
		pollSubtype?: string
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
		pollOptions?: string[]
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

function PollValidationComponent({ post, onUpdate }: PollValidationProps) {
	const [validationMode, setValidationMode] = useState<'normal' | 'detailed'>('normal')
	const [normalVote, setNormalVote] = useState<string>('')
	const [normalComment, setNormalComment] = useState('')
	const [detailedRating, setDetailedRating] = useState(0)
	const [detailedFeedback, setDetailedFeedback] = useState('')
	const [pollResponse, setPollResponse] = useState<{[key: string]: any}>({})
	const [rankedOptions, setRankedOptions] = useState<string[]>([])
	const [multipleChoices, setMultipleChoices] = useState<string[]>([])
	const [pollExplanation, setPollExplanation] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const daysLeft = Math.ceil((new Date(post.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
	const normalProgress = (post.currentNormalCount / post.normalValidatorCount) * 100
	const detailedProgress = (post.currentDetailedCount / post.detailedValidatorCount) * 100

	const pollOptions = post.pollOptions || ['Option A', 'Option B', 'Option C', 'Option D']

	useEffect(() => {
		setRankedOptions([...pollOptions])
	}, [pollOptions])

	const handleNormalValidation = async () => {
		if (!normalVote) {
			toast.error("Please provide your poll response")
			return
		}

		setIsSubmitting(true)
		try {
			// Call validation API
			toast.success("Poll response submitted successfully!")
			onUpdate()
		} catch (error) {
			console.log("Failed to submit poll response: " + error);
			toast.error("Failed to submit poll response")
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
			toast.success("Detailed poll review submitted successfully!")
			onUpdate()
		} catch (error) {
			console.log("Failed to submit the detailed review: " + error);
			toast.error("Failed to submit detailed review")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDragEnd = (result: any) => {
		if (!result.destination) return

		const items = Array.from(rankedOptions)
		const [reorderedItem] = items.splice(result.source.index, 1)
		items.splice(result.destination.index, 0, reorderedItem)

		setRankedOptions(items)
	}

	const toggleMultipleChoice = (option: string) => {
		setMultipleChoices(prev => 
			prev.includes(option) 
				? prev.filter(choice => choice !== option)
				: [...prev, option]
		)
	}

	const renderPollForm = () => {
		switch (post.pollSubtype) {
			case 'BINARY_POLL':
				return (
					<div className="space-y-4">
						<h3 className="font-medium">Binary Poll Question</h3>
						<RadioGroup value={normalVote} onValueChange={setNormalVote}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="yes" id="yes" />
								<Label htmlFor="yes">Yes</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="no" id="no" />
								<Label htmlFor="no">No</Label>
							</div>
						</RadioGroup>
					</div>
				)

			case 'MULTIPLE_CHOICE':
				return (
					<div className="space-y-4">
						<h3 className="font-medium">Multiple Choice Survey</h3>
						<div className="space-y-2">
							{pollOptions.map((option, index) => (
								<div key={index} className="flex items-center space-x-2">
									<Checkbox
										id={`option-${index}`}
										checked={multipleChoices.includes(option)}
										onCheckedChange={() => toggleMultipleChoice(option)}
									/>
									<Label htmlFor={`option-${index}`}>{option}</Label>
								</div>
							))}
						</div>
					</div>
				)

			case 'RANKING_POLL':
				return (
					<div className="space-y-4">
						<h3 className="font-medium">Ranking Poll - Drag to Reorder</h3>
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="ranking">
								{(provided: DroppableProvided) => (
									<div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
										{rankedOptions.map((option, index) => (
											<Draggable key={option} draggableId={option} index={index}>
												{(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														className={`p-3 border rounded-lg cursor-move flex items-center gap-3 ${
															snapshot.isDragging ? 'bg-blue-50 dark:bg-blue-950' : 'bg-gray-50 dark:bg-gray-800'
														}`}
													>
														<div className="flex items-center gap-2">
															<span className="font-bold text-primary">#{index + 1}</span>
															<ArrowUpDown className="h-4 w-4 text-muted-foreground" />
														</div>
														<span>{option}</span>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>
					</div>
				)

			default:
				return (
					<div className="space-y-4">
						<h3 className="font-medium">Poll Options</h3>
						<RadioGroup value={normalVote} onValueChange={setNormalVote}>
							{pollOptions.map((option, index) => (
								<div key={index} className="flex items-center space-x-2">
									<RadioGroupItem value={option} id={`option-${index}`} />
									<Label htmlFor={`option-${index}`}>{option}</Label>
								</div>
							))}
						</RadioGroup>
					</div>
				)
		}
	}

	const getPollData = () => {
		switch (post.pollSubtype) {
			case 'BINARY_POLL':
				return normalVote
			case 'MULTIPLE_CHOICE':
				return multipleChoices
			case 'RANKING_POLL':
				return rankedOptions
			default:
				return normalVote
		}
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
										<Badge variant="secondary">{post.pollSubtype}</Badge>
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
									<span>Poll Responses</span>
									<span>{post.currentNormalCount}/{post.normalValidatorCount}</span>
								</div>
								<Progress value={normalProgress} className="mb-1" />
								<p className="text-xs text-muted-foreground">₹{post.normalReward} per response</p>
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

			{/* Poll Form & Validation Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="grid grid-cols-1 lg:grid-cols-3 gap-6"
			>
				{/* Poll Interface */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Vote className="h-5 w-5" />
								Poll Interface
							</CardTitle>
							<CardDescription>
								{post.pollSubtype === 'BINARY_POLL' && "Select your answer for this yes/no question"}
								{post.pollSubtype === 'MULTIPLE_CHOICE' && "Select one or more options that apply"}
								{post.pollSubtype === 'RANKING_POLL' && "Drag the options to rank them in your preferred order"}
								{!post.pollSubtype && "Select your preferred option"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{renderPollForm()}
								
								{/* Poll Results Preview */}
								<div className="border-t pt-6">
									<h4 className="font-medium mb-4 flex items-center gap-2">
										<BarChart3 className="h-4 w-4" />
										Current Results
									</h4>
									<div className="space-y-3">
										{pollOptions.map((option, index) => {
											const percentage = Math.random() * 100 // Mock data
											const votes = Math.floor(Math.random() * 50) // Mock data
											return (
												<div key={index} className="space-y-1">
													<div className="flex justify-between text-sm">
														<span>{option}</span>
														<span>{votes} votes ({percentage.toFixed(1)}%)</span>
													</div>
													<Progress value={percentage} className="h-2" />
												</div>
											)
										})}
									</div>
									<p className="text-xs text-muted-foreground mt-3">
										Based on {post.currentNormalCount} responses
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Validation Panel */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Participate & Validate</CardTitle>
							<CardDescription>
								Respond to the poll and provide feedback
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs value={validationMode} onValueChange={(value) => setValidationMode(value as 'normal' | 'detailed')}>
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="normal" className="text-xs">
										Respond (₹{post.normalReward})
									</TabsTrigger>
									<TabsTrigger value="detailed" className="text-xs">
										Review (₹{post.detailedReward})
									</TabsTrigger>
								</TabsList>

								<TabsContent value="normal" className="space-y-4 mt-4">
									<div className="space-y-3">
										<label className="text-sm font-medium">Your Response:</label>
										<div className="text-xs text-muted-foreground">
											{post.pollSubtype === 'BINARY_POLL' && "Choose Yes or No"}
											{post.pollSubtype === 'MULTIPLE_CHOICE' && "Select applicable options above"}
											{post.pollSubtype === 'RANKING_POLL' && "Arrange options in your preferred order above"}
											{!post.pollSubtype && "Select your preferred option above"}
										</div>
									</div>
									
									<div className="space-y-2">
										<label className="text-sm font-medium">Explanation (optional):</label>
										<Textarea
											placeholder="Explain your choice..."
											value={normalComment}
											onChange={(e) => setNormalComment(e.target.value)}
											rows={3}
										/>
									</div>

									<Button
										onClick={handleNormalValidation}
										disabled={!getPollData() || isSubmitting}
										className="w-full"
									>
										{isSubmitting ? "Submitting..." : "Submit Response"}
									</Button>
								</TabsContent>

								<TabsContent value="detailed" className="space-y-4 mt-4">
									<div className="space-y-3">
										<label className="text-sm font-medium">Poll Quality Rating:</label>
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

									<div className="space-y-2">
										<label className="text-sm font-medium">Your Poll Response:</label>
										<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
											{post.pollSubtype === 'BINARY_POLL' && (normalVote || "No response yet")}
											{post.pollSubtype === 'MULTIPLE_CHOICE' && (multipleChoices.length > 0 ? multipleChoices.join(", ") : "No options selected")}
											{post.pollSubtype === 'RANKING_POLL' && rankedOptions.join(" > ")}
											{!post.pollSubtype && (normalVote || "No option selected")}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Poll Review & Feedback:</label>
										<Textarea
											placeholder="Evaluate the poll quality, question clarity, option completeness, potential bias, etc..."
											value={detailedFeedback}
											onChange={(e) => setDetailedFeedback(e.target.value)}
											rows={6}
										/>
									</div>

									<div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded">
										💡 Consider: Question clarity, option completeness, potential bias, survey design quality
									</div>

									<Button
										onClick={handleDetailedValidation}
										disabled={!detailedRating || !detailedFeedback.trim() || isSubmitting}
										className="w-full"
									>
										{isSubmitting ? "Submitting..." : "Submit Review"}
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
							<Vote className="h-4 w-4" />
							Poll Responses ({post.validations.normal.length})
						</TabsTrigger>
						<TabsTrigger value="detailed" className="flex items-center gap-2">
							<MessageSquare className="h-4 w-4" />
							Poll Reviews ({post.validations.detailed.length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="normal" className="mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{post.validations.normal.map((validation) => (
								<Card key={validation.id}>
									<CardContent className="p-4">
										<div className="flex items-center gap-3 mb-3">
											<div className="p-2 rounded-full bg-blue-100 text-blue-600">
												<Vote className="h-4 w-4" />
											</div>
											<div>
												<p className="font-medium text-sm">{validation.validator.name}</p>
												<p className="text-xs text-muted-foreground">
													{new Date(validation.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
										<div className="space-y-2">
											<p className="text-sm font-medium">Response: {validation.vote}</p>
											{validation.comment && (
												<p className="text-sm text-muted-foreground">{validation.comment}</p>
											)}
										</div>
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

export default PollValidationComponent
