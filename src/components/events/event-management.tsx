"use client"

import { useState, useEffect } from "react"
import { EventList } from "./event-list"
import { EventCalendar } from "./event-calendar"
import { EventFilters } from "./event-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, List, Plus } from "lucide-react"

interface Event {
  id: number
  title: string
  description?: string
  startDate: string
  endDate: string
  eventType: 'webinar' | 'workshop' | 'conference' | 'networking' | 'interview' | 'meeting'
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  isVirtual: boolean
  location?: string
  maxAttendees?: number
  currentAttendees: number
  registrations: number
  createdAt: string
}

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    eventType: '',
    timeRange: 'all'
  })

  useEffect(() => {
    fetchEvents()
  }, [filters, searchQuery])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.eventType) queryParams.append('eventType', filters.eventType)
      if (filters.timeRange && filters.timeRange !== 'all') queryParams.append('timeRange', filters.timeRange)
      if (searchQuery) queryParams.append('search', searchQuery)

      // Fetch events from API
      const response = await fetch(`/api/business/events?${queryParams}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setEvents(data.data?.events || [])
      } else {
        console.error('Error fetching events:', data.error)
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const filteredEvents = events?.filter(event => {
    if (!event) return false
    
    const matchesSearch = searchQuery === '' || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filters.status === '' || event.status === filters.status
    const matchesType = filters.eventType === '' || event.eventType === filters.eventType
    
    // Time range filtering
    let matchesTimeRange = true
    if (filters.timeRange !== 'all') {
      const now = new Date()
      const eventDate = new Date(event.startDate)
      
      switch (filters.timeRange) {
        case 'upcoming':
          matchesTimeRange = eventDate > now
          break
        case 'past':
          matchesTimeRange = eventDate < now
          break
        case 'this_month':
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          matchesTimeRange = eventDate >= thisMonth && eventDate < nextMonth
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesTimeRange
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
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <EventFilters filters={filters} onFilterChange={handleFilterChange} />
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Button>
          </div>
          
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{filteredEvents.length}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredEvents.filter(event => event?.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {filteredEvents.reduce((sum, event) => sum + (event?.registrations || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Registrations</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {filteredEvents.reduce((sum, event) => sum + (event?.currentAttendees || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Attendees</div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <EventList events={filteredEvents} />
      ) : (
        <EventCalendar events={filteredEvents} />
      )}
    </div>
  )
} 