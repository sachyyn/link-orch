"use client"

import { useState, useMemo } from "react"
import { useLeads, useEvents } from "@/hooks/use-api"
import { LeadPipeline } from "./lead-pipeline"
import { LeadTable } from "./lead-table"
import { LeadFilters } from "./lead-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, LayoutGrid, List } from "lucide-react"

export function LeadManagement() {
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: ''
  })

  // Build API parameters for leads
  const leadsParams = useMemo(() => {
    const params: any = {}
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.source) params.source = filters.source
    if (searchQuery) params.search = searchQuery
    return params
  }, [filters, searchQuery])

  // Fetch leads using React Query
  const { 
    data: leadsData, 
    isLoading: leadsLoading, 
    error: leadsError,
    refetch: refetchLeads 
  } = useLeads(leadsParams)

  // Also fetch events for lead sources/activities
  const { 
    data: eventsData, 
    isLoading: eventsLoading 
  } = useEvents()

  // Extract data from API responses
  const leads = leadsData?.leads || []
  const events = eventsData?.events || []

  const isLoading = leadsLoading || eventsLoading
  const hasError = leadsError

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredLeads = leads?.filter((lead: any) => {
    if (!lead) return false
    
    const matchesSearch = searchQuery === '' || 
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filters.status === '' || lead.status === filters.status
    const matchesPriority = filters.priority === '' || lead.priority === filters.priority
    const matchesSource = filters.source === '' || lead.source === filters.source
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSource
  }) || []

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {/* Search and Filters Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Skeleton className="h-10 w-80" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          
          {/* Content Skeleton */}
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Failed to load leads data</p>
          <Button 
            onClick={() => refetchLeads()} 
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <LeadFilters filters={filters} onFilterChange={handleFilterChange} />
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('pipeline')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Pipeline
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Lead Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{filteredLeads.length}</div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredLeads.filter((lead: any) => lead?.status === 'closed_won').length}
          </div>
          <div className="text-sm text-gray-600">Won</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {filteredLeads.filter((lead: any) => lead?.status === 'qualified').length}
          </div>
          <div className="text-sm text-gray-600">Qualified</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            ${filteredLeads.reduce((sum: number, lead: any) => sum + (lead?.estimatedValue || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Pipeline Value</div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'pipeline' ? (
        <LeadPipeline leads={filteredLeads} />
      ) : (
        <LeadTable leads={filteredLeads} />
      )}
    </div>
  )
} 