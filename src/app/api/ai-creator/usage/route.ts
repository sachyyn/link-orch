import { createGetHandler, createPostHandler } from '@/lib/api-wrapper'
import { getRecentUsageLogs, createUsageLog } from '@/db/services/ai-creator-service'
import { type AIUsageLog, type CreateUsageLogInput } from '@/db/schema'
import { z } from 'zod'

// Validation schemas
const usageFilterSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
})

const logUsageSchema = z.object({
  actionType: z.enum(['content_generation', 'content_regeneration', 'image_generation', 'content_refinement', 'asset_creation']),
  modelUsed: z.string().min(1),
  tokensUsed: z.number().min(0).optional(),
  apiCost: z.string().optional(),
  processingTime: z.number().optional(),
  projectId: z.number().optional(),
  sessionId: z.number().optional(),
  requestPayload: z.string().optional(),
  responseSize: z.number().optional(),
  isSuccessful: z.boolean().default(true),
  errorMessage: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
})

// Types for API responses
interface UsageLogResponse extends Omit<AIUsageLog, 'createdAt'> {
  createdAt: string
}

interface UsageLogListResponse {
  logs: UsageLogResponse[]
  total: number
}

/**
 * GET /api/ai-creator/usage
 * 
 * Retrieves recent usage logs for the authenticated user
 * Query parameters:
 * - limit: Number of logs to retrieve (default: 50, max: 100)
 */
export const GET = createGetHandler<{ limit?: number }, UsageLogListResponse>(
  async ({ userId, query }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    const limit = query?.limit || 50
    const logs = await getRecentUsageLogs(userId, limit)
    
    // Transform dates to strings for JSON serialization
    const transformedLogs = logs.map(log => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }))

    return {
      logs: transformedLogs,
      total: logs.length,
    }
  },
  {
    requireAuth: true,
    querySchema: usageFilterSchema,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
)

/**
 * POST /api/ai-creator/usage
 * 
 * Logs a new AI usage entry
 * Body schema: logUsageSchema
 */
export const POST = createPostHandler<Omit<CreateUsageLogInput, 'userId'>, UsageLogResponse>(
  async ({ userId, body }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Add userId to the log data
    const logData = {
      ...body,
      userId,
    }

    // Log usage using database service
    const newLog = await createUsageLog(logData)

    // Transform for response
    return {
      ...newLog,
      createdAt: newLog.createdAt.toISOString(),
    }
  },
  {
    bodySchema: logUsageSchema,
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  }
) 