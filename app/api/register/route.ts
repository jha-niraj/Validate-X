import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
// import { Resend } from 'resend'

// const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        // try {
        //     await resend.emails.send({
        //         from: 'SpeakFluent <welcome@speakfluent.com>',
        //         to: [email],
        //         subject: 'Welcome to SpeakFluent! 🎉',
        //         html: `
        //             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        //                 <div style="text-align: center; margin-bottom: 30px;">
        //                     <h1 style="color: #059669; margin: 0;">Welcome to SpeakFluent!</h1>
        //                     <p style="color: #6b7280; font-size: 16px;">Your language learning journey starts here</p>
        //                 </div>

        //                 <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px;">
        //                     <h2 style="margin: 0 0 15px 0;">Hi ${name}! 👋</h2>
        //                     <p style="margin: 0; font-size: 16px; line-height: 1.5;">
        //                         We're excited to have you join our community of language learners. Get ready to embark on an amazing journey of discovery and growth!
        //                     </p>
        //                 </div>

        //                 <div style="margin-bottom: 30px;">
        //                     <h3 style="color: #374151; margin-bottom: 15px;">What's next?</h3>
        //                     <ul style="color: #6b7280; line-height: 1.6;">
        //                         <li>Complete your profile setup</li>
        //                         <li>Choose your learning goals</li>
        //                         <li>Start your first lesson</li>
        //                         <li>Join our community discussions</li>
        //                     </ul>
        //                 </div>

        //                 <div style="text-align: center; margin-bottom: 30px;">
        //                     <a href="${process.env.NEXTAUTH_URL}/dashboard" 
        //                        style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); 
        //                               color: white; 
        //                               text-decoration: none; 
        //                               padding: 12px 30px; 
        //                               border-radius: 8px; 
        //                               display: inline-block; 
        //                               font-weight: bold;">
        //                         Go to Dashboard
        //                     </a>
        //                 </div>

        //                 <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
        //                     <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        //                         Need help? Reply to this email or visit our <a href="${process.env.NEXTAUTH_URL}/support" style="color: #059669;">support center</a>
        //                     </p>
        //                 </div>
        //             </div>
        //         `
        //     })
        // } catch (emailError) {
        //     console.error('Failed to send welcome email:', emailError)
        //     // Don't fail the registration if email fails
        // }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: userWithoutPassword
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
