"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
	Upload, X, Image as ImageIcon, Play, Palette, Target, ArrowLeft, CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { getCategories, createMediaPost } from "@/actions/post.actions"
import Image from "next/image"
import { MediaValidationSubtype } from "@prisma/client"

interface Category {
	id: string
	name: string
	icon?: string | null
	description?: string | null
}

export default function MediaValidationPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const subtype = searchParams.get('subtype') || 'thumbnail_selection'

	const [loading, setLoading] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [previews, setPreviews] = useState<string[]>([])

	// Form data
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		categoryId: "",
		normalValidatorCount: 50,
		detailedValidatorCount: 10,
		totalBudget: 100,
		normalReward: 0.5,
		detailedReward: 5,
		expiryDays: 7,
		instructions: ""
	})

	// Subtype configurations
	const subtypeConfig = {
		thumbnail_selection: {
			title: "Thumbnail/Image Selection",
			description: "Upload 2-5 images and get validators to vote or rank the best one",
			icon: ImageIcon,
			maxFiles: 5,
			minFiles: 2,
			acceptedTypes: "image/*",
			placeholderInstructions: "Ask validators to vote for the best thumbnail or rank them in order of preference. Be specific about what makes a good thumbnail for your use case."
		},
		design_feedback: {
			title: "Design Mockup Feedback",
			description: "Get detailed feedback on UI/UX designs and visual mockups",
			icon: Palette,
			maxFiles: 10,
			minFiles: 1,
			acceptedTypes: "image/*",
			placeholderInstructions: "Specify what aspects of the design you want feedback on: colors, layout, usability, visual hierarchy, etc."
		},
		video_review: {
			title: "Video Snippet Review",
			description: "Get engagement feedback on short video clips or trailers",
			icon: Play,
			maxFiles: 3,
			minFiles: 1,
			acceptedTypes: "video/*,image/*",
			placeholderInstructions: "Describe what kind of feedback you're looking for: engagement, clarity, pacing, visual appeal, etc."
		}
	}

	const config = subtypeConfig[subtype as keyof typeof subtypeConfig] || subtypeConfig.thumbnail_selection

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
			console.error("Error loading categories:", error)
			toast.error("Failed to load categories")
		}
	}

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || [])

		if (selectedFiles.length + files.length > config.maxFiles) {
			toast.error(`Maximum ${config.maxFiles} files allowed`)
			return
		}

		const newFiles = [...selectedFiles, ...files]
		setSelectedFiles(newFiles)

		// Create preview URLs
		const newPreviews = files.map(file => URL.createObjectURL(file))
		setPreviews(prev => [...prev, ...newPreviews])
	}

	const removeFile = (index: number) => {
		const newFiles = selectedFiles.filter((_, i) => i !== index)
		const newPreviews = previews.filter((_, i) => i !== index)

		// Revoke the object URL to prevent memory leaks
		URL.revokeObjectURL(previews[index])

		setSelectedFiles(newFiles)
		setPreviews(newPreviews)
	}

	const calculatePlatformFee = () => {
		return formData.totalBudget * 0.1 // 10% platform fee
	}

	const calculateTotalCost = () => {
		return (formData.normalValidatorCount * formData.normalReward) +
			(formData.detailedValidatorCount * formData.detailedReward) +
			calculatePlatformFee()
	}

	const calculateRemainingBudget = () => {
		return formData.totalBudget - calculateTotalCost()
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
		if (selectedFiles.length < config.minFiles) {
			toast.error(`Please upload at least ${config.minFiles} ${config.minFiles === 1 ? 'file' : 'files'}`)
			return
		}
		if (calculateRemainingBudget() < 0) {
			toast.error("Budget is insufficient for the validation requirements")
			return
		}

		setLoading(true)
		try {
			const result = await createMediaPost({
				title: formData.title,
				description: formData.description,
				categoryId: formData.categoryId,
				postSubtype: subtype as MediaValidationSubtype, // Convert subtype to proper enum
				mediaFiles: selectedFiles,
				normalValidatorCount: formData.normalValidatorCount,
				detailedValidatorCount: formData.detailedValidatorCount,
				totalBudget: formData.totalBudget,
				normalReward: formData.normalReward,
				detailedReward: formData.detailedReward,
				platformFee: calculatePlatformFee(),
				allowAIFeedback: true,
				detailedApprovalRequired: false,
				enableDetailedFeedback: true,
				detailedFeedbackStructure: formData.instructions,
				expiryDate: new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000).toISOString()
			})

			if (result.success) {
				toast.success("Media validation post created successfully!")
				router.push('/dashboard?posted=true')
			} else {
				console.log("Error creating post:", result.error)
				toast.error(result.error || "Failed to create post")
			}
		} catch (error) {
			console.error("Error creating post:", error)
			toast.error("Failed to create post")
		} finally {
			setLoading(false)
		}
	}

	const remainingBudget = calculateRemainingBudget()

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center gap-3 mb-6">
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.back()}
							className="mr-2"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
							<config.icon className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">{config.title}</h1>
							<p className="text-muted-foreground">{config.description}</p>
						</div>
					</div>
					<div className="grid gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Basic Information</CardTitle>
								<CardDescription>
									Tell us about your {subtype.replace('_', ' ')} validation request
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										placeholder={`Enter a title for your ${subtype.replace('_', ' ')} validation`}
										value={formData.title}
										onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
									/>
								</div>
								<div>
									<Label htmlFor="description">Description *</Label>
									<Textarea
										id="description"
										placeholder="Describe what you're looking to validate and any context validators should know"
										value={formData.description}
										onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
										className="min-h-[100px]"
									/>
								</div>
								<div>
									<Label htmlFor="category">Category *</Label>
									<Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
										<SelectTrigger>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											{
												categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.icon} {category.name}
													</SelectItem>
												))
											}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="instructions">Validation Instructions</Label>
									<Textarea
										id="instructions"
										placeholder={config.placeholderInstructions}
										value={formData.instructions}
										onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
										rows={3}
									/>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Upload className="h-5 w-5" />
									Upload {subtype === 'video_review' ? 'Videos/Images' : 'Images'}
								</CardTitle>
								<CardDescription>
									Upload {config.minFiles === config.maxFiles ? config.maxFiles : `${config.minFiles}-${config.maxFiles}`} {subtype === 'video_review' ? 'video files or images' : 'images'} for validation
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
										<Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
										<p className="text-sm text-gray-600 mb-2">
											Drag and drop files here or click to browse
										</p>
										<p className="text-xs text-gray-500 mb-4">
											{subtype === 'video_review' ? 'Supports: MP4, MOV, AVI, JPG, PNG' : 'Supports: JPG, PNG, GIF, WebP'}
										</p>
										<input
											type="file"
											accept={config.acceptedTypes}
											multiple={config.maxFiles > 1}
											onChange={handleFileUpload}
											className="hidden"
											id="file-upload"
										/>
										<Label htmlFor="file-upload" className="cursor-pointer">
											<Button variant="outline" size="sm" type="button">
												Choose Files
											</Button>
										</Label>
									</div>
									{
										selectedFiles.length > 0 && (
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
												{
													selectedFiles.map((file, index) => (
														<div key={index} className="relative group">
															<div className="aspect-square border rounded-lg overflow-hidden bg-gray-100">
																{
																	file.type.startsWith('image/') ? (
																		<Image
																			src={previews[index]}
																			alt={`Preview ${index + 1}`}
																			className="w-full h-full object-cover"
																			height={200}
																			width={200}
																		/>
																	) : (
																		<div className="w-full h-full flex items-center justify-center">
																			<Play className="h-8 w-8 text-gray-400" />
																		</div>
																	)
																}
															</div>
															<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
																<Button
																	variant="destructive"
																	size="sm"
																	className="opacity-0 group-hover:opacity-100 transition-opacity"
																	onClick={() => removeFile(index)}
																>
																	<X className="h-4 w-4" />
																</Button>
															</div>
															<p className="text-xs text-center mt-1 truncate">
																{file.name}
															</p>
														</div>
													))
												}
											</div>
										)
									}
									{
										selectedFiles.length > 0 && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<CheckCircle className="h-4 w-4 text-green-600" />
												{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} uploaded
											</div>
										)
									}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Target className="h-5 w-5" />
									Validation & Budget Settings
								</CardTitle>
								<CardDescription>
									Configure how you want your content to be validated
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="normalCount">Quick Validators</Label>
										<Input
											id="normalCount"
											type="number"
											min="10"
											max="500"
											value={formData.normalValidatorCount}
											onChange={(e) => setFormData(prev => ({ ...prev, normalValidatorCount: parseInt(e.target.value) || 0 }))}
										/>
										<p className="text-xs text-muted-foreground mt-1">
											Quick votes or selections (₹{formData.normalReward} each)
										</p>
									</div>
									<div>
										<Label htmlFor="detailedCount">Detailed Validators</Label>
										<Input
											id="detailedCount"
											type="number"
											min="1"
											max="100"
											value={formData.detailedValidatorCount}
											onChange={(e) => setFormData(prev => ({ ...prev, detailedValidatorCount: parseInt(e.target.value) || 0 }))}
										/>
										<p className="text-xs text-muted-foreground mt-1">
											Detailed feedback with comments (₹{formData.detailedReward} each)
										</p>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="normalReward">Quick Validation Reward (₹)</Label>
										<Select value={formData.normalReward.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, normalReward: parseFloat(value) }))}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="0.5">₹0.5</SelectItem>
												<SelectItem value="1">₹1</SelectItem>
												<SelectItem value="2">₹2</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="detailedReward">Detailed Validation Reward (₹)</Label>
										<Select value={formData.detailedReward.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, detailedReward: parseFloat(value) }))}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="3">₹3</SelectItem>
												<SelectItem value="5">₹5</SelectItem>
												<SelectItem value="8">₹8</SelectItem>
												<SelectItem value="10">₹10</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div>
									<Label htmlFor="totalBudget">Total Budget (₹)</Label>
									<Input
										id="totalBudget"
										type="number"
										min="50"
										value={formData.totalBudget}
										onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: parseInt(e.target.value) || 0 }))}
									/>
								</div>
								<div>
									<Label htmlFor="expiryDays">Validation Period</Label>
									<Select value={formData.expiryDays.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryDays: parseInt(value) }))}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">24 Hours</SelectItem>
											<SelectItem value="3">3 Days</SelectItem>
											<SelectItem value="7">1 Week</SelectItem>
											<SelectItem value="14">2 Weeks</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
									<h4 className="font-medium">Budget Breakdown</h4>
									<div className="text-sm space-y-1">
										<div className="flex justify-between">
											<span>Quick Validations ({formData.normalValidatorCount} × ₹{formData.normalReward})</span>
											<span>₹{(formData.normalValidatorCount * formData.normalReward).toFixed(2)}</span>
										</div>
										<div className="flex justify-between">
											<span>Detailed Validations ({formData.detailedValidatorCount} × ₹{formData.detailedReward})</span>
											<span>₹{(formData.detailedValidatorCount * formData.detailedReward).toFixed(2)}</span>
										</div>
										<div className="flex justify-between">
											<span>Platform Fee (10%)</span>
											<span>₹{calculatePlatformFee().toFixed(2)}</span>
										</div>
										<Separator />
										<div className="flex justify-between font-medium">
											<span>Total Cost</span>
											<span>₹{calculateTotalCost().toFixed(2)}</span>
										</div>
										<div className="flex justify-between">
											<span className={remainingBudget >= 0 ? "text-green-600" : "text-red-600"}>
												{remainingBudget >= 0 ? "Remaining" : "Over Budget"}
											</span>
											<span className={remainingBudget >= 0 ? "text-green-600" : "text-red-600"}>
												₹{Math.abs(remainingBudget).toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
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
								disabled={loading || remainingBudget < 0 || selectedFiles.length < config.minFiles}
								className="flex-1"
							>
								{loading ? "Creating..." : `Create Validation Post (₹${calculateTotalCost().toFixed(2)})`}
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}