import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getProjectSessions, createSession } from '@/db/services/ai-creator-service'
import { type AIPostSession, type CreateSessionInput } from '@/db/schema'
import { z } from 'zod'

// Validation schema for session creation (body only, projectId comes from params)
const createSessionBodySchema = z.object({
  postIdea: z.string().min(1, 'Post idea is required'),
  additionalContext: z.string().optional(),
  targetContentType: z.enum(['text-post', 'carousel', 'video-script', 'poll', 'article', 'story', 'announcement']).default('text-post'),
  selectedModel: z.string().min(1, 'Model selection is required'),
  customPrompt: z.string().optional(),
})

// Types for API
interface CreateSessionBodyInput {
  postIdea: string
  additionalContext?: string
  targetContentType?: 'text-post' | 'carousel' | 'video-script' | 'poll' | 'article' | 'story' | 'announcement'
  selectedModel: string
  customPrompt?: string
}

interface SessionResponse extends Omit<AIPostSession, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

/**
 * GET /api/ai-creator/projects/[id]/sessions
 * 
 * Retrieves all sessions for a specific project
 * Only returns sessions for projects owned by the authenticated user
 */
export const GET = createGetHandler<never, SessionResponse[]>(
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

    // Get sessions from database
    const sessions = await getProjectSessions(userId, projectId)

    // Transform for response
    return sessions.map(session => ({
      ...session,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }))
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
 * Creates a new session for a specific project
 * Only allows creating sessions for projects owned by the authenticated user
 */
export const POST = createPostHandler<CreateSessionBodyInput, SessionResponse>(
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
      postIdea,
      additionalContext,
      targetContentType,
      selectedModel,
      customPrompt,
    } = body

    // Create session using database service  
    const sessionData: CreateSessionInput = {
      projectId,
      postIdea,
      additionalContext,
      targetContentType: targetContentType || 'text-post',
      selectedModel,
      customPrompt,
      status: 'ideation',
      currentStep: 'ideation',
      needsAsset: false,
      assetGenerated: false,
      isCompleted: false,
    }

    const createdSession = await createSession(userId, sessionData)

    // Transform for response
    return {
      ...createdSession,
      createdAt: createdSession.createdAt.toISOString(),
      updatedAt: createdSession.updatedAt.toISOString(),
    }
  },
  {
    bodySchema: createSessionBodySchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 