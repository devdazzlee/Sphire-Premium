"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CreditCard,
  Plus,
  MoreHorizontal,
  Settings,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Wallet,
  Smartphone,
  Globe,
  Shield,
  Zap,
  Building,
  Download,
  Search,
} from "lucide-react"

// Mock data for payment methods
const paymentMethods = [
  {
    id: 1,
    name: "Stripe",
    type: "Credit Card",
    status: "active",
    icon: CreditCard,
    description: "Accept credit and debit cards",
    fees: "2.9% + 30¢",
    transactions: 1247,
    volume: 89420.5,
    enabled: true,
    countries: ["US", "CA", "UK", "AU"],
    currencies: ["USD", "CAD", "GBP", "AUD"],
  },
  {
    id: 2,
    name: "PayPal",
    type: "Digital Wallet",
    status: "active",
    icon: Wallet,
    description: "PayPal and PayPal Credit",
    fees: "2.9% + 30¢",
    transactions: 892,
    volume: 45230.75,
    enabled: true,
    countries: ["US", "CA", "UK", "AU", "DE", "FR"],
    currencies: ["USD", "EUR", "GBP", "CAD"],
  },
  {
    id: 3,
    name: "Apple Pay",
    type: "Mobile Payment",
    status: "active",
    icon: Smartphone,
    description: "One-touch payments on iOS",
    fees: "2.9% + 30¢",
    transactions: 567,
    volume: 32150.25,
    enabled: true,
    countries: ["US", "CA", "UK", "AU"],
    currencies: ["USD", "CAD", "GBP", "AUD"],
  },
  {
    id: 4,
    name: "Google Pay",
    type: "Mobile Payment",
    status: "inactive",
    icon: Globe,
    description: "Fast checkout with Google",
    fees: "2.9% + 30¢",
    transactions: 0,
    volume: 0,
    enabled: false,
    countries: ["US", "CA", "UK", "AU"],
    currencies: ["USD", "CAD", "GBP", "AUD"],
  },
  {
    id: 5,
    name: "Bank Transfer",
    type: "Bank Transfer",
    status: "active",
    icon: Building,
    description: "Direct bank transfers",
    fees: "0.8%",
    transactions: 234,
    volume: 78900.0,
    enabled: true,
    countries: ["US", "CA", "UK", "AU", "DE", "FR"],
    currencies: ["USD", "EUR", "GBP", "CAD"],
  },
]

// Mock data for transactions
const transactions = [
  {
    id: "TXN-001",
    customer: "John Smith",
    email: "john@example.com",
    amount: 129.99,
    currency: "USD",
    method: "Stripe",
    status: "completed",
    date: "2024-01-15T10:30:00Z",
    orderId: "ORD-1001",
    fees: 4.07,
  },
  {
    id: "TXN-002",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    amount: 89.5,
    currency: "USD",
    method: "PayPal",
    status: "completed",
    date: "2024-01-15T09:15:00Z",
    orderId: "ORD-1002",
    fees: 2.9,
  },
  {
    id: "TXN-003",
    customer: "Mike Wilson",
    email: "mike@example.com",
    amount: 249.99,
    currency: "USD",
    method: "Apple Pay",
    status: "pending",
    date: "2024-01-15T08:45:00Z",
    orderId: "ORD-1003",
    fees: 7.55,
  },
  {
    id: "TXN-004",
    customer: "Emily Davis",
    email: "emily@example.com",
    amount: 67.25,
    currency: "USD",
    method: "Stripe",
    status: "failed",
    date: "2024-01-15T07:20:00Z",
    orderId: "ORD-1004",
    fees: 0,
  },
  {
    id: "TXN-005",
    customer: "David Brown",
    email: "david@example.com",
    amount: 189.99,
    currency: "USD",
    method: "Bank Transfer",
    status: "completed",
    date: "2024-01-14T16:30:00Z",
    orderId: "ORD-1005",
    fees: 1.52,
  },
]

export default function PaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "refunded":
        return <RefreshCw className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesMethod = methodFilter === "all" || transaction.method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0)
  const completedTransactions = transactions.filter((t) => t.status === "completed").length
  const pendingTransactions = transactions.filter((t) => t.status === "pending").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Manage payment methods and view transaction history</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>Configure a new payment method for your store</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider">Payment Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="authorize">Authorize.Net</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" placeholder="e.g., Credit Cards" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="enabled" />
                  <Label htmlFor="enabled">Enable immediately</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Method</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Volume</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${totalVolume.toLocaleString()}</div>
            <p className="text-xs text-blue-700">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{completedTransactions}</div>
            <p className="text-xs text-green-700">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Pending</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingTransactions}</div>
            <p className="text-xs text-yellow-700">-2.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Total Fees</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${totalFees.toFixed(2)}</div>
            <p className="text-xs text-purple-700">2.9% average rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="methods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon
              return (
                <Card
                  key={method.id}
                  className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{method.name}</CardTitle>
                          <CardDescription className="text-sm">{method.type}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(method.status)}>{method.status}</Badge>
                      <Switch checked={method.enabled} />
                    </div>

                    <p className="text-sm text-muted-foreground">{method.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Processing Fee:</span>
                        <span className="font-medium">{method.fees}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transactions:</span>
                        <span className="font-medium">{method.transactions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-medium">${method.volume.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        <span>{method.countries.length} countries</span>
                        <span>•</span>
                        <span>{method.currencies.length} currencies</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Stripe">Stripe</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transactions Table */}
              <div className="rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Transaction</th>
                        <th className="text-left p-4 font-medium">Customer</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Method</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t hover:bg-muted/30">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{transaction.id}</div>
                              <div className="text-sm text-muted-foreground">Order: {transaction.orderId}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{transaction.customer}</div>
                              <div className="text-sm text-muted-foreground">{transaction.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">${transaction.amount}</div>
                              <div className="text-sm text-muted-foreground">Fee: ${transaction.fees}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{transaction.method}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              <span className="capitalize">{transaction.status}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">{new Date(transaction.date).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Refund
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>Configure payment processing settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-capture payments</Label>
                    <p className="text-xs text-muted-foreground">Automatically capture authorized payments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email receipts</Label>
                    <p className="text-xs text-muted-foreground">Send email receipts to customers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Failed payment retry</Label>
                    <p className="text-xs text-muted-foreground">Automatically retry failed payments</p>
                  </div>
                  <Switch />
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                      <SelectItem value="gbp">GBP - British Pound</SelectItem>
                      <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>Payment security and fraud protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">3D Secure</Label>
                    <p className="text-xs text-muted-foreground">Enable 3D Secure authentication</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Fraud detection</Label>
                    <p className="text-xs text-muted-foreground">Automatic fraud screening</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">CVV verification</Label>
                    <p className="text-xs text-muted-foreground">Require CVV for card payments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="risk-level">Risk Level Threshold</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Webhook Settings</span>
                </CardTitle>
                <CardDescription>Configure payment event notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-site.com/webhooks/payments"
                    defaultValue="https://mystore.com/webhooks/payments"
                  />
                </div>
                <div>
                  <Label>Events to Subscribe</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="payment-success" defaultChecked />
                      <Label htmlFor="payment-success" className="text-sm">
                        Payment Succeeded
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="payment-failed" defaultChecked />
                      <Label htmlFor="payment-failed" className="text-sm">
                        Payment Failed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="refund-created" />
                      <Label htmlFor="refund-created" className="text-sm">
                        Refund Created
                      </Label>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Test Webhook
                </Button>
              </CardContent>
            </Card>

            {/* Payout Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Payout Settings</span>
                </CardTitle>
                <CardDescription>Configure how you receive payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payout-schedule">Payout Schedule</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bank-account">Bank Account</Label>
                  <Input id="bank-account" placeholder="****1234" defaultValue="****1234" disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Instant payouts</Label>
                    <p className="text-xs text-muted-foreground">Receive funds instantly (additional fees apply)</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" size="sm">
                  Update Bank Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
