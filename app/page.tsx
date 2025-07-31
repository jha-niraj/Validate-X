"use client"

import { BackgroundPaths } from "@/components/background-paths"
import { Header } from "@/components/navbar"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
	return (
		<>
			<Header />
			<BackgroundPaths
				title="Validate"
				subtitle="Empower Your Ideas with Blockchain-Powered Community Validation"
				showWaitingArea={false}
			/>
		</>
	)
}