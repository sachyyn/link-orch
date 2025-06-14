import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

// ================================
// Type Definitions
// ================================

interface GenerateContentParams {
  sessionId: string
  postIdea: string
  tone?: string
  contentType?: string
  guidelines?: string
  variations: number
}

interface GenerateAssetParams {
  sessionId: string
  assetType: string
  prompt: string
  style?: string
  dimensions?: string
}

// Streaming content generation types
interface StreamingState {
  isStreaming: boolean
  progress: number
  total: number
  variations: any[]
  currentApproaches: string[]
  error: string | null
  isComplete: boolean
  totalTokensUsed: number
}

interface StreamEventData {
  type: 'started' | 'variation_complete' | 'variation_error' | 'complete' | 'error'
  total?: number
  approaches?: string[]
  variation?: any
  progress?: number
  tokensUsed?: number
  variations?: any[]
  totalTokensUsed?: number
  error?: string
  metadata?: any
  // For variation_error events
  index?: number
  approach?: string
}

// ================================
// AI Creator Query Keys
// ================================

export const aiCreatorQueryKeys = {
  all: () => ['ai-creator'] as const,
  projects: {
    all: () => ['ai-creator', 'projects'] as const,
    list: (filters?: Record<string, unknown>) => ['ai-creator', 'projects', 'list', filters] as const,
    detail: (id: string | number) => ['ai-creator', 'projects', 'detail', id] as const,
  },
  sessions: {
    all: () => ['ai-creator', 'sessions'] as const,
    byProject: (projectId: string | number) => ['ai-creator', 'sessions', 'project', projectId] as const,
    detail: (id: string | number) => ['ai-creator', 'sessions', 'detail', id] as const,
  },
  versions: {
    all: () => ['ai-creator', 'versions'] as const,
    bySession: (sessionId: string | number) => ['ai-creator', 'versions', 'session', sessionId] as const,
  },
  assets: {
    all: () => ['ai-creator', 'assets'] as const,
    bySession: (sessionId: string | number) => ['ai-creator', 'assets', 'session', sessionId] as const,
  },
  usage: {
    all: () => ['ai-creator', 'usage'] as const,
    byUser: (userId?: string) => ['ai-creator', 'usage', 'user', userId] as const,
  },
} as const

// ================================
// AI Creator API Client Extensions
// ================================

// Use the API client directly for consistency

// ================================
// Project Hooks
// ================================

export function useProjects(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: aiCreatorQueryKeys.projects.list(params),
    queryFn: () => apiClient.aiCreator.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProject(id: string | number) {
  return useQuery({
    queryKey: aiCreatorQueryKeys.projects.detail(id),
    queryFn: () => apiClient.aiCreator.getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.aiCreator.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.projects.all() })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) =>
      apiClient.aiCreator.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.projects.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.projects.all() })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.aiCreator.deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.removeQueries({ queryKey: aiCreatorQueryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.projects.all() })
      // Also invalidate related sessions
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.sessions.byProject(projectId) })
    },
  })
}

// ================================
// Session Hooks
// ================================

export function useSessions(projectId: string | number) {
  return useQuery({
    queryKey: aiCreatorQueryKeys.sessions.byProject(projectId),
    queryFn: () => apiClient.aiCreator.getSessions(projectId),
    enabled: !!projectId,
  })
}

export function useSession(id: string | number) {
  return useQuery({
    queryKey: aiCreatorQueryKeys.sessions.detail(id),
    queryFn: () => apiClient.aiCreator.getSession(id),
    enabled: !!id,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string | number; data: Record<string, unknown> }) =>
      apiClient.aiCreator.createSession(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.sessions.byProject(variables.projectId) })
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) =>
      apiClient.aiCreator.updateSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.sessions.detail(variables.id) })
    },
  })
}

// ================================
// Content Generation Hooks
// ================================

export function useStreamingContentGeneration() {
  const queryClient = useQueryClient()
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    progress: 0,
    total: 0,
    variations: [],
    currentApproaches: [],
    error: null,
    isComplete: false,
    totalTokensUsed: 0,
  })

  const generateContent = useCallback(async (params: GenerateContentParams) => {
    setState({
      isStreaming: true,
      progress: 0,
      total: params.variations,
      variations: [],
      currentApproaches: [],
      error: null,
      isComplete: false,
      totalTokensUsed: 0,
    })

    try {
      const response = await fetch('/api/ai-creator/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body reader available')
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData: StreamEventData = JSON.parse(line.slice(6))
              
              setState(prevState => {
                switch (eventData.type) {
                  case 'started':
                    return {
                      ...prevState,
                      total: eventData.total || prevState.total,
                      currentApproaches: eventData.approaches || [],
                    }
                  
                  case 'variation_complete':
                    return {
                      ...prevState,
                      progress: eventData.progress || prevState.progress,
                      variations: eventData.variation 
                        ? [...prevState.variations, eventData.variation]
                        : prevState.variations,
                      totalTokensUsed: prevState.totalTokensUsed + (eventData.tokensUsed || 0),
                    }
                  
                  case 'variation_error':
                    console.error(`Variation ${eventData.index} (${eventData.approach}) failed:`, eventData.error)
                    return prevState // Continue with other variations
                  
                  case 'complete':
                    // Invalidate queries on completion
                    queryClient.invalidateQueries({ 
                      queryKey: aiCreatorQueryKeys.versions.bySession(params.sessionId) 
                    })
                    queryClient.invalidateQueries({ 
                      queryKey: aiCreatorQueryKeys.sessions.detail(params.sessionId) 
                    })
                    queryClient.invalidateQueries({ 
                      queryKey: aiCreatorQueryKeys.usage.all() 
                    })
                    
                    return {
                      ...prevState,
                      isComplete: true,
                      isStreaming: false,
                      variations: eventData.variations || prevState.variations,
                      totalTokensUsed: eventData.totalTokensUsed || prevState.totalTokensUsed,
                    }
                  
                  case 'error':
                    return {
                      ...prevState,
                      error: eventData.error || 'Unknown error occurred',
                      isStreaming: false,
                    }
                  
                  default:
                    return prevState
                }
              })
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isStreaming: false,
      }))
    }
  }, [queryClient])

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      progress: 0,
      total: 0,
      variations: [],
      currentApproaches: [],
      error: null,
      isComplete: false,
      totalTokensUsed: 0,
    })
  }, [])

  return {
    ...state,
    generateContent,
    reset,
    progressPercentage: state.total > 0 ? Math.round((state.progress / state.total) * 100) : 0,
  }
}

// Legacy hook for backwards compatibility (falls back to regular mutation)
export function useGenerateContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: GenerateContentParams) => apiClient.aiCreator.generateContent(params),
    onSuccess: (data, variables) => {
      // Invalidate versions for the session
      queryClient.invalidateQueries({ 
        queryKey: aiCreatorQueryKeys.versions.bySession(variables.sessionId) 
      })
      // Invalidate session details to update status
      queryClient.invalidateQueries({ 
        queryKey: aiCreatorQueryKeys.sessions.detail(variables.sessionId) 
      })
      // Invalidate usage data
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.usage.all() })
    },
  })
}

export function useGenerateAssets() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: GenerateAssetParams) => apiClient.aiCreator.generateAssets(params),
    onSuccess: (data, variables) => {
      // Invalidate assets for the session
      queryClient.invalidateQueries({ 
        queryKey: aiCreatorQueryKeys.assets.bySession(variables.sessionId) 
      })
      // Invalidate session details
      queryClient.invalidateQueries({ 
        queryKey: aiCreatorQueryKeys.sessions.detail(variables.sessionId) 
      })
    },
  })
}

// ================================
// Version Management Hooks
// ================================

export function useContentVersions(sessionId: string | number) {
  return useQuery({
    queryKey: aiCreatorQueryKeys.versions.bySession(sessionId),
    queryFn: () => apiClient.aiCreator.getVersions(sessionId),
    enabled: !!sessionId,
  })
}

export function useSelectVersion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.aiCreator.selectVersion,
    onSuccess: () => {
      // Invalidate all version-related queries
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.versions.all() })
    },
  })
}

// ================================
// Asset Management Hooks
// ================================

export function useAssets(sessionId: string | number) {
  return useQuery({
    queryKey: aiCreatorQueryKeys.assets.bySession(sessionId),
    queryFn: () => apiClient.aiCreator.getAssets(sessionId),
    enabled: !!sessionId,
  })
}

// ================================
// Usage Analytics Hooks
// ================================

export function useUsageAnalytics(params?: { userId?: string } & Record<string, unknown>) {
  return useQuery({
    queryKey: aiCreatorQueryKeys.usage.byUser(params?.userId),
    queryFn: () => apiClient.aiCreator.getUsage(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ================================
// Test & Development Hooks
// ================================

export function useTestGeneration() {
  return useMutation({
    mutationFn: apiClient.aiCreator.testGeneration,
  })
} 