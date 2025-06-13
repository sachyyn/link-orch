import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { z } from 'zod'

// Validation schema for template creation
const createTemplateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(3000),
  category: z.enum(['appreciation', 'question_answer', 'follow_up', 'networking', 'general']),
})

// Types for response templates
interface ResponseTemplate {
  id: number
  title: string
  content: string
  category: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
  usage_count: number
  createdAt: string
  updatedAt: string
  isActive: boolean
}

interface TemplateQuery {
  page?: number
  limit?: number
  category?: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
  search?: string
  isActive?: boolean
}

interface TemplateListResponse {
  templates: ResponseTemplate[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  stats: {
    totalTemplates: number
    mostUsedTemplate: { id: number; title: string; usage_count: number } | null
    categoryBreakdown: Record<string, number>
  }
}

/**
 * GET /api/engagement/templates
 * 
 * Retrieves response templates with filtering and usage statistics
 */
export const GET = createGetHandler<any, TemplateListResponse>(
  async ({ userId, query }) => {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      isActive = true
    } = (query || {}) as TemplateQuery

    // Mock templates data - in production, this would fetch from database
    const mockTemplates: ResponseTemplate[] = [
      {
        id: 1,
        title: "Thank You & Offer Help",
        content: "Thank you so much for your kind words! I'm glad you found this helpful. Feel free to reach out if you have any specific questions - I'm always happy to help fellow professionals grow on LinkedIn! 🚀",
        category: 'appreciation',
        usage_count: 15,
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-02-10T14:30:00Z',
        isActive: true,
      },
      {
        id: 2,
        title: "Answer with Resource Link",
        content: "Great question! I actually covered this topic in detail in my recent post: [LINK]. You might also find value in [RESOURCE]. Let me know if you need any clarification or have follow-up questions!",
        category: 'question_answer',
        usage_count: 23,
        createdAt: '2024-01-18T14:30:00Z',
        updatedAt: '2024-02-08T11:20:00Z',
        isActive: true,
      },
      {
        id: 3,
        title: "Networking Follow-up",
        content: "I appreciate you engaging with my content! Your profile shows we have similar interests in [INDUSTRY/TOPIC]. I'd love to connect and continue the conversation. Would you be open to that?",
        category: 'networking',
        usage_count: 8,
        createdAt: '2024-01-15T11:20:00Z',
        updatedAt: '2024-01-25T16:45:00Z',
        isActive: true,
      },
      {
        id: 4,
        title: "Schedule Follow-up Call",
        content: "Thank you for your interest! This sounds like something we should discuss in more detail. Would you be available for a brief 15-minute call this week? Here's my calendar link: [CALENDAR_LINK]",
        category: 'follow_up',
        usage_count: 12,
        createdAt: '2024-01-12T16:00:00Z',
        updatedAt: '2024-02-05T09:15:00Z',
        isActive: true,
      },
      {
        id: 5,
        title: "General Encouragement",
        content: "Thank you for sharing your thoughts! It's always great to see different perspectives in our community. Keep up the excellent work! 👏",
        category: 'general',
        usage_count: 6,
        createdAt: '2024-01-10T13:45:00Z',
        updatedAt: '2024-01-20T10:30:00Z',
        isActive: true,
      },
    ]

    // Apply filters
    let filteredTemplates = mockTemplates.filter(template => template !== null)

    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category)
    }

    if (typeof isActive === 'boolean') {
      filteredTemplates = filteredTemplates.filter(template => template.isActive === isActive)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTemplates = filteredTemplates.filter(template => 
        template.title.toLowerCase().includes(searchLower) ||
        template.content.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + limit)

    // Calculate stats
    const totalTemplates = mockTemplates.length
    const mostUsedTemplate = mockTemplates.reduce((max, template) => 
      template.usage_count > (max?.usage_count || 0) ? template : max, 
      mockTemplates[0] || null
    )

    // Category breakdown
    const categoryBreakdown = mockTemplates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const response: TemplateListResponse = {
      templates: paginatedTemplates,
      pagination: {
        page,
        limit,
        total: filteredTemplates.length,
        hasMore: startIndex + limit < filteredTemplates.length,
      },
      stats: {
        totalTemplates,
        mostUsedTemplate: mostUsedTemplate ? {
          id: mostUsedTemplate.id,
          title: mostUsedTemplate.title,
          usage_count: mostUsedTemplate.usage_count,
        } : null,
        categoryBreakdown,
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
 * POST /api/engagement/templates
 * 
 * Creates a new response template
 */
export const POST = createPostHandler<any, ResponseTemplate>(
  async ({ userId, body }) => {
    const templateData = body

    // Check for duplicate title
    // In real implementation, would check database
    const isDuplicate = false // Mock check
    
    if (isDuplicate) {
      throw new Error('A template with this title already exists')
    }

    // Mock template creation
    const newTemplate: ResponseTemplate = {
      id: Math.floor(Math.random() * 1000) + 100,
      ...templateData,
      usage_count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    }

    return newTemplate
  },
  {
    bodySchema: createTemplateSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 