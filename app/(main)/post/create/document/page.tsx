'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
    Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card'
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { Upload, FileText, X, DollarSign, ArrowLeft } from 'lucide-react'
import { createDocumentPost, getCategories } from '@/actions/post.actions'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { DocumentValidationSubtype } from '@prisma/client'

const documentSubtypes = [
    { value: 'CONTRACT_REVIEW', label: 'Contract Review', description: 'Legal contracts, agreements, terms of service' },
    { value: 'RESEARCH_PAPER', label: 'Research Paper', description: 'Academic papers, studies, white papers' },
    { value: 'TECHNICAL_DOCUMENTATION', label: 'Technical Documentation', description: 'API docs, specifications, manuals' },
    { value: 'FINANCIAL_DOCUMENT', label: 'Financial Document', description: 'Reports, statements, audits' },
    { value: 'COMPLIANCE_CHECK', label: 'Compliance Check', description: 'Regulatory documents, certifications' },
    { value: 'OTHER', label: 'Other Document', description: 'Other document types for validation' }
]

interface Category {
    id: string
    name: string
    icon?: string | null
    description?: string | null
}

export default function CreateDocumentPost() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedSubtype = searchParams.get('subtype')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        subtype: selectedSubtype || '',
        normalValidatorCount: 3,
        detailedValidatorCount: 1,
        totalBudget: 100,
        normalReward: 3,
        detailedReward: 10,
        expiryDays: 7,
        specificRequirements: '',
        reviewCriteria: ''
    })

    const [documentFile, setDocumentFile] = useState<File | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const handleFileUpload = (files: FileList) => {
        if (files.length === 0) return
        
        const file = files[0] // Take only the first file for documents
        
        // Validate file type (PDF, DOC, DOCX, TXT)
        if (!file.type.includes('pdf') &&
            !file.type.includes('document') &&
            !file.type.includes('text') &&
            !file.name.endsWith('.pdf') &&
            !file.name.endsWith('.doc') &&
            !file.name.endsWith('.docx') &&
            !file.name.endsWith('.txt')) {
            toast.error(`${file.name} is not a supported document format`)
            return
        }
        
        setDocumentFile(file)
        toast.success("Document file selected successfully!")
    }

    const removeFile = () => {
        setDocumentFile(null)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.description || !formData.subtype || !formData.categoryId) {
            toast.error('Please fill in all required fields')
            return
        }

        if (!documentFile) {
            toast.error('Please upload a document')
            return
        }

        if (calculateRemainingBudget() < 0) {
            toast.error("Budget is insufficient for the validation requirements")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createDocumentPost({
                title: formData.title,
                description: formData.description,
                categoryId: formData.categoryId,
                postSubtype: formData.subtype as DocumentValidationSubtype,
                documentFile: documentFile,
                normalValidatorCount: formData.normalValidatorCount,
                detailedValidatorCount: formData.detailedValidatorCount,
                totalBudget: formData.totalBudget,
                normalReward: formData.normalReward,
                detailedReward: formData.detailedReward,
                platformFee: calculatePlatformFee(),
                allowAIFeedback: true,
                detailedApprovalRequired: false,
                enableDetailedFeedback: true,
                detailedFeedbackStructure: formData.specificRequirements,
                expiryDate: new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000).toISOString()
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
    const remainingBudget = calculateRemainingBudget()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="mr-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Document Validation</h1>
                            <p className="text-muted-foreground">Get professional feedback on your documents</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Tell us about your document validation request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter a title for your document validation"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
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
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <Label htmlFor="subtype">Document Type *</Label>
                                        <Select value={formData.subtype} onValueChange={(value) => setFormData(prev => ({ ...prev, subtype: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentSubtypes.map((subtype) => (
                                                    <SelectItem key={subtype.value} value={subtype.value}>
                                                        {subtype.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {selectedSubtypeInfo && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            {selectedSubtypeInfo.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Document Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Upload Document
                                </CardTitle>
                                <CardDescription>
                                    Upload your document for validation (PDF, DOC, DOCX, TXT)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {!documentFile ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Drag and drop your document here or click to browse
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Supports: PDF, DOC, DOCX, TXT
                                            </p>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt"
                                                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <Label htmlFor="file-upload" className="cursor-pointer">
                                                <Button variant="outline" size="sm" type="button">
                                                    Choose File
                                                </Button>
                                            </Label>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <FileText className="h-8 w-8 text-green-600" />
                                            <div className="flex-1">
                                                <p className="font-medium text-green-700 dark:text-green-300">
                                                    {documentFile.name}
                                                </p>
                                                <p className="text-sm text-green-600 dark:text-green-400">
                                                    {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeFile}
                                                type="button"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Validation Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Validation & Budget Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure how you want your document to be validated
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="normalCount">Quick Validators</Label>
                                        <Input
                                            id="normalCount"
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={formData.normalValidatorCount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, normalValidatorCount: parseInt(e.target.value) || 0 }))}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Quick reviews (₹{formData.normalReward} each)
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="detailedCount">Detailed Validators</Label>
                                        <Input
                                            id="detailedCount"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.detailedValidatorCount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, detailedValidatorCount: parseInt(e.target.value) || 0 }))}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Detailed feedback (₹{formData.detailedReward} each)
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="normalReward">Quick Review Reward (₹)</Label>
                                        <Select value={formData.normalReward.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, normalReward: parseFloat(value) }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2">₹2</SelectItem>
                                                <SelectItem value="3">₹3</SelectItem>
                                                <SelectItem value="5">₹5</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="detailedReward">Detailed Review Reward (₹)</Label>
                                        <Select value={formData.detailedReward.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, detailedReward: parseFloat(value) }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="8">₹8</SelectItem>
                                                <SelectItem value="10">₹10</SelectItem>
                                                <SelectItem value="15">₹15</SelectItem>
                                                <SelectItem value="20">₹20</SelectItem>
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
                                            <SelectItem value="3">3 Days</SelectItem>
                                            <SelectItem value="7">1 Week</SelectItem>
                                            <SelectItem value="14">2 Weeks</SelectItem>
                                            <SelectItem value="30">1 Month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Budget Breakdown */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                                    <h4 className="font-medium">Budget Breakdown</h4>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span>Quick Reviews ({formData.normalValidatorCount} × ₹{formData.normalReward})</span>
                                            <span>₹{(formData.normalValidatorCount * formData.normalReward).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Detailed Reviews ({formData.detailedValidatorCount} × ₹{formData.detailedReward})</span>
                                            <span>₹{(formData.detailedValidatorCount * formData.detailedReward).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Platform Fee (10%)</span>
                                            <span>₹{calculatePlatformFee().toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-1 flex justify-between font-medium">
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

                        {/* Additional Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Requirements</CardTitle>
                                <CardDescription>
                                    Specify any additional requirements for validators
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="specificRequirements">Specific Requirements</Label>
                                    <Textarea
                                        id="specificRequirements"
                                        placeholder="Any specific requirements or focus areas for validators"
                                        value={formData.specificRequirements}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specificRequirements: e.target.value }))}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="flex-1"
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || remainingBudget < 0 || !documentFile}
                                className="flex-1"
                            >
                                {isSubmitting ? "Creating..." : `Create Validation Post (₹${calculateTotalCost().toFixed(2)})`}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}