'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getSubmitterSpending() {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		if (session.user.role !== 'SUBMITTER') {
			return { success: false, error: "Access denied. This page is for submitters only." }
		}

		const userId = session.user.id

		// Get all posts by the submitter with spending calculations
		const posts = await prisma.post.findMany({
			where: { authorId: userId },
			include: {
				category: true,
				_count: {
					select: {
						validations: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		// Get all transactions for this user related to posts
		const transactions = await prisma.transaction.findMany({
			where: {
				userId: userId,
				type: 'POST_PAYMENT',
				postId: { not: null }
			},
			orderBy: { createdAt: 'desc' }
		})

		// Calculate total spending
		const totalSpent = transactions.reduce((sum, transaction) => 
			sum + transaction.amount.toNumber(), 0
		)

		// Calculate platform fees (assuming 10% platform fee)
		const totalPlatformFees = totalSpent * 0.1
		const totalToValidators = totalSpent * 0.9

		// Group spending by post
		const postSpending = posts.map(post => {
			const postTransactions = transactions.filter(t => t.postId === post.id)
			const totalPostSpent = postTransactions.reduce((sum, t) => 
				sum + t.amount.toNumber(), 0
			)
			
			// Calculate breakdown based on post configuration
			const normalBudget = post.normalReward.toNumber() * post.normalValidatorCount
			const detailedBudget = post.detailedReward.toNumber() * post.detailedValidatorCount
			const totalBudget = normalBudget + detailedBudget
			
			return {
				id: post.id,
				title: post.title,
				description: post.description,
				category: {
					name: post.category.name,
					icon: post.category.icon
				},
				status: post.status,
				createdAt: post.createdAt,
				validationCount: post._count.validations,
				totalSpent: totalPostSpent,
				toValidators: totalPostSpent * 0.9,
				platformFee: totalPostSpent * 0.1,
				normalBudget,
				detailedBudget,
				totalBudget,
				normalReward: post.normalReward.toNumber(),
				detailedReward: post.detailedReward.toNumber(),
				normalValidatorCount: post.normalValidatorCount,
				detailedValidatorCount: post.detailedValidatorCount,
				currentNormalCount: post.currentNormalCount,
				currentDetailedCount: post.currentDetailedCount
			}
		})

		// Calculate monthly spending trend
		const monthlySpending = transactions.reduce((acc, transaction) => {
			const month = new Date(transaction.createdAt.getFullYear(), transaction.createdAt.getMonth(), 1)
			const monthKey = month.toISOString().split('T')[0]
			
			if (!acc[monthKey]) {
				acc[monthKey] = { month: monthKey, amount: 0, count: 0 }
			}
			
			acc[monthKey].amount += transaction.amount.toNumber()
			acc[monthKey].count += 1
			
			return acc
		}, {} as Record<string, { month: string, amount: number, count: number }>)

		return {
			success: true,
			data: {
				overview: {
					totalPosts: posts.length,
					totalSpent,
					totalToValidators,
					totalPlatformFees,
					totalValidations: posts.reduce((sum, post) => sum + post._count.validations, 0),
					avgSpentPerPost: posts.length > 0 ? totalSpent / posts.length : 0
				},
				posts: postSpending,
				monthlySpending: Object.values(monthlySpending)
			}
		}
	} catch (error) {
		console.error("Error fetching submitter spending:", error)
		return { success: false, error: "Failed to fetch spending data" }
	}
}

export async function getPostSpendingDetails(postId: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Get the post with validation data
		const post = await prisma.post.findFirst({
			where: {
				id: postId,
				authorId: session.user.id
			},
			include: {
				category: true,
				validations: {
					include: {
						validator: {
							select: { 
								name: true, 
								reputationScore: true 
							}
						}
					},
					orderBy: { createdAt: 'desc' }
				},
				_count: {
					select: {
						validations: true
					}
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found or access denied" }
		}

		// Get transactions for this post
		const transactions = await prisma.transaction.findMany({
			where: {
				postId: postId,
				userId: session.user.id,
				type: 'POST_PAYMENT'
			},
			orderBy: { createdAt: 'desc' }
		})

		const totalSpent = transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0)

		// Calculate validation timeline (daily)
		const validationTimeline = post.validations.reduce((acc, validation) => {
			const date = validation.createdAt.toISOString().split('T')[0]
			if (!acc[date]) {
				acc[date] = { 
					date, 
					normalCount: 0, 
					detailedCount: 0, 
					totalRewards: 0 
				}
			}
			
			if (validation.type === 'NORMAL') {
				acc[date].normalCount += 1
			} else if (validation.type === 'DETAILED') {
				acc[date].detailedCount += 1
			}
			
			acc[date].totalRewards += validation.rewardAmount.toNumber()
			
			return acc
		}, {} as Record<string, any>)

		// Calculate spending breakdown
		const normalSpent = post.normalReward.toNumber() * post.currentNormalCount
		const detailedSpent = post.detailedReward.toNumber() * post.currentDetailedCount
		const platformFee = totalSpent * 0.1

		return {
			success: true,
			data: {
				post: {
					id: post.id,
					title: post.title,
					description: post.description,
					category: post.category.name,
					categoryIcon: post.category.icon,
					status: post.status,
					createdAt: post.createdAt,
					expiryDate: post.expiryDate
				},
				spending: {
					totalSpent,
					normalSpent,
					detailedSpent,
					platformFee,
					toValidators: totalSpent - platformFee
				},
				progress: {
					normalValidations: `${post.currentNormalCount}/${post.normalValidatorCount}`,
					detailedValidations: `${post.currentDetailedCount}/${post.detailedValidatorCount}`,
					totalValidations: post._count.validations,
					normalProgress: (post.currentNormalCount / post.normalValidatorCount) * 100,
					detailedProgress: (post.currentDetailedCount / post.detailedValidatorCount) * 100
				},
				timeline: Object.values(validationTimeline),
				validations: post.validations.map(v => ({
					id: v.id,
					type: v.type,
					vote: v.vote,
					validatorName: v.validator.name,
					validatorReputation: v.validator.reputationScore,
					rewardAmount: v.rewardAmount.toNumber(),
					createdAt: v.createdAt,
					shortComment: v.shortComment
				}))
			}
		}
	} catch (error) {
		console.error("Error fetching post spending details:", error)
		return { success: false, error: "Failed to fetch post spending details" }
	}
}
