"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	Clock, ThumbsUp, ThumbsDown, MinusCircle, Star, Settings,
	MessageSquare, FileText, Eye,
	CheckCircle, AlertCircle,
	Lightbulb, Zap, Target
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { DynamicField } from "@/types"

interface CustomValidationProps {
	post: {
		id: string
		title: string
		description: string
		status: string
		type: string
		customSubtype?: string
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
		totalBudget?: number
		normalValidatorCount?: number
		detailedValidatorCount?: number
		currentNormalCount?: number
		currentDetailedCount?: number
		normalReward?: number
		detailedReward?: number
		customInstructions?: string
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
			}>
		}
	}
	onUpdate: () => void
}

function CustomValidationComponent({ post, onUpdate }: CustomValidationProps) {
	const [validationMode, setValidationMode] = useState<'normal' | 'detailed'>('normal')
	const [normalVote, setNormalVote] = useState<string>('')
	const [normalComment, setNormalComment] = useState('')
	const [detailedRating, setDetailedRating] = useState(0)
	const [detailedFeedback, setDetailedFeedback] = useState('')
	const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([])
	const [fieldResponses, setFieldResponses] = useState<Record<string, string | number | boolean | string[]>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const daysLeft = Math.ceil((new Date(post.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
	const normalProgress = ((post.currentNormalCount || 0) / (post.normalValidatorCount || 1)) * 100
	const detailedProgress = ((post.currentDetailedCount || 0) / (post.detailedValidatorCount || 1)) * 100

	const generateDynamicFields = useCallback(() => {
		// This would parse the custom instructions and generate appropriate form fields
		// For demo purposes, we'll create some sample fields based on the subtype
		const fields: DynamicField[] = []

		switch (post.customSubtype) {
			case 'IDEA_VALIDATION':
				fields.push(
					{
						id: 'market_potential',
						type: 'number',
						label: 'Market Potential (1-5)',
						required: true
					},
					{
						id: 'feasibility',
						type: 'number',
						label: 'Technical Feasibility (1-5)',
						required: true
					},
					{
						id: 'uniqueness',
						type: 'number',
						label: 'Uniqueness/Innovation (1-5)',
						required: true
					},
					{
						id: 'target_audience',
						type: 'select',
						label: 'Primary Target Audience',
						required: true,
						options: ['B2B', 'B2C', 'Both', 'Government', 'Non-profit']
					}
				)
				break

			case 'BUSINESS_REVIEW':
				fields.push(
					{
						id: 'business_model',
						type: 'number',
						label: 'Business Model Clarity (1-5)',
						required: true
					},
					{
						id: 'revenue_potential',
						type: 'number',
						label: 'Revenue Potential (1-5)',
						required: true
					},
					{
						id: 'competitive_advantage',
						type: 'textarea',
						label: 'Competitive Advantage Analysis',
						required: true
					},
					{
						id: 'risk_level',
						type: 'select',
						label: 'Overall Risk Level',
						required: true,
						options: ['Low', 'Medium', 'High', 'Very High']
					}
				)
				break

			case 'MIXED_CONTENT':
				fields.push(
					{
						id: 'content_quality',
						type: 'number',
						label: 'Overall Content Quality (1-5)',
						required: true
					},
					{
						id: 'content_type',
						type: 'select',
						label: 'Primary Content Type',
						required: true,
						options: ['Educational', 'Entertainment', 'Marketing', 'Technical', 'Creative']
					},
					{
						id: 'improvements',
						type: 'textarea',
						label: 'Suggested Improvements',
						required: false
					}
				)
				break

			default:
				// Generic fields for unknown subtypes
				fields.push(
					{
						id: 'overall_quality',
						type: 'number',
						label: 'Overall Quality (1-5)',
						required: true
					},
					{
						id: 'general_feedback',
						type: 'textarea',
						label: 'General Feedback',
						required: true
					}
				)
		}

		setDynamicFields(fields)
	}, [post.customSubtype])

	// Parse custom instructions and generate dynamic form fields
	useEffect(() => {
		generateDynamicFields()
	}, [generateDynamicFields])

	const handleNormalValidation = async () => {
		if (!normalVote) {
			toast.error("Please select your validation")
			return
		}

		// Check required fields
		const requiredFields = dynamicFields.filter(field => field.required)
		const missingFields = requiredFields.filter(field => !fieldResponses[field.id])
		
		if (missingFields.length > 0) {
			toast.error("Please fill in all required fields")
			return
		}

		setIsSubmitting(true)
		try {
			// Call validation API
			toast.success("Custom validation submitted successfully!")
			onUpdate()
		} catch (error) {
			toast.error("Failed to submit validation")
			console.log("Failed to submit validation: " + error);
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
			toast.success("Detailed custom review submitted successfully!")
			onUpdate()
		} catch (error) {
			console.log("Failed to submit detailed review: " + error);
			toast.error("Failed to submit detailed review")
		} finally {
			setIsSubmitting(false)
		}
	}

	const updateFieldResponse = (fieldId: string, value: string | number | boolean | string[]) => {
		setFieldResponses(prev => ({
			...prev,
			[fieldId]: value
		}))
	}

	const renderDynamicField = (field: DynamicField) => {
		switch (field.type) {
			case 'text':
				return (
					<Input
						value={String(fieldResponses[field.id] || '')}
						onChange={(e) => updateFieldResponse(field.id, e.target.value)}
						placeholder={`Enter ${field.label.toLowerCase()}`}
					/>
				)

			case 'textarea':
				return (
					<Textarea
						value={String(fieldResponses[field.id] || '')}
						onChange={(e) => updateFieldResponse(field.id, e.target.value)}
						placeholder={`Enter ${field.label.toLowerCase()}`}
						rows={3}
					/>
				)

			case 'number':
				return (
					<Input
						type="number"
						value={String(fieldResponses[field.id] || '')}
						onChange={(e) => updateFieldResponse(field.id, Number(e.target.value))}
						placeholder={`Enter ${field.label.toLowerCase()}`}
					/>
				)

			case 'select':
				return (
					<Select value={String(fieldResponses[field.id] || '')} onValueChange={(value) => updateFieldResponse(field.id, value)}>
						<SelectTrigger>
							<SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
						</SelectTrigger>
						<SelectContent>
							{field.options?.map((option) => (
								<SelectItem key={option} value={option}>{option}</SelectItem>
							))}
						</SelectContent>
					</Select>
				)

			case 'radio':
				return (
					<RadioGroup value={String(fieldResponses[field.id] || '')} onValueChange={(value: string) => updateFieldResponse(field.id, value)}>
						{field.options?.map((option) => (
							<div key={option} className="flex items-center space-x-2">
								<RadioGroupItem value={option} id={`${field.id}-${option}`} />
								<Label htmlFor={`${field.id}-${option}`}>{option}</Label>
							</div>
						))}
					</RadioGroup>
				)

			case 'checkbox':
				const selectedOptions = Array.isArray(fieldResponses[field.id]) 
					? fieldResponses[field.id] as string[]
					: []
				return (
					<div className="space-y-2">
						{field.options?.map((option) => (
							<div key={option} className="flex items-center space-x-2">
								<Checkbox
									id={`${field.id}-${option}`}
									checked={selectedOptions.includes(option)}
									onCheckedChange={(checked) => {
										const updated = checked
											? [...selectedOptions, option]
											: selectedOptions.filter((item: string) => item !== option)
										updateFieldResponse(field.id, updated)
									}}
								/>
								<Label htmlFor={`${field.id}-${option}`}>{option}</Label>
							</div>
						))}
					</div>
				)

			case 'boolean':
				return (
					<div className="flex items-center space-x-2">
						<Checkbox
							id={field.id}
							checked={Boolean(fieldResponses[field.id])}
							onCheckedChange={(checked) => updateFieldResponse(field.id, checked)}
						/>
						<Label htmlFor={field.id}>{field.label}</Label>
					</div>
				)

			case 'rating':
				const rating = Number(fieldResponses[field.id] || 0)
				return (
					<div className="flex gap-1">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								onClick={() => updateFieldResponse(field.id, star)}
								className="text-2xl"
							>
								<Star
									className={`h-6 w-6 ${
										star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
									}`}
								/>
							</button>
						))}
					</div>
				)

			default:
				return null
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
										<Badge variant="secondary">{post.customSubtype}</Badge>
										<Badge variant={post.status === 'OPEN' ? 'default' : 'secondary'}>
											{post.status}
										</Badge>
									</div>
									<CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
									<CardDescription className="text-base">
										{post.description}
									</CardDescription>
									
									{/* Custom Instructions */}
									{post.customInstructions && (
										<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
											<h4 className="font-medium text-sm mb-2 flex items-center gap-2">
												<Lightbulb className="h-4 w-4" />
												Validation Instructions
											</h4>
											<p className="text-sm text-muted-foreground whitespace-pre-wrap">
												{post.customInstructions}
											</p>
										</div>
									)}

									{/* Attachments */}
									<div className="flex flex-wrap gap-2 mt-4">
										{post.fileUrl && (
											<Button variant="outline" size="sm" asChild>
												<a href={post.fileUrl} target="_blank" rel="noopener noreferrer">
													<FileText className="h-4 w-4 mr-2" />
													{post.fileName || 'Download File'}
												</a>
											</Button>
										)}
										{post.linkUrl && (
											<Button variant="outline" size="sm" asChild>
												<a href={post.linkUrl} target="_blank" rel="noopener noreferrer">
													<Eye className="h-4 w-4 mr-2" />
													View Link
												</a>
											</Button>
										)}
									</div>
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

					<Card>
						<CardHeader>
							<CardTitle className="text-sm">Validation Type</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<Settings className="h-4 w-4" />
									<span>Custom Validation</span>
								</div>
								<p className="text-xs text-muted-foreground">
									Follow the specific instructions and complete the required fields
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</motion.div>

			{/* Dynamic Form & Validation Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="grid grid-cols-1 lg:grid-cols-3 gap-6"
			>
				{/* Dynamic Form Fields */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Target className="h-5 w-5" />
								Custom Validation Form
							</CardTitle>
							<CardDescription>
								Complete the fields below based on the validation requirements
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{dynamicFields.map((field) => (
									<div key={field.id} className="space-y-2">
										<label className="text-sm font-medium flex items-center gap-2">
											{field.label}
											{field.required && <span className="text-red-500">*</span>}
										</label>
										{renderDynamicField(field)}
									</div>
								))}

								{dynamicFields.length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										<Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
										<p>Custom validation form will be generated based on requirements</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Validation Panel */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Submit Validation</CardTitle>
							<CardDescription>
								Choose your validation method
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs value={validationMode} onValueChange={(value) => setValidationMode(value as 'normal' | 'detailed')}>
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="normal" className="text-xs">
										Standard (₹{post.normalReward})
									</TabsTrigger>
									<TabsTrigger value="detailed" className="text-xs">
										Detailed (₹{post.detailedReward})
									</TabsTrigger>
								</TabsList>

								<TabsContent value="normal" className="space-y-4 mt-4">
									<div className="space-y-3">
										<label className="text-sm font-medium">Overall Assessment:</label>
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
										<label className="text-sm font-medium">Additional Comments:</label>
										<Textarea
											placeholder="Share any additional thoughts or suggestions..."
											value={normalComment}
											onChange={(e) => setNormalComment(e.target.value)}
											rows={3}
										/>
									</div>

									<div className="text-xs text-muted-foreground p-3 bg-amber-50 dark:bg-amber-950 rounded">
										<AlertCircle className="h-4 w-4 inline mr-2" />
										Complete the custom form above before submitting
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

									<div className="space-y-2">
										<label className="text-sm font-medium">Comprehensive Review:</label>
										<Textarea
											placeholder="Provide detailed analysis, recommendations, and comprehensive feedback..."
											value={detailedFeedback}
											onChange={(e) => setDetailedFeedback(e.target.value)}
											rows={6}
										/>
									</div>

									<div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded">
										<Zap className="h-4 w-4 inline mr-2" />
										Your custom form responses and detailed feedback will be combined for a comprehensive review
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
							<CheckCircle className="h-4 w-4" />
							Standard Validations ({post.validations.normal.length})
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

export default CustomValidationComponent
