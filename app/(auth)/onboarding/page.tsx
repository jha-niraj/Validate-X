"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowRight, ArrowLeft, CheckCircle, Users, Lightbulb, Play, SkipForward, Loader2 } from "lucide-react"
import { completeOnboarding, redirectAfterOnboarding } from "@/actions/onboarding.actions"
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
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [formData, setFormData] = useState({
        userRole: "" as "SUBMITTER" | "VALIDATOR" | "BOTH" | "",
        selectedCategories: [] as string[],
        customCategory: "",
        watchedVideo: false
    })

    useEffect(() => {
        fetchCategories()
    }, [])

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

    const handleRoleSelection = (role: "SUBMITTER" | "VALIDATOR" | "BOTH") => {
        setFormData(prev => ({ ...prev, userRole: role }))
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
        if (currentStep === 1 && !formData.userRole) {
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

    const handleSkipVideo = () => {
        setCurrentStep(4)
    }

    const handleCompleteOnboarding = async () => {
        if (formData.selectedCategories.length === 0) {
            toast.error("Please select at least one category")
            return
        }

        setIsLoading(true)
        try {
            const result = await completeOnboarding({
                userRole: formData.userRole as "SUBMITTER" | "VALIDATOR" | "BOTH",
                categories: formData.selectedCategories,
                customCategory: formData.customCategory
            })

            if (result.success) {
                toast.success("Welcome to ValidateX!")
                // Redirect based on role
                await redirectAfterOnboarding(formData.userRole)
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
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Choose Your Role</CardTitle>
                <CardDescription>
                    How would you like to participate in ValidateX?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div 
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                        formData.userRole === "SUBMITTER" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-200"
                    }`}
                    onClick={() => handleRoleSelection("SUBMITTER")}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Lightbulb className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Submit Ideas (Sam)</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Submit ideas for feedback (e.g., projects, pitches, assignments)
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                                <Badge variant="outline">Idea Creator</Badge>
                                <Badge variant="outline">Project Owner</Badge>
                            </div>
                        </div>
                        {formData.userRole === "SUBMITTER" && (
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                        )}
                    </div>
                </div>

                <div 
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                        formData.userRole === "VALIDATOR" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-gray-200"
                    }`}
                    onClick={() => handleRoleSelection("VALIDATOR")}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Validate Ideas (Elina)</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Earn rewards by reviewing and providing feedback on ideas
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                                <Badge variant="outline">Expert Reviewer</Badge>
                                <Badge variant="outline">Reward Earner</Badge>
                            </div>
                        </div>
                        {formData.userRole === "VALIDATOR" && (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        )}
                    </div>
                </div>

                <div 
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                        formData.userRole === "BOTH" ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "border-gray-200"
                    }`}
                    onClick={() => handleRoleSelection("BOTH")}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <div className="flex items-center gap-1">
                                <Lightbulb className="h-4 w-4 text-purple-600" />
                                <Users className="h-4 w-4 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Both Submit & Validate</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Get the full ValidateX experience - submit your ideas and help validate others
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                                <Badge variant="outline">Complete Experience</Badge>
                                <Badge variant="outline">Community Member</Badge>
                            </div>
                        </div>
                        {formData.userRole === "BOTH" && (
                            <CheckCircle className="h-6 w-6 text-purple-600" />
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <Button 
                        onClick={handleNext} 
                        className="w-full" 
                        size="lg"
                        disabled={!formData.userRole}
                    >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const renderStep2 = () => (
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Select Your Interests</CardTitle>
                <CardDescription>
                    Choose categories that match your interests to get personalized content
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {categoriesLoading ? (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading categories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((category) => {
                            const isSelected = formData.selectedCategories.includes(category.id)
                            
                            return (
                                <div 
                                    key={category.id}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                        isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-200"
                                    }`}
                                    onClick={() => handleCategoryToggle(category.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                            {category.icon ? (
                                                <span className="text-lg">{category.icon}</span>
                                            ) : (
                                                <Lightbulb className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-1">{category.name}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {category.description || "No description available"}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

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
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">How ValidateX Works</CardTitle>
                <CardDescription>
                    Watch this quick 1-minute video to understand the platform
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="p-4 bg-white/10 rounded-full mb-4 mx-auto w-fit">
                            <Play className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-white mb-4">Video: How ValidateX Works</p>
                        <p className="text-white/70 text-sm">Click to watch the introduction video</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrevious} className="flex-1">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button variant="outline" onClick={handleSkipVideo} className="flex-1">
                        <SkipForward className="mr-2 h-4 w-4" /> Skip Video
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const renderStep4 = () => (
        <Card className="w-full max-w-2xl">
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
                            {formData.userRole === "SUBMITTER" && "Idea Submitter (Sam)"}
                            {formData.userRole === "VALIDATOR" && "Idea Validator (Elina)"}
                            {formData.userRole === "BOTH" && "Both Submit & Validate"}
                        </Badge>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-2">Selected Categories:</h4>
                        <div className="flex flex-wrap gap-2">
                            {formData.selectedCategories.map(categoryId => {
                                const category = categories.find(c => c.id === categoryId)
                                return (
                                    <Badge key={categoryId} variant="secondary">
                                        {category?.name || categoryId}
                                    </Badge>
                                )
                            })}
                            {formData.customCategory && (
                                <Badge variant="secondary">{formData.customCategory}</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">What happens next?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.userRole === "VALIDATOR" && "You'll be taken to the ValidateHub where you can start reviewing ideas and earning rewards."}
                        {formData.userRole === "SUBMITTER" && "You'll be taken to your dashboard where you can create your first post."}
                        {formData.userRole === "BOTH" && "You'll be taken to your dashboard with access to both submission and validation features."}
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
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Setting up...
                            </>
                        ) : (
                            <>
                                Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-gradient-to-bl from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Progress indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step <= currentStep 
                                        ? "bg-blue-600 text-white" 
                                        : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}>
                                    {step}
                                </div>
                                {step < 4 && (
                                    <div className={`w-12 h-1 mx-2 ${
                                        step < currentStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Step {currentStep} of 4
                    </p>
                </div>

                <div className="flex justify-center">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                </div>
            </div>
        </div>
    )
}
