'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, DollarSign } from 'lucide-react'
import { createDocumentPost } from '@/actions/post.actions'
import { toast } from 'sonner'

const documentSubtypes = [
    { value: 'CONTRACT_REVIEW', label: 'Contract Review', description: 'Legal contracts, agreements, terms of service' },
    { value: 'RESEARCH_PAPER', label: 'Research Paper', description: 'Academic papers, studies, white papers' },
    { value: 'TECHNICAL_DOCUMENTATION', label: 'Technical Documentation', description: 'API docs, specifications, manuals' },
    { value: 'FINANCIAL_DOCUMENT', label: 'Financial Document', description: 'Reports, statements, audits' },
    { value: 'COMPLIANCE_CHECK', label: 'Compliance Check', description: 'Regulatory documents, certifications' },
    { value: 'OTHER', label: 'Other Document', description: 'Other document types for validation' }
]

export default function CreateDocumentPost() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedSubtype = searchParams.get('subtype')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subtype: selectedSubtype || '',
        budget: '',
        documentUrls: [] as string[],
        specificRequirements: '',
        reviewCriteria: ''
    })

    const [documentFiles, setDocumentFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFileUpload = async (files: FileList) => {
        if (files.length === 0) return

        setUploading(true)
        const uploadedUrls: string[] = []

        try {
            for (const file of Array.from(files)) {
                // Validate file type (PDF, DOC, DOCX, TXT)
                if (!file.type.includes('pdf') &&
                    !file.type.includes('document') &&
                    !file.type.includes('text') &&
                    !file.name.endsWith('.pdf') &&
                    !file.name.endsWith('.doc') &&
                    !file.name.endsWith('.docx') &&
                    !file.name.endsWith('.txt')) {
                    toast.error(`${file.name} is not a supported document format`)
                    continue
                }

                // Create FormData for upload
                const formData = new FormData()
                formData.append('file', file)

                // TODO: Replace with actual upload to Cloudinary or your storage service
                // For now, creating a mock URL
                const mockUrl = `https://example.com/documents/${Date.now()}_${file.name}`
                uploadedUrls.push(mockUrl)
            }

            setFormData(prev => ({
                ...prev,
                documentUrls: [...prev.documentUrls, ...uploadedUrls]
            }))

            setDocumentFiles(prev => [...prev, ...Array.from(files)])
            toast.success(`${uploadedUrls.length} document(s) uploaded successfully`)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload documents')
        } finally {
            setUploading(false)
        }
    }

    const removeDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documentUrls: prev.documentUrls.filter((_, i) => i !== index)
        }))
        setDocumentFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.description || !formData.subtype || !formData.budget) {
            toast.error('Please fill in all required fields')
            return
        }

        if (formData.documentUrls.length === 0) {
            toast.error('Please upload at least one document')
            return
        }

        setIsSubmitting(true)

        try {
      const result = await createDocumentPost({
        title: formData.title,
        description: formData.description,
        categoryId: '', // Will be auto-filled in the action
        postSubtype: formData.subtype as any,
        documentUrl: formData.documentUrls[0] || '',
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
                toast.success('Document validation post created successfully!')
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

    const selectedSubtypeInfo = documentSubtypes.find(sub => sub.value === formData.subtype)

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create Document Validation</h1>
                <p className="text-muted-foreground">
                    Upload documents for expert review and validation
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Document Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Document Type
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
                                    <SelectValue placeholder="Select document type for validation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {documentSubtypes.map((subtype) => (
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

                {/* Document Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => document.getElementById('document-upload')?.click()}
                        >
                            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">Upload Documents</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Drag and drop files or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB each)
                            </p>
                            <input
                                id="document-upload"
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                className="hidden"
                                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                disabled={uploading}
                            />
                        </div>

                        {/* Uploaded Documents */}
                        {documentFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label>Uploaded Documents ({documentFiles.length})</Label>
                                <div className="grid gap-2">
                                    {documentFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-6 h-6 text-blue-500" />
                                                <div>
                                                    <p className="font-medium">{file.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDocument(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                placeholder="Enter a clear title for your document validation"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what you want validated in your documents..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="mt-1 min-h-[100px]"
                            />
                        </div>

                        <div>
                            <Label htmlFor="requirements">Specific Requirements</Label>
                            <Textarea
                                id="requirements"
                                placeholder="Any specific requirements or areas of focus for the validation..."
                                value={formData.specificRequirements}
                                onChange={(e) => setFormData(prev => ({ ...prev, specificRequirements: e.target.value }))}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="criteria">Review Criteria</Label>
                            <Textarea
                                id="criteria"
                                placeholder="What criteria should validators use to assess your documents?"
                                value={formData.reviewCriteria}
                                onChange={(e) => setFormData(prev => ({ ...prev, reviewCriteria: e.target.value }))}
                                className="mt-1"
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
                        disabled={isSubmitting || uploading}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Post'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
