import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { z } from 'zod'

// Validation schema for lead creation
const createLeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().min(1).max(200).optional(),
  jobTitle: z.string().max(150).optional(),
  linkedinUrl: z.string().url().optional(),
  phone: z.string().max(20).optional(),
  source: z.enum(['linkedin_post', 'linkedin_message', 'event', 'website', 'referral', 'other']),
  sourceDetails: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
})

// Types for business leads
interface BusinessLead {
  id: number
  firstName: string
  lastName: string
  email: string
  company?: string
  jobTitle?: string
  linkedinUrl?: string
  phone?: string
  source: 'linkedin_post' | 'linkedin_message' | 'event' | 'website' | 'referral' | 'other'
  sourceDetails?: string
  notes?: string
  tags: string[]
  
  // Lead status and pipeline
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high'
  estimatedValue?: number
  probability: number // 0-100
  
  // Tracking information
  createdAt: string
  updatedAt: string
  lastContactedAt?: string
  nextFollowUpAt?: string
  
  // Engagement data
  engagement: {
    linkedinConnected: boolean
    emailOpens: number
    emailClicks: number
    eventAttendance: number
    responseRate: number
  }
  
  // Activity history
  activities: Array<{
    id: number
    type: 'email' | 'call' | 'meeting' | 'linkedin_message' | 'note'
    description: string
    createdAt: string
    outcome?: 'positive' | 'neutral' | 'negative'
  }>
}

interface LeadListResponse {
  leads: BusinessLead[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  stats: {
    totalLeads: number
    newLeads: number
    qualifiedLeads: number
    conversionRate: number
    totalValue: number
  }
  pipeline: Array<{
    status: string
    count: number
    value: number
  }>
}

interface LeadQuery {
  page?: number
  limit?: number
  status?: string
  source?: string
  priority?: string
  search?: string
  tags?: string
}

/**
 * GET /api/business/leads
 * 
 * Retrieves business leads with filtering and pipeline analytics
 * Includes conversion tracking and engagement metrics
 */
export const GET = createGetHandler<any, LeadListResponse>(
  async ({ userId, query }) => {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      priority,
      search,
      tags
    } = (query || {}) as LeadQuery

    // Mock leads data
    const mockLeads: BusinessLead[] = [
      {
        id: 1,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@techcorp.com",
        company: "TechCorp Solutions",
        jobTitle: "Marketing Director",
        linkedinUrl: "https://linkedin.com/in/sarahjohnson",
        phone: "+1-555-0123",
        source: 'linkedin_post',
        sourceDetails: "Commented on 'LinkedIn Growth Strategies' post",
        notes: "Interested in LinkedIn training for her team",
        tags: ['marketing', 'linkedin-training', 'high-potential'],
        status: 'qualified',
        priority: 'high',
        estimatedValue: 5000,
        probability: 75,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:15:00Z',
        lastContactedAt: '2024-01-18T09:00:00Z',
        nextFollowUpAt: '2024-01-25T10:00:00Z',
        engagement: {
          linkedinConnected: true,
          emailOpens: 3,
          emailClicks: 2,
          eventAttendance: 1,
          responseRate: 85.7,
        },
        activities: [
          {
            id: 1,
            type: 'linkedin_message',
            description: 'Sent connection request with personalized message',
            createdAt: '2024-01-15T11:00:00Z',
            outcome: 'positive',
          },
          {
            id: 2,
            type: 'email',
            description: 'Sent LinkedIn training proposal',
            createdAt: '2024-01-18T09:00:00Z',
            outcome: 'positive',
          },
        ],
      },
      {
        id: 2,
        firstName: "Michael",
        lastName: "Chen",
        email: "m.chen@startup.co",
        company: "InnovateCo",
        jobTitle: "Founder & CEO",
        linkedinUrl: "https://linkedin.com/in/michaelchen",
        source: 'event',
        sourceDetails: "Met at Personal Branding Workshop",
        notes: "Looking to scale personal branding for leadership team",
        tags: ['startup', 'ceo', 'personal-branding'],
        status: 'proposal',
        priority: 'high',
        estimatedValue: 8500,
        probability: 60,
        createdAt: '2024-01-30T19:00:00Z',
        updatedAt: '2024-02-02T11:30:00Z',
        lastContactedAt: '2024-02-01T15:00:00Z',
        nextFollowUpAt: '2024-02-05T14:00:00Z',
        engagement: {
          linkedinConnected: true,
          emailOpens: 5,
          emailClicks: 3,
          eventAttendance: 1,
          responseRate: 92.3,
        },
        activities: [
          {
            id: 3,
            type: 'meeting',
            description: 'In-person meeting at workshop',
            createdAt: '2024-01-30T19:00:00Z',
            outcome: 'positive',
          },
          {
            id: 4,
            type: 'email',
            description: 'Sent custom proposal for leadership team training',
            createdAt: '2024-02-01T15:00:00Z',
            outcome: 'neutral',
          },
        ],
      },
      {
        id: 3,
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.r@consulting.firm",
        company: "Strategic Consulting Group",
        jobTitle: "Senior Consultant",
        linkedinUrl: "https://linkedin.com/in/emmarodriguez",
        source: 'linkedin_message',
        sourceDetails: "Reached out after viewing LinkedIn profile",
        notes: "Interested in content strategy consultation",
        tags: ['consulting', 'content-strategy'],
        status: 'contacted',
        priority: 'medium',
        estimatedValue: 3500,
        probability: 40,
        createdAt: '2024-01-22T14:20:00Z',
        updatedAt: '2024-01-28T09:45:00Z',
        lastContactedAt: '2024-01-25T16:30:00Z',
        nextFollowUpAt: '2024-02-05T10:00:00Z',
        engagement: {
          linkedinConnected: true,
          emailOpens: 2,
          emailClicks: 1,
          eventAttendance: 0,
          responseRate: 66.7,
        },
        activities: [
          {
            id: 5,
            type: 'linkedin_message',
            description: 'Initial outreach message',
            createdAt: '2024-01-22T14:20:00Z',
            outcome: 'positive',
          },
          {
            id: 6,
            type: 'call',
            description: '30-minute discovery call',
            createdAt: '2024-01-25T16:30:00Z',
            outcome: 'neutral',
          },
        ],
      },
    ]

    // Apply filters
    let filteredLeads = mockLeads

    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status)
    }

    if (source) {
      filteredLeads = filteredLeads.filter(lead => lead.source === source)
    }

    if (priority) {
      filteredLeads = filteredLeads.filter(lead => lead.priority === priority)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredLeads = filteredLeads.filter(lead => 
        lead.firstName.toLowerCase().includes(searchLower) ||
        lead.lastName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower) ||
        lead.notes?.toLowerCase().includes(searchLower)
      )
    }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase())
      filteredLeads = filteredLeads.filter(lead => 
        lead.tags.some(tag => tagList.includes(tag.toLowerCase()))
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + limit)

    // Calculate pipeline stats
    const pipeline = [
      { status: 'new', count: 0, value: 0 },
      { status: 'contacted', count: 0, value: 0 },
      { status: 'qualified', count: 0, value: 0 },
      { status: 'proposal', count: 0, value: 0 },
      { status: 'negotiation', count: 0, value: 0 },
      { status: 'closed_won', count: 0, value: 0 },
      { status: 'closed_lost', count: 0, value: 0 },
    ]

    mockLeads.forEach(lead => {
      const pipelineStage = pipeline.find(p => p.status === lead.status)
      if (pipelineStage) {
        pipelineStage.count++
        pipelineStage.value += lead.estimatedValue || 0
      }
    })

    const totalValue = mockLeads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
    const closedWon = mockLeads.filter(lead => lead.status === 'closed_won').length
    const conversionRate = mockLeads.length > 0 ? (closedWon / mockLeads.length) * 100 : 0

    const response: LeadListResponse = {
      leads: paginatedLeads,
      pagination: {
        page,
        limit,
        total: filteredLeads.length,
        hasMore: startIndex + limit < filteredLeads.length,
      },
      stats: {
        totalLeads: mockLeads.length,
        newLeads: mockLeads.filter(l => l.status === 'new').length,
        qualifiedLeads: mockLeads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length,
        conversionRate,
        totalValue,
      },
      pipeline,
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
 * POST /api/business/leads
 * 
 * Creates a new business lead
 * Validates contact information and sets up initial tracking
 */
export const POST = createPostHandler<any, BusinessLead>(
  async ({ userId, body }) => {
    const leadData = body

    // Check for duplicate email
    // In real implementation, would check database
    const isDuplicate = false // Mock check
    
    if (isDuplicate) {
      throw new Error('A lead with this email already exists')
    }

    // Mock lead creation
    const newLead: BusinessLead = {
      id: Math.floor(Math.random() * 1000) + 100,
      ...leadData,
      status: 'new',
      priority: 'medium',
      probability: 25, // Default for new leads
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      engagement: {
        linkedinConnected: false,
        emailOpens: 0,
        emailClicks: 0,
        eventAttendance: 0,
        responseRate: 0,
      },
      activities: [
        {
          id: 1,
          type: 'note',
          description: `Lead created from ${leadData.source}${leadData.sourceDetails ? `: ${leadData.sourceDetails}` : ''}`,
          createdAt: new Date().toISOString(),
        }
      ],
    }

    return newLead
  },
  {
    bodySchema: createLeadSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 