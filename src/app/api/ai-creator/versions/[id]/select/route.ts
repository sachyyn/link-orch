import { createPostHandler } from '@/lib/api-wrapper'
import { selectContentVersion } from '@/db/services/ai-creator-service'
import { z } from 'zod'

// Validation schema
const selectVersionSchema = z.object({
  sessionId: z.string().min(1),
})

interface SelectVersionResponse {
  success: boolean
  message: string
  versionId: string
  sessionId: string
}

/**
 * POST /api/ai-creator/versions/[id]/select
 * 
 * Selects a specific content version as the chosen one for a session
 * Body schema: selectVersionSchema
 */
export const POST = createPostHandler<{ sessionId: string }, SelectVersionResponse>(
  async ({ userId, params, body }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Version ID is required')
    }

    const versionId = params.id as string
    if (!versionId.trim()) {
      throw new Error('Invalid version ID')
    }

    const { sessionId } = body

    // Select version using database service
    const success = await selectContentVersion(userId, sessionId, versionId)
    
    if (!success) {
      throw new Error('Version not found or selection failed')
    }

    return {
      success: true,
      message: `Version ${versionId} has been selected for session ${sessionId}`,
      versionId,
      sessionId,
    }
  },
  {
    bodySchema: selectVersionSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 