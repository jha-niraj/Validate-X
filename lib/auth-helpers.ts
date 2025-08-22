"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function verifyCredentials(email: string, password: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { email }
		})

		if (!user) {
			return { success: false, error: "No account found with this email address", user: null }
		}

		if (!user.password) {
			return { success: false, error: "Please sign in with Google or reset your password", user: null }
		}

		// For special case where password is "verified" (after OTP verification)
		if (password === "verified") {
			if (user.emailVerified) {
				return {
					success: true,
					error: null,
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image,
						role: user.role,
						roleExplicitlyChosen: user.roleExplicitlyChosen,
						onboardingCompleted: user.onboardingCompleted
					}
				}
			} else {
				return { success: false, error: "Email verification not completed", user: null }
			}
		}

		// Check if email is verified for regular password login
		if (!user.emailVerified) {
			return { success: false, error: "Please verify your email before signing in", user: null }
		}

		// Regular password check
		const isPasswordValid = await bcrypt.compare(password, user.password)

		if (!isPasswordValid) {
			return { success: false, error: "Incorrect password. Please try again", user: null }
		}

		return {
			success: true,
			error: null,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				image: user.image,
				role: user.role,
				roleExplicitlyChosen: user.roleExplicitlyChosen,
				onboardingCompleted: user.onboardingCompleted
			}
		}
	} catch (error) {
		console.error("Credential verification error:", error)
		return { success: false, error: "Authentication failed. Please try again", user: null }
	}
}
