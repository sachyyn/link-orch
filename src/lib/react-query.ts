import { QueryClient } from '@tanstack/react-query'

// Create a client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache time: How long data stays in cache when unused (10 minutes)  
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      // Refetch on window focus for important data freshness
      refetchOnWindowFocus: true,
      // Refetch on reconnect to get latest data
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

// Query key factory for consistent cache management
export const queryKeys = {
  // Dashboard
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
  },
  
  // Content Management
  content: {
    all: () => ['content'] as const,
    posts: () => ['content', 'posts'] as const,
    post: (id: string | number) => ['content', 'posts', id] as const,
    pillars: () => ['content', 'pillars'] as const,
    pillar: (id: string | number) => ['content', 'pillars', id] as const,
  },
  
  // Analytics
  analytics: {
    all: () => ['analytics'] as const,
    overview: (period?: string) => ['analytics', 'overview', period] as const,
    posts: () => ['analytics', 'posts'] as const,
    post: (id: string | number) => ['analytics', 'posts', id] as const,
    reports: () => ['analytics', 'reports'] as const,
  },
  
  // Engagement
  engagement: {
    all: () => ['engagement'] as const,
    comments: (filters?: Record<string, any>) => ['engagement', 'comments', filters] as const,
    comment: (id: string | number) => ['engagement', 'comments', id] as const,
    metrics: (filters?: Record<string, any>) => ['engagement', 'metrics', filters] as const,
    templates: () => ['engagement', 'templates'] as const,
  },
  
  // Business
  business: {
    all: () => ['business'] as const,
    leads: (filters?: Record<string, any>) => ['business', 'leads', filters] as const,
    lead: (id: string | number) => ['business', 'leads', id] as const,
    events: (filters?: Record<string, any>) => ['business', 'events', filters] as const,
    event: (id: string | number) => ['business', 'events', id] as const,
  },
  
  // User
  user: {
    profile: () => ['user', 'profile'] as const,
    onboardingStatus: () => ['user', 'onboarding-status'] as const,
  },
} as const

// Error handling utilities
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Default error handler for React Query
export const defaultQueryErrorHandler = (error: unknown) => {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}:`, error.message)
    
    // Handle specific error cases
    switch (error.status) {
      case 401:
        // Redirect to login or refresh token
        console.error('Authentication required')
        break
      case 403:
        console.error('Access forbidden')
        break
      case 429:
        console.error('Rate limit exceeded')
        break
      case 500:
        console.error('Server error occurred')
        break
      default:
        console.error('Unknown API error')
    }
  } else {
    console.error('Unexpected error:', error)
  }
} 