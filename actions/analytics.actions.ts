'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Decimal } from "@prisma/client/runtime/library"

export async function getSubmitterAnalytics() {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		if (session.user.role !== 'SUBMITTER') {
			return { success: false, error: "Access denied. This page is for submitters only." }
		}

		const userId = session.user.id

		// Get user's posts with validation data
		const posts = await prisma.post.findMany({
			where: { authorId: userId },
			include: {
				category: true,
				validations: {
					include: {
						validator: {
							select: { name: true, reputationScore: true }
						}
					}
				},
				_count: {
					select: {
						validations: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		// Calculate spending analytics
		const spendingData = await prisma.transaction.findMany({
			where: {
				userId: userId,
				type: 'POST_PAYMENT'
			},
			orderBy: { createdAt: 'desc' }
		})

		// Get monthly spending trend (last 6 months) using Prisma
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
		
		const monthlySpendingData = await prisma.transaction.findMany({
			where: {
				userId: userId,
				type: 'POST_PAYMENT',
				createdAt: {
					gte: sixMonthsAgo
				}
			},
			orderBy: { createdAt: 'asc' }
		})

		// Group by month
		const monthlySpending = monthlySpendingData.reduce((acc, transaction) => {
			const month = new Date(transaction.createdAt.getFullYear(), transaction.createdAt.getMonth(), 1)
			const monthKey = month.toISOString()
			
			if (!acc[monthKey]) {
				acc[monthKey] = { month: monthKey, total_amount: 0, transaction_count: 0 }
			}
			
			acc[monthKey].total_amount += transaction.amount.toNumber()
			acc[monthKey].transaction_count += 1
			
			return acc
		}, {} as Record<string, any>)

		// Get validation engagement over time (daily for last 30 days)
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

		const validationsData = await prisma.validation.findMany({
			where: {
				post: {
					authorId: userId
				},
				createdAt: {
					gte: thirtyDaysAgo
				}
			},
			include: {
				validator: {
					select: { id: true }
				}
			},
			orderBy: { createdAt: 'asc' }
		})

		// Group by date
		const dailyValidations = validationsData.reduce((acc, validation) => {
			const date = validation.createdAt.toISOString().split('T')[0]
			
			if (!acc[date]) {
				acc[date] = { date, validation_count: 0, unique_validators: new Set() }
			}
			
			acc[date].validation_count += 1
			acc[date].unique_validators.add(validation.validator.id)
			
			return acc
		}, {} as Record<string, any>)

		// Get category performance
		const categoryPerformance = await prisma.post.groupBy({
			by: ['categoryId'],
			where: { authorId: userId },
			_count: { id: true },
			_avg: { normalReward: true, detailedReward: true },
			_sum: { normalReward: true, detailedReward: true }
		})

		const categoriesWithNames = await Promise.all(
			categoryPerformance.map(async (cat) => {
				const category = await prisma.category.findUnique({
					where: { id: cat.categoryId },
					select: { name: true, icon: true }
				})
				return {
					...cat,
					categoryName: category?.name || 'Unknown',
					categoryIcon: category?.icon || '📝'
				}
			})
		)

		// Get validation quality metrics
		const validationQuality = await prisma.validation.groupBy({
			by: ['vote'],
			where: {
				post: { authorId: userId }
			},
			_count: { id: true }
		})

		// Calculate ROI and engagement metrics
		const totalSpent = spendingData.reduce((sum, transaction) => sum + transaction.amount.toNumber(), 0)
		const totalValidations = posts.reduce((sum, post) => sum + post._count.validations, 0)
		const avgValidationsPerPost = posts.length > 0 ? totalValidations / posts.length : 0
		const avgCostPerValidation = totalValidations > 0 ? totalSpent / totalValidations : 0

		// Get top performing posts
		const topPosts = posts
			.sort((a, b) => b._count.validations - a._count.validations)
			.slice(0, 5)
			.map(post => ({
				id: post.id,
				title: post.title,
				category: post.category.name,
				validationCount: post._count.validations,
				totalBudget: post.normalReward.toNumber() * post.normalValidatorCount + 
							post.detailedReward.toNumber() * post.detailedValidatorCount,
				createdAt: post.createdAt.toISOString(),
				status: post.status
			}))

		// Recent activity feed
		const recentActivity = await prisma.validation.findMany({
			where: {
				post: { authorId: userId }
			},
			include: {
				post: { select: { title: true } },
				validator: { select: { name: true } }
			},
			orderBy: { createdAt: 'desc' },
			take: 10
		})

		return {
			success: true,
			analytics: {
				// Overview metrics
				overview: {
					totalPosts: posts.length,
					totalSpent,
					totalValidations,
					avgValidationsPerPost: Math.round(avgValidationsPerPost * 100) / 100,
					avgCostPerValidation: Math.round(avgCostPerValidation * 100) / 100
				},
				// Charts data
				monthlySpending: Object.values(monthlySpending).map((item: any) => ({
					month: item.month,
					amount: item.total_amount || 0,
					transactions: item.transaction_count || 0
				})),
				dailyValidations: Object.values(dailyValidations).map((item: any) => ({
					date: item.date,
					validations: item.validation_count || 0,
					uniqueValidators: item.unique_validators?.size || 0
				})),
				categoryPerformance: categoriesWithNames.map(cat => ({
					categoryId: cat.categoryId,
					categoryName: cat.categoryName,
					categoryIcon: cat.categoryIcon,
					postCount: cat._count.id,
					avgNormalReward: cat._avg.normalReward ? cat._avg.normalReward.toNumber() : 0,
					avgDetailedReward: cat._avg.detailedReward ? cat._avg.detailedReward.toNumber() : 0,
					totalSpent: (cat._sum.normalReward?.toNumber() || 0) + (cat._sum.detailedReward?.toNumber() || 0)
				})),
				validationQuality: validationQuality.map(vq => ({
					vote: vq.vote,
					count: vq._count.id
				})),
				topPosts,
				recentActivity: recentActivity.map(activity => ({
					id: activity.id,
					postTitle: activity.post.title,
					validatorName: activity.validator.name,
					vote: activity.vote,
					type: activity.type,
					createdAt: activity.createdAt.toISOString(),
					rewardAmount: activity.rewardAmount.toNumber()
				}))
			}
		}
	} catch (error) {
		console.error("Error fetching submitter analytics:", error)
		return { success: false, error: "Failed to fetch analytics data" }
	}
}

export async function getPostAnalytics(postId: string) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Verify the post belongs to the user
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
							select: { name: true, reputationScore: true }
						}
					},
					orderBy: { createdAt: 'desc' }
				}
			}
		})

		if (!post) {
			return { success: false, error: "Post not found or access denied" }
		}

		// Get validation timeline using Prisma (group by date)
		const validations = await prisma.validation.findMany({
			where: { postId },
			orderBy: { createdAt: 'asc' },
			select: {
				createdAt: true,
				vote: true,
			}
		})

		// Group by date and calculate sentiment
		const timelineMap: Record<string, { validation_count: number, sentiment_sum: number }> = {}
		validations.forEach(v => {
			const date = v.createdAt.toISOString().split('T')[0]
			if (!timelineMap[date]) timelineMap[date] = { validation_count: 0, sentiment_sum: 0 }
			timelineMap[date].validation_count += 1
			timelineMap[date].sentiment_sum += v.vote === 'LIKE' ? 1 : v.vote === 'DISLIKE' ? -1 : 0
		})
		const validationTimeline = Object.entries(timelineMap).map(([date, data]) => ({
			date,
			validationCount: data.validation_count,
			sentimentScore: data.validation_count > 0 ? data.sentiment_sum / data.validation_count : 0
		}))

		// Get validator quality distribution
		const validatorQuality = await prisma.validation.findMany({
			where: { postId },
			include: {
				validator: {
					select: { reputationScore: true }
				}
			}
		})

		const qualityDistribution = validatorQuality.reduce((acc, validation) => {
			const score = validation.validator.reputationScore
			const range = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
			acc[range] = (acc[range] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		return {
			success: true,
			postAnalytics: {
				post: {
					id: post.id,
					title: post.title,
					description: post.description,
					category: post.category.name,
					createdAt: post.createdAt,
					status: post.status,
					totalBudget: post.normalReward.toNumber() * post.normalValidatorCount + 
								post.detailedReward.toNumber() * post.detailedValidatorCount
				},
				validationTimeline,
				validatorQualityDistribution: qualityDistribution,
				validations: post.validations.map(validation => ({
					id: validation.id,
					vote: validation.vote,
					type: validation.type,
					validatorName: validation.validator.name,
					validatorReputation: validation.validator.reputationScore,
					shortComment: validation.shortComment,
					detailedFeedback: validation.detailedFeedback,
					createdAt: validation.createdAt,
					rewardAmount: validation.rewardAmount.toNumber()
				}))
			}
		}
	} catch (error) {
		console.error("Error fetching post analytics:", error)
		return { success: false, error: "Failed to fetch post analytics" }
	}
}
