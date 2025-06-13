"use client"

import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface Filters {
  status: string
  eventType: string
  timeRange: string
}

interface EventFiltersProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const eventTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Conference' },
  { value: 'networking', label: 'Networking' },
  { value: 'interview', label: 'Interview' },
  { value: 'meeting', label: 'Meeting' },
]

const timeRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past Events' },
  { value: 'this_month', label: 'This Month' },
]

export function EventFilters({ filters, onFilterChange }: EventFiltersProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFilterChange({
      status: '',
      eventType: '',
      timeRange: 'all',
    })
  }

  const hasActiveFilters = filters.status || filters.eventType || filters.timeRange !== 'all'

  return (
    <div className="flex items-center gap-2">
      <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.eventType} onValueChange={(value) => handleFilterChange('eventType', value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {eventTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          {timeRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
} 