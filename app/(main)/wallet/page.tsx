"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Send, Minus, CreditCard, Info, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getUserWallet, createWithdrawalRequest } from '@/actions/wallet.actions';

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
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchWalletData();
    }
  }, [session]);

  const fetchWalletData = async () => {
    try {
      const data = await getUserWallet();
      setWalletData(data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawalAmount) > (walletData?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId) {
      setError('Please enter UPI ID');
      return;
    }

    if (paymentMethod === 'BLOCKCHAIN' && !walletAddress) {
      setError('Please enter wallet address');
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

      setSuccess('Withdrawal request submitted successfully!');
      setWithdrawalAmount('');
      setUpiId('');
      setWalletAddress('');
      fetchWalletData();
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      setError('Failed to create withdrawal request');
    } finally {
      setWithdrawing(false);
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
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">My Wallet</h1>
        </div>

        {/* Balance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              ₹{walletData.balance.toFixed(2)}
            </div>
            <div className="flex gap-4 mt-4 text-sm text-gray-600">
              {walletData.role === 'VALIDATOR' && (
                <div>Total Earned: ₹{walletData.totalEarned?.toFixed(2) || '0.00'}</div>
              )}
              {walletData.role === 'SUBMITTER' && (
                <div>Total Spent: ₹{walletData.totalSpent?.toFixed(2) || '0.00'}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="withdraw" className="space-y-4">
          <TabsList>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Withdraw Funds
                </CardTitle>
                <CardDescription>
                  Withdraw your earnings to your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="Enter amount"
                      max={walletData.balance}
                    />
                  </div>

                  <div>
                    <Label htmlFor="method">Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as 'UPI' | 'BLOCKCHAIN')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="BLOCKCHAIN">Blockchain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentMethod === 'UPI' && (
                  <div>
                    <Label htmlFor="upi">UPI ID</Label>
                    <Input
                      id="upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter your UPI ID"
                    />
                  </div>
                )}

                {paymentMethod === 'BLOCKCHAIN' && (
                  <div>
                    <Label htmlFor="wallet">Wallet Address</Label>
                    <Input
                      id="wallet"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your wallet address"
                    />
                  </div>
                )}

                <Button
                  onClick={handleWithdrawal}
                  disabled={withdrawing || !withdrawalAmount}
                  className="w-full"
                >
                  {withdrawing ? 'Processing...' : 'Submit Withdrawal Request'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Your recent withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {walletData.withdrawalRequests && walletData.withdrawalRequests.length > 0 ? (
                  <div className="space-y-4">
                    {walletData.withdrawalRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">₹{request.amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(request.createdAt).toLocaleDateString()}
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
                          >
                            {request.status}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {request.paymentMethod}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No withdrawal requests yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
