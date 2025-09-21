"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Save, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Building2,
  Truck,
  CreditCard,
  Bell,
  Globe,
  Shield,
  Settings as SettingsIcon,
  Users,
  Smartphone,
  Mail,
  MapPin,
  Phone,
  Clock,
  Eye,
  EyeOff
} from "lucide-react"
import { adminApi, tokenManager } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

function SettingsContent() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("business")

  // Form states
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan'
    },
    logo: '',
    favicon: ''
  })

  const [shippingSettings, setShippingSettings] = useState({
    defaultShippingCost: 0,
    freeShippingThreshold: 0,
    processingTime: 1,
    shippingMethods: []
  })

  const [paymentSettings, setPaymentSettings] = useState({
    acceptedMethods: [],
    currency: {
      primary: 'PKR',
      symbol: '₨',
      position: 'before'
    },
    taxRate: 0,
    invoicePrefix: 'INV'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      smtp: {
        host: '',
        port: 587,
        secure: false,
        auth: {
          user: '',
          pass: ''
        }
      },
      fromEmail: '',
      fromName: ''
    },
    sms: {
      enabled: false,
      provider: '',
      apiKey: '',
      fromNumber: ''
    },
    push: {
      enabled: false,
      vapidKeys: {
        publicKey: '',
        privateKey: ''
      }
    }
  })

  const [systemSettings, setSystemSettings] = useState({
    timezone: 'Asia/Karachi',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    itemsPerPage: 20,
    autoBackup: {
      enabled: false,
      frequency: 'daily',
      retentionDays: 30
    }
  })

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    lockoutDuration: 900,
    requireEmailVerification: false,
    requireTwoFactor: false
  })

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = tokenManager.getToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      // In a real app, you would fetch settings from API
      // For now, we'll use default values
      const defaultSettings = {
        businessInfo: {
          name: 'TechStore Pakistan',
          tagline: 'Your Premier Tech Destination',
          description: 'Leading electronics and technology retailer in Pakistan',
          email: 'info@techstore.pk',
          phone: '+92-XXX-XXXXXXX',
          address: {
            street: '123 Business District',
            city: 'Karachi',
            state: 'Sindh',
            zipCode: '75000',
            country: 'Pakistan'
          },
          logo: '',
          favicon: ''
        },
        shipping: {
          defaultShippingCost: 200,
          freeShippingThreshold: 5000,
          processingTime: 1,
          shippingMethods: [
            {
              name: 'Standard Delivery',
              description: 'Regular delivery within 3-5 business days',
              cost: 200,
              estimatedDays: { min: 3, max: 5 },
              isActive: true
            },
            {
              name: 'Express Delivery',
              description: 'Fast delivery within 1-2 business days',
              cost: 500,
              estimatedDays: { min: 1, max: 2 },
              isActive: true
            }
          ]
        },
        payment: {
          acceptedMethods: ['credit_card', 'debit_card', 'cash_on_delivery'],
          currency: {
            primary: 'PKR',
            symbol: '₨',
            position: 'before'
          },
          taxRate: 0,
          invoicePrefix: 'INV'
        },
        notifications: notificationSettings,
        system: systemSettings,
        security: securitySettings
      }

      setSettings(defaultSettings)
      setBusinessInfo(defaultSettings.businessInfo)
      setShippingSettings(defaultSettings.shipping)
      setPaymentSettings(defaultSettings.payment)
      setNotificationSettings(defaultSettings.notifications)
      setSystemSettings(defaultSettings.system)
      setSecuritySettings(defaultSettings.security)

    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)
      
      const token = tokenManager.getToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const updatedSettings = {
        businessInfo,
        shipping: shippingSettings,
        payment: paymentSettings,
        notifications: notificationSettings,
        system: systemSettings,
        security: securitySettings
      }

      // In a real app, you would save to API
      console.log('Saving settings:', updatedSettings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSettings(updatedSettings)
      setSuccess('Settings saved successfully!')

    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your store configuration and preferences</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Business Settings */}
            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                  <CardDescription>Configure your business details and branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          value={businessInfo.name}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter business name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          value={businessInfo.tagline}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, tagline: e.target.value }))}
                          placeholder="Enter business tagline"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={businessInfo.description}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter business description"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Business Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={businessInfo.email}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter business email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Business Phone *</Label>
                        <Input
                          id="phone"
                          value={businessInfo.phone}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter business phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Business Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={businessInfo.address.street}
                          onChange={(e) => setBusinessInfo(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, street: e.target.value }
                          }))}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={businessInfo.address.city}
                          onChange={(e) => setBusinessInfo(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, city: e.target.value }
                          }))}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province *</Label>
                        <Input
                          id="state"
                          value={businessInfo.address.state}
                          onChange={(e) => setBusinessInfo(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, state: e.target.value }
                          }))}
                          placeholder="Enter state/province"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                        <Input
                          id="zipCode"
                          value={businessInfo.address.zipCode}
                          onChange={(e) => setBusinessInfo(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, zipCode: e.target.value }
                          }))}
                          placeholder="Enter ZIP code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={businessInfo.address.country}
                          onChange={(e) => setBusinessInfo(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, country: e.target.value }
                          }))}
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Branding
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="logo">Logo URL</Label>
                        <Input
                          id="logo"
                          value={businessInfo.logo}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, logo: e.target.value }))}
                          placeholder="Enter logo URL"
                        />
                      </div>
                      <div>
                        <Label htmlFor="favicon">Favicon URL</Label>
                        <Input
                          id="favicon"
                          value={businessInfo.favicon}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, favicon: e.target.value }))}
                          placeholder="Enter favicon URL"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription>Configure payment methods and currency settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Accepted Payment Methods</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {[
                        { value: 'credit_card', label: 'Credit Card' },
                        { value: 'debit_card', label: 'Debit Card' },
                        { value: 'bank_transfer', label: 'Bank Transfer' },
                        { value: 'cash_on_delivery', label: 'Cash on Delivery' },
                        { value: 'digital_wallet', label: 'Digital Wallet' },
                        { value: 'cryptocurrency', label: 'Cryptocurrency' }
                      ].map((method) => (
                        <label key={method.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={paymentSettings.acceptedMethods.includes(method.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentSettings(prev => ({
                                  ...prev,
                                  acceptedMethods: [...prev.acceptedMethods, method.value]
                                }))
                              } else {
                                setPaymentSettings(prev => ({
                                  ...prev,
                                  acceptedMethods: prev.acceptedMethods.filter(m => m !== method.value)
                                }))
                              }
                            }}
                          />
                          <span className="text-sm">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Currency Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="currency">Primary Currency</Label>
                        <Select 
                          value={paymentSettings.currency.primary} 
                          onValueChange={(value) => setPaymentSettings(prev => ({
                            ...prev,
                            currency: { ...prev.currency, primary: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="symbol">Currency Symbol</Label>
                        <Input
                          id="symbol"
                          value={paymentSettings.currency.symbol}
                          onChange={(e) => setPaymentSettings(prev => ({
                            ...prev,
                            currency: { ...prev.currency, symbol: e.target.value }
                          }))}
                          placeholder="₨"
                        />
                      </div>
                      <div>
                        <Label htmlFor="position">Symbol Position</Label>
                        <Select 
                          value={paymentSettings.currency.position} 
                          onValueChange={(value) => setPaymentSettings(prev => ({
                            ...prev,
                            currency: { ...prev.currency, position: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="before">Before Amount</SelectItem>
                            <SelectItem value="after">After Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={paymentSettings.taxRate}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                      <Input
                        id="invoicePrefix"
                        value={paymentSettings.invoicePrefix}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                        placeholder="INV"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>Configure system preferences and localization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Localization
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={systemSettings.timezone} 
                          onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Karachi">Asia/Karachi</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={systemSettings.language} 
                          onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ur">Urdu</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select 
                          value={systemSettings.dateFormat} 
                          onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeFormat">Time Format</Label>
                        <Select 
                          value={systemSettings.timeFormat} 
                          onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timeFormat: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12 Hour</SelectItem>
                            <SelectItem value="24h">24 Hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Display Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemsPerPage">Items Per Page</Label>
                        <Select 
                          value={systemSettings.itemsPerPage.toString()} 
                          onValueChange={(value) => setSystemSettings(prev => ({ ...prev, itemsPerPage: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure security and authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Session Management
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          min="300"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 3600 }))}
                          placeholder="3600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Login Protection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          min="3"
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lockoutDuration">Lockout Duration (seconds)</Label>
                        <Input
                          id="lockoutDuration"
                          type="number"
                          min="300"
                          value={securitySettings.lockoutDuration}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) || 900 }))}
                          placeholder="900"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Verification Requirements
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={securitySettings.requireEmailVerification}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
                        />
                        <span>Require Email Verification</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={securitySettings.requireTwoFactor}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: e.target.checked }))}
                        />
                        <span>Require Two-Factor Authentication</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  )
}