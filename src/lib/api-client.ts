import { APIError } from './react-query'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Enhanced fetch wrapper with error handling
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    // Handle different response types
    const contentType = response.headers.get('content-type')
    let data: any
    
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Handle API errors
    if (!response.ok) {
      throw new APIError(
        data?.error || data?.message || `HTTP ${response.status}`,
        response.status,
        data
      )
    }

    // Return the data directly if it has a success property, otherwise return as-is
    return data?.success !== undefined ? data.data : data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Handle network errors
    throw new APIError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      error
    )
  }
}

// API client methods
export const apiClient = {
  // Generic methods
  get: <T = any>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    const searchParams = params ? `?${new URLSearchParams(params)}` : ''
    return apiRequest<T>(`${endpoint}${searchParams}`)
  },

  post: <T = any>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put: <T = any>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch: <T = any>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete: <T = any>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'DELETE',
    })
  },

  // Dashboard APIs
  dashboard: {
    getStats: () => apiClient.get('/stats'),
  },

  // AI Creator APIs
  aiCreator: {
    // Projects
    getProjects: (params?: any) => apiClient.get('/ai-creator/projects', params),
    getProject: (id: string | number) => apiClient.get(`/ai-creator/projects/${id}`),
    createProject: (data: any) => apiClient.post('/ai-creator/projects', data),
    updateProject: (id: string | number, data: any) => apiClient.put(`/ai-creator/projects/${id}`, data),
    deleteProject: (id: string | number) => apiClient.delete(`/ai-creator/projects/${id}`),
    
    // Sessions
    getSessions: (projectId: string | number) => apiClient.get(`/ai-creator/projects/${projectId}/sessions`),
    getSession: (id: string | number) => apiClient.get(`/ai-creator/sessions/${id}`),
    createSession: (projectId: string | number, data: any) => apiClient.post(`/ai-creator/projects/${projectId}/sessions`, data),
    updateSession: (id: string | number, data: any) => apiClient.put(`/ai-creator/sessions/${id}`, data),
    deleteSession: (id: string | number) => apiClient.delete(`/ai-creator/sessions/${id}`),
    
    // Content Generation
    generateContent: (data: any) => apiClient.post('/ai-creator/generate/content', data),
    generateAssets: (data: any) => apiClient.post('/ai-creator/generate/assets', data),
    
    // Versions & Assets
    getVersions: (sessionId: string | number) => apiClient.get(`/ai-creator/sessions/${sessionId}/versions`),
    selectVersion: (versionId: string | number) => apiClient.post(`/ai-creator/versions/${versionId}/select`),
    getAssets: (sessionId: string | number) => apiClient.get(`/ai-creator/sessions/${sessionId}/assets`),
    
    // Usage
    getUsage: (params?: any) => apiClient.get('/ai-creator/usage', params),
    
    // Test
    testGeneration: () => apiClient.post('/ai-creator/test-generation'),
  },

  // Content Management APIs
  content: {
    // Posts
    getPosts: (params?: {
      page?: number
      limit?: number
      status?: string
      pillarId?: string
      search?: string
      startDate?: string
      endDate?: string
    }) => apiClient.get('/content/posts', params),
    
    getPost: (id: string | number) => apiClient.get(`/content/posts/${id}`),
    
    createPost: (data: {
      title: string
      content: string
      status?: 'draft' | 'scheduled' | 'published'
      scheduledAt?: string
      pillarId?: string
      hashtags?: string[]
      mentions?: string[]
      mediaUrls?: string[]
    }) => apiClient.post('/content/posts', data),
    
    updatePost: (id: string | number, data: any) => 
      apiClient.put(`/content/posts/${id}`, data),
    
    deletePost: (id: string | number) => 
      apiClient.delete(`/content/posts/${id}`),
    
    bulkUpdatePosts: (data: {
      postIds: number[]
      action: 'delete' | 'update_status' | 'schedule'
      updates?: any
    }) => apiClient.post('/content/posts/bulk', data),

    // Pillars
    getPillars: () => apiClient.get('/content/pillars'),
    
    createPillar: (data: {
      name: string
      description?: string
      color: string
      targetPercentage?: number
    }) => apiClient.post('/content/pillars', data),
  },

  // Analytics APIs
  analytics: {
    getOverview: (params?: {
      period?: '7d' | '30d' | '90d' | '1y'
      includeComparisons?: boolean
    }) => apiClient.get('/analytics/overview', params),
    
    getPostAnalytics: (id: string | number, params?: {
      includeComparisons?: boolean
    }) => apiClient.get(`/analytics/posts/${id}`, params),
    
    getReports: (params?: {
      type?: string
      startDate?: string
      endDate?: string
    }) => apiClient.get('/analytics/reports', params),
    
    generateReport: (data: {
      name: string
      type: 'performance' | 'engagement' | 'growth' | 'content'
      period: string
      includeComparisons?: boolean
    }) => apiClient.post('/analytics/reports', data),
  },

  // Engagement APIs
  engagement: {
    getComments: (params?: {
      page?: number
      limit?: number
      status?: 'unread' | 'read' | 'replied' | 'ignored'
      priority?: 'low' | 'medium' | 'high'
      sentiment?: 'positive' | 'neutral' | 'negative'
      search?: string
      postId?: number
    }) => apiClient.get('/engagement/comments', params),
    
    getComment: (id: string | number) => 
      apiClient.get(`/engagement/comments/${id}`),
    
    updateComment: (id: string | number, data: {
      status?: 'unread' | 'read' | 'replied' | 'ignored'
      priority?: 'low' | 'medium' | 'high'
      response?: string
      responseTemplateId?: number
    }) => apiClient.put(`/engagement/comments/${id}`, data),
    
    getMetrics: (params?: {
      period?: 'week' | 'month' | 'quarter'
      startDate?: string
      endDate?: string
      postId?: number
    }) => apiClient.get('/engagement/metrics', params),
    
    getTemplates: (params?: {
      category?: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
      search?: string
    }) => apiClient.get('/engagement/templates', params),
    
    createTemplate: (data: {
      title: string
      content: string
      category: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
    }) => apiClient.post('/engagement/templates', data),
  },

  // Business APIs
  business: {
    // Leads
    getLeads: (params?: {
      page?: number
      limit?: number
      status?: string
      source?: string
      priority?: string
      search?: string
      tags?: string
    }) => apiClient.get('/business/leads', params),
    
    createLead: (data: {
      firstName: string
      lastName: string
      email: string
      company?: string
      jobTitle?: string
      linkedinUrl?: string
      phone?: string
      source: string
      sourceDetails?: string
      notes?: string
      tags?: string[]
    }) => apiClient.post('/business/leads', data),

    // Events
    getEvents: (params?: {
      page?: number
      limit?: number
      status?: string
      eventType?: string
      search?: string
      from?: string
      to?: string
    }) => apiClient.get('/business/events', params),
    
    createEvent: (data: {
      title: string
      description: string
      eventType: 'webinar' | 'workshop' | 'networking' | 'conference' | 'meetup'
      startDateTime: string
      endDateTime: string
      location?: string
      isVirtual: boolean
      maxAttendees?: number
      registrationRequired: boolean
      tags?: string[]
    }) => apiClient.post('/business/events', data),
  },

  // User APIs
  user: {
    getOnboardingStatus: () => apiClient.get('/user/onboarding-status'),
    
    updateOnboardingStatus: (data: {
      currentStep: number
      completedSteps: number[]
      isCompleted: boolean
    }) => apiClient.post('/onboarding', data),
  },
} 