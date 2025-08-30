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
import { Link, ExternalLink, DollarSign, Globe } from 'lucide-react'
import { createLinkPost } from '@/actions/post.actions'
import { toast } from 'sonner'

const linkSubtypes = [
	{ value: 'WEBSITE_REVIEW', label: 'Website Review', description: 'Review websites, landing pages, apps' },
	{ value: 'UX_FEEDBACK', label: 'UX Feedback', description: 'User experience and interface feedback' },
	{ value: 'CONTENT_VALIDATION', label: 'Content Validation', description: 'Validate web content and copy' },
	{ value: 'COMPETITOR_ANALYSIS', label: 'Competitor Analysis', description: 'Compare with competitor sites' },
	{ value: 'APP_TESTING', label: 'App Testing', description: 'Test web or mobile applications' },
	{ value: 'OTHER', label: 'Other Link', description: 'Other types of link validation' }
]

export default function CreateLinkPost() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const selectedSubtype = searchParams.get('subtype')

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		subtype: selectedSubtype || '',
		budget: '',
		linkUrl: '',
		specificTasks: '',
		reviewCriteria: '',
		accessInstructions: ''
	})

	const [linkPreview, setLinkPreview] = useState<{
		title?: string
		description?: string
		image?: string
	} | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const validateUrl = (url: string) => {
		try {
			new URL(url)
			return true
		} catch {
			return false
		}
	}

	const handleUrlChange = (url: string) => {
		setFormData(prev => ({ ...prev, linkUrl: url }))

		// Simple URL preview (in a real app, you'd fetch metadata)
		if (validateUrl(url)) {
			setLinkPreview({
				title: new URL(url).hostname,
				description: `Preview of ${url}`
			})
		} else {
			setLinkPreview(null)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.title || !formData.description || !formData.subtype || !formData.budget) {
			toast.error('Please fill in all required fields')
			return
		}

		if (!formData.linkUrl) {
			toast.error('Please enter a link URL')
			return
		}

		if (!validateUrl(formData.linkUrl)) {
			toast.error('Please enter a valid URL')
			return
		}

		setIsSubmitting(true)

		try {
			const result = await createLinkPost({
				title: formData.title,
				description: formData.description,
				categoryId: '', // Will be auto-filled in the action
				postSubtype: formData.subtype as any,
				linkUrl: formData.linkUrl,
				normalValidatorCount: 3,
				detailedValidatorCount: 1,
				totalBudget: parseFloat(formData.budget),
				normalReward: parseFloat(formData.budget) * 0.6,
				detailedReward: parseFloat(formData.budget) * 0.3,
				platformFee: parseFloat(formData.budget) * 0.1,
				allowAIFeedback: true,
				detailedApprovalRequired: false,
				enableDetailedFeedback: true,
				detailedFeedbackStructure: JSON.stringify({
					specificTasks: formData.specificTasks,
					reviewCriteria: formData.reviewCriteria,
					accessInstructions: formData.accessInstructions
				}),
				expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
			})

			if (result.success) {
				toast.success('Link validation post created successfully!')
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

	const selectedSubtypeInfo = linkSubtypes.find(sub => sub.value === formData.subtype)

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Create Link Validation</h1>
				<p className="text-muted-foreground">
					Get expert feedback on websites, apps, and online content
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Link Type Selection */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Link className="w-5 h-5" />
							Link Type
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
									<SelectValue placeholder="Select link type for validation" />
								</SelectTrigger>
								<SelectContent>
									{linkSubtypes.map((subtype) => (
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

				{/* Link Input */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="w-5 h-5" />
							Link URL
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="linkUrl">URL to Validate *</Label>
							<Input
								id="linkUrl"
								type="url"
								placeholder="https://example.com"
								value={formData.linkUrl}
								onChange={(e) => handleUrlChange(e.target.value)}
								className="mt-1"
							/>
							{formData.linkUrl && !validateUrl(formData.linkUrl) && (
								<p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
							)}
						</div>

						{/* Link Preview */}
						{linkPreview && (
							<div className="border rounded-lg p-4 bg-muted/50">
								<div className="flex items-center gap-2 mb-2">
									<ExternalLink className="w-4 h-4" />
									<span className="font-medium">Link Preview</span>
								</div>
								<p className="font-medium">{linkPreview.title}</p>
								<p className="text-sm text-muted-foreground">{linkPreview.description}</p>
							</div>
						)}

						<div>
							<Label htmlFor="accessInstructions">Access Instructions</Label>
							<Textarea
								id="accessInstructions"
								placeholder="Any special instructions for accessing the link (login details, specific pages to visit, etc.)"
								value={formData.accessInstructions}
								onChange={(e) => setFormData(prev => ({ ...prev, accessInstructions: e.target.value }))}
								className="mt-1"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Validation Details */}
				<Card>
					<CardHeader>
						<CardTitle>Validation Requirements</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="specificTasks">Specific Tasks</Label>
							<Textarea
								id="specificTasks"
								placeholder="What specific tasks should validators perform? (e.g., test checkout process, review navigation, check mobile responsiveness)"
								value={formData.specificTasks}
								onChange={(e) => setFormData(prev => ({ ...prev, specificTasks: e.target.value }))}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="reviewCriteria">Review Criteria</Label>
							<Textarea
								id="reviewCriteria"
								placeholder="What criteria should validators focus on? (e.g., usability, design, functionality, performance)"
								value={formData.reviewCriteria}
								onChange={(e) => setFormData(prev => ({ ...prev, reviewCriteria: e.target.value }))}
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
								placeholder="Enter a clear title for your link validation"
								value={formData.title}
								onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="description">Description *</Label>
							<Textarea
								id="description"
								placeholder="Describe what you want validated about your link..."
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
								This amount will be split among validators who provide quality feedback
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
						disabled={isSubmitting || !validateUrl(formData.linkUrl)}
						className="min-w-[120px]"
					>
						{isSubmitting ? 'Creating...' : 'Create Post'}
					</Button>
				</div>
			</form>
		</div>
	)
}