"use client"

import { useState, useEffect } from "react"
import { LeadPipeline } from "./lead-pipeline"
import { LeadTable } from "./lead-table"
import { LeadFilters } from "./lead-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, LayoutGrid, List } from "lucide-react"

interface Lead {
  id: number
  name: string
  email: string
  company?: string
  jobTitle?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high'
  source: string
  estimatedValue?: number
  lastContactedAt?: string
  nextFollowUpAt?: string
  createdAt: string
}

export function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: ''
  })

  useEffect(() => {
    fetchLeads()
  }, [filters, searchQuery])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.source) queryParams.append('source', filters.source)
      if (searchQuery) queryParams.append('search', searchQuery)

      // Fetch leads from API
      const response = await fetch(`/api/business/leads?${queryParams}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setLeads(data.data?.leads || [])
      } else {
        console.error('Error fetching leads:', data.error)
        setLeads([])
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredLeads = leads?.filter(lead => {
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
            {filteredLeads.filter(lead => lead?.status === 'closed_won').length}
          </div>
          <div className="text-sm text-gray-600">Won</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {filteredLeads.filter(lead => lead?.status === 'qualified').length}
          </div>
          <div className="text-sm text-gray-600">Qualified</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            ${filteredLeads.reduce((sum, lead) => sum + (lead?.estimatedValue || 0), 0).toLocaleString()}
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