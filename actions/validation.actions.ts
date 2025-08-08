'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { ValidationType, ValidationStatus, TransactionType } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

interface CreateValidationData {
	postId: string
	type: ValidationType
	vote?: string // For normal validations: LIKE, DISLIKE, NEUTRAL
	shortComment?: string
	detailedFeedback?: string
	rating?: number // 1-5 for detailed validations
	feedbackFileUrl?: string
	feedbackFileName?: string
	isOriginal?: boolean
}

export async function createValidation(data: CreateValidationData) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Check if user already validated this post
		const existingValidation = await prisma.validation.findUnique({
			where: {
				postId_validatorId: {
					postId: data.postId,
					validatorId: session.user.id
				}
			}
		})

		if (existingValidation) {
			return { success: false, error: "You have already validated this post" }
		}

		// Get the post to check reward amounts and limits
		const post = await prisma.post.findUnique({
			where: { id: data.postId },
			include: {
				author: {
					select: { id: true }
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found" }
		}

		// Check if user is trying to validate their own post
		if (post.authorId === session.user.id) {
			return { success: false, error: "You cannot validate your own post" }
		}

		// Check if post is still open for validation
		if (post.status !== "OPEN" || post.expiryDate < new Date()) {
			return { success: false, error: "Post is no longer accepting validations" }
		}

		// Check validation limits
		const currentValidations = await prisma.validation.count({
			where: {
				postId: data.postId,
				type: data.type
			}
		})

		const limit = data.type === ValidationType.NORMAL
			? post.normalValidatorCount
			: post.detailedValidatorCount

		if (currentValidations >= limit) {
			return { success: false, error: "Validation limit reached for this type" }
		}

		// Calculate reward amount
		const rewardAmount = data.type === ValidationType.NORMAL
			? post.normalReward
			: post.detailedReward

		// Determine initial status
		const status = data.type === ValidationType.NORMAL
			? ValidationStatus.COMPLETED
			: ValidationStatus.PENDING

		// Create the validation
		const validation = await prisma.validation.create({
			data: {
				postId: data.postId,
				validatorId: session.user.id,
				type: data.type,
				vote: data.vote,
				shortComment: data.shortComment,
				detailedFeedback: data.detailedFeedback,
				rating: data.rating,
				feedbackFileUrl: data.feedbackFileUrl,
				feedbackFileName: data.feedbackFileName,
				isOriginal: data.isOriginal || false,
				rewardAmount,
				status,
				isPaid: status === ValidationStatus.COMPLETED // Auto-pay normal validations
			},
			include: {
				post: {
					select: {
						title: true,
						author: {
							select: {
								name: true
							}
						}
					}
				}
			}
		})

		// Update post validation counts
		const updateData = data.type === ValidationType.NORMAL
			? { currentNormalCount: { increment: 1 } }
			: { currentDetailedCount: { increment: 1 } }

		await prisma.post.update({
			where: { id: data.postId },
			data: updateData
		})

		// If it's a completed validation (normal), create earning transaction and update balance
		if (status === ValidationStatus.COMPLETED) {
			await prisma.transaction.create({
				data: {
					userId: session.user.id,
					amount: rewardAmount,
					type: "VALIDATION_EARNING",
					validationId: validation.id,
					description: `Validation reward for: ${validation.post.title}`,
					status: "COMPLETED"
				}
			})

			// Update user balance and stats
			await prisma.user.update({
				where: { id: session.user.id },
				data: {
					totalBalance: { increment: rewardAmount },
					availableBalance: { increment: rewardAmount },
					totalValidations: { increment: 1 },
					reputationScore: { increment: data.type === ValidationType.DETAILED ? 5 : 1 }
				}
			})
		} else {
			// For pending validations, just update stats (no payment yet)
			await prisma.user.update({
				where: { id: session.user.id },
				data: {
					totalValidations: { increment: 1 }
				}
			})
		}

		// Check if post validation goals are met
		const updatedPost = await prisma.post.findUnique({
			where: { id: data.postId },
			select: {
				currentNormalCount: true,
				currentDetailedCount: true,
				normalValidatorCount: true,
				detailedValidatorCount: true
			}
		})

		if (updatedPost &&
			updatedPost.currentNormalCount >= updatedPost.normalValidatorCount &&
			updatedPost.currentDetailedCount >= updatedPost.detailedValidatorCount) {
			await prisma.post.update({
				where: { id: data.postId },
				data: { status: "CLOSED" }
			})
		}

		revalidatePath('/validatehub')
		revalidatePath('/dashboard')

		return { success: true, validation }
	} catch (error) {
		console.error("Error creating validation:", error)
		return { success: false, error: "Failed to create validation" }
	}
}

export async function getUserValidations(userId?: string) {
	try {
		const session = await auth()
		const targetUserId = userId || session?.user?.id

		if (!targetUserId) {
			return { success: false, error: "User not found" }
		}

		const validations = await prisma.validation.findMany({
			where: {
				validatorId: targetUserId
			},
			include: {
				post: {
					select: {
						id: true,
						title: true,
						description: true,
						category: {
							select: {
								name: true,
								icon: true
							}
						},
						author: {
							select: {
								name: true,
								image: true
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return { success: true, validations }
	} catch (error) {
		console.error("Error fetching user validations:", error)
		return { success: false, error: "Failed to fetch validations" }
	}
}

export async function approveValidation(validationId: string, approvalReason?: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Get validation with post info to verify ownership
		const validation = await prisma.validation.findUnique({
			where: { id: validationId },
			include: {
				post: {
					select: {
						authorId: true,
						title: true
					}
				}
			}
		})

		if (!validation) {
			return { success: false, error: "Validation not found" }
		}

		// Check if user owns the post
		if (validation.post.authorId !== session.user.id) {
			return { success: false, error: "Unauthorized to approve this validation" }
		}

		// Update validation status
		const updatedValidation = await prisma.validation.update({
			where: { id: validationId },
			data: {
				status: ValidationStatus.APPROVED,
				approvalReason,
				isPaid: true
			}
		})

		// Create earning transaction for the validator
		await prisma.transaction.create({
			data: {
				userId: validation.validatorId,
				amount: validation.rewardAmount,
				type: "VALIDATION_EARNING",
				validationId: validation.id,
				description: `Approved validation reward for: ${validation.post.title}`,
				status: "COMPLETED"
			}
		})

		// Update validator balance and reputation
		await prisma.user.update({
			where: { id: validation.validatorId },
			data: {
				totalBalance: { increment: validation.rewardAmount },
				availableBalance: { increment: validation.rewardAmount },
				reputationScore: { increment: 5 } // Bonus for approved detailed validation
			}
		})

		revalidatePath('/dashboard')

		return { success: true, validation: updatedValidation }
	} catch (error) {
		console.error("Error approving validation:", error)
		return { success: false, error: "Failed to approve validation" }
	}
}

export async function rejectValidation(validationId: string, rejectionReason: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Get validation with post info to verify ownership
		const validation = await prisma.validation.findUnique({
			where: { id: validationId },
			include: {
				post: {
					select: {
						authorId: true,
						title: true
					}
				}
			}
		})

		if (!validation) {
			return { success: false, error: "Validation not found" }
		}

		// Check if user owns the post
		if (validation.post.authorId !== session.user.id) {
			return { success: false, error: "Unauthorized to reject this validation" }
		}

		// Update validation status
		const updatedValidation = await prisma.validation.update({
			where: { id: validationId },
			data: {
				status: ValidationStatus.REJECTED,
				approvalReason: rejectionReason
			}
		})

		// Decrease validator reputation for rejected detailed validation
		await prisma.user.update({
			where: { id: validation.validatorId },
			data: {
				reputationScore: { decrement: 2 }
			}
		})

		revalidatePath('/dashboard')

		return { success: true, validation: updatedValidation }
	} catch (error) {
		console.error("Error rejecting validation:", error)
		return { success: false, error: "Failed to reject validation" }
	}
}

export async function getPendingValidationsForApproval(userId: string) {
	try {
		const validations = await prisma.validation.findMany({
			where: {
				post: {
					authorId: userId
				},
				status: ValidationStatus.PENDING,
				type: ValidationType.DETAILED
			},
			include: {
				validator: {
					select: {
						name: true,
						image: true,
						reputationScore: true
					}
				},
				post: {
					select: {
						title: true,
						category: {
							select: {
								name: true
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return { success: true, validations }
	} catch (error) {
		console.error("Error fetching pending validations:", error)
		return { success: false, error: "Failed to fetch pending validations" }
	}
}

export async function updateValidationStatus(validationId: string, status: ValidationStatus, approvalReason?: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Get validation details to check ownership
		const validation = await prisma.validation.findUnique({
			where: { id: validationId },
			include: {
				post: {
					select: { authorId: true, title: true }
				}
			}
		})

		if (!validation) {
			return { success: false, error: "Validation not found" }
		}

		// Check if user is the post author
		if (validation.post.authorId !== session.user.id) {
			return { success: false, error: "Access denied" }
		}

		// Update validation status
		const updatedValidation = await prisma.validation.update({
			where: { id: validationId },
			data: {
				status: status,
				approvalReason: approvalReason || null,
				updatedAt: new Date()
			}
		})

		// If approved, add reward to validator's balance and mark as paid
		if (status === ValidationStatus.APPROVED && validation.type === ValidationType.DETAILED) {
			const post = await prisma.post.findUnique({
				where: { id: validation.postId },
				select: { detailedReward: true }
			})

			if (post) {
				// Update user's balance
				await prisma.user.update({
					where: { id: validation.validatorId },
					data: {
						totalBalance: {
							increment: post.detailedReward
						},
						availableBalance: {
							increment: post.detailedReward
						}
					}
				})

				// Mark validation as paid
				await prisma.validation.update({
					where: { id: validationId },
					data: { isPaid: true }
				})

				// Create transaction record
				await prisma.transaction.create({
					data: {
						userId: validation.validatorId,
						amount: post.detailedReward,
						type: TransactionType.VALIDATION_EARNING,
						description: `Detailed validation approved for post: ${validation.post.title}`,
						status: 'COMPLETED',
						validationId: validationId
					}
				})
			}
		}

		revalidatePath('/validation/[slug]/detailed-review/[reviewId]', 'page')
		revalidatePath('/validation/[slug]/details', 'page')

		return { success: true, validation: updatedValidation }
	} catch (error) {
		console.error('Error updating validation status:', error)
		return { success: false, error: "Failed to update validation status" }
	}
}

export async function getPostForDetailedValidation(postId: string) {
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
				categoryId: true,
				fileUrl: true,
				fileName: true,
				linkUrl: true,
				detailedReward: true,
				enableDetailedFeedback: true,
				detailedFeedbackStructure: true,
				detailedValidatorCount: true,
				currentDetailedCount: true,
				createdAt: true,
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true
					}
				},
				category: {
					select: {
						name: true,
						icon: true
					}
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found" }
		}

		if (!post.enableDetailedFeedback) {
			return { success: false, error: "Detailed feedback is not enabled for this post" }
		}

		// Check if user already provided detailed validation
		const existingValidation = await prisma.validation.findUnique({
			where: {
				postId_validatorId: {
					postId: post.id,
					validatorId: session.user.id
				}
			}
		})

		if (existingValidation && existingValidation.type === ValidationType.DETAILED) {
			return { success: false, error: "You have already provided detailed validation for this post" }
		}

		// Parse the detailed feedback structure
		let feedbackStructure = []
		if (post.detailedFeedbackStructure) {
			try {
				feedbackStructure = JSON.parse(post.detailedFeedbackStructure)
			} catch (error) {
				console.error('Error parsing feedback structure:', error)
			}
		}

		return {
			success: true,
			post: {
				...post,
				detailedReward: post.detailedReward?.toNumber() || 0,
				detailedValidationCount: post.currentDetailedCount,
				maxDetailedValidations: post.detailedValidatorCount,
				feedbackStructure
			}
		}
	} catch (error) {
		console.error('Error fetching post for detailed validation:', error)
		return { success: false, error: "Failed to fetch post details" }
	}
}

export async function createDetailedValidation({
	postId,
	responses,
	overallRating,
	overallComment,
	fileAttachments
}: {
	postId: string
	responses: Array<{
		questionId: string
		questionText: string
		response: string
		rating?: number
	}>
	overallRating: number
	overallComment?: string
	fileAttachments?: Array<{
		url: string
		filename: string
		type: string
	}>
}) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Check if user already validated this post
		const existingValidation = await prisma.validation.findUnique({
			where: {
				postId_validatorId: {
					postId,
					validatorId: session.user.id
				}
			}
		})

		if (existingValidation) {
			return { success: false, error: "You have already validated this post" }
		}

		// Get the post to check reward amounts and limits
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				author: {
					select: { id: true }
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found" }
		}

		if (!post.enableDetailedFeedback) {
			return { success: false, error: "Detailed feedback is not enabled for this post" }
		}

		// Check if post has reached max detailed validations
		const detailedValidationCount = await prisma.validation.count({
			where: {
				postId,
				type: ValidationType.DETAILED
			}
		})

		if (detailedValidationCount >= post.detailedValidatorCount) {
			return { success: false, error: "This post has reached the maximum number of detailed validations" }
		}

		// Cannot validate own post
		if (post.author.id === session.user.id) {
			return { success: false, error: "You cannot validate your own post" }
		}

		// Create the detailed validation
		const validation = await prisma.validation.create({
			data: {
				postId,
				validatorId: session.user.id,
				type: ValidationType.DETAILED,
				rating: overallRating,
				detailedFeedback: overallComment,
				rewardAmount: post.detailedReward || new Decimal(0),
				status: ValidationStatus.PENDING, // Detailed validations start as PENDING until approved by submitter
				detailedResponses: JSON.stringify(responses)
			}
		})

		// Note: For detailed validations, we don't credit the validator immediately
		// The reward will be credited only after the submitter approves the validation

		revalidatePath('/validatehub/[slug]', 'page')
		revalidatePath('/validation/[slug]/details', 'page')

		return { 
			success: true, 
			validation: {
				...validation,
				rewardAmount: validation.rewardAmount?.toNumber() || 0
			}
		}
	} catch (error) {
		console.error('Error creating detailed validation:', error)
		return { success: false, error: "Failed to create detailed validation" }
	}
}

export async function createNormalValidation({
	postId,
	vote,
	shortComment
}: {
	postId: string
	vote: 'LIKE' | 'DISLIKE' | 'NEUTRAL'
	shortComment?: string
}) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Check if user already validated this post
		const existingValidation = await prisma.validation.findUnique({
			where: {
				postId_validatorId: {
					postId,
					validatorId: session.user.id
				}
			}
		})

		if (existingValidation) {
			return { success: false, error: "You have already validated this post" }
		}

		// Get the post to check reward amounts and limits
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				author: {
					select: { id: true, availableBalance: true }
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found" }
		}

		// Cannot validate own post
		if (post.author.id === session.user.id) {
			return { success: false, error: "You cannot validate your own post" }
		}

		// Check if post has reached max normal validations
		const normalValidationCount = await prisma.validation.count({
			where: {
				postId,
				type: ValidationType.NORMAL
			}
		})

		if (normalValidationCount >= post.normalValidatorCount) {
			return { success: false, error: "This post has reached the maximum number of validations" }
		}

		// Check if submitter has enough balance
		if (post.author.availableBalance.toNumber() < post.normalReward.toNumber()) {
			return { success: false, error: "Submitter has insufficient balance to pay for this validation" }
		}

		// Create the validation
		const validation = await prisma.validation.create({
			data: {
				postId,
				validatorId: session.user.id,
				type: ValidationType.NORMAL,
				vote,
				shortComment,
				rewardAmount: post.normalReward,
				status: ValidationStatus.APPROVED, // Normal validations are immediately approved
				isPaid: true
			}
		})

		// Credit the validator immediately
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				availableBalance: { increment: post.normalReward },
				totalBalance: { increment: post.normalReward },
				totalValidations: { increment: 1 },
				reputationScore: { increment: 1 }
			}
		})

		// Debit the submitter
		await prisma.user.update({
			where: { id: post.author.id },
			data: {
				availableBalance: { decrement: post.normalReward }
			}
		})

		// Create transaction records
		await prisma.transaction.create({
			data: {
				userId: session.user.id,
				amount: post.normalReward,
				type: TransactionType.VALIDATION_EARNING,
				description: `Validation reward for "${post.title}"`,
				status: "COMPLETED"
			}
		})

		await prisma.transaction.create({
			data: {
				userId: post.author.id,
				amount: post.normalReward.negated(),
				type: TransactionType.POST_PAYMENT,
				description: `Payment for validation of "${post.title}"`,
				status: "COMPLETED"
			}
		})

		// Update post counts
		await prisma.post.update({
			where: { id: postId },
			data: {
				currentNormalCount: { increment: 1 }
			}
		})

		revalidatePath('/validatehub')

		return { 
			success: true, 
			validation: {
				...validation,
				rewardAmount: validation.rewardAmount.toNumber()
			},
			creditedAmount: post.normalReward.toNumber()
		}
	} catch (error) {
		console.error('Error creating normal validation:', error)
		return { success: false, error: "Failed to create validation" }
	}
}
