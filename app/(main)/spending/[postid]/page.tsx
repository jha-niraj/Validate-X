'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, DollarSign, TrendingUp, Eye, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { getPostSpendingDetails } from '@/actions/spending.actions'
import { PostStatus, ValidationType } from '@prisma/client'
import { toast } from 'sonner'
import { notFound } from 'next/navigation'

interface PostSpendingData {
	post: {
		id: string
		title: string
		description: string
		category: string
		categoryIcon: string | null
		status: PostStatus
		createdAt: Date
		expiryDate: Date
	}
	spending: {
		totalSpent: number
		normalSpent: number
		detailedSpent: number
		platformFee: number
		toValidators: number
	}
	progress: {
		normalValidations: string
		detailedValidations: string
		totalValidations: number
		normalProgress: number
		detailedProgress: number
	}
	timeline: Array<{
		date: string
		normalCount: number
		detailedCount: number
		totalRewards: number
	}>
	validations: Array<{
		id: string
		type: ValidationType
		vote: string | null
		validatorName: string
		validatorReputation: number
		rewardAmount: number
		createdAt: Date
		shortComment: string | null
	}>
}

export default function PostSpendingDetailsPage({ params }: { params: Promise<{ postid: string }> }) {
	const [data, setData] = useState<PostSpendingData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchData() {
			try {
				setLoading(true)
				const { postid } = await params
				const result = await getPostSpendingDetails(postid)
				
				if (result.success && result.data) {
					setData(result.data)
				} else {
					setError(result.error || 'Failed to load post details')
					toast.error(result.error || 'Failed to load post details')
				}
			} catch (err) {
				console.log("Error while loading post details:", err)
				setError('Failed to load post details')
				toast.error('Failed to load post details')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [params])

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading post details...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error || !data) {
		return notFound()
	}

	const { post, spending, progress, validations } = data

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8">
			{/* Header */}
			<div className="flex items-center gap-4 mb-8">
				<Link href="/spending">
					<Button variant="outline" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Spending
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
					<p className="text-gray-600">Detailed spending analysis</p>
				</div>
			</div>

			{/* Post Details Hero Section */}
			<Card className="bg-gradient-to-r from-blue-50 to-purple-50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<span className="text-2xl">{post.categoryIcon}</span>
						Post Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-gray-900 mb-2">Description</h3>
								<p className="text-gray-700 leading-relaxed">{post.description}</p>
							</div>
							<div className="flex gap-4">
								<Badge variant="secondary">{post.category}</Badge>
								<Badge variant={post.status === 'OPEN' ? 'default' : 'secondary'}>
									{post.status}
								</Badge>
							</div>
						</div>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-600">Created</p>
									<p className="font-semibold">{new Date(post.createdAt).toLocaleDateString()}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Expires</p>
									<p className="font-semibold">{new Date(post.expiryDate).toLocaleDateString()}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-600">Total Validations</p>
									<p className="text-2xl font-bold text-blue-600">{progress.totalValidations}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Total Spent</p>
									<p className="text-2xl font-bold text-green-600">₹{spending.totalSpent.toFixed(2)}</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Spending Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Spending Breakdown
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="bg-blue-50 rounded-lg p-4 text-center">
							<div className="text-sm text-blue-700 font-medium">Normal Validation</div>
							<div className="text-xl font-bold text-blue-800">₹{spending.normalSpent.toFixed(2)}</div>
							<div className="text-xs text-blue-600">{progress.normalValidations}</div>
						</div>
						<div className="bg-green-50 rounded-lg p-4 text-center">
							<div className="text-sm text-green-700 font-medium">Detailed Validation</div>
							<div className="text-xl font-bold text-green-800">₹{spending.detailedSpent.toFixed(2)}</div>
							<div className="text-xs text-green-600">{progress.detailedValidations}</div>
						</div>
						<div className="bg-purple-50 rounded-lg p-4 text-center">
							<div className="text-sm text-purple-700 font-medium">To Validators</div>
							<div className="text-xl font-bold text-purple-800">₹{spending.toValidators.toFixed(2)}</div>
							<div className="text-xs text-purple-600">90% of total</div>
						</div>
						<div className="bg-orange-50 rounded-lg p-4 text-center">
							<div className="text-sm text-orange-700 font-medium">Platform Fee</div>
							<div className="text-xl font-bold text-orange-800">₹{spending.platformFee.toFixed(2)}</div>
							<div className="text-xs text-orange-600">10% of total</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Progress Tracking */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Validation Progress
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span>Normal Validations</span>
								<span>{progress.normalValidations}</span>
							</div>
							<Progress value={progress.normalProgress} className="h-3" />
							<div className="text-xs text-gray-500 mt-1">
								{progress.normalProgress.toFixed(1)}% complete
							</div>
						</div>
						<div>
							<div className="flex justify-between text-sm mb-2">
								<span>Detailed Validations</span>
								<span>{progress.detailedValidations}</span>
							</div>
							<Progress value={progress.detailedProgress} className="h-3" />
							<div className="text-xs text-gray-500 mt-1">
								{progress.detailedProgress.toFixed(1)}% complete
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recent Validations */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Recent Validations
					</CardTitle>
				</CardHeader>
				<CardContent>
					{validations.length === 0 ? (
						<div className="text-center py-8">
							<Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-600">No validations yet</p>
						</div>
					) : (
						<div className="space-y-4">
							{validations.slice(0, 10).map((validation) => (
								<div key={validation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
									<div className="flex items-center gap-4">
										<Badge variant={validation.type === 'NORMAL' ? 'secondary' : 'default'}>
											{validation.type}
										</Badge>
										<div>
											<p className="font-medium">{validation.validatorName}</p>
											<p className="text-sm text-gray-600">
												Rep: {validation.validatorReputation} • {validation.vote}
											</p>
											{validation.shortComment && (
												<p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
													<MessageSquare className="h-3 w-3" />
													{validation.shortComment}
												</p>
											)}
										</div>
									</div>
									<div className="text-right">
										<p className="font-bold text-green-600">₹{validation.rewardAmount.toFixed(2)}</p>
										<p className="text-xs text-gray-500">
											{new Date(validation.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex gap-4">
				<Link href={`/post/${post.id}`} className="flex-1">
					<Button className="w-full">
						<Eye className="h-4 w-4 mr-2" />
						View Post
					</Button>
				</Link>
				<Link href="/spending" className="flex-1">
					<Button variant="outline" className="w-full">
						Back to All Spending
					</Button>
				</Link>
			</div>
		</div>
	)
}
