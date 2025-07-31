'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { PostStatus, ValidationType } from "@prisma/client"
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
  allowAIFeedback: boolean
  detailedApprovalRequired: boolean
  expiryDays: number
}

export async function createPost(data: CreatePostData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Calculate rewards and fees
    const platformFeeRate = 0.1 // 10% platform fee
    const totalAfterFee = data.totalBudget * (1 - platformFeeRate)
    const totalValidators = data.normalValidatorCount + data.detailedValidatorCount
    
    // Calculate rewards per validation
    const normalReward = totalValidators > 0 
      ? (totalAfterFee * 0.6) / data.normalValidatorCount 
      : 0
    const detailedReward = totalValidators > 0 
      ? (totalAfterFee * 0.4) / data.detailedValidatorCount 
      : 0

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + data.expiryDays)

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
        normalReward: new Decimal(normalReward),
        detailedReward: new Decimal(detailedReward),
        platformFee: new Decimal(data.totalBudget * platformFeeRate),
        allowAIFeedback: data.allowAIFeedback,
        detailedApprovalRequired: data.detailedApprovalRequired,
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

    // Create payment transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: new Decimal(data.totalBudget),
        type: "POST_PAYMENT",
        postId: post.id,
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

    return { success: true, posts }
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

    return { success: true, post }
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
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, categories }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { success: false, error: "Failed to fetch categories" }
  }
}
