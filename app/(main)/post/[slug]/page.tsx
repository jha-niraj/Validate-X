"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { getPostDetails } from "@/actions/post.actions"
import { PostType } from "@prisma/client"

// Import type-specific validation components
import MediaValidationComponent from "./_components/MediaValidationComponent"
import DocumentValidationComponent from "./_components/DocumentValidationComponent"
import PollValidationComponent from "./_components/PollValidationComponent"
import LinkValidationComponent from "./_components/LinkValidationComponent"
import CustomValidationComponent from "./_components/CustomValidationComponent"

interface PostDetails {
	id: string
	title: string
	description: string
	status: string
	type: PostType
	mediaSubtype?: string
	documentSubtype?: string
	pollSubtype?: string
	linkSubtype?: string
	customSubtype?: string
	category: {
		name: string
		icon?: string | null
	}
	author: {
		name: string
		image?: string | null
	}
	createdAt: string
	expiryDate: string
	totalBudget: number
	normalValidatorCount: number
	detailedValidatorCount: number
	currentNormalCount: number
	currentDetailedCount: number
	normalReward: number
	detailedReward: number
	fileUrl?: string
	fileName?: string
	fileType?: string
	linkUrl?: string
	pollOptions?: string[]
	customInstructions?: string
	mediaUrls?: string[]
	validations: {
		normal: Array<{
			id: string
			vote: string
			comment?: string
			validator: {
				name: string
				image?: string | null
			}
			createdAt: string
		}>
		detailed: Array<{
			id: string
			feedback: string
			rating: number
			status: string
			validator: {
				name: string
				image?: string | null
			}
			createdAt: string
		}>
	}
}

export default function PostDetailsPage() {
	const { slug } = useParams()
	const router = useRouter()
	const [post, setPost] = useState<PostDetails | null>(null)
	const [loading, setLoading] = useState(true)

	const loadPostDetails = useCallback(async () => {
		try {
			setLoading(true)
			const result = await getPostDetails(slug as string)
			
			if (result.success && result.post) {
				setPost(result.post as PostDetails)
			} else {
				toast.error(result.error || "Failed to load post details")
				router.push('/dashboard')
			}
		} catch (error) {
			console.error("Error loading post details:", error)
			toast.error("Failed to load post details")
			router.push('/dashboard')
		} finally {
			setLoading(false)
		}
	}, [router, slug]);

	useEffect(() => {
		loadPostDetails()
	}, [slug, loadPostDetails])

	if (loading) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading post details...</p>
				</div>
			</div>
		)
	}

	if (!post) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
				<Card className="p-8 text-center max-w-md">
					<CardContent>
						<h2 className="text-xl font-semibold mb-2">Post not found</h2>
						<p className="text-muted-foreground mb-4">The post you&apos;re looking for doesn&apos;t exist.</p>
						<Button onClick={() => router.back()}>Go Back</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Render type-specific validation component
	const renderValidationComponent = () => {
		switch (post.type) {
			case PostType.MEDIA_VALIDATION:
				return <MediaValidationComponent post={post} onUpdate={loadPostDetails} />
			case PostType.DOCUMENT_VALIDATION:
				return <DocumentValidationComponent post={post} onUpdate={loadPostDetails} />
			case PostType.POLL_VALIDATION:
				return <PollValidationComponent post={post} onUpdate={loadPostDetails} />
			case PostType.LINK_VALIDATION:
				return <LinkValidationComponent post={post} onUpdate={loadPostDetails} />
			case PostType.CUSTOM_VALIDATION:
				return <CustomValidationComponent post={post} onUpdate={loadPostDetails} />
			default:
				return (
					<div className="text-center py-8">
						<p className="text-muted-foreground">Unknown post type</p>
					</div>
				)
		}
	}

	return (
		<div className="min-h-screen bg-white dark:bg-neutral-900">
			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Button>
				</div>

				{/* Type-specific validation component */}
				{renderValidationComponent()}
			</div>
		</div>
	)
}
