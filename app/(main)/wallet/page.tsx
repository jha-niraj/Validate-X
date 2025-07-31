'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
	Wallet,
	TrendingUp,
	ArrowUpRight,
	ArrowDownLeft,
	CreditCard,
	Smartphone,
	Bitcoin,
	Eye,
	EyeOff,
	Download,
	Settings,
	History,
	PiggyBank
} from 'lucide-react'
import { toast } from 'sonner'
import { getWalletInfo, updatePaymentPreferences, requestCashout, getTransactionHistory, optOutBalance } from '@/actions/wallet.actions'
import { PaymentMethod } from '@prisma/client'

interface WalletData {
	totalBalance: number
	availableBalance: number
	optedOutBalance: number
	upiId: string | null
	paytmNumber: string | null
	walletAddress: string | null
	preferredPaymentMethod: PaymentMethod | null
	totalValidations: number
	totalIdeasSubmitted: number
	reputationScore: number
	monthlyEarnings: number
	monthlyValidations: number
	canCashout: boolean
	nextCashoutAvailable: Date | null
	cashoutCooldownDays: number
	recentTransactions: Array<{
		id: string
		amount: number
		type: string
		status: string
		description: string
		createdAt: Date
	}>
}

export default function WalletPage() {
	const { data: session } = useSession()
	const [walletData, setWalletData] = useState<WalletData | null>(null)
	const [transactions, setTransactions] = useState<Array<{
		id: string
		amount: number
		type: string
		status: string
		description: string
		createdAt: Date
	}>>([]);
	const [loading, setLoading] = useState(true)
	const [balanceVisible, setBalanceVisible] = useState(true)
	const [cashoutOpen, setCashoutOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)
	const [optOutOpen, setOptOutOpen] = useState(false)
	const [blockchainWalletOpen, setBlockchainWalletOpen] = useState(false)

	// Form states
	const [cashoutAmount, setCashoutAmount] = useState('')
	const [cashoutMethod, setCashoutMethod] = useState<PaymentMethod>('RAZORPAY')
	const [cashoutPassword, setCashoutPassword] = useState('')
	const [paymentDetails, setPaymentDetails] = useState({
		upiId: '',
		paytmNumber: '',
		walletAddress: '',
		preferredMethod: 'RAZORPAY' as PaymentMethod
	})
	const [optOutAmount, setOptOutAmount] = useState('')

	useEffect(() => {
		loadWalletData()
		loadTransactions()
	}, [])

	const loadWalletData = async () => {
		try {
			const result = await getWalletInfo()
			if (result.success && result.wallet) {
				setWalletData(result.wallet as WalletData)
				setPaymentDetails({
					upiId: result.wallet.upiId || '',
					paytmNumber: result.wallet.paytmNumber || '',
					walletAddress: result.wallet.walletAddress || '',
					preferredMethod: result.wallet.preferredPaymentMethod || 'RAZORPAY'
				})
			}
		} catch (error) {
			toast.error('Failed to load wallet data')
		} finally {
			setLoading(false)
		}
	}

	const loadTransactions = async () => {
		try {
			const result = await getTransactionHistory(undefined, 20)
			if (result.success && result.transactions) {
				setTransactions(result.transactions)
			}
		} catch (error) {
			toast.error('Failed to load transactions')
		}
	}

	const handleCashout = async () => {
		if (!walletData.canCashout) {
			toast.error('Cashout not available yet. Please wait for the cooldown period.')
			return
		}

		if (!cashoutAmount || isNaN(Number(cashoutAmount))) {
			toast.error('Please enter a valid amount')
			return
		}

		if (!cashoutPassword) {
			toast.error('Please enter your password to confirm cashout')
			return
		}

		const amount = Number(cashoutAmount)
		if (amount < 100) {
			toast.error('Minimum cashout amount is ₹100')
			return
		}

		if (amount > walletData.availableBalance) {
			toast.error('Insufficient balance')
			return
		}

		try {
			const result = await requestCashout({
				amount,
				method: cashoutMethod,
				upiId: paymentDetails.upiId,
				paytmNumber: paymentDetails.paytmNumber,
				walletAddress: paymentDetails.walletAddress
			})

			if (result.success) {
				toast.success('Cashout request submitted successfully! It will be reviewed within 1-2 business days.')
				setCashoutOpen(false)
				setCashoutAmount('')
				setCashoutPassword('')
				loadWalletData()
				loadTransactions()
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			toast.error('Failed to process cashout request')
		}
	}

	const handleUpdatePaymentSettings = async () => {
		try {
			const result = await updatePaymentPreferences({
				preferredPaymentMethod: paymentDetails.preferredMethod,
				upiId: paymentDetails.upiId,
				paytmNumber: paymentDetails.paytmNumber,
				walletAddress: paymentDetails.walletAddress
			})
			if (result.success) {
				toast.success('Payment preferences updated')
				setSettingsOpen(false)
				loadWalletData()
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			toast.error('Failed to update payment preferences')
		}
	}

	const handleOptOut = async () => {
		if (!optOutAmount || isNaN(Number(optOutAmount))) {
			toast.error('Please enter a valid amount')
			return
		}

		const amount = Number(optOutAmount)
		if (amount <= 0) {
			toast.error('Amount must be greater than 0')
			return
		}

		try {
			const result = await optOutBalance(amount)
			if (result.success) {
				toast.success(`₹${amount} moved to opted-out balance`)
				setOptOutOpen(false)
				setOptOutAmount('')
				loadWalletData()
			} else {
				toast.error(result.error)
			}
		} catch (error) {
			toast.error('Failed to opt out balance')
		}
	}

	const formatCurrency = (amount: number) => {
		return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
	}

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		})
	}

	const getTransactionIcon = (type: string) => {
		switch (type) {
			case 'VALIDATION_EARNING':
			case 'BONUS':
				return <ArrowUpRight className="h-4 w-4 text-green-500" />
			case 'CASHOUT':
				return <ArrowDownLeft className="h-4 w-4 text-red-500" />
			case 'POST_PAYMENT':
				return <ArrowDownLeft className="h-4 w-4 text-blue-500" />
			default:
				return <ArrowUpRight className="h-4 w-4 text-gray-500" />
		}
	}

	const getPaymentMethodIcon = (method: PaymentMethod) => {
		switch (method) {
			case 'RAZORPAY':
			case 'PHONEPE':
				return <Smartphone className="h-4 w-4" />
			case 'POLYGON':
				return <Bitcoin className="h-4 w-4" />
			default:
				return <CreditCard className="h-4 w-4" />
		}
	}

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="grid gap-6">
					<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
					<div className="grid md:grid-cols-3 gap-6">
						{[1, 2, 3].map(i => (
							<div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
						))}
					</div>
				</div>
			</div>
		)
	}

	if (!walletData) {
		return (
			<div className="container mx-auto p-6">
				<div className="text-center py-12">
					<p className="text-gray-500">Failed to load wallet data</p>
					<Button onClick={loadWalletData} className="mt-4">
						Retry
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Wallet className="h-8 w-8" />
						Wallet
					</h1>
					<p className="text-gray-600 mt-1">
						Manage your earnings and payment preferences
					</p>
				</div>
				<div className="flex gap-2">
					<Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm">
								<Settings className="h-4 w-4 mr-2" />
								Settings
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Payment Settings</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label>Preferred Payment Method</Label>
									<Select
										value={paymentDetails.preferredMethod}
										onValueChange={(value: PaymentMethod) =>
											setPaymentDetails(prev => ({ ...prev, preferredMethod: value }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="RAZORPAY">Razorpay (UPI/Cards)</SelectItem>
											<SelectItem value="PHONEPE">PhonePe UPI</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Show only UPI fields for UPI payment methods */}
								{(paymentDetails.preferredMethod === 'RAZORPAY' || paymentDetails.preferredMethod === 'PHONEPE') && (
									<div className="space-y-3">
										<div>
											<Label>UPI ID</Label>
											<Input
												placeholder="your-upi@bank"
												value={paymentDetails.upiId}
												onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
											/>
										</div>

										<div>
											<Label>Mobile Number (for PayTM/backup)</Label>
											<Input
												placeholder="+91 9876543210"
												value={paymentDetails.paytmNumber}
												onChange={(e) => setPaymentDetails(prev => ({ ...prev, paytmNumber: e.target.value }))}
											/>
										</div>
									</div>
								)}

								<div className="flex gap-2">
									<Button onClick={handleUpdatePaymentSettings} className="flex-1">
										Update Settings
									</Button>
									<Button 
										variant="outline" 
										onClick={() => {
											setSettingsOpen(false)
											setBlockchainWalletOpen(true)
										}}
										className="flex-1"
									>
										<Bitcoin className="h-4 w-4 mr-2" />
										Blockchain
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>

					{/* Blockchain Wallet Dialog */}
					<Dialog open={blockchainWalletOpen} onOpenChange={setBlockchainWalletOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<Bitcoin className="h-5 w-5" />
									Blockchain Wallet
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div className="text-center py-8">
									<Bitcoin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
									<h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
									<p className="text-gray-600 mb-4">
										Blockchain wallet integration with Polygon and other chains is under development.
									</p>
									<div className="space-y-2 text-sm text-gray-500">
										<div className="flex items-center justify-center gap-2">
											<Bitcoin className="h-4 w-4" />
											<span>Polygon (MATIC)</span>
										</div>
										<div className="flex items-center justify-center gap-2">
											<Bitcoin className="h-4 w-4" />
											<span>Ethereum (ETH)</span>
										</div>
										<div className="flex items-center justify-center gap-2">
											<Bitcoin className="h-4 w-4" />
											<span>USDC Stablecoin</span>
										</div>
									</div>
								</div>
								<Button 
									variant="outline" 
									onClick={() => setBlockchainWalletOpen(false)}
									className="w-full"
								>
									Close
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<Button
						variant="outline"
						size="sm"
						onClick={() => setBalanceVisible(!balanceVisible)}
					>
						{balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</Button>
				</div>
			</div>

			{/* Balance Cards */}
			<div className="grid md:grid-cols-4 gap-4">
				<Card className="col-span-2">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Total Balance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div>
								<div className="text-3xl font-bold">
									{balanceVisible ? formatCurrency(walletData.totalBalance) : '****'}
								</div>
								<div className="text-sm text-gray-500 mt-1">
									Available: {balanceVisible ? formatCurrency(walletData.availableBalance) : '****'}
								</div>
							</div>
							<div className="text-right">
								<div className="space-y-2">
									{!walletData.canCashout && walletData.nextCashoutAvailable && (
										<p className="text-xs text-amber-600">
											Next cashout: {formatDate(walletData.nextCashoutAvailable)}
										</p>
									)}
									<Dialog open={cashoutOpen} onOpenChange={setCashoutOpen}>
										<DialogTrigger asChild>
											<Button 
												disabled={!walletData.canCashout}
												variant={walletData.canCashout ? "default" : "secondary"}
											>
												<Download className="h-4 w-4 mr-2" />
												{walletData.canCashout ? "Cash Out" : "Cashout Unavailable"}
											</Button>
										</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Cash Out Request</DialogTitle>
										</DialogHeader>
										<div className="space-y-4">
											<div>
												<Label>Amount (₹)</Label>
												<div className="flex gap-2">
													<Input
														type="number"
														placeholder="100"
														value={cashoutAmount}
														onChange={(e) => setCashoutAmount(e.target.value)}
														className="flex-1"
													/>
													<Button 
														variant="outline" 
														onClick={() => setCashoutAmount(walletData.availableBalance.toString())}
														type="button"
													>
														Max
													</Button>
												</div>
												<p className="text-sm text-gray-500 mt-1">
													Available: {formatCurrency(walletData.availableBalance)} • Min: ₹100
												</p>
											</div>

											<div>
												<Label>Payment Method</Label>
												<Select value={cashoutMethod} onValueChange={(value: PaymentMethod) => setCashoutMethod(value)}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="RAZORPAY">Razorpay (UPI/Cards)</SelectItem>
														<SelectItem value="PHONEPE">PhonePe UPI</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div>
												<Label>Confirm with Password</Label>
												<Input
													type="password"
													placeholder="Enter your password"
													value={cashoutPassword}
													onChange={(e) => setCashoutPassword(e.target.value)}
												/>
												<p className="text-sm text-gray-500 mt-1">
													Required for security verification
												</p>
											</div>

											<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
												<p className="text-sm text-amber-800">
													<strong>Processing Time:</strong> Cashout requests are reviewed manually and processed within 1-2 business days.
												</p>
											</div>

											<Button 
												onClick={handleCashout} 
												className="w-full"
												disabled={!cashoutAmount || !cashoutPassword}
											>
												Request Cashout
											</Button>
										</div>
									</DialogContent>
								</Dialog>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							This Month
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="text-2xl font-bold text-green-600">
								{balanceVisible ? formatCurrency(walletData.monthlyEarnings) : '****'}
							</div>
							<div className="text-sm text-gray-500">
								{walletData.monthlyValidations} validations
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
							<PiggyBank className="h-4 w-4" />
							Opted Out
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="text-2xl font-bold text-blue-600">
								{balanceVisible ? formatCurrency(walletData.optedOutBalance) : '****'}
							</div>
							<Dialog open={optOutOpen} onOpenChange={setOptOutOpen}>
								<DialogTrigger asChild>
									<Button variant="outline" size="sm" className="w-full">
										Opt Out More
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Opt Out Balance</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										<p className="text-sm text-gray-600">
											Move funds from available balance to opted-out balance. Opted-out funds are protected and won&apos;t be used for automatic deductions.
										</p>
										<div>
											<Label>Amount to Opt Out (₹)</Label>
											<Input
												type="number"
												placeholder="0"
												value={optOutAmount}
												onChange={(e) => setOptOutAmount(e.target.value)}
											/>
											<p className="text-sm text-gray-500 mt-1">
												Available: {formatCurrency(walletData.availableBalance)}
											</p>
										</div>
										<Button onClick={handleOptOut} className="w-full">
											Opt Out Amount
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Stats Cards */}
			<div className="grid md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-2xl font-bold">{walletData.totalValidations}</div>
								<div className="text-sm text-gray-500">Total Validations</div>
							</div>
							<TrendingUp className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-2xl font-bold">{walletData.totalIdeasSubmitted}</div>
								<div className="text-sm text-gray-500">Ideas Submitted</div>
							</div>
							<ArrowUpRight className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-2xl font-bold">{walletData.reputationScore}</div>
								<div className="text-sm text-gray-500">Reputation Score</div>
							</div>
							<Badge variant="secondary" className="text-lg">
								{walletData.reputationScore >= 100 ? 'Expert' :
									walletData.reputationScore >= 50 ? 'Pro' : 'Novice'}
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Transactions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<History className="h-5 w-5" />
						Recent Transactions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{transactions.length === 0 ? (
							<p className="text-gray-500 text-center py-8">No transactions yet</p>
						) : (
							transactions.map((transaction) => (
								<div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
									<div className="flex items-center gap-3">
										{getTransactionIcon(transaction.type)}
										<div>
											<div className="font-medium">{transaction.description}</div>
											<div className="text-sm text-gray-500">
												{formatDate(transaction.createdAt)}
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className={`font-bold ${transaction.type === 'VALIDATION_EARNING' || transaction.type === 'BONUS'
												? 'text-green-600'
												: 'text-red-600'
											}`}>
											{transaction.type === 'VALIDATION_EARNING' || transaction.type === 'BONUS' ? '+' : '-'}
											{formatCurrency(transaction.amount)}
										</div>
										<Badge
											variant={transaction.status === 'COMPLETED' ? 'default' : 'secondary'}
											className="text-xs"
										>
											{transaction.status}
										</Badge>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
