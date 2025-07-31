"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
	Upload, FileText, Link2, Calculator, CreditCard, AlertCircle,
	CheckCircle, Lightbulb, Users, Eye, DollarSign, Clock, Info
} from "lucide-react"
import { toast } from "sonner"
import { createPost, getCategories } from "@/actions/post.actions"
import { redirect } from "next/navigation"

interface Category {
	id: string
	name: string
	description: string | null
	icon: string | null
}

interface PostFormData {
	title: string
	description: string
	categoryId: string
	fileUrl?: string
	fileName?: string
	fileType?: string
	linkUrl?: string
	normalValidatorCount: number
	detailedValidatorCount: number
	normalReward: number
	detailedReward: number
	allowAIFeedback: boolean
	detailedApprovalRequired: boolean
	expiryDays: number
}

export default function PostCreatePage() {
	const { data: session } = useSession()
	const router = useRouter()
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [step, setStep] = useState(1)
	const [formData, setFormData] = useState<PostFormData>({
		title: "",
		description: "",
		categoryId: "",
		normalValidatorCount: 500,
		detailedValidatorCount: 100,
		normalReward: 2,
		detailedReward: 10,
		allowAIFeedback: true,
		detailedApprovalRequired: true,
		expiryDays: 7
	})

	useEffect(() => {
		if (!session?.user) {
			redirect("/signin")
		}

		// Note: userRole check would be done here if available in session
		// For now, we'll let all authenticated users access this page

		fetchCategories()
	}, [session])

	const fetchCategories = async () => {
		try {
			const result = await getCategories()
			if (result.success && result.categories) {
				setCategories(result.categories)
			} else {
				toast.error("Failed to load categories")
			}
		} catch (error) {
			console.error("Error fetching categories:", error)
			toast.error("Failed to load categories")
		}
	}

	const handleInputChange = (field: keyof PostFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const calculateBudget = () => {
		const normalTotal = formData.normalValidatorCount * formData.normalReward
		const detailedTotal = formData.detailedValidatorCount * formData.detailedReward
		const subtotal = normalTotal + detailedTotal
		const platformFee = subtotal * 0.1 // 10% platform fee
		const total = subtotal + platformFee

		return {
			normalTotal,
			detailedTotal,
			subtotal,
			platformFee,
			total
		}
	}

	const handleFileUpload = async (file: File) => {
		setUploading(true)
		try {
			// Mock file upload - replace with actual Cloudinary upload
			const mockUrl = `https://example.com/uploads/${file.name}`

			handleInputChange('fileUrl', mockUrl)
			handleInputChange('fileName', file.name)
			handleInputChange('fileType', file.type)

			toast.success("File uploaded successfully")
		} catch (error) {
			console.error("Error uploading file:", error)
			toast.error("Failed to upload file")
		} finally {
			setUploading(false)
		}
	}

	const handleSubmit = async () => {
		if (!formData.title.trim() || !formData.description.trim() || !formData.categoryId) {
			toast.error("Please fill in all required fields")
			return
		}

		setLoading(true)
		try {
			const budget = calculateBudget()

			const postData = {
				...formData,
				totalBudget: budget.total,
				platformFee: budget.platformFee,
				expiryDate: new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000)
			}

			const result = await createPost(postData)

			if (result.success) {
				toast.success("Post created successfully!")
				router.push(`/dashboard?posted=true`)
			} else {
				toast.error(result.error || "Failed to create post")
			}
		} catch (error) {
			console.error("Error creating post:", error)
			toast.error("Failed to create post")
		} finally {
			setLoading(false)
		}
	}

	const budget = calculateBudget()
	const totalSteps = 3

	return (
		<div className="min-h-screen bg-gradient-to-bl dark:from-black dark:via-gray-900 dark:to-black">
			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Submit New Idea</h1>
					<p className="text-muted-foreground">
						Share your innovative concept and get valuable feedback from our validator community
					</p>
				</div>

				{/* Progress */}
				<Card className="mb-8">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Step {step} of {totalSteps}</h3>
							<Badge variant="outline">{Math.round((step / totalSteps) * 100)}% Complete</Badge>
						</div>
						<Progress value={(step / totalSteps) * 100} className="mb-2" />
						<div className="flex justify-between text-sm text-muted-foreground">
							<span className={step >= 1 ? "text-primary font-medium" : ""}>Idea Details</span>
							<span className={step >= 2 ? "text-primary font-medium" : ""}>Validation Settings</span>
							<span className={step >= 3 ? "text-primary font-medium" : ""}>Budget & Payment</span>
						</div>
					</CardContent>
				</Card>

				{/* Step 1: Idea Details */}
				{step === 1 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lightbulb className="h-5 w-5" />
								Idea Details
							</CardTitle>
							<CardDescription>
								Provide the core details of your innovative concept
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Title */}
							<div className="space-y-2">
								<Label htmlFor="title">Title *</Label>
								<Input
									id="title"
									placeholder="Give your idea a compelling title..."
									value={formData.title}
									onChange={(e) => handleInputChange('title', e.target.value)}
									maxLength={100}
								/>
								<p className="text-xs text-muted-foreground">
									{formData.title.length}/100 characters
								</p>
							</div>

							{/* Category */}
							<div className="space-y-2">
								<Label htmlFor="category">Category *</Label>
								<Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select a category for your idea" />
									</SelectTrigger>
									<SelectContent>
										{categories.map((category) => (
											<SelectItem key={category.id} value={category.id}>
												<div className="flex items-center gap-2">
													{category.icon && <span>{category.icon}</span>}
													<span>{category.name}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Description *</Label>
								<Textarea
									id="description"
									placeholder="Describe your idea in detail. What problem does it solve? How does it work? What makes it innovative?"
									value={formData.description}
									onChange={(e) => handleInputChange('description', e.target.value)}
									className="min-h-[150px]"
									maxLength={2000}
								/>
								<p className="text-xs text-muted-foreground">
									{formData.description.length}/2000 characters
								</p>
							</div>

							{/* File Upload */}
							<div className="space-y-2">
								<Label>Supporting Documents (Optional)</Label>
								<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
									<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<p className="text-lg font-medium mb-2">Upload supporting files</p>
									<p className="text-sm text-muted-foreground mb-4">
										PDF, DOC, PPT, or images (Max 10MB)
									</p>
									<input
										type="file"
										accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
										onChange={(e) => {
											const file = e.target.files?.[0]
											if (file) {
												if (file.size > 10 * 1024 * 1024) {
													toast.error("File size must be less than 10MB")
													return
												}
												handleFileUpload(file)
											}
										}}
										className="hidden"
										id="file-upload"
									/>
									<Button
										variant="outline"
										onClick={() => document.getElementById('file-upload')?.click()}
										disabled={uploading}
									>
										{uploading ? "Uploading..." : "Choose File"}
									</Button>

									{formData.fileName && (
										<div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
											<div className="flex items-center gap-2 text-green-600">
												<FileText className="h-4 w-4" />
												<span className="text-sm">{formData.fileName}</span>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* External Link */}
							<div className="space-y-2">
								<Label htmlFor="linkUrl">External Link (Optional)</Label>
								<div className="flex gap-2">
									<Link2 className="h-4 w-4 mt-3 text-muted-foreground" />
									<Input
										id="linkUrl"
										placeholder="https://example.com/your-prototype"
										value={formData.linkUrl || ""}
										onChange={(e) => handleInputChange('linkUrl', e.target.value)}
										type="url"
									/>
								</div>
								<p className="text-xs text-muted-foreground">
									Link to prototype, demo, or additional resources
								</p>
							</div>

							<div className="flex justify-end">
								<Button
									onClick={() => setStep(2)}
									disabled={!formData.title.trim() || !formData.description.trim() || !formData.categoryId}
								>
									Next: Validation Settings
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 2: Validation Settings */}
				{step === 2 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Validation Settings
							</CardTitle>
							<CardDescription>
								Configure how you want validators to review your idea
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Validator Counts */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="normalCount">Quick Validators</Label>
									<Input
										id="normalCount"
										type="number"
										min="100"
										max="1000"
										step="50"
										value={formData.normalValidatorCount}
										onChange={(e) => handleInputChange('normalValidatorCount', parseInt(e.target.value))}
									/>
									<p className="text-xs text-muted-foreground">
										Simple yes/no/neutral votes with short comments
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="detailedCount">Detailed Validators</Label>
									<Input
										id="detailedCount"
										type="number"
										min="50"
										max="500"
										step="25"
										value={formData.detailedValidatorCount}
										onChange={(e) => handleInputChange('detailedValidatorCount', parseInt(e.target.value))}
									/>
									<p className="text-xs text-muted-foreground">
										In-depth feedback with ratings and detailed analysis
									</p>
								</div>
							</div>

							{/* Rewards */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="normalReward">Quick Validation Reward</Label>
									<div className="flex items-center gap-2">
										<span className="text-sm">₹</span>
										<Input
											id="normalReward"
											type="number"
											min="1"
											max="10"
											step="0.5"
											value={formData.normalReward}
											onChange={(e) => handleInputChange('normalReward', parseFloat(e.target.value))}
										/>
									</div>
									<p className="text-xs text-muted-foreground">
										Reward per quick validation (₹1-10)
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="detailedReward">Detailed Validation Reward</Label>
									<div className="flex items-center gap-2">
										<span className="text-sm">₹</span>
										<Input
											id="detailedReward"
											type="number"
											min="5"
											max="50"
											step="1"
											value={formData.detailedReward}
											onChange={(e) => handleInputChange('detailedReward', parseFloat(e.target.value))}
										/>
									</div>
									<p className="text-xs text-muted-foreground">
										Reward per detailed validation (₹5-50)
									</p>
								</div>
							</div>

							{/* Settings */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Label>Allow AI Feedback</Label>
										<p className="text-sm text-muted-foreground">
											Get additional insights from AI analysis
										</p>
									</div>
									<Switch
										checked={formData.allowAIFeedback}
										onCheckedChange={(checked) => handleInputChange('allowAIFeedback', checked)}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Label>Detailed Approval Required</Label>
										<p className="text-sm text-muted-foreground">
											Review and approve detailed feedback before publication
										</p>
									</div>
									<Switch
										checked={formData.detailedApprovalRequired}
										onCheckedChange={(checked) => handleInputChange('detailedApprovalRequired', checked)}
									/>
								</div>
							</div>

							{/* Expiry */}
							<div className="space-y-2">
								<Label htmlFor="expiry">Validation Period</Label>
								<Select value={formData.expiryDays.toString()} onValueChange={(value) => handleInputChange('expiryDays', parseInt(value))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="3">3 days</SelectItem>
										<SelectItem value="7">7 days (Recommended)</SelectItem>
										<SelectItem value="14">14 days</SelectItem>
										<SelectItem value="30">30 days</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									How long validators have to submit feedback
								</p>
							</div>

							<div className="flex justify-between">
								<Button variant="outline" onClick={() => setStep(1)}>
									Back
								</Button>
								<Button onClick={() => setStep(3)}>
									Next: Budget & Payment
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 3: Budget & Payment */}
				{step === 3 && (
					<div className="space-y-6">
						{/* Budget Calculator */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calculator className="h-5 w-5" />
									Budget Calculator
								</CardTitle>
								<CardDescription>
									Review your validation costs
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-3">
										<div className="flex justify-between">
											<span>Quick Validations</span>
											<span>₹{budget.normalTotal.toFixed(2)}</span>
										</div>
										<p className="text-xs text-muted-foreground">
											{formData.normalValidatorCount} × ₹{formData.normalReward}
										</p>
									</div>

									<div className="space-y-3">
										<div className="flex justify-between">
											<span>Detailed Validations</span>
											<span>₹{budget.detailedTotal.toFixed(2)}</span>
										</div>
										<p className="text-xs text-muted-foreground">
											{formData.detailedValidatorCount} × ₹{formData.detailedReward}
										</p>
									</div>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>₹{budget.subtotal.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm text-muted-foreground">
										<span>Platform Fee (10%)</span>
										<span>₹{budget.platformFee.toFixed(2)}</span>
									</div>
								</div>

								<Separator />

								<div className="flex justify-between text-lg font-semibold">
									<span>Total Cost</span>
									<span>₹{budget.total.toFixed(2)}</span>
								</div>
							</CardContent>
						</Card>

						{/* Payment */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5" />
									Payment
								</CardTitle>
								<CardDescription>
									Complete payment to publish your idea
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
									<div className="flex items-start gap-3">
										<Info className="h-5 w-5 text-blue-600 mt-0.5" />
										<div>
											<h4 className="font-medium text-blue-900 dark:text-blue-100">Payment Terms</h4>
											<ul className="text-sm text-blue-700 dark:text-blue-200 mt-2 space-y-1">
												<li>• Payment is required upfront to ensure validator rewards</li>
												<li>• Unused budget will be refunded if targets aren't met</li>
												<li>• Platform fee is non-refundable</li>
											</ul>
										</div>
									</div>
								</div>

								<div className="flex justify-between">
									<Button variant="outline" onClick={() => setStep(2)}>
										Back
									</Button>
									<Button
										onClick={handleSubmit}
										disabled={loading}
										className="flex items-center gap-2"
									>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												Creating Post...
											</>
										) : (
											<>
												<CreditCard className="h-4 w-4" />
												Pay ₹{budget.total.toFixed(2)} & Publish
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	)
}
