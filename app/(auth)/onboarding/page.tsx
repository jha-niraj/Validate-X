"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
	Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
	ArrowRight, ArrowLeft, CheckCircle, Users, Lightbulb, Loader2 
} from "lucide-react"
import { completeOnboarding, checkOnboardingStatus } from "@/actions/onboarding.actions"
import { getCategories } from "@/actions/post.actions"

interface Category {
	id: string
	name: string
	description: string | null
	icon: string | null
}

// Fallback categories if database is empty
const FALLBACK_CATEGORIES = [
	{ id: "tech", name: "Technology", icon: "💻", description: "Software, Hardware, AI, Web Development" },
	{ id: "business", name: "Business", icon: "🏢", description: "Startups, Business Models, Marketing" },
	{ id: "assignments", name: "Assignments", icon: "📚", description: "Academic Projects, Research, Studies" },
	{ id: "social-impact", name: "Social Impact", icon: "❤️", description: "Non-profit, Community, Sustainability" },
	{ id: "creative", name: "Creative", icon: "🎨", description: "Design, Art, Content, Media" },
]

export default function OnboardingPage() {
	const router = useRouter()
	const [currentStep, setCurrentStep] = useState(1)
	const [isLoading, setIsLoading] = useState(false)
	const [checkingStatus, setCheckingStatus] = useState(true)
	const [categories, setCategories] = useState<Category[]>([])
	const [categoriesLoading, setCategoriesLoading] = useState(true)
	const [formData, setFormData] = useState({
		role: "" as "SUBMITTER" | "USER" | "",
		selectedCategories: [] as string[],
		customCategory: "",
		watchedVideo: false
	})

	useEffect(() => {
		checkOnboardingStatusAndRedirect()
		fetchCategories()
	}, [])

	const checkOnboardingStatusAndRedirect = async () => {
		try {
			setCheckingStatus(true)
			const result = await checkOnboardingStatus()
			
			if (!result.needsOnboarding) {
				// User has already completed onboarding, redirect to dashboard
				toast.success("You've already completed onboarding!")
				router.replace('/dashboard')
				return
			}
		} catch (error) {
			console.error("Error checking onboarding status:", error)
		} finally {
			setCheckingStatus(false)
		}
	}

	const fetchCategories = async () => {
		try {
			setCategoriesLoading(true)
			const result = await getCategories()

			if (result.success && result.categories && result.categories.length > 0) {
				setCategories(result.categories)
			} else {
				// Use fallback categories if none exist in database
				setCategories(FALLBACK_CATEGORIES as Category[])
			}
		} catch (error) {
			console.error("Error fetching categories:", error)
			setCategories(FALLBACK_CATEGORIES as Category[])
			toast.error("Using default categories due to loading error")
		} finally {
			setCategoriesLoading(false)
		}
	}

	const handleRoleSelection = (role: "SUBMITTER" | "USER") => {
		setFormData(prev => ({ ...prev, role: role }))
	}

	const handleCategoryToggle = (categoryId: string) => {
		setFormData(prev => ({
			...prev,
			selectedCategories: prev.selectedCategories.includes(categoryId)
				? prev.selectedCategories.filter(id => id !== categoryId)
				: [...prev.selectedCategories, categoryId]
		}))
	}

	const handleNext = () => {
		if (currentStep === 1 && !formData.role) {
			toast.error("Please select a role to continue")
			return
		}
		if (currentStep === 2 && formData.selectedCategories.length === 0) {
			toast.error("Please select at least one category")
			return
		}
		setCurrentStep(prev => prev + 1)
	}

	const handlePrevious = () => {
		setCurrentStep(prev => prev - 1)
	}

	const handleCompleteOnboarding = async () => {
		if (formData.selectedCategories.length === 0) {
			toast.error("Please select at least one category")
			return
		}

		setIsLoading(true)
		try {
			const result = await completeOnboarding({
				role: formData.role as "SUBMITTER" | "USER",
				categories: formData.selectedCategories,
				customCategory: formData.customCategory
			})

			if (result.success) {
				toast.success("Welcome to ValidateX!")
				if(result?.role === "SUBMITTER") {
					router.push("/dashboard?createPost=true");
				} else if(result.role === "USER") {
					router.push("/post");
				}
			} else {
				toast.error(result.error || "Failed to complete onboarding")
			}
		} catch (error) {
			console.error("Onboarding error:", error)
			toast.error("Something went wrong. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	const renderStep1 = () => (
		<Card className="max-w-7xl mx-auto">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold">Choose Your Role</CardTitle>
				<CardDescription>
					How would you like to participate in ValidateX?
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div
						className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${formData.role === "SUBMITTER" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-200"
							}`}
						onClick={() => handleRoleSelection("SUBMITTER")}
					>
						<div className="flex items-start gap-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
								<Lightbulb className="h-6 w-6 text-blue-600" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold mb-2">Submit Ideas</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Submit ideas for feedback (e.g., projects, pitches, assignments)
								</p>
								<div className="flex items-center gap-2 mt-3">
									<Badge variant="outline">Idea Creator</Badge>
									<Badge variant="outline">Project Owner</Badge>
								</div>
							</div>
							{
								formData.role === "SUBMITTER" && (
									<CheckCircle className="h-6 w-6 text-blue-600" />
								)
							}
						</div>
					</div>
					<div
						className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${formData.role === "USER" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-gray-200"
							}`}
						onClick={() => handleRoleSelection("USER")}
					>
						<div className="flex items-start gap-4">
							<div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold mb-2">Validate Ideas</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Earn rewards by reviewing and providing feedback on ideas
								</p>
								<div className="flex items-center gap-2 mt-3">
									<Badge variant="outline">Expert Reviewer</Badge>
									<Badge variant="outline">Reward Earner</Badge>
								</div>
							</div>
							{
								formData.role === "USER" && (
									<CheckCircle className="h-6 w-6 text-green-600" />
								)
							}
						</div>
					</div>
				</div>
				<div className="pt-4 text-center">
					<Button
						onClick={handleNext}
						className="w-fit mx-auto"
						size="lg"
						disabled={!formData.role}
					>
						Continue <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	)

	const renderStep2 = () => (
		<Card className="w-full max-w-7xl mx-auto">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold">Select Your Interests</CardTitle>
				<CardDescription>
					Choose categories that match your interests to get personalized content
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{
					categoriesLoading ? (
						<div className="text-center py-8">
							<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
							<p className="text-muted-foreground">Loading categories...</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{
								categories.map((category) => {
									const isSelected = formData.selectedCategories.includes(category.id)

									return (
										<div
											key={category.id}
											className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-200"
												}`}
											onClick={() => handleCategoryToggle(category.id)}
										>
											<div className="flex items-start gap-3">
												<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
													{
														category.icon ? (
															<span className="text-lg">{category.icon}</span>
														) : (
															<Lightbulb className="h-5 w-5" />
														)
													}
												</div>
												<div className="flex-1">
													<h4 className="font-semibold mb-1">{category.name}</h4>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{category.description || "No description available"}
													</p>
												</div>
												{
													isSelected && (
														<CheckCircle className="h-5 w-5 text-blue-600" />
													)
												}
											</div>
										</div>
									)
								})
							}
						</div>
					)
				}
				<div className="space-y-2">
					<Label htmlFor="customCategory">Custom Category (Optional)</Label>
					<Input
						id="customCategory"
						placeholder="e.g., AI Research, Climate Tech, EdTech"
						value={formData.customCategory}
						onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
					/>
				</div>
				<div className="flex gap-3 pt-4">
					<Button variant="outline" onClick={handlePrevious} className="flex-1">
						<ArrowLeft className="mr-2 h-4 w-4" /> Previous
					</Button>
					<Button
						onClick={handleNext}
						className="flex-1"
						disabled={formData.selectedCategories.length === 0}
					>
						Continue <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	)

	const renderStep3 = () => (
		<Card className="w-full max-w-7xl mx-auto">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold">You&apos;re All Set!</CardTitle>
				<CardDescription>
					Review your selections and complete your onboarding
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div>
						<h4 className="font-semibold mb-2">Your Role:</h4>
						<Badge variant="outline" className="text-base px-3 py-1">
							{formData.role === "SUBMITTER" && "Idea Submitter"}
							{formData.role === "USER" && "Idea Validator"}
						</Badge>
					</div>
					<div>
						<h4 className="font-semibold mb-2">Selected Categories:</h4>
						<div className="flex flex-wrap gap-2">
							{
								formData.selectedCategories.map(categoryId => {
									const category = categories.find(c => c.id === categoryId)
									return (
										<Badge key={categoryId} variant="secondary">
											{category?.name || categoryId}
										</Badge>
									)
								})
							}
							{
								formData.customCategory && (
									<Badge variant="secondary">{formData.customCategory}</Badge>
								)
							}
						</div>
					</div>
				</div>
				<div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
					<h4 className="font-semibold mb-2">What happens next?</h4>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{formData.role === "USER" && "You'll be taken to the ValidateHub where you can start reviewing ideas and earning rewards."}
						{formData.role === "SUBMITTER" && "You'll be taken to your dashboard where you can create your first post."}
					</p>
				</div>
				<div className="flex gap-3 pt-4">
					<Button variant="outline" onClick={handlePrevious} className="flex-1">
						<ArrowLeft className="mr-2 h-4 w-4" /> Previous
					</Button>
					<Button
						onClick={handleCompleteOnboarding}
						className="flex-1"
						disabled={isLoading}
					>
						{
							isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Setting up...
								</>
							) : (
								<>
									Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
								</>
							)
						}
					</Button>
				</div>
			</CardContent>
		</Card>
	)

	// Show loading screen while checking onboarding status
	if (checkingStatus) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-lg text-gray-600 dark:text-gray-400">Checking your account status...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 flex items-center justify-center p-4 py-24 md:py-0">
			<div className="w-full max-w-4xl">
				<div className="mb-4">
					<div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
						{
							[1, 2, 3, 4].map((step) => (
								<div key={step} className="flex items-center">
									<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
										? "bg-blue-600 text-white"
										: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
										}`}>
										{step}
									</div>
									{
										step < 4 && (
											<div className={`w-12 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
												}`} />
										)
									}
								</div>
							))
						}
					</div>
					<p className="text-center text-sm text-gray-600 dark:text-gray-400">
						Step {currentStep} of 4
					</p>
				</div>
			</div>
			<div className="max-w-7xl mx-auto">
				{currentStep === 1 && renderStep1()}
				{currentStep === 2 && renderStep2()}
				{currentStep === 3 && renderStep3()}
			</div>
		</div>
	)
}