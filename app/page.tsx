"use client"

import { BackgroundPaths } from "@/components/background-paths"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
	return (
		<BackgroundPaths
			title="Validate"
			subtitle="Empower Your Ideas with Blockchain-Powered Community Validation"
			showWaitingArea={true}
		/>
	)
}