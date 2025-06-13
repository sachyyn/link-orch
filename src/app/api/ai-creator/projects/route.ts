import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getProjects, createProject, type ProjectFilters, type ProjectListResult } from '@/db/services/ai-creator-service'
import { type AIProject, type CreateProjectInput } from '@/db/schema'
import { z } from 'zod'
import { createProjectApiSchema, type CreateProjectApiInput } from '@/lib/schemas'

// Validation schemas
const projectFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  tone: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Types for API responses
interface ProjectResponse extends Omit<AIProject, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

interface ProjectListResponse {
  projects: ProjectResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * GET /api/ai-creator/projects
 * 
 * Retrieves paginated list of AI Creator projects with filtering options
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - tone: Filter by content tone
 * - isActive: Filter by active status
 * - search: Search in name, description, and guidelines
 * - startDate: Filter projects created after date
 * - endDate: Filter projects created before date
 */
export const GET = createGetHandler<ProjectFilters, ProjectListResponse>(
  async ({ userId, query }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    const result = await getProjects(userId, query || {})
    
    // Transform dates to strings for JSON serialization
    const transformedProjects = result.projects.map(project => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }))

    return {
      projects: transformedProjects,
      pagination: result.pagination,
    }
  },
  {
    requireAuth: true,
    querySchema: projectFilterSchema,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/ai-creator/projects
 * 
 * Creates a new AI Creator project
 * Body schema: createProjectApiSchema
 */
export const POST = createPostHandler<CreateProjectApiInput, ProjectResponse>(
  async ({ userId, body }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const {
      name,
      description,
      tone,
      contentTypes,
      guidelines,
      targetAudience,
      keyTopics,
      brandVoice,
      contentPillars,
      defaultModel,
    } = body

    // Validate content types is valid JSON array
    try {
      const parsedContentTypes = JSON.parse(contentTypes)
      if (!Array.isArray(parsedContentTypes)) {
        throw new Error('Content types must be a JSON array')
      }
    } catch (error) {
      throw new Error('Invalid content types format - must be valid JSON array')
    }

    // Create project using database service
    const newProject = await createProject(userId, {
      name,
      description,
      tone,
      contentTypes,
      guidelines,
      targetAudience,
      keyTopics,
      brandVoice,
      contentPillars,
      defaultModel,
    })

    // Transform for response
    return {
      ...newProject,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString(),
    }
  },
  {
    bodySchema: createProjectApiSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 