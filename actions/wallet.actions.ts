'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { PaymentMethod, CashoutStatus } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

interface CashoutData {
	amount: number
	method: PaymentMethod
	upiId?: string
	paytmNumber?: string
	walletAddress?: string
}

export async function getWalletInfo(userId?: string) {
	try {
		const session = await auth()
		const targetUserId = userId || session?.user?.id

		if (!targetUserId) {
			return { success: false, error: "User not found" }
		}

		const user = await prisma.user.findUnique({
			where: { id: targetUserId },
			select: {
				totalBalance: true,
				availableBalance: true,
				optedOutBalance: true,
				upiId: true,
				paytmNumber: true,
				walletAddress: true,
				preferredPaymentMethod: true,
				totalValidations: true,
				totalIdeasSubmitted: true,
				reputationScore: true,
				lastCashoutAt: true
			}
		})

		if (!user) {
			return { success: false, error: "User not found" }
		}

		// Get recent transactions
		const transactions = await prisma.transaction.findMany({
			where: { userId: targetUserId },
			orderBy: { createdAt: 'desc' },
			take: 10
		})

		// Get earning stats for current month
		const startOfMonth = new Date()
		startOfMonth.setDate(1)
		startOfMonth.setHours(0, 0, 0, 0)

		const monthlyEarnings = await prisma.transaction.aggregate({
			where: {
				userId: targetUserId,
				type: "VALIDATION_EARNING",
				createdAt: { gte: startOfMonth }
			},
			_sum: { amount: true },
			_count: true
		})

		// Calculate next cashout availability (15 days after last cashout)
		const CASHOUT_COOLDOWN_DAYS = 15
		let nextCashoutAvailable: Date | null = null
		let canCashout = true
		
		if (user.lastCashoutAt) {
			const nextAllowedDate = new Date(user.lastCashoutAt)
			nextAllowedDate.setDate(nextAllowedDate.getDate() + CASHOUT_COOLDOWN_DAYS)
			
			if (new Date() < nextAllowedDate) {
				canCashout = false
				nextCashoutAvailable = nextAllowedDate
			}
		}

		return {
			success: true,
			wallet: {
				...user,
				totalBalance: user.totalBalance.toNumber(),
				availableBalance: user.availableBalance.toNumber(),
				optedOutBalance: user.optedOutBalance.toNumber(),
				monthlyEarnings: monthlyEarnings._sum.amount ? monthlyEarnings._sum.amount.toNumber() : 0,
				monthlyValidations: monthlyEarnings._count || 0,
				recentTransactions: transactions.map(t => ({
					...t,
					amount: t.amount.toNumber()
				})),
				canCashout,
				nextCashoutAvailable,
				cashoutCooldownDays: CASHOUT_COOLDOWN_DAYS
			}
		}
	} catch (error) {
		console.error("Error fetching wallet info:", error)
		return { success: false, error: "Failed to fetch wallet information" }
	}
}

export async function updatePaymentPreferences(data: {
	preferredPaymentMethod: PaymentMethod
	upiId?: string
	paytmNumber?: string
	walletAddress?: string
}) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		const user = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				preferredPaymentMethod: data.preferredPaymentMethod,
				upiId: data.upiId,
				paytmNumber: data.paytmNumber,
				walletAddress: data.walletAddress
			}
		})

		revalidatePath('/wallet')

		return { success: true, user }
	} catch (error) {
		console.error("Error updating payment preferences:", error)
		return { success: false, error: "Failed to update payment preferences" }
	}
}

export async function requestCashout(data: CashoutData) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		// Get user's current balance and last cashout
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				availableBalance: true,
				lastCashoutAt: true,
				upiId: true,
				paytmNumber: true,
				walletAddress: true
			}
		})

		if (!user) {
			return { success: false, error: "User not found" }
		}

		// Check cashout cooldown (15 days)
		const CASHOUT_COOLDOWN_DAYS = 15
		if (user.lastCashoutAt) {
			const nextAllowedDate = new Date(user.lastCashoutAt)
			nextAllowedDate.setDate(nextAllowedDate.getDate() + CASHOUT_COOLDOWN_DAYS)
			
			if (new Date() < nextAllowedDate) {
				const daysLeft = Math.ceil((nextAllowedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
				return { 
					success: false, 
					error: `Cashout not available yet. You can cash out again in ${daysLeft} days.` 
				}
			}
		}

		// Check minimum cashout amount (₹100)
		if (data.amount < 100) {
			return { success: false, error: "Minimum cashout amount is ₹100" }
		}

		// Check if user has sufficient balance
		if (user.availableBalance.toNumber() < data.amount) {
			return { success: false, error: "Insufficient balance" }
		}

		// Validate payment details based on method
		if (data.method === PaymentMethod.RAZORPAY || data.method === PaymentMethod.PHONEPE) {
			if (!data.upiId && !data.paytmNumber) {
				return { success: false, error: "UPI ID or mobile number required" }
			}
		}

		// Create cashout request (not processed immediately)
		const cashoutRequest = await prisma.cashoutRequest.create({
			data: {
				userId: session.user.id,
				amount: new Decimal(data.amount),
				method: data.method,
				upiId: data.upiId,
				paytmNumber: data.paytmNumber,
				walletAddress: data.walletAddress,
				status: CashoutStatus.PENDING
			}
		})

		// Update user's last cashout date and payment info
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				lastCashoutAt: new Date(),
				...(data.upiId && { upiId: data.upiId }),
				...(data.paytmNumber && { paytmNumber: data.paytmNumber }),
				...(data.walletAddress && { walletAddress: data.walletAddress }),
				preferredPaymentMethod: data.method
			}
		})

		revalidatePath('/wallet')

		return { success: true, cashoutRequest }
	} catch (error) {
		console.error("Error requesting cashout:", error)
		return { success: false, error: "Failed to process cashout request" }
	}
}

export async function getTransactionHistory(userId?: string, limit: number = 50) {
	try {
		const session = await auth()
		const targetUserId = userId || session?.user?.id

		if (!targetUserId) {
			return { success: false, error: "User not found" }
		}

		const transactions = await prisma.transaction.findMany({
			where: { userId: targetUserId },
			orderBy: { createdAt: 'desc' },
			take: limit
		})

		// Calculate summary stats
		const stats = await prisma.transaction.groupBy({
			by: ['type'],
			where: { userId: targetUserId },
			_sum: { amount: true },
			_count: true
		})

		const summary = {
			totalEarnings: 0,
			totalCashouts: 0,
			totalTransactions: 0
		}

		stats.forEach(stat => {
			if (stat.type === 'VALIDATION_EARNING' || stat.type === 'BONUS') {
				summary.totalEarnings += stat._sum.amount?.toNumber() || 0
			} else if (stat.type === 'CASHOUT') {
				summary.totalCashouts += stat._sum.amount?.toNumber() || 0
			}
			summary.totalTransactions += stat._count
		})

		return {
			success: true,
			transactions: transactions.map(t => ({
				...t,
				amount: t.amount.toNumber()
			})),
			summary
		}
	} catch (error) {
		console.error("Error fetching transaction history:", error)
		return { success: false, error: "Failed to fetch transaction history" }
	}
}

export async function getEarningsAnalytics(userId?: string, days: number = 30) {
	try {
		const session = await auth()
		const targetUserId = userId || session?.user?.id

		if (!targetUserId) {
			return { success: false, error: "User not found" }
		}

		const startDate = new Date()
		startDate.setDate(startDate.getDate() - days)

		// Get daily earnings for the period
		const dailyEarnings = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM "Transaction"
      WHERE user_id = ${targetUserId}
        AND type IN ('VALIDATION_EARNING', 'BONUS')
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `

		// Get earnings by validation type
		const earningsByType = await prisma.transaction.groupBy({
			by: ['type'],
			where: {
				userId: targetUserId,
				type: { in: ['VALIDATION_EARNING', 'BONUS'] },
				createdAt: { gte: startDate }
			},
			_sum: { amount: true },
			_count: true
		})

		// Get validation performance stats
		const validationStats = await prisma.validation.groupBy({
			by: ['type', 'status'],
			where: {
				validatorId: targetUserId,
				createdAt: { gte: startDate }
			},
			_count: true,
			_sum: { rewardAmount: true }
		})

		return {
			success: true,
			analytics: {
				dailyEarnings,
				earningsByType,
				validationStats,
				period: days
			}
		}
	} catch (error) {
		console.error("Error fetching earnings analytics:", error)
		return { success: false, error: "Failed to fetch earnings analytics" }
	}
}

export async function optOutBalance(amount: number) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" }
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { availableBalance: true }
		})

		if (!user) {
			return { success: false, error: "User not found" }
		}

		if (user.availableBalance.toNumber() < amount) {
			return { success: false, error: "Insufficient available balance" }
		}

		// Move amount from available to opted-out balance
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				availableBalance: { decrement: amount },
				optedOutBalance: { increment: amount }
			}
		})

		// Create transaction record
		await prisma.transaction.create({
			data: {
				userId: session.user.id,
				amount: new Decimal(amount),
				type: "BONUS", // Using BONUS type for opted-out funds
				description: `Opted out ₹${amount} from available balance`,
				status: "COMPLETED"
			}
		})

		revalidatePath('/wallet')

		return { success: true, user: updatedUser }
	} catch (error) {
		console.error("Error opting out balance:", error)
		return { success: false, error: "Failed to opt out balance" }
	}
}
