'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { PostStatus, ValidationType, ValidationStatus } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

interface CreatePostData {
	title: string
	description: string
	categoryId: string
	fileUrl?: string
	fileName?: string
	fileType?: string
	linkUrl?: string
	normalValidatorCount: number
	detailedValidatorCount: number
	totalBudget: number
	normalReward: number
	detailedReward: number
	platformFee: number
	allowAIFeedback: boolean
	detailedApprovalRequired: boolean
	enableDetailedFeedback: boolean
	detailedFeedbackStructure?: string
	expiryDate: string
	file?: File | null
}

export async function createPost(data: CreatePostData) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Check if user has sufficient balance
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { availableBalance: true }
		})

		if (!user) {
			return { success: false, error: "User not found" }
		}

		if (user.availableBalance.toNumber() < data.totalBudget) {
			return { success: false, error: "Insufficient balance" }
		}

		const expiryDate = new Date(data.expiryDate)

		const post = await prisma.post.create({
			data: {
				title: data.title,
				description: data.description,
				categoryId: data.categoryId,
				authorId: session.user.id,
				fileUrl: data.fileUrl,
				fileName: data.fileName,
				fileType: data.fileType,
				linkUrl: data.linkUrl,
				normalValidatorCount: data.normalValidatorCount,
				detailedValidatorCount: data.detailedValidatorCount,
				totalBudget: new Decimal(data.totalBudget),
				normalReward: new Decimal(data.normalReward),
				detailedReward: new Decimal(data.detailedReward),
				platformFee: new Decimal(data.platformFee),
				allowAIFeedback: data.allowAIFeedback,
				detailedApprovalRequired: data.detailedApprovalRequired,
				enableDetailedFeedback: data.enableDetailedFeedback,
				detailedFeedbackStructure: data.detailedFeedbackStructure,
				expiryDate,
				status: PostStatus.OPEN
			},
			include: {
				category: true,
				author: {
					select: {
						name: true,
						image: true
					}
				}
			}
		})

		// Deduct from user's available balance
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				availableBalance: { decrement: data.totalBudget }
			}
		})

		// Create payment transaction record
		await prisma.transaction.create({
			data: {
				userId: session.user.id,
				amount: new Decimal(-data.totalBudget),
				type: "POST_PAYMENT",
				description: `Payment for post: ${data.title}`,
				status: "COMPLETED"
			}
		})

		// Update user stats
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				totalIdeasSubmitted: {
					increment: 1
				}
			}
		})

		revalidatePath('/dashboard')
		revalidatePath('/validatehub')

		return { success: true, post }
	} catch (error) {
		console.error("Error creating post:", error)
		return { success: false, error: "Failed to create post" }
	}
}

export async function getUserPosts(userId?: string) {
	try {
		const session = await auth()
		const targetUserId = userId || session?.user?.id

		if (!targetUserId) {
			return { success: false, error: "User not found" }
		}

		const posts = await prisma.post.findMany({
			where: {
				authorId: targetUserId
			},
			include: {
				category: true,
				validations: {
					include: {
						validator: {
							select: {
								name: true,
								image: true
							}
						}
					}
				},
				_count: {
					select: {
						validations: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return { success: true, posts }
	} catch (error) {
		console.error("Error fetching user posts:", error)
		return { success: false, error: "Failed to fetch posts" }
	}
}

export async function getPostsForValidation(categoryIds?: string[]) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		const whereClause: any = {
			status: PostStatus.OPEN,
			expiryDate: {
				gt: new Date()
			},
			authorId: {
				not: session.user.id // Don't show user's own posts
			},
			validations: {
				none: {
					validatorId: session.user.id // Don't show already validated posts
				}
			}
		}

		if (categoryIds && categoryIds.length > 0) {
			whereClause.categoryId = {
				in: categoryIds
			}
		}

		const posts = await prisma.post.findMany({
			where: whereClause,
			include: {
				category: true,
				author: {
					select: {
						name: true,
						image: true,
						reputationScore: true
					}
				},
				_count: {
					select: {
						validations: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: 50 // Limit for performance
		})

		// Convert Decimal fields to numbers for client serialization
		const serializedPosts = posts.map(post => ({
			...post,
			totalBudget: post.totalBudget.toNumber(),
			normalReward: post.normalReward.toNumber(),
			detailedReward: post.detailedReward.toNumber(),
			platformFee: post.platformFee.toNumber(),
			expiryDate: post.expiryDate.toISOString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString()
		}))

		return { success: true, posts: serializedPosts }
	} catch (error) {
		console.error("Error fetching posts for validation:", error)
		return { success: false, error: "Failed to fetch posts" }
	}
}

export async function getPostById(postId: string) {
	try {
		const post = await prisma.post.findUnique({
			where: {
				id: postId
			},
			include: {
				category: true,
				author: {
					select: {
						id: true,
						name: true,
						image: true,
						reputationScore: true
					}
				},
				validations: {
					include: {
						validator: {
							select: {
								name: true,
								image: true,
								reputationScore: true
							}
						}
					},
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found" }
		}

		// Convert Decimal fields to numbers for client serialization
		const serializedPost = {
			...post,
			totalBudget: post.totalBudget.toNumber(),
			normalReward: post.normalReward.toNumber(),
			detailedReward: post.detailedReward.toNumber(),
			platformFee: post.platformFee.toNumber(),
			expiryDate: post.expiryDate.toISOString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
			validations: post.validations.map(validation => ({
				...validation,
				rewardAmount: validation.rewardAmount.toNumber(),
				createdAt: validation.createdAt.toISOString(),
				updatedAt: validation.updatedAt.toISOString()
			}))
		}

		return { success: true, post: serializedPost }
	} catch (error) {
		console.error("Error fetching post:", error)
		return { success: false, error: "Failed to fetch post" }
	}
}

export async function updatePostStatus(postId: string, status: PostStatus) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Verify user owns the post
		const post = await prisma.post.findUnique({
			where: {
				id: postId,
				authorId: session.user.id
			}
		})

		if (!post) {
			return { success: false, error: "Post not found or unauthorized" }
		}

		const updatedPost = await prisma.post.update({
			where: {
				id: postId
			},
			data: {
				status
			}
		})

		revalidatePath('/dashboard')

		return { success: true, post: updatedPost }
	} catch (error) {
		console.error("Error updating post status:", error)
		return { success: false, error: "Failed to update post status" }
	}
}

export async function getCategories() {
	try {
		let categories = await prisma.category.findMany({
			where: {
				isActive: true
			},
			orderBy: {
				name: 'asc'
			}
		})

		// If no categories exist, seed the default ones
		if (categories.length === 0) {
			const DEFAULT_CATEGORIES = [
				{ name: "Technology", icon: "💻", description: "Software, Hardware, AI, Web Development" },
				{ name: "Business", icon: "🏢", description: "Startups, Business Models, Marketing" },
				{ name: "Assignments", icon: "📚", description: "Academic Projects, Research, Studies" },
				{ name: "Social Impact", icon: "❤️", description: "Non-profit, Community, Sustainability" },
				{ name: "Creative", icon: "🎨", description: "Design, Art, Content, Media" },
			]

			await prisma.category.createMany({
				data: DEFAULT_CATEGORIES.map(category => ({
					name: category.name,
					description: category.description,
					icon: category.icon,
					isActive: true
				})),
				skipDuplicates: true
			})

			// Fetch the newly created categories
			categories = await prisma.category.findMany({
				where: {
					isActive: true
				},
				orderBy: {
					name: 'asc'
				}
			})
		}

		return { success: true, categories }
	} catch (error) {
		console.error("Error fetching categories:", error)
		return { success: false, error: "Failed to fetch categories" }
	}
}

export async function getPostDetails(postId: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				category: {
					select: { name: true, icon: true }
				},
				author: {
					select: { name: true, image: true }
				},
				validations: {
					include: {
						validator: {
							select: { name: true, image: true }
						}
					},
					orderBy: { createdAt: 'desc' }
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found" }
		}

		// Check if user is the author
		if (post.authorId !== session.user.id) {
			return { success: false, error: "Access denied" }
		}

		// Transform the data for frontend
		const transformedPost = {
			...post,
			category: {
				...post.category,
				icon: post.category.icon || undefined
			},
			author: {
				...post.author,
				image: post.author.image || undefined
			},
			createdAt: post.createdAt.toISOString(),
			expiryDate: post.expiryDate.toISOString(),
			fileUrl: post.fileUrl || undefined,
			fileName: post.fileName || undefined,
			linkUrl: post.linkUrl || undefined,
			totalBudget: Number(post.totalBudget),
			normalReward: Number(post.normalReward),
			detailedReward: Number(post.detailedReward),
			validations: {
				normal: post.validations
					.filter(v => v.type === ValidationType.NORMAL)
					.map(v => ({
						id: v.id,
						vote: v.vote,
						comment: v.shortComment,
						validator: {
							...v.validator,
							image: v.validator.image || undefined
						},
						createdAt: v.createdAt.toISOString()
					})),
				detailed: post.validations
					.filter(v => v.type === ValidationType.DETAILED)
					.map(v => ({
						id: v.id,
						feedback: v.detailedFeedback || '',
						rating: v.rating || 0,
						status: v.status,
						validator: {
							...v.validator,
							image: v.validator.image || undefined
						},
						createdAt: v.createdAt.toISOString(),
						isOriginal: v.isOriginal || false
					}))
			}
		}

		return { success: true, post: transformedPost }
	} catch (error) {
		console.error('Error fetching post details:', error)
		return { success: false, error: "Failed to fetch post details" }
	}
}

export async function getDetailedValidations(postId: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { 
				id: true, 
				title: true, 
				description: true, 
				authorId: true 
			}
		})

		if (!post) {
			return { success: false, error: "Post not found" }
		}

		// Check if user is the author
		if (post.authorId !== session.user.id) {
			return { success: false, error: "Access denied" }
		}

		const validations = await prisma.validation.findMany({
			where: {
				postId: postId,
				type: ValidationType.DETAILED,
				status: ValidationStatus.PENDING
			},
			include: {
				validator: {
					select: { 
						name: true, 
						image: true,
						reputationScore: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		const transformedValidations = validations.map(v => ({
			id: v.id,
			feedback: v.detailedFeedback || '',
			rating: v.rating || 0,
			status: v.status,
			validator: {
				...v.validator,
				image: v.validator.image || undefined,
				reputationScore: Number(v.validator.reputationScore)
			},
			createdAt: v.createdAt.toISOString(),
			isOriginal: v.isOriginal || false,
			originalityScore: v.isOriginal ? 0.8 + Math.random() * 0.2 : 0.5 + Math.random() * 0.3
		}))

		return { 
			success: true, 
			validations: transformedValidations,
			postInfo: {
				id: post.id,
				title: post.title,
				description: post.description
			}
		}
	} catch (error) {
		console.error('Error fetching detailed validations:', error)
		return { success: false, error: "Failed to fetch validations" }
	}
}
