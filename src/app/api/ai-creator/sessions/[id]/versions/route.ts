import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getSessionContentVersions, createContentVersions } from '@/db/services/ai-creator-service'
import { type AIContentVersion, type CreateContentVersionInput } from '@/db/schema'
import { z } from 'zod'

// Validation schema for creating content versions
const createVersionsSchema = z.object({
  versions: z.array(z.object({
    versionNumber: z.number().min(1),
    generationBatch: z.number().default(1),
    content: z.string().min(1),
    contentLength: z.number().optional(),
    estimatedReadTime: z.number().optional(),
    hashtags: z.string().optional(),
    mentions: z.string().optional(),
    callToAction: z.string().optional(),
    modelUsed: z.string().min(1),
    tokensUsed: z.number().optional(),
    generationTime: z.number().optional(),
    prompt: z.string().optional(),
  })).min(1).max(10), // Allow creating 1-10 versions at once
})

// Types for API responses
interface VersionResponse extends Omit<AIContentVersion, 'createdAt'> {
  createdAt: string
}

interface VersionListResponse {
  versions: VersionResponse[]
  sessionId: number
}

/**
 * GET /api/ai-creator/sessions/[id]/versions
 * 
 * Retrieves all content versions for a specific session
 * Only returns versions for sessions owned by the authenticated user
 */
export const GET = createGetHandler<never, VersionListResponse>(
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

    // Get versions from database
    const versions = await getSessionContentVersions(userId, sessionId)
    
    // Transform dates to strings for JSON serialization
    const transformedVersions = versions.map(version => ({
      ...version,
      createdAt: version.createdAt.toISOString(),
    }))

    return {
      versions: transformedVersions,
      sessionId,
    }
  },
  {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/ai-creator/sessions/[id]/versions
 * 
 * Creates new content versions for a specific session
 * Body schema: createVersionsSchema
 */
export const POST = createPostHandler<{ versions: Omit<CreateContentVersionInput, 'sessionId'>[] }, VersionResponse[]>(
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

    const { versions } = body

    // Validate version numbers are unique within this batch
    const versionNumbers = versions.map(v => v.versionNumber)
    const uniqueVersionNumbers = new Set(versionNumbers)
    if (versionNumbers.length !== uniqueVersionNumbers.size) {
      throw new Error('Version numbers must be unique within a batch')
    }

    // Add sessionId to each version for the service call
    const versionsWithSessionId = versions.map(version => ({
      ...version,
      sessionId,
    }))

    // Create versions using database service
    const newVersions = await createContentVersions(userId, sessionId, versionsWithSessionId)

    // Transform for response
    return newVersions.map(version => ({
      ...version,
      createdAt: version.createdAt.toISOString(),
    }))
  },
  {
    bodySchema: createVersionsSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 