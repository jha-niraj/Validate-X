export const verificationEmailTemplate = (otp: string) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email - ValidateX</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-flex; align-items: center; gap: 12px; background: white; padding: 16px 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #0d9488, #10b981); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 20px; font-weight: bold;">V</span>
                        </div>
                        <h1 style="margin: 0; color: #0d9488; font-size: 28px; font-weight: 700;">ValidateX</h1>
                    </div>
                </div>

                <!-- Main Content Card -->
                <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); border: 1px solid rgba(13, 148, 136, 0.1);">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0d9488, #10b981); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.3);">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 32px; font-weight: 700;">Welcome to ValidateX!</h2>
                        <p style="margin: 0; color: #6b7280; font-size: 18px; line-height: 1.6;">Thank you for joining our idea validation community. Please verify your email address to get started.</p>
                    </div>

                    <!-- OTP Section -->
                    <div style="background: linear-gradient(135deg, #f0fdfa, #ccfbf1); border: 2px solid #0d9488; border-radius: 20px; padding: 32px; text-align: center; margin: 32px 0; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: rgba(13, 148, 136, 0.1); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: rgba(16, 185, 129, 0.1); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 1;">
                            <h3 style="margin: 0 0 16px 0; color: #0d9488; font-size: 18px; font-weight: 600;">Your Verification Code</h3>
                            <div style="background: white; border-radius: 12px; padding: 24px; margin: 16px 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                                <div style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #0d9488; margin: 0; font-family: 'Courier New', monospace;">${otp}</div>
                            </div>
                            <div style="margin-top: 20px;">
                                <button onclick="navigator.clipboard.writeText('${otp}')" style="background: #0d9488; color: white; border: none; border-radius: 8px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 4H18C19.1046 4 20 4.89543 20 6V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    Copy Code
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Instructions -->
                    <div style="text-align: center; margin: 32px 0;">
                        <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">Enter this code on the verification page to complete your registration. This code will expire in <strong style="color: #0d9488;">10 minutes</strong>.</p>
                        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 20px 0;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">⚠️ If you didn't create an account with ValidateX, please ignore this email.</p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 40px; padding: 24px; background: rgba(255, 255, 255, 0.5); border-radius: 16px;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">This email was sent by ValidateX</p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">Empowering innovation through community validation</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const passwordResetEmailTemplate = (resetUrl: string) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password - ValidateX</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-flex; align-items: center; gap: 12px; background: white; padding: 16px 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #0d9488, #10b981); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 20px; font-weight: bold;">V</span>
                        </div>
                        <h1 style="margin: 0; color: #0d9488; font-size: 28px; font-weight: 700;">ValidateX</h1>
                    </div>
                </div>

                <!-- Main Content Card -->
                <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); border: 1px solid rgba(13, 148, 136, 0.1);">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #dc2626, #ef4444); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15V17M12 9V13M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56987 17.3333 3.53223 19 5.07183 19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 32px; font-weight: 700;">Password Reset Request</h2>
                        <p style="margin: 0; color: #6b7280; font-size: 18px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password.</p>
                    </div>

                    <!-- Reset Button -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0d9488, #10b981); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.3); transition: all 0.2s;">
                            Reset My Password
                        </a>
                    </div>

                    <!-- Alternative Link -->
                    <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 32px 0;">
                        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Can't click the button? Copy and paste this link:</p>
                        <div style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; font-family: 'Courier New', monospace; font-size: 12px; color: #0d9488; word-break: break-all;">${resetUrl}</div>
                    </div>

                    <!-- Security Notice -->
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 32px 0;">
                        <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">🔒 Security Notice</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
                            <li>This link will expire in <strong>1 hour</strong></li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your password won't change until you create a new one</li>
                        </ul>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 40px; padding: 24px; background: rgba(255, 255, 255, 0.5); border-radius: 16px;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">This email was sent by ValidateX</p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">Empowering innovation through community validation</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
