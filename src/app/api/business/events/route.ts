import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { z } from 'zod'

// Validation schema for event creation
const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  eventType: z.enum(['workshop', 'webinar', 'networking', 'conference', 'meetup', 'other']),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  location: z.string().max(255).optional(),
  isVirtual: z.boolean().default(false),
  maxAttendees: z.number().int().min(1).max(10000).optional(),
  registrationRequired: z.boolean().default(true),
  tags: z.array(z.string()).max(10).optional(),
})

// Types for business events
interface BusinessEvent {
  id: number
  title: string
  description?: string
  eventType: 'workshop' | 'webinar' | 'networking' | 'conference' | 'meetup' | 'other'
  startDateTime: string
  endDateTime: string
  location?: string
  isVirtual: boolean
  maxAttendees?: number
  registrationRequired: boolean
  tags: string[]
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  
  // Event metrics
  stats: {
    registrations: number
    attendees: number
    noShows: number
    completionRate: number
    avgRating?: number
    totalRatings: number
  }
  
  // Related content
  linkedPosts: Array<{
    postId: number
    title: string
    publishedAt: string
    impressions: number
  }>
}

interface EventListResponse {
  events: BusinessEvent[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  stats: {
    totalEvents: number
    upcomingEvents: number
    completedEvents: number
    totalAttendees: number
  }
}

interface EventQuery {
  page?: number
  limit?: number
  status?: string
  eventType?: string
  search?: string
  from?: string // Date filter
  to?: string   // Date filter
}

/**
 * GET /api/business/events
 * 
 * Retrieves business events with filtering and pagination
 * Includes event statistics and performance metrics
 */
export const GET = createGetHandler<any, EventListResponse>(
  async ({ userId, query }) => {
    const {
      page = 1,
      limit = 10,
      status,
      eventType,
      search,
      from,
      to
    } = (query || {}) as EventQuery

    // Mock events data
    const mockEvents: BusinessEvent[] = [
      {
        id: 1,
        title: "LinkedIn Growth Masterclass",
        description: "Learn advanced strategies to grow your LinkedIn presence and build meaningful professional relationships.",
        eventType: 'webinar',
        startDateTime: '2024-02-15T14:00:00Z',
        endDateTime: '2024-02-15T15:30:00Z',
        location: 'Virtual',
        isVirtual: true,
        maxAttendees: 100,
        registrationRequired: true,
        tags: ['linkedin', 'growth', 'networking', 'marketing'],
        status: 'published',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-22T16:30:00Z',
        stats: {
          registrations: 87,
          attendees: 0,
          noShows: 0,
          completionRate: 0,
          totalRatings: 0,
        },
        linkedPosts: [
          {
            postId: 5,
            title: "Announcing LinkedIn Growth Masterclass",
            publishedAt: '2024-01-22T09:00:00Z',
            impressions: 12400,
          },
        ],
      },
      {
        id: 2,
        title: "Personal Branding Workshop",
        description: "Hands-on workshop for building a compelling personal brand on LinkedIn.",
        eventType: 'workshop',
        startDateTime: '2024-01-30T18:00:00Z',
        endDateTime: '2024-01-30T20:00:00Z',
        location: 'WeWork Downtown',
        isVirtual: false,
        maxAttendees: 25,
        registrationRequired: true,
        tags: ['personal-branding', 'workshop', 'networking'],
        status: 'completed',
        createdAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-31T10:00:00Z',
        stats: {
          registrations: 28,
          attendees: 23,
          noShows: 5,
          completionRate: 82.1,
          avgRating: 4.7,
          totalRatings: 21,
        },
        linkedPosts: [
          {
            postId: 8,
            title: "Personal Branding Workshop This Week",
            publishedAt: '2024-01-25T11:00:00Z',
            impressions: 8900,
          },
          {
            postId: 12,
            title: "Thank you to all workshop attendees!",
            publishedAt: '2024-01-31T14:00:00Z',
            impressions: 5600,
          },
        ],
      },
      {
        id: 3,
        title: "Networking Coffee Chat",
        description: "Casual networking event for professionals in tech and marketing.",
        eventType: 'networking',
        startDateTime: '2024-01-25T08:30:00Z',
        endDateTime: '2024-01-25T10:00:00Z',
        location: 'Local Coffee Shop',
        isVirtual: false,
        maxAttendees: 15,
        registrationRequired: false,
        tags: ['networking', 'coffee', 'tech', 'marketing'],
        status: 'completed',
        createdAt: '2024-01-18T09:00:00Z',
        updatedAt: '2024-01-26T11:00:00Z',
        stats: {
          registrations: 12,
          attendees: 14,
          noShows: 0,
          completionRate: 100,
          avgRating: 4.3,
          totalRatings: 8,
        },
        linkedPosts: [
          {
            postId: 10,
            title: "Join us for networking coffee tomorrow!",
            publishedAt: '2024-01-24T17:00:00Z',
            impressions: 6700,
          },
        ],
      },
    ]

    // Apply filters
    let filteredEvents = mockEvents

    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status)
    }

    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType)
    }

    if (search) {
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + limit)

    const response: EventListResponse = {
      events: paginatedEvents,
      pagination: {
        page,
        limit,
        total: filteredEvents.length,
        hasMore: startIndex + limit < filteredEvents.length,
      },
      stats: {
        totalEvents: mockEvents.length,
        upcomingEvents: mockEvents.filter(e => e.status === 'published' || e.status === 'live').length,
        completedEvents: mockEvents.filter(e => e.status === 'completed').length,
        totalAttendees: mockEvents.reduce((sum, e) => sum + e.stats.attendees, 0),
      },
    }

    return response
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/business/events
 * 
 * Creates a new business event
 * Validates event details and scheduling constraints
 */
export const POST = createPostHandler<any, BusinessEvent>(
  async ({ userId, body }) => {
    const eventData = body

    // Validate date range
    const startDate = new Date(eventData.startDateTime)
    const endDate = new Date(eventData.endDateTime)
    
    if (startDate >= endDate) {
      throw new Error('End date must be after start date')
    }

    // Validate future date
    if (startDate <= new Date()) {
      throw new Error('Event start date must be in the future')
    }

    // Mock event creation
    const newEvent: BusinessEvent = {
      id: Math.floor(Math.random() * 1000) + 100,
      ...eventData,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        registrations: 0,
        attendees: 0,
        noShows: 0,
        completionRate: 0,
        totalRatings: 0,
      },
      linkedPosts: [],
    }

    return newEvent
  },
  {
    bodySchema: createEventSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 