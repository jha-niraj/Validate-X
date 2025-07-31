'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { ValidationType, ValidationStatus } from "@prisma/client"
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
