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
  priority: string
  source: string
}

interface LeadFiltersProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Won' },
  { value: 'closed_lost', label: 'Lost' },
]

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'linkedin_post', label: 'LinkedIn Post' },
  { value: 'linkedin_message', label: 'LinkedIn Message' },
  { value: 'event', label: 'Event' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
]

export function LeadFilters({ filters, onFilterChange }: LeadFiltersProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFilterChange({
      status: '',
      priority: '',
      source: '',
    })
  }

  const hasActiveFilters = filters.status || filters.priority || filters.source

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

      <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          {sourceOptions.map((option) => (
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