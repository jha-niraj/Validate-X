'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function requestPasswordReset(email: string) {
    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!user) {
            // Don't reveal if user exists for security
            return { success: true, message: 'If an account with that email exists, a reset link has been sent.' }
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Save reset token to database
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // Create reset URL
        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/resetpassword?token=${resetToken}`

        // Send email (commented out until email is configured)
        /*
        try {
            await resend.emails.send({
                from: 'SpeakFluent <noreply@speakfluent.com>',
                to: email,
                subject: 'Reset Your Password - SpeakFluent',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #0f766e 0%, #059669 100%); padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">SpeakFluent</h1>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9;">
                            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
                            <p style="color: #666; line-height: 1.6;">
                                You requested to reset your password. Click the button below to create a new password:
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" 
                                   style="background: linear-gradient(135deg, #0f766e 0%, #059669 100%); 
                                          color: white; 
                                          padding: 15px 30px; 
                                          text-decoration: none; 
                                          border-radius: 8px; 
                                          display: inline-block; 
                                          font-weight: bold;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="color: #666; font-size: 14px;">
                                This link will expire in 24 hours. If you didn't request this reset, please ignore this email.
                            </p>
                            <p style="color: #666; font-size: 14px;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="${resetUrl}" style="color: #0f766e;">${resetUrl}</a>
                            </p>
                        </div>
                    </div>
                `
            })
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError)
            // Continue anyway since we want to return success for security
        }
        */

        console.log('Password reset requested for:', email)
        console.log('Reset URL (for development):', resetUrl)

        return {
            success: true,
            message: 'If an account with that email exists, a reset link has been sent.',
            // For development only - remove in production
            resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
        }
    } catch (error) {
        console.error('Error requesting password reset:', error)
        return { success: false, error: 'Failed to process password reset request' }
    }
}

export async function resetPassword(token: string, newPassword: string) {
    try {
        // Validate token
        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        })

        if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
            return { success: false, error: 'Invalid or expired reset token' }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })

        return { success: true, message: 'Password has been reset successfully' }
    } catch (error) {
        console.error('Error resetting password:', error)
        return { success: false, error: 'Failed to reset password' }
    }
}

export async function validateResetToken(token: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { resetToken: token },
            select: { id: true, resetTokenExpiry: true }
        })

        if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
            return { valid: false }
        }

        return { valid: true }
    } catch (error) {
        console.error('Error validating reset token:', error)
        return { valid: false }
    }
} 