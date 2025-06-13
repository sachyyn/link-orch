import { NextRequest, NextResponse } from 'next/server'

// ================================
// Security Headers
// ================================

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy (basic)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
  )
  
  return response
}

// ================================
// CORS Configuration
// ================================

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://linkedinmaster-pro.vercel.app',
  // Add your production domains here
]

export function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return addSecurityHeaders(response)
  }
  
  return null
}

export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  return response
}

// ================================
// Input Sanitization
// ================================

export function sanitizeString(input: string): string {
  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T]
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T]
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      ) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}

// ================================
// Request Validation
// ================================

export function validateContentType(request: NextRequest, expectedType: string = 'application/json'): boolean {
  const contentType = request.headers.get('content-type')
  return contentType?.includes(expectedType) ?? false
}

export function validateUserAgent(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')
  
  // Block requests without user agent (potential bots)
  if (!userAgent) {
    return false
  }
  
  // Block known malicious user agents
  const blockedAgents = [
    'curl',
    'wget',
    'python-requests',
    // Add more as needed
  ]
  
  return !blockedAgents.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  )
}

// ================================
// Request Size Limits
// ================================

export const REQUEST_SIZE_LIMITS = {
  JSON: 1024 * 1024, // 1MB
  TEXT: 1024 * 100,  // 100KB
  FILE: 1024 * 1024 * 10, // 10MB
} as const

export function validateRequestSize(request: NextRequest, limit: number = REQUEST_SIZE_LIMITS.JSON): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (!contentLength) {
    return true // Let it through, will be caught later if too large
  }
  
  return parseInt(contentLength) <= limit
}

// ================================
// Security Middleware Wrapper
// ================================

export function withSecurity<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    validateUserAgent?: boolean
    maxRequestSize?: number
    allowedMethods?: string[]
  } = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest
    
    // Handle CORS
    const corsResponse = handleCors(request)
    if (corsResponse) {
      return corsResponse
    }
    
    // Validate request method
    if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
      return new NextResponse('Method not allowed', { status: 405 })
    }
    
    // Validate user agent
    if (options.validateUserAgent && !validateUserAgent(request)) {
      return new NextResponse('Invalid user agent', { status: 400 })
    }
    
    // Validate request size
    if (options.maxRequestSize && !validateRequestSize(request, options.maxRequestSize)) {
      return new NextResponse('Request too large', { status: 413 })
    }
    
    try {
      const response = await handler(...args)
      
      // Add security headers
      addSecurityHeaders(response)
      
      // Add CORS headers
      addCorsHeaders(response, request)
      
      return response
    } catch (error) {
      console.error('Security middleware error:', error)
      const errorResponse = new NextResponse('Internal server error', { status: 500 })
      return addSecurityHeaders(errorResponse)
    }
  }
}

// ================================
// Environment-based Security
// ================================

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function getSecurityConfig() {
  return {
    strictMode: isProduction(),
    enableLogging: isDevelopment(),
    allowInsecureRequests: isDevelopment(),
  }
} 