import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Protected routes that require authentication
const protectedRoutes = [
	'/dashboard',
	'/profile',
	'/settings',
	'/projects',
	'/ideas',
	'/validation',
	'/analytics',
	'/transactions',
	'/wallet',
	'/onboarding',
	'/validatehub'
]

// Public routes that don't require authentication
const publicRoutes = [
	'/',
	'/signin',
	'/signup',
	'/verify',
	'/waiting',
	'/forgotpassword',
	'/resetpassword',
	'/error',
	'/about',
	'/contact',
	'/pricing',
	'/features'
]

// API routes that should be excluded from auth checks
const apiRoutes = [
	'/api/auth',
	'/api/health',
	'/api/register',
	'/api/verify',
	'/api/forgot-password',
	'/api/reset-password',
	'/api/resend-verification'
]

export default auth((req) => {
	const { nextUrl } = req
	
	// Allow API routes to pass through
	if (apiRoutes.some(route => nextUrl.pathname.startsWith(route))) {
		return NextResponse.next()
	}

	// Allow static files and Next.js internals
	if (
		nextUrl.pathname.startsWith('/_next/') ||
		nextUrl.pathname.startsWith('/api/') ||
		nextUrl.pathname.includes('.') ||
		nextUrl.pathname === '/favicon.ico'
	) {
		return NextResponse.next()
	}

	// Check if current path is a protected route
	const isProtectedRoute = protectedRoutes.some(route =>
		nextUrl.pathname.startsWith(route)
	)

	// Check if current path is a public route
	const isPublicRoute = publicRoutes.some(route =>
		nextUrl.pathname === route || (route !== '/' && nextUrl.pathname.startsWith(route))
	)

	const isLoggedIn = !!req.auth

	// If user is not logged in and trying to access protected route
	if (!isLoggedIn && isProtectedRoute) {
		// Prevent redirect loops by checking if we're already on signin
		if (nextUrl.pathname === '/signin') {
			return NextResponse.next()
		}
		
		const signInUrl = new URL('/signin', nextUrl.origin)
		signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
		return NextResponse.redirect(signInUrl)
	}

	// Handle post-login redirection logic
	if (isLoggedIn) {
		// If user is trying to access signin/signup, redirect to dashboard
		if (nextUrl.pathname === '/signin' || nextUrl.pathname === '/signup') {
			// Prevent redirect loops by checking if we're already redirecting
			const dashboardUrl = new URL('/dashboard', nextUrl.origin)
			return NextResponse.redirect(dashboardUrl)
		}

		// For the root path, redirect authenticated users to dashboard
		if (nextUrl.pathname === '/') {
			const dashboardUrl = new URL('/dashboard', nextUrl.origin)
			return NextResponse.redirect(dashboardUrl)
		}
	}

	// If it's a public route or unmatched route, allow it to proceed
	return NextResponse.next()
})

export const config = {
	// More specific matcher to avoid catching static files and API routes
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files
		 * - files with extensions (images, etc.)
		 * - webhook endpoints
		 */
		'/((?!api/auth|_next/static|_next/image|favicon.ico|public/|.*\\..*).*)',
	],
}
