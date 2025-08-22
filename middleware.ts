import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
	const { nextUrl } = req

	// Allow API routes and static files to pass through
	if (
		nextUrl.pathname.startsWith('/api/') ||
		nextUrl.pathname.startsWith('/_next/') ||
		nextUrl.pathname.includes('.') ||
		nextUrl.pathname === '/favicon.ico'
	) {
		return NextResponse.next()
	}

	const isLoggedIn = !!req.auth

	// Public routes that don't require authentication
	const publicRoutes = [
		'/',
		'/signin',
		'/signup',
		'/verify',
		'/waiting',
		'/forgotpassword',
		'/resetpassword',
		'/error'
	]

	// Check if current path is a public route
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname)

	// If user is not logged in and trying to access a protected route
	if (!isLoggedIn && !isPublicRoute) {
		const signInUrl = new URL('/signin', nextUrl.origin)
		signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
		return NextResponse.redirect(signInUrl)
	}

	// If user is logged in and trying to access signin/signup pages
	if (isLoggedIn && (nextUrl.pathname === '/signin' || nextUrl.pathname === '/signup')) {
		return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
	}

	// If user is logged in and on root path, redirect to dashboard
	if (isLoggedIn && nextUrl.pathname === '/') {
		return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
	}

	return NextResponse.next()
})

export const config = {
	matcher: [
		'/((?!api/|_next/|favicon.ico|.*\\.).*)',
	],
}