"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  MoreHorizontal,
  Edit,
  Copy,
  Trash,
  Share
} from "lucide-react"

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

interface EventListProps {
  events: Event[]
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

const eventTypeColors = {
  webinar: 'bg-blue-100 text-blue-800',
  workshop: 'bg-green-100 text-green-800',
  conference: 'bg-purple-100 text-purple-800',
  networking: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-orange-100 text-orange-800',
  meeting: 'bg-gray-100 text-gray-800',
}

export function EventList({ events }: EventListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getAttendanceRate = (current: number, max?: number) => {
    if (!max) return null
    return Math.round((current / max) * 100)
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-400 text-lg mb-2">No events found</div>
        <div className="text-gray-500 text-sm">Create your first event to get started</div>
        <Button className="mt-4">Create Event</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[event.status]} capitalize`}
                  >
                    {event.status}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${eventTypeColors[event.eventType]} capitalize`}
                  >
                    {event.eventType}
                  </Badge>
                </div>
                {event.description && (
                  <p className="text-gray-600 text-sm">{event.description}</p>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Share className="h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-red-600">
                    <Trash className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Date & Time</span>
                </div>
                <div className="text-sm">
                  <div>{formatDate(event.startDate)}</div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {event.isVirtual ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span className="font-medium">Location</span>
                </div>
                <div className="text-sm">
                  {event.isVirtual ? (
                    <div className="text-blue-600">Virtual Event</div>
                  ) : (
                    <div>{event.location || 'TBD'}</div>
                  )}
                </div>
              </div>
              
              {/* Attendance */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Attendance</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {event.registrations} registered
                  </div>
                  {event.maxAttendees && (
                    <div className="text-gray-500">
                      {event.currentAttendees}/{event.maxAttendees} attended
                      {getAttendanceRate(event.currentAttendees, event.maxAttendees) && (
                        <span className="ml-1">
                          ({getAttendanceRate(event.currentAttendees, event.maxAttendees)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600 font-medium">Actions</div>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="sm" className="justify-start">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Manage Attendees
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 