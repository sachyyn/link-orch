import { createGetHandler, createPutHandler, createDeleteHandler } from '@/lib/api-wrapper'
import { getSessionById, updateSession, deleteSession } from '@/db/services/ai-creator-service'
import { type AIPostSession, type CreateSessionInput } from '@/db/schema'
import { z } from 'zod'

// Validation schema for updates
const updateSessionSchema = z.object({
  postIdea: z.string().min(1).optional(),
  additionalContext: z.string().optional(),
  targetContentType: z.enum(['text-post', 'carousel', 'video-script', 'poll', 'article', 'story', 'announcement']).optional(),
  selectedModel: z.string().optional(),
  customPrompt: z.string().optional(),
  status: z.enum(['ideation', 'generating', 'asset-creation', 'ready', 'completed', 'archived']).optional(),
  currentStep: z.string().optional(),
  needsAsset: z.boolean().optional(),
  finalContent: z.string().optional(),
  isCompleted: z.boolean().optional(),
})

// Types for API responses
interface SessionResponse extends Omit<AIPostSession, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

interface DeleteResponse {
  success: boolean
  message: string
}

/**
 * GET /api/ai-creator/sessions/[id]
 * 
 * Retrieves a single AI post session by ID
 * Only returns sessions for projects owned by the authenticated user
 */
export const GET = createGetHandler<never, SessionResponse>(
  async ({ userId, params }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Session ID is required')
    }

    const sessionId = parseInt(params.id as string)
    if (isNaN(sessionId)) {
      throw new Error('Invalid session ID')
    }

    // Get session from database
    const session = await getSessionById(userId, sessionId)
    
    if (!session) {
      throw new Error('Session not found')
    }

    // Transform for response
    return {
      ...session,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * PUT /api/ai-creator/sessions/[id]
 * 
 * Updates an existing AI post session
 * Only allows updating sessions for projects owned by the authenticated user
 */
export const PUT = createPutHandler<Partial<CreateSessionInput>, SessionResponse>(
  async ({ userId, params, body }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Session ID is required')
    }

    const sessionId = parseInt(params.id as string)
    if (isNaN(sessionId)) {
      throw new Error('Invalid session ID')
    }

    const {
      postIdea,
      additionalContext,
      targetContentType,
      selectedModel,
      customPrompt,
      status,
      currentStep,
      needsAsset,
      finalContent,
      isCompleted,
    } = body

    // Update session using database service
    const updatedSession = await updateSession(userId, sessionId, {
      postIdea,
      additionalContext,
      targetContentType,
      selectedModel,
      customPrompt,
      status,
      currentStep,
      needsAsset,
      finalContent,
      isCompleted,
    })

    if (!updatedSession) {
      throw new Error('Session not found or update failed')
    }

    // Transform for response
    return {
      ...updatedSession,
      createdAt: updatedSession.createdAt.toISOString(),
      updatedAt: updatedSession.updatedAt.toISOString(),
    }
  },
  {
    bodySchema: updateSessionSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * DELETE /api/ai-creator/sessions/[id]
 * 
 * Deletes an AI post session
 * Only allows deleting sessions for projects owned by the authenticated user
 * Note: This will cascade delete all content versions and assets
 */
export const DELETE = createDeleteHandler<DeleteResponse>(
  async ({ userId, params }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Session ID is required')
    }

    const sessionId = parseInt(params.id as string)
    if (isNaN(sessionId)) {
      throw new Error('Invalid session ID')
    }

    // Delete session using database service
    const success = await deleteSession(userId, sessionId)
    
    if (!success) {
      throw new Error('Session not found or deletion failed')
    }

    return {
      success: true,
      message: `Session ${sessionId} has been successfully deleted`,
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 