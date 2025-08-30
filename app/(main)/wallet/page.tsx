"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Wallet,
	Send,
	CreditCard,
	Info,
	Zap,
	TrendingUp,
	Calendar,
	ArrowUpRight,
	ArrowDownLeft,
	Clock,
	CheckCircle,
	XCircle,
	Settings,
	Eye,
	EyeOff
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getUserWallet, createWithdrawalRequest, updateUserPaymentSettings, getWalletInfo } from '@/actions/wallet.actions';
import { toast } from 'sonner';

interface WalletData {
	balance: number;
	role: string;
	totalEarned?: number;
	totalSpent?: number;
	withdrawalRequests?: Array<{
		id: string;
		amount: number;
		status: string;
		createdAt: string;
		paymentMethod: string;
		details: any;
	}>;
}

export default function WalletPage() {
	const { data: session } = useSession();
	const [walletData, setWalletData] = useState<WalletData | null>(null);
	const [loading, setLoading] = useState(true);
	const [withdrawing, setWithdrawing] = useState(false);
	const [withdrawalAmount, setWithdrawalAmount] = useState('');
	const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BLOCKCHAIN'>('UPI');
	const [upiId, setUpiId] = useState('');
	const [walletAddress, setWalletAddress] = useState('');
	const [error, setError] = useState('');
	const [showBalance, setShowBalance] = useState(true);
	const [showPaymentSettings, setShowPaymentSettings] = useState(false);
	const [savedUpiId, setSavedUpiId] = useState('');
	const [savedWalletAddress, setSavedWalletAddress] = useState('');
	const [updatingSettings, setUpdatingSettings] = useState(false);

	useEffect(() => {
		if (session?.user) {
			fetchWalletData();
		}
	}, [session]);

	const fetchWalletData = async () => {
		try {
			const data = await getUserWallet();
			setWalletData(data);

			// Also fetch saved payment settings
			const walletInfo = await getWalletInfo();
			if (walletInfo.success && walletInfo.wallet) {
				setSavedUpiId(walletInfo.wallet.upiId || '');
				setSavedWalletAddress(walletInfo.wallet.walletAddress || '');
			}
		} catch (error) {
			console.error('Error fetching wallet data:', error);
			setError('Failed to load wallet data');
		} finally {
			setLoading(false);
		}
	};

	const handleWithdrawal = async () => {
		if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (parseFloat(withdrawalAmount) < 100) {
			toast.error('Minimum withdrawal amount is ₹100');
			return;
		}

		if (parseFloat(withdrawalAmount) > (walletData?.balance || 0)) {
			toast.error('Insufficient balance');
			return;
		}

		if (paymentMethod === 'UPI' && !upiId) {
			toast.error('Please enter UPI ID');
			return;
		}

		if (paymentMethod === 'BLOCKCHAIN' && !walletAddress) {
			toast.error('Please enter wallet address');
			return;
		}

		setWithdrawing(true);
		setError('');

		try {
			await createWithdrawalRequest({
				amount: parseFloat(withdrawalAmount),
				paymentMethod,
				details: paymentMethod === 'UPI' ? { upiId } : { walletAddress }
			});

			toast.success('Withdrawal request submitted successfully!');
			setWithdrawalAmount('');
			setUpiId('');
			setWalletAddress('');
			fetchWalletData();
		} catch (error) {
			console.error('Error creating withdrawal request:', error);
			toast.error('Failed to create withdrawal request');
		} finally {
			setWithdrawing(false);
		}
	};

	const handleUpdatePaymentSettings = async () => {
		setUpdatingSettings(true);
		try {
			const result = await updateUserPaymentSettings({
				upiId: savedUpiId || undefined,
				walletAddress: savedWalletAddress || undefined
			});

			if (result.success) {
				toast.success('Payment settings updated successfully!');
				setShowPaymentSettings(false);
			} else {
				toast.error(result.error || 'Failed to update payment settings');
			}
		} catch (error) {
			console.error('Error updating payment settings:', error);
			toast.error('Failed to update payment settings');
		} finally {
			setUpdatingSettings(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!walletData) {
		return (
			<div className="container mx-auto p-6">
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>Failed to load wallet data</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
							<Wallet className="h-8 w-8 text-blue-600" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">My Wallet</h1>
							<p className="text-gray-600 dark:text-gray-400">Manage your earnings and withdrawals</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{/* Balance Visibility Toggle */}
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowBalance(!showBalance)}
							className="flex items-center gap-2"
						>
							{showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							{showBalance ? 'Hide Balance' : 'Show Balance'}
						</Button>

						{/* Payment Settings */}
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowPaymentSettings(true)}
							className="flex items-center gap-2"
						>
							<Settings className="h-4 w-4" />
							Payment Settings
						</Button>
					</div>
				</div>

				{/* Balance Overview Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-green-100">
									<Zap className="h-5 w-5" />
									Available Balance
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{showBalance ? `₹${walletData.balance.toFixed(2)}` : '••••••'}
								</div>
								<p className="text-green-100 text-sm mt-1">Ready to withdraw</p>
							</CardContent>
						</Card>
					</motion.div>

					{walletData.role === 'USER' && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-blue-600">
										<TrendingUp className="h-5 w-5" />
										Total Earned
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-blue-600">
										{showBalance ? `₹${walletData.totalEarned?.toFixed(2) || '0.00'}` : '••••••'}
									</div>
									<p className="text-gray-600 dark:text-gray-400 text-sm mt-1">All time earnings</p>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{walletData.role === 'SUBMITTER' && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-purple-600">
										<ArrowUpRight className="h-5 w-5" />
										Total Spent
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-purple-600">
										{showBalance ? `₹${walletData.totalSpent?.toFixed(2) || '0.00'}` : '••••••'}
									</div>
									<p className="text-gray-600 dark:text-gray-400 text-sm mt-1">All time spending</p>
								</CardContent>
							</Card>
						</motion.div>
					)}

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-orange-600">
									<Calendar className="h-5 w-5" />
									This Month
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-orange-600">₹0.00</div>
								<p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Monthly activity</p>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				<Tabs defaultValue="withdraw" className="space-y-6">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="withdraw" className="flex items-center gap-2">
							<Send className="h-4 w-4" />
							Withdraw Funds
						</TabsTrigger>
						<TabsTrigger value="history" className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Transaction History
						</TabsTrigger>
					</TabsList>

					<TabsContent value="withdraw">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Send className="h-5 w-5 text-blue-600" />
										Withdraw Funds
									</CardTitle>
									<CardDescription>
										Withdraw your earnings to your preferred payment method. Minimum withdrawal amount is ₹100.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="amount">Withdrawal Amount</Label>
											<div className="relative">
												<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
												<Input
													id="amount"
													type="number"
													value={withdrawalAmount}
													onChange={(e) => setWithdrawalAmount(e.target.value)}
													placeholder="0.00"
													className="pl-8 pr-24"
													min="100"
													max={walletData.balance}
												/>
												<div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="h-6 px-2 text-xs"
														onClick={() => setWithdrawalAmount((walletData.balance / 2).toFixed(2))}
													>
														Half
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														className="h-6 px-2 text-xs"
														onClick={() => setWithdrawalAmount(walletData.balance.toFixed(2))}
													>
														Max
													</Button>
												</div>
											</div>
											<p className="text-sm text-gray-500">
												Available: ₹{walletData.balance.toFixed(2)}
											</p>
										</div>

										<div className="space-y-2">
											<Label htmlFor="method">Payment Method</Label>
											<Select
												value={paymentMethod}
												onValueChange={(value) => setPaymentMethod(value as 'UPI' | 'BLOCKCHAIN')}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select payment method" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="UPI">
														<div className="flex items-center gap-2">
															<CreditCard className="h-4 w-4" />
															UPI Payment
														</div>
													</SelectItem>
													<SelectItem value="BLOCKCHAIN">
														<div className="flex items-center gap-2">
															<Wallet className="h-4 w-4" />
															Blockchain Wallet
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{paymentMethod === 'UPI' && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											transition={{ duration: 0.3 }}
											className="space-y-2"
										>
											<Label htmlFor="upi">UPI ID</Label>
											<Input
												id="upi"
												value={upiId}
												onChange={(e) => setUpiId(e.target.value)}
												placeholder="yourname@upi"
											/>
										</motion.div>
									)}

									{paymentMethod === 'BLOCKCHAIN' && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											transition={{ duration: 0.3 }}
											className="space-y-2"
										>
											<Label htmlFor="wallet">Wallet Address</Label>
											<Input
												id="wallet"
												value={walletAddress}
												onChange={(e) => setWalletAddress(e.target.value)}
												placeholder="0x..."
											/>
										</motion.div>
									)}

									<Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
										<Info className="h-4 w-4 text-blue-600" />
										<AlertDescription className="text-blue-700 dark:text-blue-300">
											Withdrawal requests are processed within 2-3 business days. A small processing fee may apply.
										</AlertDescription>
									</Alert>

									<Button
										onClick={handleWithdrawal}
										disabled={withdrawing || !withdrawalAmount || parseFloat(withdrawalAmount) < 100}
										className="w-full bg-blue-600 hover:bg-blue-700"
										size="lg"
									>
										{withdrawing ? (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												Processing...
											</div>
										) : (
											<div className="flex items-center gap-2">
												<Send className="h-4 w-4" />
												Submit Withdrawal Request
											</div>
										)}
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					</TabsContent>

					<TabsContent value="history">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Clock className="h-5 w-5 text-gray-600" />
										Transaction History
									</CardTitle>
									<CardDescription>Your recent withdrawal requests and transactions</CardDescription>
								</CardHeader>
								<CardContent>
									{walletData.withdrawalRequests && walletData.withdrawalRequests.length > 0 ? (
										<div className="space-y-4">
											{walletData.withdrawalRequests.map((request) => (
												<motion.div
													key={request.id}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
												>
													<div className="flex items-center gap-3">
														<div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
															<ArrowDownLeft className="h-4 w-4 text-gray-600" />
														</div>
														<div>
															<div className="font-semibold">₹{request.amount.toFixed(2)}</div>
															<div className="text-sm text-gray-600">
																{new Date(request.createdAt).toLocaleDateString('en-IN', {
																	year: 'numeric',
																	month: 'short',
																	day: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit'
																})}
															</div>
														</div>
													</div>
													<div className="text-right">
														<Badge
															variant={
																request.status === 'COMPLETED'
																	? 'default'
																	: request.status === 'PENDING'
																		? 'secondary'
																		: 'destructive'
															}
															className="flex items-center gap-1"
														>
															{request.status === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
															{request.status === 'PENDING' && <Clock className="h-3 w-3" />}
															{request.status === 'FAILED' && <XCircle className="h-3 w-3" />}
															{request.status}
														</Badge>
														<div className="text-sm text-gray-600 mt-1">
															via {request.paymentMethod}
														</div>
													</div>
												</motion.div>
											))}
										</div>
									) : (
										<div className="text-center py-12">
											<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
												<Clock className="h-8 w-8 text-gray-400" />
											</div>
											<h3 className="text-lg font-semibold text-gray-600 mb-2">No transactions yet</h3>
											<p className="text-gray-500">Your withdrawal requests will appear here</p>
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					</TabsContent>
				</Tabs>

				{/* Payment Settings Dialog */}
				<Dialog open={showPaymentSettings} onOpenChange={setShowPaymentSettings}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								Payment Settings
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="saved-upi">UPI ID</Label>
								<Input
									id="saved-upi"
									value={savedUpiId}
									onChange={(e) => setSavedUpiId(e.target.value)}
									placeholder="yourname@upi"
									className="mt-1"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Used for UPI withdrawals
								</p>
							</div>

							<div>
								<Label htmlFor="saved-wallet">Blockchain Wallet Address</Label>
								<Input
									id="saved-wallet"
									value={savedWalletAddress}
									onChange={(e) => setSavedWalletAddress(e.target.value)}
									placeholder="0x..."
									className="mt-1"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Used for blockchain withdrawals
								</p>
							</div>

							<div className="flex gap-3 pt-4">
								<Button
									onClick={handleUpdatePaymentSettings}
									disabled={updatingSettings}
									className="flex-1"
								>
									{updatingSettings ? (
										<div className="flex items-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											Saving...
										</div>
									) : (
										'Save Settings'
									)}
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowPaymentSettings(false)}
									disabled={updatingSettings}
								>
									Cancel
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</motion.div>
		</div>
	);
}
