"use server"

import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { verificationEmailTemplate, passwordResetEmailTemplate, registrationSuccessEmailTemplate } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate reset token
function generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Send verification email
async function sendVerificationEmail(email: string, otp: string) {
    try {
        await resend.emails.send({
            from: "ValidateX <noreply@coderz.nirajjha.xyz>",
            to: email,
            subject: "Verify your email address - ValidateX",
            html: verificationEmailTemplate(otp)
        })
        return { success: true }
    } catch (error) {
        console.error("Error sending verification email:", error)
        return { success: false, error: "Failed to send verification email" }
    }
}

// Send password reset email
async function sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/resetpassword?token=${resetToken}`
    
    try {
        await resend.emails.send({
            from: "ValidateX <noreply@coderz.nirajjha.xyz>",
            to: email,
            subject: "Reset your password - ValidateX",
            html: passwordResetEmailTemplate(resetUrl)
        })
        return { success: true }
    } catch (error) {
        console.error("Error sending password reset email:", error)
        return { success: false, error: "Failed to send password reset email" }
    }
}

// Send registration success email
async function sendRegistrationSuccessEmail(email: string, name: string) {
    try {
        await resend.emails.send({
            from: "ValidateX <noreply@coderz.nirajjha.xyz>",
            to: email,
            subject: "Welcome to ValidateX - Registration Complete! 🎉",
            html: registrationSuccessEmailTemplate(name, email)
        })
        return { success: true }
    } catch (error) {
        console.error("Error sending registration success email:", error)
        return { success: false, error: "Failed to send registration success email" }
    }
}

// Register user action
export async function registerUser(name: string, email: string, password: string) {
    if (!name || !email || !password) {
        return { success: false, error: "All fields are required" }
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { success: false, error: "User with this email already exists" }
        }

        // Generate OTP and expiry
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user with verification token
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                verificationToken: otp,
                verificationTokenExpiry: otpExpiry,
            }
        })

        // Send verification email
        const emailResult = await sendVerificationEmail(email, otp)
        
        if (!emailResult.success) {
            // Clean up user if email failed
            await prisma.user.delete({ where: { email } })
            return { success: false, error: emailResult.error }
        }

        return { success: true, message: "User registered successfully. Please check your email for verification code." }
    } catch (error) {
        console.error("Registration error:", error)
        return { success: false, error: "Failed to register user" }
    }
}

// Verify OTP action
export async function verifyOTP(email: string, otp: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (user.emailVerified) {
            return { success: false, error: "Email already verified" }
        }

        if (!user.verificationToken || user.verificationToken !== otp) {
            return { success: false, error: "Invalid OTP" }
        }

        if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
            return { success: false, error: "OTP has expired" }
        }

        // Verify the user
        await prisma.user.update({
            where: { email },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
                verificationTokenExpiry: null,
            }
        })

        // Send registration success email
        try {
            await sendRegistrationSuccessEmail(user.email, user.name)
        } catch (error) {
            console.error("Failed to send registration success email:", error)
            // Don't fail the verification if email sending fails
        }

        return { success: true, message: "Email verified successfully" }
    } catch (error) {
        console.error("OTP verification error:", error)
        return { success: false, error: "Failed to verify OTP" }
    }
}

// Resend verification OTP
export async function resendVerificationOTP(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (user.emailVerified) {
            return { success: false, error: "Email already verified" }
        }

        // Generate new OTP
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Update user with new OTP
        await prisma.user.update({
            where: { email },
            data: {
                verificationToken: otp,
                verificationTokenExpiry: otpExpiry,
            }
        })

        // Send verification email
        const emailResult = await sendVerificationEmail(email, otp)
        
        if (!emailResult.success) {
            return { success: false, error: emailResult.error }
        }

        return { success: true, message: "Verification code sent successfully" }
    } catch (error) {
        console.error("Resend OTP error:", error)
        return { success: false, error: "Failed to resend verification code" }
    }
}

// Request password reset
export async function requestPasswordReset(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // Don't reveal if user exists or not for security
            return { success: true, message: "If an account with this email exists, you will receive a password reset link." }
        }

        // Generate reset token
        const resetToken = generateResetToken()
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Update user with reset token
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            }
        })

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken)
        
        if (!emailResult.success) {
            return { success: false, error: emailResult.error }
        }

        return { 
            success: true, 
            message: "If an account with this email exists, you will receive a password reset link.",
            resetUrl: process.env.NODE_ENV === "development" ? `${process.env.NEXTAUTH_URL}/resetpassword?token=${resetToken}` : null
        }
    } catch (error) {
        console.error("Password reset request error:", error)
        return { success: false, error: "Failed to process password reset request" }
    }
}

// Validate reset token
export async function validateResetToken(token: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        })

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return { valid: false }
        }

        return { valid: true }
    } catch (error) {
        console.error("Reset token validation error:", error)
        return { valid: false }
    }
}

// Reset password
export async function resetPassword(token: string, newPassword: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        })

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return { success: false, error: "Invalid or expired reset token" }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            }
        })

        return { success: true, message: "Password reset successfully" }
    } catch (error) {
        console.error("Password reset error:", error)
        return { success: false, error: "Failed to reset password" }
    }
}

// Sign in user after verification
export async function signInUser(email: string, callbackUrl?: string) {
    try {
        const result = await signIn("credentials", {
            email,
            password: "verified", // This is a special flag for verified users
            redirect: false,
        })

        if (result?.error) {
            return { success: false, error: "Failed to sign in" }
        }

        return { success: true, callbackUrl }
    } catch (error) {
        console.error("Sign in error:", error)
        return { success: false, error: "Failed to sign in" }
    }
}