import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { 
  withErrorHandler, 
  authenticateUser, 
  validateRequestBody, 
  validateQueryParams,
  successResponse,
  APIHandler 
} from './api'
import { withSecurity } from './security'
import { sanitizeObject } from './security'

// ================================
// API Wrapper Configuration
// ================================

export interface APIConfig {
  // Authentication
  requireAuth?: boolean
  
  // Validation
  bodySchema?: ZodSchema
  querySchema?: ZodSchema
  
  // Security
  allowedMethods?: string[]
  maxRequestSize?: number
  validateUserAgent?: boolean
  sanitizeInput?: boolean
  
  // Logging
  enableLogging?: boolean
}

// ================================
// Main API Wrapper
// ================================

export function createAPIHandler<
  TBody = any,
  TQuery = any,
  TResponse = any
>(
  handler: (context: {
    userId?: string
    body?: TBody
    query?: TQuery
    request: NextRequest
    params?: any
  }) => Promise<TResponse>,
  config: APIConfig = {}
): APIHandler {
  
  return withSecurity(
    withErrorHandler(async (request: NextRequest, context?: { params: any }) => {
      const startTime = Date.now()
      
      // Await params for Next.js 15+ compatibility
      // This fixes the "params should be awaited before using its properties" warning
      const resolvedParams = context?.params ? await context.params : undefined
      
      // Initialize context object
      const handlerContext: {
        userId?: string
        body?: TBody
        query?: TQuery
        request: NextRequest
        params?: any
      } = {
        request,
        params: resolvedParams,
      }
      
      // Authentication
      if (config.requireAuth) {
        handlerContext.userId = await authenticateUser()
        
        if (config.enableLogging) {
          console.log(`[API] Authenticated user: ${handlerContext.userId}`)
        }
      }
      
      // Body validation and sanitization
      if (config.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        let body = await validateRequestBody(request, config.bodySchema)
        
        if (config.sanitizeInput) {
          body = sanitizeObject(body)
        }
        
        handlerContext.body = body
        
        if (config.enableLogging) {
          console.log(`[API] Validated body:`, JSON.stringify(body, null, 2))
        }
      }
      
      // Query parameter validation
      if (config.querySchema) {
        let query = validateQueryParams(request, config.querySchema)
        
        if (config.sanitizeInput) {
          query = sanitizeObject(query)
        }
        
        handlerContext.query = query
        
        if (config.enableLogging) {
          console.log(`[API] Validated query:`, JSON.stringify(query, null, 2))
        }
      }
      
      // Execute handler
      const result = await handler(handlerContext)
      
      // Log performance
      if (config.enableLogging) {
        const duration = Date.now() - startTime
        console.log(`[API] Request completed in ${duration}ms`)
      }
      
      // Return response
      return successResponse(result)
    }),
    {
      allowedMethods: config.allowedMethods,
      maxRequestSize: config.maxRequestSize,
      validateUserAgent: config.validateUserAgent,
    }
  )
}

// ================================
// Specialized API Handlers
// ================================

// For GET requests with query parameters
export function createGetHandler<TQuery = any, TResponse = any>(
  handler: (context: {
    userId?: string
    query?: TQuery
    request: NextRequest
    params?: any
  }) => Promise<TResponse>,
  config: Omit<APIConfig, 'bodySchema'> & { querySchema?: ZodSchema<TQuery> } = {}
) {
  return createAPIHandler(
    async ({ userId, query, request, params }) => {
      return handler({ userId, query, request, params })
    },
    {
      ...config,
      allowedMethods: ['GET'],
    }
  )
}

// For POST requests with body validation
export function createPostHandler<TBody = any, TResponse = any>(
  handler: (context: {
    userId: string
    body: TBody
    request: NextRequest
    params?: any
  }) => Promise<TResponse>,
  config: Omit<APIConfig, 'querySchema'> & { 
    bodySchema: ZodSchema<TBody>
    requireAuth?: boolean 
  } = { bodySchema: {} as ZodSchema<TBody> }
) {
  return createAPIHandler(
    async ({ userId, body, request, params }) => {
      if (!userId) throw new Error('Authentication required')
      return handler({ userId, body: body!, request, params })
    },
    {
      ...config,
      requireAuth: true,
      allowedMethods: ['POST'],
    }
  )
}

// For PUT requests with body validation
export function createPutHandler<TBody = any, TResponse = any>(
  handler: (context: {
    userId: string
    body: TBody
    request: NextRequest
    params?: any
  }) => Promise<TResponse>,
  config: Omit<APIConfig, 'querySchema'> & { 
    bodySchema: ZodSchema<TBody>
    requireAuth?: boolean 
  } = { bodySchema: {} as ZodSchema<TBody> }
) {
  return createAPIHandler(
    async ({ userId, body, request, params }) => {
      if (!userId) throw new Error('Authentication required')
      return handler({ userId, body: body!, request, params })
    },
    {
      ...config,
      requireAuth: true,
      allowedMethods: ['PUT'],
    }
  )
}

// For DELETE requests
export function createDeleteHandler<TResponse = any>(
  handler: (context: {
    userId: string
    request: NextRequest
    params?: any
  }) => Promise<TResponse>,
  config: Omit<APIConfig, 'bodySchema' | 'querySchema'> = {}
) {
  return createAPIHandler(
    async ({ userId, request, params }) => {
      if (!userId) throw new Error('Authentication required')
      return handler({ userId, request, params })
    },
    {
      ...config,
      requireAuth: true,
      allowedMethods: ['DELETE'],
    }
  )
}

// ================================
// Utility Functions
// ================================

// Extract common patterns
export function extractIdFromParams(params: any): number {
  const id = parseInt(params?.id)
  if (isNaN(id)) {
    throw new Error('Invalid ID parameter')
  }
  return id
}

export function extractUserIdFromContext(context: { userId?: string }): string {
  if (!context.userId) {
    throw new Error('User ID not found in context')
  }
  return context.userId
}

// ================================
// Development Helpers
// ================================

export function createMockHandler<TResponse = any>(
  mockData: TResponse,
  delay: number = 0
) {
  return createAPIHandler(
    async () => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      return mockData
    },
    {
      enableLogging: true,
    }
  )
}

// ================================
// Export commonly used configurations
// ================================

export const commonConfigs = {
  // Public endpoint (no auth required)
  public: {
    requireAuth: false,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  },
  
  // Protected endpoint (auth required)
  protected: {
    requireAuth: true,
    sanitizeInput: true,
    enableLogging: process.env.NODE_ENV === 'development',
  },
  
  // Admin endpoint (strict security)
  admin: {
    requireAuth: true,
    sanitizeInput: true,
    validateUserAgent: true,
    enableLogging: true,
  },
  
  // File upload endpoint
  upload: {
    requireAuth: true,
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    allowedMethods: ['POST'],
    sanitizeInput: false, // Don't sanitize file data
  },
} as const 