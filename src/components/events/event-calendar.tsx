"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

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

interface EventCalendarProps {
  events: Event[]
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date)
    return events?.filter(event => {
      const eventDate = new Date(event.startDate)
      return (
        eventDate.getDate() === targetDate.getDate() &&
        eventDate.getMonth() === targetDate.getMonth() &&
        eventDate.getFullYear() === targetDate.getFullYear()
      )
    }) || []
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Create array of days for the calendar grid
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  if (!events) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-400 text-lg mb-2">No events to display</div>
        <div className="text-gray-500 text-sm">Events will appear on the calendar when created</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-b">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : []
            const isToday = day && 
              new Date().getDate() === day &&
              new Date().getMonth() === currentDate.getMonth() &&
              new Date().getFullYear() === currentDate.getFullYear()

            return (
              <div 
                key={index} 
                className={`min-h-24 p-2 border-b border-r last:border-r-0 ${
                  !day ? 'bg-gray-50' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div 
                          key={event.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow"
                          title={`${event.title} - ${formatTime(event.startDate)}`}
                        >
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              event.status === 'published' ? 'bg-green-500' :
                              event.status === 'draft' ? 'bg-gray-400' :
                              event.status === 'ongoing' ? 'bg-blue-500' :
                              event.status === 'completed' ? 'bg-purple-500' :
                              'bg-red-500'
                            }`} />
                            <span className="font-medium truncate">{event.title}</span>
                          </div>
                          <div className="text-gray-500">
                            {formatTime(event.startDate)}
                          </div>
                        </div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="font-medium">Status:</div>
        {Object.entries(statusColors).map(([status, colorClass]) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${
              status === 'published' ? 'bg-green-500' :
              status === 'draft' ? 'bg-gray-400' :
              status === 'ongoing' ? 'bg-blue-500' :
              status === 'completed' ? 'bg-purple-500' :
              'bg-red-500'
            }`} />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 