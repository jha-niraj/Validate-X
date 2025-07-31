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
  totalBalance: any
  availableBalance: any
  optedOutBalance: any
  upiId: string | null
  paytmNumber: string | null
  walletAddress: string | null
  preferredPaymentMethod: PaymentMethod | null
  totalValidations: number
  totalIdeasSubmitted: number
  reputationScore: number
  monthlyEarnings: any
  monthlyValidations: number
  recentTransactions: any[]
}

export default function WalletPage() {
  const { data: session } = useSession()
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [cashoutOpen, setCashoutOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [optOutOpen, setOptOutOpen] = useState(false)

  // Form states
  const [cashoutAmount, setCashoutAmount] = useState('')
  const [cashoutMethod, setCashoutMethod] = useState<PaymentMethod>('RAZORPAY')
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
    if (!cashoutAmount || isNaN(Number(cashoutAmount))) {
      toast.error('Please enter a valid amount')
      return
    }

    const amount = Number(cashoutAmount)
    if (amount < 100) {
      toast.error('Minimum cashout amount is ₹100')
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
        toast.success('Cashout request submitted successfully')
        setCashoutOpen(false)
        setCashoutAmount('')
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

  const formatCurrency = (amount: any) => {
    return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
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
                      <SelectItem value="POLYGON">Polygon Crypto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
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
                    <Label>Mobile Number (PayTM)</Label>
                    <Input
                      placeholder="+91 9876543210"
                      value={paymentDetails.paytmNumber}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, paytmNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Polygon Wallet Address</Label>
                    <Input
                      placeholder="0x..."
                      value={paymentDetails.walletAddress}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, walletAddress: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button onClick={handleUpdatePaymentSettings} className="w-full">
                  Update Settings
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
                <Dialog open={cashoutOpen} onOpenChange={setCashoutOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Cash Out
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cash Out</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={cashoutAmount}
                          onChange={(e) => setCashoutAmount(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Available: {formatCurrency(walletData.availableBalance)}
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
                            <SelectItem value="POLYGON">Polygon Crypto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={handleCashout} className="w-full">
                        Request Cashout
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.type === 'VALIDATION_EARNING' || transaction.type === 'BONUS'
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
