import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api-wrapper'
import { getProjectById, updateProject, deleteProject } from '@/db/services/ai-creator-service'
import { type AIProject, type CreateProjectInput } from '@/db/schema'
import { z } from 'zod'

// Validation schema for updates
const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'thought-leader', 'provocative', 'educational', 'inspirational', 'conversational', 'custom']).optional(),
  contentTypes: z.string().optional(), // JSON array as string
  guidelines: z.string().optional(),
  targetAudience: z.string().optional(),
  keyTopics: z.string().optional(),
  brandVoice: z.string().optional(),
  contentPillars: z.string().optional(),
  isActive: z.boolean().optional(),
  defaultModel: z.string().optional(),
})

// Types for API responses
interface ProjectResponse extends Omit<AIProject, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

interface DeleteResponse {
  success: boolean
  message: string
}

/**
 * GET /api/ai-creator/projects/[id]
 * 
 * Retrieves a single AI Creator project by ID
 * Only returns projects owned by the authenticated user
 */
export const GET = createGetHandler<never, ProjectResponse>(
  async ({ userId, params }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Project ID is required')
    }

    const projectId = params.id as string
    if (!projectId.trim()) {
      throw new Error('Invalid project ID')
    }

    // Get project from database
    const project = await getProjectById(userId, projectId)
    
    if (!project) {
      throw new Error('Project not found')
    }

    // Transform for response
    return {
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * PUT /api/ai-creator/projects/[id]
 * 
 * Updates an existing AI Creator project
 * Only allows updating projects owned by the authenticated user
 */
export const PUT = createPutHandler<Partial<CreateProjectInput>, ProjectResponse>(
  async ({ userId, params, body }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Project ID is required')
    }

    const projectId = params.id as string
    if (!projectId.trim()) {
      throw new Error('Invalid project ID')
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
      isActive,
      defaultModel,
    } = body

    // Validate content types is valid JSON array if provided
    if (contentTypes) {
      try {
        const parsedContentTypes = JSON.parse(contentTypes)
        if (!Array.isArray(parsedContentTypes)) {
          throw new Error('Content types must be a JSON array')
        }
      } catch {
        throw new Error('Invalid content types format - must be valid JSON array')
      }
    }

    // Update project using database service
    const updatedProject = await updateProject(userId, projectId, {
      name,
      description,
      tone,
      contentTypes,
      guidelines,
      targetAudience,
      keyTopics,
      brandVoice,
      contentPillars,
      isActive,
      defaultModel,
    })

    if (!updatedProject) {
      throw new Error('Project not found or update failed')
    }

    // Transform for response
    return {
      ...updatedProject,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
    }
  },
  {
    bodySchema: updateProjectSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * DELETE /api/ai-creator/projects/[id]
 * 
 * Deletes an AI Creator project
 * Only allows deleting projects owned by the authenticated user
 * Note: This will cascade delete all sessions, versions, and assets
 */
export const DELETE = createDeleteHandler<DeleteResponse>(
  async ({ userId, params }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Project ID is required')
    }

    const projectId = params.id as string
    if (!projectId.trim()) {
      throw new Error('Invalid project ID')
    }

    // Delete project using database service
    const success = await deleteProject(userId, projectId)
    
    if (!success) {
      throw new Error('Project not found or deletion failed')
    }

    return {
      success: true,
      message: `Project ${projectId} has been successfully deleted`,
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 