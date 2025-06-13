import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getSessionAssets, createAsset } from '@/db/services/ai-creator-service'
import { type AIGeneratedAsset, type CreateAssetInput } from '@/db/schema'
import { z } from 'zod'

// Validation schema for creating assets
const createAssetSchema = z.object({
  assetType: z.enum(['image', 'carousel', 'infographic', 'banner', 'thumbnail', 'logo', 'chart']),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileSize: z.number().optional(),
  prompt: z.string().min(1),
  model: z.string().optional(),
  style: z.string().optional(),
  dimensions: z.string().optional(),
  generationTime: z.number().optional(),
  generationCost: z.string().optional(),
})

// Types for API responses
interface AssetResponse extends Omit<AIGeneratedAsset, 'createdAt'> {
  createdAt: string
}

interface AssetListResponse {
  assets: AssetResponse[]
  sessionId: number
}

/**
 * GET /api/ai-creator/sessions/[id]/assets
 * 
 * Retrieves all assets for a specific session
 * Only returns assets for sessions owned by the authenticated user
 */
export const GET = createGetHandler<never, AssetListResponse>(
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

    // Get assets from database
    const assets = await getSessionAssets(userId, sessionId)
    
    // Transform dates to strings for JSON serialization
    const transformedAssets = assets.map(asset => ({
      ...asset,
      createdAt: asset.createdAt.toISOString(),
    }))

    return {
      assets: transformedAssets,
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
 * POST /api/ai-creator/sessions/[id]/assets
 * 
 * Creates a new asset for a specific session
 * Body schema: createAssetSchema
 */
export const POST = createPostHandler<Omit<CreateAssetInput, 'sessionId'>, AssetResponse>(
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
      assetType,
      fileName,
      fileUrl,
      fileSize,
      prompt,
      model,
      style,
      dimensions,
      generationTime,
      generationCost,
    } = body

    // Create asset using database service
    const newAsset = await createAsset(userId, sessionId, {
      sessionId,
      assetType,
      fileName,
      fileUrl,
      fileSize,
      prompt,
      model,
      style,
      dimensions,
      generationTime,
      generationCost,
    })

    // Transform for response
    return {
      ...newAsset,
      createdAt: newAsset.createdAt.toISOString(),
    }
  },
  {
    bodySchema: createAssetSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 