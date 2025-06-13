import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ZodSchema, ZodError } from 'zod'
import { apiResponseSchema, paginatedResponseSchema } from './validations'

// ================================
// Error Types and Classes
// ================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors: any[] = []) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

// ================================
// Response Helpers
// ================================

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  )
}

export function errorResponse(
  error: string | Error,
  status: number = 500,
  code?: string
) {
  const message = error instanceof Error ? error.message : error

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status }
  )
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string
) {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
    message,
  })
}

// ================================
// Authentication Utilities
// ================================

export async function authenticateUser() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new AuthenticationError()
  }
  
  return userId
}

export async function getAuthenticatedUserId() {
  try {
    return await authenticateUser()
  } catch (error) {
    return null
  }
}

// ================================
// Validation Utilities
// ================================

export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        'Invalid request data',
        error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }))
      )
    }
    throw new APIError('Invalid JSON in request body', 400)
  }
}

export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        'Invalid query parameters',
        error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }))
      )
    }
    throw error
  }
}

export function validatePathParams<T>(
  params: any,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(params)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        'Invalid path parameters',
        error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }))
      )
    }
    throw error
  }
}

// ================================
// Error Handler Wrapper
// ================================

export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof APIError) {
        return errorResponse(error.message, error.statusCode, error.code)
      }

      if (error instanceof ZodError) {
        return errorResponse(
          'Validation failed',
          400,
          'VALIDATION_ERROR'
        )
      }

      // Log unexpected errors for debugging
      console.error('Unexpected API error:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
      })

      return errorResponse(
        'Internal server error',
        500,
        'INTERNAL_ERROR'
      )
    }
  }
}

// ================================
// Database Utilities
// ================================

export function calculatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  return {
    offset,
    limit,
    page,
    totalPages,
    total,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

// ================================
// Type Helpers
// ================================

export type APIResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedAPIResponse<T = any> = {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
  message?: string
}

export type APIHandler = (
  request: NextRequest,
  context?: { params: any }
) => Promise<NextResponse>

// ================================
// Common Database Query Helpers
// ================================

export function buildWhereClause(filters: Record<string, any>) {
  // This will be expanded as we build specific endpoints
  // For now, it's a placeholder for common filtering logic
  return filters
}

export function buildOrderClause(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  // Common sorting logic placeholder
  return { sortBy, sortOrder }
} 