"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { EnhancedCard } from "@/components/enhanced-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Warehouse,
  BarChart3,
  RefreshCw,
  Download,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react"

const warehouses = [
  {
    id: "1",
    name: "Main Warehouse",
    location: "New York, NY",
    address: "123 Storage St, New York, NY 10001",
    capacity: 10000,
    used: 7500,
    status: "Active",
    manager: "John Smith",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    name: "West Coast Hub",
    location: "Los Angeles, CA",
    address: "456 Logistics Ave, Los Angeles, CA 90001",
    capacity: 8000,
    used: 5200,
    status: "Active",
    manager: "Sarah Johnson",
    phone: "+1 (555) 987-6543",
  },
  {
    id: "3",
    name: "Distribution Center",
    location: "Chicago, IL",
    address: "789 Supply Chain Blvd, Chicago, IL 60601",
    capacity: 12000,
    used: 9800,
    status: "Active",
    manager: "Mike Davis",
    phone: "+1 (555) 456-7890",
  },
]

const inventoryItems = [
  {
    id: "1",
    productId: "WBH-001",
    productName: "Wireless Bluetooth Headphones",
    sku: "WBH-001",
    category: "Electronics",
    totalStock: 150,
    availableStock: 120,
    reservedStock: 30,
    reorderPoint: 50,
    reorderQuantity: 100,
    costPrice: 45.0,
    sellPrice: 79.99,
    supplier: "TechSupply Co.",
    lastRestocked: "2024-01-15",
    warehouses: [
      { warehouseId: "1", stock: 75, reserved: 15 },
      { warehouseId: "2", stock: 45, reserved: 10 },
      { warehouseId: "3", stock: 30, reserved: 5 },
    ],
    movements: [
      {
        date: "2024-01-15",
        type: "Inbound",
        quantity: 50,
        reason: "Purchase Order #1234",
        warehouse: "Main Warehouse",
      },
      { date: "2024-01-14", type: "Outbound", quantity: -25, reason: "Order #5678", warehouse: "Main Warehouse" },
      {
        date: "2024-01-13",
        type: "Transfer",
        quantity: -10,
        reason: "Transfer to West Coast",
        warehouse: "Main Warehouse",
      },
    ],
    status: "In Stock",
  },
  {
    id: "2",
    productId: "SFW-002",
    productName: "Smart Fitness Watch",
    sku: "SFW-002",
    category: "Electronics",
    totalStock: 75,
    availableStock: 60,
    reservedStock: 15,
    reorderPoint: 25,
    reorderQuantity: 50,
    costPrice: 120.0,
    sellPrice: 199.99,
    supplier: "WearableTech Ltd.",
    lastRestocked: "2024-01-14",
    warehouses: [
      { warehouseId: "1", stock: 40, reserved: 8 },
      { warehouseId: "2", stock: 25, reserved: 5 },
      { warehouseId: "3", stock: 10, reserved: 2 },
    ],
    movements: [
      {
        date: "2024-01-14",
        type: "Inbound",
        quantity: 30,
        reason: "Purchase Order #1235",
        warehouse: "Main Warehouse",
      },
      { date: "2024-01-13", type: "Outbound", quantity: -15, reason: "Order #5679", warehouse: "West Coast Hub" },
    ],
    status: "In Stock",
  },
  {
    id: "3",
    productId: "ELS-003",
    productName: "Ergonomic Laptop Stand",
    sku: "ELS-003",
    category: "Accessories",
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    reorderPoint: 20,
    reorderQuantity: 40,
    costPrice: 25.0,
    sellPrice: 49.99,
    supplier: "OfficeSupply Inc.",
    lastRestocked: "2024-01-10",
    warehouses: [
      { warehouseId: "1", stock: 0, reserved: 0 },
      { warehouseId: "2", stock: 0, reserved: 0 },
      { warehouseId: "3", stock: 0, reserved: 0 },
    ],
    movements: [
      { date: "2024-01-12", type: "Outbound", quantity: -20, reason: "Order #5680", warehouse: "Main Warehouse" },
      { date: "2024-01-11", type: "Outbound", quantity: -15, reason: "Order #5681", warehouse: "Distribution Center" },
    ],
    status: "Out of Stock",
  },
  {
    id: "4",
    productId: "WGM-005",
    productName: "Wireless Gaming Mouse",
    sku: "WGM-005",
    category: "Electronics",
    totalStock: 25,
    availableStock: 20,
    reservedStock: 5,
    reorderPoint: 30,
    reorderQuantity: 60,
    costPrice: 55.0,
    sellPrice: 89.99,
    supplier: "GamerGear Co.",
    lastRestocked: "2024-01-11",
    warehouses: [
      { warehouseId: "1", stock: 15, reserved: 3 },
      { warehouseId: "2", stock: 10, reserved: 2 },
      { warehouseId: "3", stock: 0, reserved: 0 },
    ],
    movements: [
      {
        date: "2024-01-11",
        type: "Inbound",
        quantity: 25,
        reason: "Purchase Order #1236",
        warehouse: "Main Warehouse",
      },
      { date: "2024-01-10", type: "Outbound", quantity: -10, reason: "Order #5682", warehouse: "West Coast Hub" },
    ],
    status: "Low Stock",
  },
]

const stockMovements = [
  {
    id: "1",
    date: "2024-01-15",
    product: "Wireless Bluetooth Headphones",
    type: "Inbound",
    quantity: 50,
    warehouse: "Main Warehouse",
    reason: "Purchase Order #1234",
    user: "Admin",
  },
  {
    id: "2",
    date: "2024-01-15",
    product: "Smart Fitness Watch",
    type: "Outbound",
    quantity: -15,
    warehouse: "West Coast Hub",
    reason: "Order #5679",
    user: "System",
  },
  {
    id: "3",
    date: "2024-01-14",
    product: "Wireless Gaming Mouse",
    type: "Transfer",
    quantity: 10,
    warehouse: "Main Warehouse → West Coast Hub",
    reason: "Stock Rebalancing",
    user: "Manager",
  },
  {
    id: "4",
    date: "2024-01-14",
    product: "Ergonomic Laptop Stand",
    type: "Outbound",
    quantity: -20,
    warehouse: "Distribution Center",
    reason: "Order #5680",
    user: "System",
  },
  {
    id: "5",
    date: "2024-01-13",
    product: "Bluetooth Speaker",
    type: "Inbound",
    quantity: 35,
    warehouse: "Distribution Center",
    reason: "Purchase Order #1237",
    user: "Admin",
  },
]

function InventoryContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [showAddStock, setShowAddStock] = useState(false)
  const [showTransferStock, setShowTransferStock] = useState(false)

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All Status" || item.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
      case "Low Stock":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "Reorder Required":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Reorder Required</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockIcon = (item: any) => {
    if (item.totalStock === 0) return <XCircle className="w-4 h-4 text-red-500" />
    if (item.totalStock <= item.reorderPoint) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Inbound":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "Outbound":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "Transfer":
        return <ArrowUpDown className="w-4 h-4 text-blue-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500" />
    }
  }

  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.totalStock * item.costPrice, 0)
  const lowStockItems = inventoryItems.filter(
    (item) => item.totalStock <= item.reorderPoint && item.totalStock > 0,
  ).length
  const outOfStockItems = inventoryItems.filter((item) => item.totalStock === 0).length
  const totalProducts = inventoryItems.length

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
              <p className="text-muted-foreground">
                Track stock levels, manage warehouses, and monitor inventory movements
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Dialog open={showTransferStock} onOpenChange={setShowTransferStock}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Transfer Stock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Stock</DialogTitle>
                    <DialogDescription>Move inventory between warehouses</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from-warehouse">From Warehouse</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="to-warehouse">To Warehouse</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product">Product</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.productName} ({item.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="Enter quantity" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea id="reason" placeholder="Transfer reason" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTransferStock(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowTransferStock(false)}>Transfer Stock</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Stock</DialogTitle>
                    <DialogDescription>Receive new inventory into warehouse</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.productName} ({item.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="warehouse">Warehouse</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="Enter quantity" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost per Unit</Label>
                      <Input id="cost" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input id="supplier" placeholder="Supplier name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input id="reference" placeholder="Purchase order or reference number" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddStock(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowAddStock(false)}>Add Stock</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <EnhancedCard
              title="Total Products"
              value={totalProducts}
              change={{ value: "Active items", trend: "neutral" }}
              icon={Package}
            />
            <EnhancedCard
              title="Inventory Value"
              value={`$${totalInventoryValue.toLocaleString()}`}
              change={{ value: "At cost price", trend: "up" }}
              icon={BarChart3}
            />
            <EnhancedCard
              title="Low Stock Items"
              value={lowStockItems}
              change={{ value: "Need reordering", trend: "down" }}
              icon={AlertTriangle}
            />
            <EnhancedCard
              title="Out of Stock"
              value={outOfStockItems}
              change={{ value: "Immediate attention", trend: "down" }}
              icon={XCircle}
            />
            <EnhancedCard
              title="Warehouses"
              value={warehouses.length}
              change={{ value: "Active locations", trend: "neutral" }}
              icon={Warehouse}
            />
          </div>

          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
              <TabsTrigger value="movements">Stock Movements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Inventory Overview</CardTitle>
                      <CardDescription>Monitor stock levels across all warehouses</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search products by name or SKU..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Warehouses">All Warehouses</SelectItem>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Status">All Status</SelectItem>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Total Stock</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Reserved</TableHead>
                          <TableHead>Reorder Point</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {getStockIcon(item)}
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-muted-foreground">{item.category}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                            <TableCell className="font-medium">{item.totalStock}</TableCell>
                            <TableCell>{item.availableStock}</TableCell>
                            <TableCell>{item.reservedStock}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{item.reorderPoint}</span>
                                {item.totalStock <= item.reorderPoint && (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>${(item.totalStock * item.costPrice).toFixed(2)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <ArrowUpDown className="mr-2 h-4 w-4" />
                                    Transfer Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Adjust Stock
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="warehouses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((warehouse) => (
                  <Card key={warehouse.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                            <Warehouse className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{warehouse.location}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{warehouse.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Capacity Utilization</span>
                            <span>{Math.round((warehouse.used / warehouse.capacity) * 100)}%</span>
                          </div>
                          <Progress value={(warehouse.used / warehouse.capacity) * 100} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{warehouse.used.toLocaleString()} used</span>
                            <span>{warehouse.capacity.toLocaleString()} total</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Manager:</span>
                            <span className="font-medium">{warehouse.manager}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Phone:</span>
                            <span className="font-medium">{warehouse.phone}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" className="w-full bg-transparent">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="movements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movements</CardTitle>
                  <CardDescription>Track all inventory movements and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Warehouse</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>User</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockMovements.map((movement) => (
                          <TableRow key={movement.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{movement.date}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{movement.product}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getMovementIcon(movement.type)}
                                <span>{movement.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={movement.quantity > 0 ? "text-green-600" : "text-red-600"}>
                                {movement.quantity > 0 ? "+" : ""}
                                {movement.quantity}
                              </span>
                            </TableCell>
                            <TableCell>{movement.warehouse}</TableCell>
                            <TableCell>{movement.reason}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{movement.user}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Turnover</CardTitle>
                    <CardDescription>Product movement velocity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inventoryItems.slice(0, 5).map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-xs text-white font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium">{item.productName}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{(Math.random() * 5 + 1).toFixed(1)}x</div>
                            <div className="text-xs text-muted-foreground">per month</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reorder Alerts</CardTitle>
                    <CardDescription>Items requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inventoryItems
                        .filter((item) => item.totalStock <= item.reorderPoint)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getStockIcon(item)}
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Stock: {item.totalStock} / Reorder: {item.reorderPoint}
                                </p>
                              </div>
                            </div>
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Reorder
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <AuthGuard>
      <InventoryContent />
    </AuthGuard>
  )
}
