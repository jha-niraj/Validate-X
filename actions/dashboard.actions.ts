"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

// Get dashboard data for submitters (Sam)
export async function getSubmitterDashboard() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/signin")
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        posts: {
          include: {
            category: true,
            validations: true,
            _count: {
              select: {
                validations: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        selectedCategories: {
          include: {
            category: true
          }
        }
      }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Calculate analytics
    const totalPosts = user.posts.length
    const totalValidations = user.posts.reduce((sum, post) => sum + post._count.validations, 0)
    const avgValidationsPerPost = totalPosts > 0 ? Math.round(totalValidations / totalPosts) : 0
    
    // Get recent validations on user's posts
    const recentValidations = await prisma.validation.findMany({
      where: {
        post: {
          authorId: session.user.id
        }
      },
      include: {
        post: true,
        validator: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get earnings analytics
    const earningsData = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: 'VALIDATION_EARNING'
      },
      orderBy: { createdAt: 'desc' },
      take: 30 // Last 30 transactions for chart
    })

    // Group earnings by date for chart
    const earningsChart = earningsData.reduce((acc, transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + Number(transaction.amount)
      return acc
    }, {} as Record<string, number>)

    return {
      user: {
        name: user.name,
        userRole: user.userRole,
        totalBalance: user.totalBalance,
        availableBalance: user.availableBalance,
        reputationScore: user.reputationScore,
        totalIdeasSubmitted: user.totalIdeasSubmitted,
        totalValidations: user.totalValidations
      },
      posts: user.posts.map(post => ({
        id: post.id,
        title: post.title,
        status: post.status,
        category: post.category.name,
        validationCount: post._count.validations,
        createdAt: post.createdAt,
        totalBudget: post.totalBudget,
        normalReward: post.normalReward,
        detailedReward: post.detailedReward
      })),
      analytics: {
        totalPosts,
        totalValidations,
        avgValidationsPerPost,
        earningsChart: Object.entries(earningsChart).map(([date, amount]) => ({
          date,
          amount
        }))
      },
      recentValidations: recentValidations.map(validation => ({
        id: validation.id,
        postTitle: validation.post.title,
        validatorName: validation.validator.name,
        validatorImage: validation.validator.image,
        type: validation.type,
        status: validation.status,
        createdAt: validation.createdAt,
        rating: validation.rating
      })),
      categories: user.selectedCategories.map(selection => selection.category)
    }
  } catch (error) {
    console.error("Error fetching submitter dashboard:", error)
    throw new Error("Failed to fetch dashboard data")
  }
}

// Get dashboard data for validators (Elina)
export async function getValidatorDashboard() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/signin")
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        validations: {
          include: {
            post: {
              include: {
                category: true,
                author: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        selectedCategories: {
          include: {
            category: true
          }
        }
      }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Get available posts for validation (in user's preferred categories)
    const categoryIds = user.selectedCategories.map(selection => selection.categoryId)
    const availablePosts = await prisma.post.findMany({
      where: {
        status: 'OPEN',
        categoryId: { in: categoryIds },
        authorId: { not: session.user.id }, // Don't include own posts
        validations: {
          none: {
            validatorId: session.user.id // Don't include already validated posts
          }
        }
      },
      include: {
        category: true,
        author: {
          select: {
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            validations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate analytics
    const totalValidations = user.validations.length
    const approvedValidations = user.validations.filter(v => v.status === 'APPROVED').length
    const pendingValidations = user.validations.filter(v => v.status === 'PENDING').length
    const approvalRate = totalValidations > 0 ? Math.round((approvedValidations / totalValidations) * 100) : 0

    // Get earnings analytics
    const earningsData = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: 'VALIDATION_EARNING'
      },
      orderBy: { createdAt: 'desc' },
      take: 30 // Last 30 transactions for chart
    })

    // Group earnings by date for chart
    const earningsChart = earningsData.reduce((acc, transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + Number(transaction.amount)
      return acc
    }, {} as Record<string, number>)

    // Calculate validation streak (consecutive days with validations)
    const validationDates = user.validations
      .map(v => v.createdAt.toISOString().split('T')[0])
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort()
      .reverse()

    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let currentDate = new Date()

    for (const validationDate of validationDates) {
      const checkDate = currentDate.toISOString().split('T')[0]
      if (validationDate === checkDate) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      user: {
        name: user.name,
        userRole: user.userRole,
        totalBalance: user.totalBalance,
        availableBalance: user.availableBalance,
        reputationScore: user.reputationScore,
        totalValidations: user.totalValidations,
        totalIdeasSubmitted: user.totalIdeasSubmitted
      },
      validations: user.validations.slice(0, 10).map(validation => ({
        id: validation.id,
        postTitle: validation.post.title,
        postCategory: validation.post.category.name,
        authorName: validation.post.author.name,
        authorImage: validation.post.author.image,
        type: validation.type,
        status: validation.status,
        rating: validation.rating,
        createdAt: validation.createdAt,
        rewardAmount: validation.rewardAmount
      })),
      availablePosts: availablePosts.map(post => ({
        id: post.id,
        title: post.title,
        category: post.category.name,
        authorName: post.author.name,
        authorImage: post.author.image,
        validationCount: post._count.validations,
        normalReward: post.normalReward,
        detailedReward: post.detailedReward,
        createdAt: post.createdAt
      })),
      analytics: {
        totalValidations,
        approvedValidations,
        pendingValidations,
        approvalRate,
        validationStreak: streak,
        earningsChart: Object.entries(earningsChart).map(([date, amount]) => ({
          date,
          amount
        }))
      },
      categories: user.selectedCategories.map(selection => selection.category)
    }
  } catch (error) {
    console.error("Error fetching validator dashboard:", error)
    throw new Error("Failed to fetch dashboard data")
  }
}

// Get dashboard data for users with BOTH role
export async function getBothDashboard() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/signin")
  }

  try {
    // Get both submitter and validator data
    const [submitterData, validatorData] = await Promise.all([
      getSubmitterDashboard(),
      getValidatorDashboard()
    ])

    return {
      ...submitterData,
      validatorData: {
        validations: validatorData.validations,
        availablePosts: validatorData.availablePosts,
        validatorAnalytics: validatorData.analytics
      }
    }
  } catch (error) {
    console.error("Error fetching both dashboard:", error)
    throw new Error("Failed to fetch dashboard data")
  }
}
