import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getSessionAssets, createAsset } from '@/db/services/ai-creator-service'
import { type AIGeneratedAsset, type CreateAssetInput } from '@/db/schema'
import { z } from 'zod'

// Validation schema for asset creation
const createAssetSchema = z.object({
  assetType: z.enum(['image', 'carousel', 'infographic', 'banner', 'thumbnail', 'logo', 'chart']),
  fileName: z.string().min(1),
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

/**
 * GET /api/ai-creator/sessions/[id]/assets
 * 
 * Retrieves all generated assets for a specific session
 * Only returns assets for sessions owned by the authenticated user
 */
export const GET = createGetHandler<never, AssetResponse[]>(
  async ({ userId, params }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!params?.id) {
      throw new Error('Session ID is required')
    }

    const sessionId = params.id as string
    if (!sessionId.trim()) {
      throw new Error('Invalid session ID')
    }

    // Get assets from database
    const assets = await getSessionAssets(userId, sessionId)

    // Transform for response
    return assets.map(asset => ({
      ...asset,
      createdAt: asset.createdAt.toISOString(),
    }))
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
 * Creates a new generated asset for a specific session
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

    const sessionId = params.id as string
    if (!sessionId.trim()) {
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
      isSelected: false,
      isDownloaded: false,
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