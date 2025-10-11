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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Mail, 
  Users, 
  Send, 
  Trash2, 
  Search, 
  TrendingUp, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar
} from "lucide-react"
import { adminApi, tokenManager } from "@/lib/api"
import { toast } from "sonner"

interface NewsletterSubscriber {
  _id: string
  email: string
  subscribedAt: string
  isActive: boolean
  source: string
  unsubscribedAt?: string
}

interface NewsletterStats {
  totalSubscribers: number
  activeSubscribers: number
  unsubscribedCount: number
  recentSubscribers: number
  subscriptionRate: string
  subscribersBySource: Array<{ _id: string; count: number }>
}

function NewsletterContent() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Newsletter send dialog
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [newsletterSubject, setNewsletterSubject] = useState("")
  const [newsletterContent, setNewsletterContent] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchNewsletterData()
  }, [currentPage, filterActive, searchQuery])

  const fetchNewsletterData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = tokenManager.getToken()
      if (!token) {
        setError('Authentication required')
        toast.error('Please log in to continue')
        return
      }

      console.log('Fetching newsletter data with token:', token ? 'Token exists' : 'No token')

      // Fetch subscribers and stats
      const [subscribersResponse, statsResponse] = await Promise.all([
        adminApi.getNewsletterSubscribers(token, {
          page: currentPage,
          limit: 20,
          isActive: filterActive,
          search: searchQuery
        }),
        adminApi.getNewsletterStats(token)
      ])

      console.log('Subscribers Response:', subscribersResponse)
      console.log('Stats Response:', statsResponse)

      if (subscribersResponse.status === 'success' && subscribersResponse.data) {
        setSubscribers(subscribersResponse.data.subscribers || [])
        setTotalPages(subscribersResponse.data.pagination?.pages || 1)
      } else {
        console.error('Subscribers fetch failed:', subscribersResponse)
        if (subscribersResponse.status === 'error') {
          setError(subscribersResponse.message || 'Failed to load subscribers')
          toast.error(subscribersResponse.message || 'Failed to load subscribers')
        }
      }

      if (statsResponse.status === 'success' && statsResponse.data) {
        // Backend returns data directly, not nested
        const statsData = statsResponse.data as NewsletterStats
        setStats(statsData)
      } else {
        console.error('Stats fetch failed:', statsResponse)
        if (statsResponse.status === 'error') {
          setError(statsResponse.message || 'Failed to load stats')
          toast.error(statsResponse.message || 'Failed to load stats')
        }
      }

    } catch (err: any) {
      console.error('Error fetching newsletter data:', err)
      setError(`Failed to load newsletter data: ${err.message}`)
      toast.error('Failed to load newsletter data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterContent.trim()) {
      toast.error('Please fill in both subject and content')
      return
    }

    try {
      setIsSending(true)
      const token = tokenManager.getToken()
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const response = await adminApi.sendNewsletter(token, {
        subject: newsletterSubject,
        content: newsletterContent
      })

      if (response.status === 'success') {
        toast.success('Newsletter sent successfully!', {
          description: `Sent to ${response.data?.recipientCount || 0} subscribers`
        })
        setIsSendDialogOpen(false)
        setNewsletterSubject("")
        setNewsletterContent("")
      } else {
        toast.error('Failed to send newsletter', {
          description: response.message
        })
      }
    } catch (err: any) {
      console.error('Error sending newsletter:', err)
      toast.error('Failed to send newsletter')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return
    }

    try {
      const token = tokenManager.getToken()
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const response = await adminApi.deleteNewsletterSubscriber(token, subscriberId)

      if (response.status === 'success') {
        toast.success('Subscriber deleted successfully')
        fetchNewsletterData()
      } else {
        toast.error('Failed to delete subscriber')
      }
    } catch (err: any) {
      console.error('Error deleting subscriber:', err)
      toast.error('Failed to delete subscriber')
    }
  }

  const handleExportSubscribers = () => {
    const csvContent = [
      ['Email', 'Status', 'Source', 'Subscribed At'],
      ...subscribers.map(sub => [
        sub.email,
        sub.isActive ? 'Active' : 'Unsubscribed',
        sub.source,
        new Date(sub.subscribedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Subscribers exported successfully')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading && !stats) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading newsletter data...</p>
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Newsletter Management</h1>
                <p className="text-muted-foreground">Manage subscribers and send newsletters</p>
              </div>
              <Button onClick={() => setIsSendDialogOpen(true)} size="lg">
                <Send className="w-4 h-4 mr-2" />
                Send Newsletter
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time subscribers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.activeSubscribers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently subscribed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.unsubscribedCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No longer active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.recentSubscribers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    New subscribers
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscribers Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscribers List</CardTitle>
                  <CardDescription>Manage your newsletter subscribers</CardDescription>
                </div>
                <Button variant="outline" onClick={handleExportSubscribers}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={filterActive === true ? "default" : "outline"}
                    onClick={() => setFilterActive(true)}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterActive === false ? "default" : "outline"}
                    onClick={() => setFilterActive(false)}
                  >
                    Unsubscribed
                  </Button>
                  <Button
                    variant={filterActive === undefined ? "default" : "outline"}
                    onClick={() => setFilterActive(undefined)}
                  >
                    All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Subscribed Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.length > 0 ? (
                      subscribers.map((subscriber) => (
                        <TableRow key={subscriber._id}>
                          <TableCell className="font-medium">{subscriber.email}</TableCell>
                          <TableCell>
                            <Badge variant={subscriber.isActive ? "default" : "secondary"}>
                              {subscriber.isActive ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                              ) : (
                                <><XCircle className="w-3 h-3 mr-1" /> Unsubscribed</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{subscriber.source}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(subscriber.subscribedAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubscriber(subscriber._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Send Newsletter Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              This will send an email to all active subscribers ({stats?.activeSubscribers || 0} recipients)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter newsletter subject..."
                value={newsletterSubject}
                onChange={(e) => setNewsletterSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter newsletter content (HTML supported)..."
                value={newsletterContent}
                onChange={(e) => setNewsletterContent(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNewsletter} disabled={isSending}>
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Newsletter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function NewsletterPage() {
  return (
    <AuthGuard>
      <NewsletterContent />
    </AuthGuard>
  )
}

