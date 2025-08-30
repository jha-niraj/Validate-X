// Common types and interfaces
import { PostStatus } from "@prisma/client"

export interface User {
    id: string
    email: string
    name: string | null
    image: string | null
    role: "SUBMITTER" | "USER" | "ADMIN"
    onboardingCompleted: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Category {
    id: string
    name: string
    description: string | null
    icon: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Post {
    id: string
    title: string
    description: string
    type: "NORMAL" | "LINK" | "DOCUMENT" | "MEDIA" | "POLL" | "CUSTOM"
    content: string | null
    authorId: string
    author: User
    categories: Category[]
    validationCount: number
    avgRating: number | null
    status: PostStatus
    createdAt: Date
    updatedAt: Date
    validations?: Validation[]
    _count?: {
        validations: number
    }
}

// Extended interfaces for dashboard
export interface DashboardPost extends Post {
    category?: string
    totalBudget?: number
    normalReward?: number
    detailedReward?: number
    authorName?: string
}

export interface Validation {
    id: string
    rating: number
    feedback: string
    validatorId: string
    validator: User
    postId: string
    post: Post
    createdAt: Date
    updatedAt: Date
}

export interface DashboardValidation extends Validation {
    type?: string
    status?: string
    postTitle?: string
    postCategory?: string
    rewardAmount?: number
}

export interface DashboardAnalytics {
    views: number
    engagement: number
    conversionRate: number
    earningsChart?: Array<{
        date: string
        amount: number
    }>
}

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginationParams {
    page?: number
    limit?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// Form types
export interface OnboardingFormData {
    role: "SUBMITTER" | "USER" | ""
    selectedCategories: string[]
    customCategory: string
    watchedVideo: boolean
}

// Dynamic field types for custom validation
export interface DynamicField {
    id: string
    type: "text" | "number" | "boolean" | "select" | "textarea" | "radio" | "checkbox" | "rating"
    label: string
    placeholder?: string
    required: boolean
    options?: string[]
}

export interface CustomValidationData {
    fields: DynamicField[]
    responses: Record<string, string | number | boolean>
}

// Poll types
export interface PollOption {
    id: string
    text: string
    votes?: number
}

export interface PollData {
    question: string
    options: PollOption[]
    allowMultiple: boolean
}

// Spending and wallet types
export interface Transaction {
    id: string
    amount: number
    type: "DEBIT" | "CREDIT"
    description: string
    userId: string
    postId?: string
    createdAt: Date
}

export interface WalletBalance {
    id: string
    userId: string
    balance: number
    updatedAt: Date
}

// Dashboard stats
export interface DashboardStats {
    totalPosts: number
    totalValidations: number
    avgRating: number
    totalEarnings: number
    totalSpent: number
    recentActivity: Array<{
        id: string
        type: string
        description: string
        createdAt: Date
    }>
}

// File upload types
export interface UploadedFile {
    url: string
    publicId: string
    filename: string
    size: number
    type: string
}

// Review types
export interface DetailedReview {
    id: string
    rating: number
    feedback: string
    detailedFeedback?: string
    validator: User
    post: Post
    createdAt: Date
    updatedAt: Date
}

// Validation subtypes
export type CustomValidationSubtype = 
    | 'MIXED_CONTENT' 
    | 'CREATIVE_REVIEW' 
    | 'STRATEGIC_FEEDBACK' 
    | 'IDEA_VALIDATION' 
    | 'BUSINESS_REVIEW'

// Extended user interface for profile pages
export interface ProfileUser extends User {
    bio?: string | null
    location?: string | null
    website?: string | null
    walletAddress?: string | null
    skills?: string[] | null
    interests?: string[] | null
    totalValidations?: number | null
    totalIdeasSubmitted?: number | null
    reputationScore?: number | null
}

// Extended dashboard stats for profile
export interface ProfileStats extends DashboardStats {
    memberSince?: string
}
