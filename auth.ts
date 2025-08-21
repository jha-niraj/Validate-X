import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth";
import { Role } from '@prisma/client';
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	trustHost: true, // Required for NextAuth v5
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password"
				}
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const user = await prisma.user.findUnique({
						where: {
							email: credentials.email as string
						}
					});

					if (!user || !user.password) {
						return null;
					}

					// For special case where password is "verified" (after OTP verification)
					if (credentials.password === "verified") {
						// Refetch user to get latest verification status
						const freshUser = await prisma.user.findUnique({
							where: {
								email: credentials.email as string
							}
						});

						if (freshUser && freshUser.emailVerified) {
							return {
								id: freshUser.id,
								email: freshUser.email,
								name: freshUser.name,
								image: freshUser.image,
								role: freshUser.role,
								roleExplicitlyChosen: freshUser.roleExplicitlyChosen,
								onboardingCompleted: freshUser.onboardingCompleted
							};
						} else {
							throw new Error("Email verification not completed");
						}
					}

					// Check if email is verified for regular password login
					if (!user.emailVerified) {
						throw new Error("Please verify your email before signing in");
					}

					// Regular password check
					const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

					if (!isPasswordValid) {
						return null;
					}

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image,
						role: user.role,
						roleExplicitlyChosen: user.roleExplicitlyChosen
					};
				} catch (error) {
					console.error("Authorization error:", error);
					throw new Error(error instanceof Error ? error.message : "Authentication failed");
				}
			}
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_SECRET_ID || ""
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id!;
				token.role = user.role;
				token.roleExplicitlyChosen = user.roleExplicitlyChosen;
			}

			// Handle session updates from client-side
			if (trigger === "update" && session) {
				// Update token with new session data
				if (session.role) {
					token.role = session.role;
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as Role
				session.user.roleExplicitlyChosen = Boolean(token.roleExplicitlyChosen);
			}
			return session;
		},
		async signIn({ user, account, profile }) {
			if (account?.provider === 'google') {
				const existingUser = await prisma.user.findUnique({
					where: { email: profile?.email as string }
				});

				if (existingUser) {
					await prisma.user.update({
						where: {
							email: profile?.email as string
						},
						data: {
							emailVerified: new Date()
						}
					});
				}

				return true;
			}
			return true;
		},
		async redirect({ url, baseUrl }) {
			// Prevent redirect loops by being more specific about redirects
			if (url.startsWith("/")) {
				// If it's a relative URL, construct the full URL
				const fullUrl = `${baseUrl}${url}`;
				
				// Avoid redirecting to signin/signup if already authenticated
				if (url === "/signin" || url === "/signup") {
					return `${baseUrl}/dashboard`;
				}
				
				return fullUrl;
			}
			
			// If it's an absolute URL, check if it's from the same origin
			if (url.startsWith(baseUrl)) {
				return url;
			}
			
			// For external URLs or fallback, redirect to dashboard
			return `${baseUrl}/dashboard`;
		},
	},
	pages: {
		signIn: '/signin',
		error: '/error',
		signOut: '/'
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
	cookies: {
		sessionToken: {
			name: "next-auth.session-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
				maxAge: 30 * 24 * 60 * 60, // 30 days
			},
		},
		callbackUrl: {
			name: "next-auth.callback-url",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
			},
		},
		csrfToken: {
			name: "next-auth.csrf-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
			},
		},
	},
})