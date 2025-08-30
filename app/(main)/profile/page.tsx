import { getProfile, getUserStats } from "@/actions/profile.action"
import { MainProfile } from "./_components/mainprofile"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		redirect('/signin')
	}

	const [profileData, statsData] = await Promise.all([
		getProfile(),
		getUserStats()
	])

	if (!profileData.success || !profileData.user) {
		return (
			<div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600">Error loading profile</h1>
					<p className="text-neutral-600 dark:text-neutral-400 mt-2">Please try again later</p>
				</div>
			</div>
		)
	}

	const { user } = profileData
	const stats = statsData.success ? statsData.stats : null

	// Transform stats to ProfileStats format
	const profileStats = stats ? {
		memberSince: stats.memberSince || new Date().toISOString(),
		totalPosts: stats.totalIdeasSubmitted || 0,
		totalValidations: stats.totalValidations || 0,
		avgRating: stats.reputationScore || 0,
		totalEarnings: 0,
		totalSpent: 0,
		recentActivity: []
	} : {
		memberSince: new Date().toISOString(),
		totalPosts: 0,
		totalValidations: 0,
		avgRating: 0,
		totalEarnings: 0,
		totalSpent: 0,
		recentActivity: []
	}

	return <MainProfile user={{...user, onboardingCompleted: true}} stats={profileStats} />
}