"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Truck,
  Plus,
  Settings,
  MapPin,
  Package,
  DollarSign,
  Globe,
  Edit,
  Trash2,
  MoreHorizontal,
  Plane,
  Ship,
  Car,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Mock data for shipping zones
const shippingZones = [
  {
    id: 1,
    name: "United States",
    countries: ["United States"],
    rates: [
      { id: 1, name: "Standard Shipping", price: 5.99, deliveryTime: "5-7 business days", carrier: "USPS" },
      { id: 2, name: "Express Shipping", price: 12.99, deliveryTime: "2-3 business days", carrier: "FedEx" },
      { id: 3, name: "Overnight", price: 24.99, deliveryTime: "1 business day", carrier: "UPS" },
    ],
  },
  {
    id: 2,
    name: "Canada",
    countries: ["Canada"],
    rates: [
      {
        id: 4,
        name: "Standard International",
        price: 15.99,
        deliveryTime: "7-14 business days",
        carrier: "Canada Post",
      },
      { id: 5, name: "Express International", price: 29.99, deliveryTime: "3-5 business days", carrier: "DHL" },
    ],
  },
  {
    id: 3,
    name: "Europe",
    countries: ["United Kingdom", "Germany", "France", "Italy", "Spain"],
    rates: [
      { id: 6, name: "EU Standard", price: 19.99, deliveryTime: "10-15 business days", carrier: "DHL" },
      { id: 7, name: "EU Express", price: 39.99, deliveryTime: "5-7 business days", carrier: "FedEx" },
    ],
  },
]

// Mock data for shipping carriers
const carriers = [
  { id: 1, name: "USPS", status: "active", trackingEnabled: true, logo: "🇺🇸" },
  { id: 2, name: "FedEx", status: "active", trackingEnabled: true, logo: "📦" },
  { id: 3, name: "UPS", status: "active", trackingEnabled: true, logo: "🚚" },
  { id: 4, name: "DHL", status: "active", trackingEnabled: true, logo: "✈️" },
  { id: 5, name: "Canada Post", status: "inactive", trackingEnabled: false, logo: "🇨🇦" },
]

// Mock data for shipping settings
const shippingSettings = {
  freeShippingThreshold: 75,
  defaultPackageWeight: 1,
  defaultPackageDimensions: { length: 10, width: 8, height: 6 },
  originAddress: {
    company: "Your Store",
    address1: "123 Business St",
    address2: "Suite 100",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
  },
}

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState("zones")
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false)
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<any>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping & Delivery</h1>
          <p className="text-muted-foreground">Manage shipping zones, rates, and delivery options</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Shipping Zone
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Covering 7 countries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipping Rates</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Average $18.99</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Carriers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">1 inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Shipping</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$75+</div>
            <p className="text-xs text-muted-foreground">Minimum order value</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="zones">Shipping Zones</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="packaging">Packaging</TabsTrigger>
        </TabsList>

        {/* Shipping Zones Tab */}
        <TabsContent value="zones" className="space-y-4">
          <div className="grid gap-6">
            {shippingZones.map((zone) => (
              <Card key={zone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {zone.name}
                      </CardTitle>
                      <CardDescription>
                        {zone.countries.join(", ")} • {zone.rates.length} shipping rates
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Zone
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Rate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Zone
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {zone.rates.map((rate) => (
                      <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {rate.carrier === "USPS" && <Car className="h-4 w-4 text-blue-600" />}
                            {rate.carrier === "FedEx" && <Truck className="h-4 w-4 text-blue-600" />}
                            {rate.carrier === "UPS" && <Package className="h-4 w-4 text-blue-600" />}
                            {rate.carrier === "DHL" && <Plane className="h-4 w-4 text-blue-600" />}
                            {rate.carrier === "Canada Post" && <Ship className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div>
                            <div className="font-medium">{rate.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {rate.carrier} • {rate.deliveryTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold">${rate.price}</div>
                            <div className="text-sm text-muted-foreground">per order</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Carriers Tab */}
        <TabsContent value="carriers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Carriers</CardTitle>
              <CardDescription>Manage your shipping carrier integrations and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carriers.map((carrier) => (
                  <div key={carrier.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{carrier.logo}</div>
                      <div>
                        <div className="font-medium">{carrier.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {carrier.trackingEnabled ? "Tracking enabled" : "No tracking"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={carrier.status === "active" ? "default" : "secondary"}>
                        {carrier.status === "active" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {carrier.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your shipping preferences and defaults</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="free-shipping">Free Shipping Threshold</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="free-shipping"
                      type="number"
                      defaultValue={shippingSettings.freeShippingThreshold}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-weight">Default Package Weight (lbs)</Label>
                  <Input id="default-weight" type="number" defaultValue={shippingSettings.defaultPackageWeight} />
                </div>
                <div className="space-y-2">
                  <Label>Default Package Dimensions (inches)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Length" defaultValue={shippingSettings.defaultPackageDimensions.length} />
                    <Input placeholder="Width" defaultValue={shippingSettings.defaultPackageDimensions.width} />
                    <Input placeholder="Height" defaultValue={shippingSettings.defaultPackageDimensions.height} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origin Address</CardTitle>
                <CardDescription>Where your packages ship from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue={shippingSettings.originAddress.company} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input id="address1" defaultValue={shippingSettings.originAddress.address1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input id="address2" defaultValue={shippingSettings.originAddress.address2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue={shippingSettings.originAddress.city} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" defaultValue={shippingSettings.originAddress.state} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" defaultValue={shippingSettings.originAddress.zip} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue={shippingSettings.originAddress.country}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Packaging Tab */}
        <TabsContent value="packaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Package Types</CardTitle>
              <CardDescription>Define custom package types for accurate shipping calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Small Box", dimensions: "6×4×2", weight: "0.5 lbs", active: true },
                  { name: "Medium Box", dimensions: "10×8×6", weight: "1.0 lbs", active: true },
                  { name: "Large Box", dimensions: "14×12×10", weight: "2.0 lbs", active: true },
                  { name: "Envelope", dimensions: "12×9×0.5", weight: "0.1 lbs", active: false },
                ].map((pkg, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {pkg.dimensions} • {pkg.weight}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={pkg.active} />
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Package Type
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
