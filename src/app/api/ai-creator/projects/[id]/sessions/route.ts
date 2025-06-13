import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getProjectSessions, createSession } from '@/db/services/ai-creator-service'
import { type AIPostSession, type CreateSessionInput } from '@/db/schema'
import { createSessionApiSchema, type CreateSessionApiInput } from '@/lib/schemas'

// Types for API responses
interface SessionResponse extends Omit<AIPostSession, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

interface SessionListResponse {
  sessions: SessionResponse[]
  projectId: number
}

/**
 * GET /api/ai-creator/projects/[id]/sessions
 * 
 * Retrieves all sessions for a specific project
 * Only returns sessions for projects owned by the authenticated user
 */
export const GET = createGetHandler<never, SessionListResponse>(
  async ({ userId, params }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Project ID is required')
    }

    const projectId = parseInt(params.id as string)
    if (isNaN(projectId)) {
      throw new Error('Invalid project ID')
    }

    // Get sessions from database
    const sessions = await getProjectSessions(userId, projectId)
    
    // Transform dates to strings for JSON serialization
    const transformedSessions = sessions.map(session => ({
      ...session,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }))

    return {
      sessions: transformedSessions,
      projectId,
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/ai-creator/projects/[id]/sessions
 * 
 * Creates a new post session for a specific project
 * Body schema: createSessionApiSchema
 */
export const POST = createPostHandler<CreateSessionApiInput, SessionResponse>(
  async ({ userId, params, body }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Project ID is required')
    }

    const projectId = parseInt(params.id as string)
    if (isNaN(projectId)) {
      throw new Error('Invalid project ID')
    }

    const {
      postIdea,
      additionalContext,
      targetContentType,
      selectedModel,
      customPrompt,
      needsAsset,
    } = body

    // Create session using database service
    const newSession = await createSession(userId, {
      projectId,
      postIdea,
      additionalContext,
      targetContentType,
      selectedModel,
      customPrompt,
      needsAsset,
    })

    // Transform for response
    return {
      ...newSession,
      createdAt: newSession.createdAt.toISOString(),
      updatedAt: newSession.updatedAt.toISOString(),
    }
  },
  {
    bodySchema: createSessionApiSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 