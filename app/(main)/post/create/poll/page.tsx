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
import { Plus, X, DollarSign, BarChart3 } from 'lucide-react'
import { createPollPost } from '@/actions/post.actions'
import { toast } from 'sonner'
import { PollValidationSubtype } from '@prisma/client'

const pollSubtypes = [
    { value: 'PREFERENCE_RANKING', label: 'Preference Ranking', description: 'Rank options by preference or priority' },
    { value: 'MARKET_RESEARCH', label: 'Market Research', description: 'Consumer preferences and market insights' },
    { value: 'FEATURE_PRIORITIZATION', label: 'Feature Prioritization', description: 'Product feature ranking and feedback' },
    { value: 'USER_FEEDBACK', label: 'User Feedback', description: 'General user opinions and feedback' },
    { value: 'CONCEPT_VALIDATION', label: 'Concept Validation', description: 'Validate concepts and ideas' },
    { value: 'OTHER', label: 'Other Poll', description: 'Other types of polls and surveys' }
]

export default function CreatePollPost() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedSubtype = searchParams.get('subtype')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subtype: selectedSubtype || '',
        budget: '',
        pollQuestion: '',
        pollInstructions: '',
        allowMultipleAnswers: false,
        showResults: true
    })

    const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const addPollOption = () => {
        if (pollOptions.length < 10) {
            setPollOptions([...pollOptions, ''])
        }
    }

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index))
        }
    }

    const updatePollOption = (index: number, value: string) => {
        const updated = [...pollOptions]
        updated[index] = value
        setPollOptions(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.description || !formData.subtype || !formData.budget) {
            toast.error('Please fill in all required fields')
            return
        }

        if (!formData.pollQuestion) {
            toast.error('Please enter a poll question')
            return
        }

        const validOptions = pollOptions.filter(option => option.trim() !== '')
        if (validOptions.length < 2) {
            toast.error('Please provide at least 2 poll options')
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createPollPost({
                title: formData.title,
                description: formData.description,
                categoryId: '', // Will be auto-filled in the action
                postSubtype: formData.subtype as PollValidationSubtype,
                pollOptions: validOptions,
                pollSettings: {
                    question: formData.pollQuestion,
                    instructions: formData.pollInstructions,
                    allowMultipleAnswers: formData.allowMultipleAnswers,
                    showResults: formData.showResults
                },
                normalValidatorCount: 5,
                detailedValidatorCount: 2,
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
                toast.success('Poll validation post created successfully!')
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

    const selectedSubtypeInfo = pollSubtypes.find(sub => sub.value === formData.subtype)

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create Poll Validation</h1>
                <p className="text-muted-foreground">
                    Create polls and surveys for community feedback and insights
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Poll Type
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
                                    <SelectValue placeholder="Select poll type for validation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        pollSubtypes.map((subtype) => (
                                            <SelectItem key={subtype.value} value={subtype.value}>
                                                <div>
                                                    <div className="font-medium">{subtype.label}</div>
                                                    <div className="text-sm text-muted-foreground">{subtype.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            {
                                selectedSubtypeInfo && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {selectedSubtypeInfo.description}
                                    </p>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Poll Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="pollQuestion">Poll Question *</Label>
                            <Textarea
                                id="pollQuestion"
                                placeholder="What question do you want to ask?"
                                value={formData.pollQuestion}
                                onChange={(e) => setFormData(prev => ({ ...prev, pollQuestion: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Poll Options *</Label>
                            <div className="space-y-2 mt-2">
                                {
                                    pollOptions.map((option, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder={`Option ${index + 1}`}
                                                value={option}
                                                onChange={(e) => updatePollOption(index, e.target.value)}
                                                className="flex-1"
                                            />
                                            {
                                                pollOptions.length > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removePollOption(index)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )
                                            }
                                        </div>
                                    ))
                                }
                                {
                                    pollOptions.length < 10 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addPollOption}
                                            className="w-full"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Option
                                        </Button>
                                    )
                                }
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="pollInstructions">Poll Instructions</Label>
                            <Textarea
                                id="pollInstructions"
                                placeholder="Any specific instructions for validators..."
                                value={formData.pollInstructions}
                                onChange={(e) => setFormData(prev => ({ ...prev, pollInstructions: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Validation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter a clear title for your poll validation"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the context and purpose of your poll..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="mt-1 min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>
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