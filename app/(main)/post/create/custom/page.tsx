'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { Settings, DollarSign, Lightbulb } from 'lucide-react'
import { createCustomPost } from '@/actions/post.actions'
import { toast } from 'sonner'
import { CustomValidationSubtype } from '@prisma/client'

const customSubtypes = [
	{ value: 'MIXED_CONTENT', label: 'Mixed Content', description: 'Combination of different content types' },
	{ value: 'CREATIVE_REVIEW', label: 'Creative Review', description: 'Creative work, designs, concepts' },
	{ value: 'STRATEGIC_FEEDBACK', label: 'Strategic Feedback', description: 'Business strategy and planning' },
	{ value: 'TECHNICAL_AUDIT', label: 'Technical Audit', description: 'Technical review and assessment' },
	{ value: 'PROCESS_VALIDATION', label: 'Process Validation', description: 'Workflow and process review' },
	{ value: 'OTHER', label: 'Other Custom', description: 'Other custom validation needs' }
]

export default function CreateCustomPost() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const selectedSubtype = searchParams.get('subtype')

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		subtype: selectedSubtype || '',
		budget: '',
		customInstructions: '',
		validationCriteria: '',
		deliverables: '',
		timeline: ''
	})

	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.title || !formData.description || !formData.subtype || !formData.budget) {
			toast.error('Please fill in all required fields')
			return
		}

		if (!formData.customInstructions) {
			toast.error('Please provide custom validation instructions')
			return
		}

		setIsSubmitting(true)

		try {
			const result = await createCustomPost({
				title: formData.title,
				description: formData.description,
				categoryId: '', // Will be auto-filled in the action
				postSubtype: formData.subtype as CustomValidationSubtype,
				customInstructions: formData.customInstructions,
				customRequirements: JSON.stringify({
					validationCriteria: formData.validationCriteria,
					deliverables: formData.deliverables,
					timeline: formData.timeline
				}),
				normalValidatorCount: 3,
				detailedValidatorCount: 1,
				totalBudget: parseFloat(formData.budget),
				normalReward: parseFloat(formData.budget) * 0.6,
				detailedReward: parseFloat(formData.budget) * 0.3,
				platformFee: parseFloat(formData.budget) * 0.1,
				allowAIFeedback: true,
				detailedApprovalRequired: false,
				enableDetailedFeedback: true,
				expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
			})

			if (result.success) {
				toast.success('Custom validation post created successfully!')
				router.push('/dashboard')
			} else {
				toast.error(result.error || 'Failed to create post')
			}
		} catch (error) {
			console.error('Submit error:', error)
			toast.error('An unexpected error occurred')
		} finally {
			setIsSubmitting(false)
		}
	}

	const selectedSubtypeInfo = customSubtypes.find(sub => sub.value === formData.subtype)

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Create Custom Validation</h1>
				<p className="text-muted-foreground">
					Design your own validation process with custom instructions and criteria
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Custom Type Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="w-5 h-5" />
							Custom Type
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="subtype">Validation Type *</Label>
							<Select
								value={formData.subtype}
								onValueChange={(value) => setFormData(prev => ({ ...prev, subtype: value }))}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select custom validation type" />
								</SelectTrigger>
								<SelectContent>
									{customSubtypes.map((subtype) => (
										<SelectItem key={subtype.value} value={subtype.value}>
											<div>
												<div className="font-medium">{subtype.label}</div>
												<div className="text-sm text-muted-foreground">{subtype.description}</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{selectedSubtypeInfo && (
								<p className="text-sm text-muted-foreground mt-2">
									{selectedSubtypeInfo.description}
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Custom Instructions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Lightbulb className="w-5 h-5" />
							Validation Instructions
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="customInstructions">Custom Instructions *</Label>
							<Textarea
								id="customInstructions"
								placeholder="Provide detailed instructions for validators on what to review, how to evaluate, and what feedback to provide..."
								value={formData.customInstructions}
								onChange={(e) => setFormData(prev => ({ ...prev, customInstructions: e.target.value }))}
								className="mt-1 min-h-[120px]"
							/>
							<p className="text-sm text-muted-foreground mt-2">
								Be as specific as possible. This will guide validators on how to assess your content.
							</p>
						</div>

						<div>
							<Label htmlFor="validationCriteria">Validation Criteria</Label>
							<Textarea
								id="validationCriteria"
								placeholder="What specific criteria should validators use? (e.g., accuracy, feasibility, creativity, compliance)"
								value={formData.validationCriteria}
								onChange={(e) => setFormData(prev => ({ ...prev, validationCriteria: e.target.value }))}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="deliverables">Expected Deliverables</Label>
							<Textarea
								id="deliverables"
								placeholder="What should validators provide? (e.g., scored evaluation, detailed report, recommendations, ratings)"
								value={formData.deliverables}
								onChange={(e) => setFormData(prev => ({ ...prev, deliverables: e.target.value }))}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="timeline">Timeline Requirements</Label>
							<Textarea
								id="timeline"
								placeholder="Any specific timeline or urgency requirements for this validation?"
								value={formData.timeline}
								onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
								className="mt-1"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Post Details */}
				<Card>
					<CardHeader>
						<CardTitle>Validation Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								placeholder="Enter a clear title for your custom validation"
								value={formData.title}
								onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								placeholder="Describe your custom validation needs and context..."
								value={formData.description}
								onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
								className="mt-1 min-h-[100px]"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Budget */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="w-5 h-5" />
							Validation Budget
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div>
							<Label htmlFor="budget">Budget Amount (USD) *</Label>
							<Input
								id="budget"
								type="number"
								step="0.01"
								min="1"
								placeholder="Enter budget amount"
								value={formData.budget}
								onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
								className="mt-1"
							/>
							<p className="text-sm text-muted-foreground mt-2">
								This amount will be split among validators who provide quality feedback. Custom validations typically require higher budgets due to their specialized nature.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
					>
						Back
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						className="min-w-[120px]"
					>
						{isSubmitting ? 'Creating...' : 'Create Post'}
					</Button>
				</div>
			</form>
		</div>
	)
}