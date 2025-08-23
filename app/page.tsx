"use client"

import { MainLandingPage } from "@/components/background-paths"
import { Header } from "@/components/navbar"
import SmoothScroll from "@/components/smoothscroll"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
	return (
		<SmoothScroll>
			<Header />
			<MainLandingPage
				title="Validate"
				subtitle="Empower Your Ideas with Blockchain-Powered Community Validation"
				showWaitingArea={false}
			/>
		</SmoothScroll>
	)
}