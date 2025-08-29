'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { getSubmitterSpending } from '@/actions/spending.actions'
import { toast } from 'sonner'

interface SpendingData {
    overview: {
        totalPosts: number
        totalSpent: number
        totalToValidators: number
        totalPlatformFees: number
        totalValidations: number
        avgSpentPerPost: number
    }
    posts: Array<{
        id: string
        title: string
        description: string
        category: {
            name: string
            icon: string | null
        }
        status: any
        createdAt: Date
        validationCount: number
        totalSpent: number
        toValidators: number
        platformFee: number
        totalBudget: number
    }>
    monthlySpending: Array<{
        month: string
        amount: number
        count: number
    }>
}

export default function SpendingTrackingPage() {
    const [data, setData] = useState<SpendingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const result = await getSubmitterSpending()

                if (result.success && result.data) {
                    setData(result.data)
                } else {
                    setError(result.error || 'Failed to load spending data')
                    toast.error(result.error || 'Failed to load spending data')
                }
            } catch (err) {
                setError('Failed to load spending data')
                toast.error('Failed to load spending data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading spending data...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Spending Data</h2>
                    <p className="text-gray-600 mb-6">You haven't created any posts yet or no spending data is available.</p>
                    <Link href="/post/create">
                        <Button>Create Your First Post</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const { overview, posts } = data

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Spending Tracker</h1>
                <p className="text-gray-600">Track your investment in post validations and see where your money goes</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Spent</p>
                                <p className="text-2xl font-bold text-blue-600">₹{overview.totalSpent.toFixed(2)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Posts</p>
                                <p className="text-2xl font-bold">{overview.totalPosts}</p>
                            </div>
                            <FileText className="h-8 w-8 text-gray-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Validations</p>
                                <p className="text-2xl font-bold">{overview.totalValidations}</p>
                            </div>
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">To Validators</p>
                                <p className="text-2xl font-bold text-green-600">₹{overview.totalToValidators.toFixed(2)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Platform Fees</p>
                                <p className="text-2xl font-bold text-orange-600">₹{overview.totalPlatformFees.toFixed(2)}</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Per Post</p>
                                <p className="text-2xl font-bold text-purple-600">₹{overview.avgSpentPerPost.toFixed(2)}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Posts List */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Spending by Post</h2>
                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Found</h3>
                                <p className="text-gray-600 mb-4">You haven't created any posts yet.</p>
                                <Link href="/post/create">
                                    <Button>Create Your First Post</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        posts.map((post) => (
                            <Card key={post.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary">
                                                    {post.category.icon} {post.category.name}
                                                </Badge>
                                                <Badge variant={post.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {post.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">₹{post.totalSpent.toFixed(2)}</div>
                                            <div className="text-sm text-gray-500">{post.validationCount} validations</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Spending Breakdown */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                                <div className="text-sm text-green-700 font-medium">To Validators</div>
                                                <div className="text-lg font-bold text-green-800">₹{post.toValidators.toFixed(2)}</div>
                                                <div className="text-xs text-green-600">90% of total</div>
                                            </div>
                                            <div className="bg-orange-50 rounded-lg p-3 text-center">
                                                <div className="text-sm text-orange-700 font-medium">Platform Fee</div>
                                                <div className="text-lg font-bold text-orange-800">₹{post.platformFee.toFixed(2)}</div>
                                                <div className="text-xs text-orange-600">10% of total</div>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Budget Used</span>
                                                <span>{((post.totalSpent / post.totalBudget) * 100).toFixed(1)}%</span>
                                            </div>
                                            <Progress
                                                value={(post.totalSpent / post.totalBudget) * 100}
                                                className="h-2"
                                            />
                                            <div className="text-xs text-gray-500">
                                                ₹{post.totalSpent.toFixed(2)} of ₹{post.totalBudget.toFixed(2)} budget
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Link href={`/spending/${post.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full">
                                                    View Details
                                                </Button>
                                            </Link>
                                            <Link href={`/post/${post.id}`} className="flex-1">
                                                <Button variant="default" className="w-full">
                                                    View Post
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
