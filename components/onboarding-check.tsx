"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { checkOnboardingStatus } from "@/actions/onboarding.actions"
import { useSession } from "next-auth/react"

export default function OnboardingCheck({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const pathname = usePathname()
	const [isChecking, setIsChecking] = useState(true)

	useEffect(() => {
		async function checkOnboarding() {
			// Skip check if user is not authenticated or on public routes
			if (status !== "authenticated" || !session) {
				setIsChecking(false)
				return
			}

			// Skip check if already on onboarding page or auth pages
			if (pathname === '/onboarding' || pathname.startsWith('/auth') || pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
				setIsChecking(false)
				return
			}

			try {
				const result = await checkOnboardingStatus()

				if (result.needsOnboarding) {
					router.push('/onboarding')
					return
				}

				setIsChecking(false)
			} catch (error) {
				console.error('Error checking onboarding status:', error)
				setIsChecking(false)
			}
		}

		checkOnboarding()
	}, [session, status, router, pathname])

	// Show loading spinner while checking
	if (isChecking) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	return <>{children}</>
}