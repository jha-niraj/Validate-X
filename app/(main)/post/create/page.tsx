"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
	Plus, Minus, Upload, FileText, ExternalLink, 
	DollarSign, Users, Calendar, Lightbulb, Target, Settings
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { createPost, getCategories } from "@/actions/post.actions"

interface Category {
	id: string
	name: string
	icon?: string | null
	description?: string | null
}

interface FeedbackCategory {
	name: string
	description: string
	required: boolean
}

interface FeedbackQuestion {
	question: string
	type: 'text' | 'rating' | 'select'
	options?: string[]
	required: boolean
}

export default function CreatePostPage() {
	const router = useRouter()
	const { data: session } = useSession()
	const [loading, setLoading] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])

	// Basic post data
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		categoryId: "",
		linkUrl: "",
		normalValidatorCount: 500,
		detailedValidatorCount: 100,
		totalBudget: 5000,
		normalReward: 10,
		detailedReward: 50,
		expiryDays: 7,
		allowAIFeedback: true,
		detailedApprovalRequired: true
	})

	// Detailed feedback settings
	const [enableDetailedFeedback, setEnableDetailedFeedback] = useState(false)
	const [feedbackCategories, setFeedbackCategories] = useState<FeedbackCategory[]>([])
	const [feedbackQuestions, setFeedbackQuestions] = useState<FeedbackQuestion[]>([])
	const [file, setFile] = useState<File | null>(null)

	useEffect(() => {
		loadCategories()
	}, [])

	const loadCategories = async () => {
		try {
			const result = await getCategories()
			if (result.success && result.categories) {
				setCategories(result.categories)
			}
		} catch (error) {
			toast.error("Failed to load categories")
		}
	}

	const addFeedbackCategory = () => {
		setFeedbackCategories([...feedbackCategories, {
			name: "",
			description: "",
			required: false
		}])
	}

	const removeFeedbackCategory = (index: number) => {
		setFeedbackCategories(feedbackCategories.filter((_, i) => i !== index))
	}

	const updateFeedbackCategory = (index: number, field: keyof FeedbackCategory, value: any) => {
		const updated = [...feedbackCategories]
		updated[index] = { ...updated[index], [field]: value }
		setFeedbackCategories(updated)
	}

	const addFeedbackQuestion = () => {
		setFeedbackQuestions([...feedbackQuestions, {
			question: "",
			type: 'text',
			required: false
		}])
	}

	const removeFeedbackQuestion = (index: number) => {
		setFeedbackQuestions(feedbackQuestions.filter((_, i) => i !== index))
	}

	const updateFeedbackQuestion = (index: number, field: keyof FeedbackQuestion, value: any) => {
		const updated = [...feedbackQuestions]
		updated[index] = { ...updated[index], [field]: value }
		setFeedbackQuestions(updated)
	}

	const addQuestionOption = (questionIndex: number) => {
		const updated = [...feedbackQuestions]
		if (!updated[questionIndex].options) {
			updated[questionIndex].options = []
		}
		updated[questionIndex].options!.push("")
		setFeedbackQuestions(updated)
	}

	const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
		const updated = [...feedbackQuestions]
		updated[questionIndex].options![optionIndex] = value
		setFeedbackQuestions(updated)
	}

	const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
		const updated = [...feedbackQuestions]
		updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex)
		setFeedbackQuestions(updated)
	}

	const calculatePlatformFee = () => {
		return formData.totalBudget * 0.1 // 10% platform fee
	}

	const calculateRemainingBudget = () => {
		const normalCost = formData.normalValidatorCount * formData.normalReward
		const detailedCost = formData.detailedValidatorCount * formData.detailedReward
		const platformFee = calculatePlatformFee()
		return formData.totalBudget - normalCost - detailedCost - platformFee
	}

	const handleSubmit = async () => {
		// Validation
		if (!formData.title.trim()) {
			toast.error("Please enter a title")
			return
		}
		if (!formData.description.trim()) {
			toast.error("Please enter a description")
			return
		}
		if (!formData.categoryId) {
			toast.error("Please select a category")
			return
		}
		if (calculateRemainingBudget() < 0) {
			toast.error("Budget is insufficient for the validation requirements")
			return
		}

		// Validate detailed feedback structure if enabled
		if (enableDetailedFeedback) {
			const hasCategories = feedbackCategories.some(cat => cat.name.trim())
			const hasQuestions = feedbackQuestions.some(q => q.question.trim())
			
			if (!hasCategories && !hasQuestions) {
				toast.error("Please add at least one feedback category or question for detailed validation")
				return
			}

			// Validate category names
			for (let i = 0; i < feedbackCategories.length; i++) {
				if (!feedbackCategories[i].name.trim()) {
					toast.error(`Please enter a name for feedback category ${i + 1}`)
					return
				}
			}

			// Validate questions
			for (let i = 0; i < feedbackQuestions.length; i++) {
				if (!feedbackQuestions[i].question.trim()) {
					toast.error(`Please enter question ${i + 1}`)
					return
				}
				if (feedbackQuestions[i].type === 'select' && (!feedbackQuestions[i].options || feedbackQuestions[i].options!.length < 2)) {
					toast.error(`Question ${i + 1} needs at least 2 options for select type`)
					return
				}
			}
		}

		setLoading(true)
		try {
			// Prepare detailed feedback structure
			let detailedFeedbackStructure = null
			if (enableDetailedFeedback) {
				detailedFeedbackStructure = JSON.stringify({
					categories: feedbackCategories.filter(cat => cat.name.trim()),
					questions: feedbackQuestions.filter(q => q.question.trim())
				})
			}

			const expiryDate = new Date()
			expiryDate.setDate(expiryDate.getDate() + formData.expiryDays)

			const result = await createPost({
				...formData,
				enableDetailedFeedback,
				detailedFeedbackStructure: detailedFeedbackStructure || undefined,
				platformFee: calculatePlatformFee(),
				expiryDate: expiryDate.toISOString(),
				file
			})

			if (result.success) {
				toast.success("Post created successfully!")
				router.push('/dashboard')
			} else {
				toast.error(result.error || "Failed to create post")
			}
		} catch (error) {
			toast.error("Failed to create post")
		} finally {
			setLoading(false)
		}
	}

	const remainingBudget = calculateRemainingBudget()

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center gap-3 mb-6">
						<Lightbulb className="h-8 w-8 text-blue-600" />
						<div>
							<h1 className="text-3xl font-bold">Create New Post</h1>
							<p className="text-muted-foreground">Submit your idea for validation by the community</p>
						</div>
					</div>

					<div className="grid gap-6">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Basic Information
								</CardTitle>
								<CardDescription>
									Tell us about your idea and what you want to validate
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										placeholder="Enter a clear, descriptive title for your idea"
										value={formData.title}
										onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
									/>
								</div>

								<div>
									<Label htmlFor="description">Description *</Label>
									<Textarea
										id="description"
										placeholder="Describe your idea in detail. What problem does it solve? How does it work? What makes it unique?"
										value={formData.description}
										onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
										className="min-h-[120px]"
									/>
								</div>

								<div>
									<Label htmlFor="category">Category *</Label>
									<Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
										<SelectTrigger>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.icon} {category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="linkUrl">Reference Link (Optional)</Label>
									<Input
										id="linkUrl"
										placeholder="https://example.com - Link to prototype, website, or additional resources"
										value={formData.linkUrl}
										onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
									/>
								</div>

								{/* File Upload */}
								<div>
									<Label>Supporting Document (Optional)</Label>
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
										<Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
										<p className="text-sm text-gray-600 mb-2">
											Upload pitch deck, business plan, or mockups
										</p>
										<input
											type="file"
											accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
											onChange={(e) => setFile(e.target.files?.[0] || null)}
											className="hidden"
											id="file-upload"
										/>
										<Label htmlFor="file-upload" className="cursor-pointer">
											<Button variant="outline" size="sm" type="button">
												Choose File
											</Button>
										</Label>
										{file && (
											<p className="text-sm text-green-600 mt-2">
												Selected: {file.name}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Validation Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Target className="h-5 w-5" />
									Validation Settings
								</CardTitle>
								<CardDescription>
									Configure how you want your idea to be validated
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="normalCount">Normal Validators</Label>
										<Input
											id="normalCount"
											type="number"
											min="1"
											max="1000"
											value={formData.normalValidatorCount}
											onChange={(e) => setFormData(prev => ({ ...prev, normalValidatorCount: parseInt(e.target.value) || 0 }))}
										/>
									</div>
									<div>
										<Label htmlFor="normalReward">Normal Reward (₹)</Label>
										<Input
											id="normalReward"
											type="number"
											min="1"
											max="100"
											value={formData.normalReward}
											onChange={(e) => setFormData(prev => ({ ...prev, normalReward: parseInt(e.target.value) || 0 }))}
										/>
									</div>
									<div>
										<Label htmlFor="detailedCount">Detailed Validators</Label>
										<Input
											id="detailedCount"
											type="number"
											min="1"
											max="500"
											value={formData.detailedValidatorCount}
											onChange={(e) => setFormData(prev => ({ ...prev, detailedValidatorCount: parseInt(e.target.value) || 0 }))}
										/>
									</div>
									<div>
										<Label htmlFor="detailedReward">Detailed Reward (₹)</Label>
										<Input
											id="detailedReward"
											type="number"
											min="10"
											max="500"
											value={formData.detailedReward}
											onChange={(e) => setFormData(prev => ({ ...prev, detailedReward: parseInt(e.target.value) || 0 }))}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="totalBudget">Total Budget (₹)</Label>
									<Input
										id="totalBudget"
										type="number"
										min="100"
										value={formData.totalBudget}
										onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: parseInt(e.target.value) || 0 }))}
									/>
								</div>

								<div>
									<Label htmlFor="expiryDays">Validation Period (Days)</Label>
									<Select value={formData.expiryDays.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryDays: parseInt(value) }))}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="3">3 Days</SelectItem>
											<SelectItem value="7">7 Days</SelectItem>
											<SelectItem value="14">14 Days</SelectItem>
											<SelectItem value="30">30 Days</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Budget Breakdown */}
								<div className="bg-gray-50 rounded-lg p-4 space-y-2">
									<h4 className="font-medium">Budget Breakdown</h4>
									<div className="text-sm space-y-1">
										<div className="flex justify-between">
											<span>Normal Validations ({formData.normalValidatorCount} × ₹{formData.normalReward})</span>
											<span>₹{formData.normalValidatorCount * formData.normalReward}</span>
										</div>
										<div className="flex justify-between">
											<span>Detailed Validations ({formData.detailedValidatorCount} × ₹{formData.detailedReward})</span>
											<span>₹{formData.detailedValidatorCount * formData.detailedReward}</span>
										</div>
										<div className="flex justify-between">
											<span>Platform Fee (10%)</span>
											<span>₹{calculatePlatformFee()}</span>
										</div>
										<Separator />
										<div className="flex justify-between font-medium">
											<span>Total Cost</span>
											<span>₹{formData.normalValidatorCount * formData.normalReward + formData.detailedValidatorCount * formData.detailedReward + calculatePlatformFee()}</span>
										</div>
										<div className="flex justify-between">
											<span className={remainingBudget >= 0 ? "text-green-600" : "text-red-600"}>
												{remainingBudget >= 0 ? "Remaining" : "Over Budget"}
											</span>
											<span className={remainingBudget >= 0 ? "text-green-600" : "text-red-600"}>
												₹{Math.abs(remainingBudget)}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Detailed Feedback Structure */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5" />
									Detailed Feedback Structure
								</CardTitle>
								<CardDescription>
									Define how you want detailed validators to provide feedback
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-2">
									<Switch
										id="enable-detailed"
										checked={enableDetailedFeedback}
										onCheckedChange={setEnableDetailedFeedback}
									/>
									<Label htmlFor="enable-detailed">
										Enable custom detailed feedback structure
									</Label>
								</div>

								{enableDetailedFeedback && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										transition={{ duration: 0.3 }}
										className="space-y-6"
									>
										{/* Feedback Categories */}
										<div>
											<div className="flex items-center justify-between mb-3">
												<Label className="text-base font-medium">Feedback Categories</Label>
												<Button
													variant="outline"
													size="sm"
													onClick={addFeedbackCategory}
												>
													<Plus className="h-4 w-4 mr-2" />
													Add Category
												</Button>
											</div>
											<p className="text-sm text-muted-foreground mb-4">
												Define specific areas you want validators to focus on (e.g., Market Viability, Technical Feasibility)
											</p>

											{feedbackCategories.map((category, index) => (
												<div key={index} className="border rounded-lg p-4 space-y-3">
													<div className="flex items-center justify-between">
														<span className="font-medium">Category {index + 1}</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => removeFeedbackCategory(index)}
														>
															<Minus className="h-4 w-4" />
														</Button>
													</div>
													<div className="grid gap-3">
														<div>
															<Label>Category Name *</Label>
															<Input
																placeholder="e.g., Market Viability"
																value={category.name}
																onChange={(e) => updateFeedbackCategory(index, 'name', e.target.value)}
															/>
														</div>
														<div>
															<Label>Description</Label>
															<Textarea
																placeholder="Describe what kind of feedback you want for this category"
																value={category.description}
																onChange={(e) => updateFeedbackCategory(index, 'description', e.target.value)}
																rows={2}
															/>
														</div>
														<div className="flex items-center space-x-2">
															<Checkbox
																checked={category.required}
																onCheckedChange={(checked) => updateFeedbackCategory(index, 'required', checked)}
															/>
															<Label>Required field</Label>
														</div>
													</div>
												</div>
											))}
										</div>

										{/* Specific Questions */}
										<div>
											<div className="flex items-center justify-between mb-3">
												<Label className="text-base font-medium">Specific Questions</Label>
												<Button
													variant="outline"
													size="sm"
													onClick={addFeedbackQuestion}
												>
													<Plus className="h-4 w-4 mr-2" />
													Add Question
												</Button>
											</div>
											<p className="text-sm text-muted-foreground mb-4">
												Ask specific questions to get targeted feedback
											</p>

											{feedbackQuestions.map((question, index) => (
												<div key={index} className="border rounded-lg p-4 space-y-3">
													<div className="flex items-center justify-between">
														<span className="font-medium">Question {index + 1}</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => removeFeedbackQuestion(index)}
														>
															<Minus className="h-4 w-4" />
														</Button>
													</div>
													<div className="grid gap-3">
														<div>
															<Label>Question *</Label>
															<Textarea
																placeholder="e.g., How would you rate the market opportunity for this idea?"
																value={question.question}
																onChange={(e) => updateFeedbackQuestion(index, 'question', e.target.value)}
																rows={2}
															/>
														</div>
														<div>
															<Label>Answer Type</Label>
															<Select
																value={question.type}
																onValueChange={(value) => updateFeedbackQuestion(index, 'type', value)}
															>
																<SelectTrigger>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="text">Text Answer</SelectItem>
																	<SelectItem value="rating">Rating (1-5)</SelectItem>
																	<SelectItem value="select">Multiple Choice</SelectItem>
																</SelectContent>
															</Select>
														</div>

														{question.type === 'select' && (
															<div>
																<div className="flex items-center justify-between mb-2">
																	<Label>Options</Label>
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => addQuestionOption(index)}
																	>
																		<Plus className="h-4 w-4" />
																	</Button>
																</div>
																{question.options?.map((option, optIndex) => (
																	<div key={optIndex} className="flex gap-2">
																		<Input
																			placeholder={`Option ${optIndex + 1}`}
																			value={option}
																			onChange={(e) => updateQuestionOption(index, optIndex, e.target.value)}
																		/>
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={() => removeQuestionOption(index, optIndex)}
																		>
																			<Minus className="h-4 w-4" />
																		</Button>
																	</div>
																))}
															</div>
														)}

														<div className="flex items-center space-x-2">
															<Checkbox
																checked={question.required}
																onCheckedChange={(checked) => updateFeedbackQuestion(index, 'required', checked)}
															/>
															<Label>Required field</Label>
														</div>
													</div>
												</div>
											))}
										</div>
									</motion.div>
								)}
							</CardContent>
						</Card>

						{/* Submit */}
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={() => router.back()}
								disabled={loading}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								onClick={handleSubmit}
								disabled={loading || remainingBudget < 0}
								className="flex-1"
							>
								{loading ? "Creating..." : `Create Post (₹${formData.normalValidatorCount * formData.normalReward + formData.detailedValidatorCount * formData.detailedReward + calculatePlatformFee()})`}
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
