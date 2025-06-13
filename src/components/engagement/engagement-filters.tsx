"use client"

import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

interface EngagementFiltersProps {
  filters: {
    status: string
    priority: string
    sentiment: string
  }
  onFilterChange: (filters: {
    status: string
    priority: string
    sentiment: string
  }) => void
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'ignored', label: 'Ignored' },
]

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' },
]

const sentimentOptions = [
  { value: '', label: 'All Sentiment' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

export function EngagementFilters({ filters, onFilterChange }: EngagementFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  const clearAllFilters = () => {
    onFilterChange({
      status: '',
      priority: '',
      sentiment: '',
    })
  }

  const hasActiveFilters = filters.status || filters.priority || filters.sentiment

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
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
          <SelectTrigger className="w-36">
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

        <Select value={filters.sentiment} onValueChange={(value) => handleFilterChange('sentiment', value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            {sentimentOptions.map((option) => (
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
            onClick={clearAllFilters}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              Priority: {priorityOptions.find(opt => opt.value === filters.priority)?.label}
              <button
                onClick={() => handleFilterChange('priority', '')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
          
          {filters.sentiment && (
            <Badge variant="secondary" className="gap-1">
              Sentiment: {sentimentOptions.find(opt => opt.value === filters.sentiment)?.label}
              <button
                onClick={() => handleFilterChange('sentiment', '')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
} 