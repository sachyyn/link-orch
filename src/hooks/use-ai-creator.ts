import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/react-query'

// ================================
// AI Creator Query Keys
// ================================

export const aiCreatorQueryKeys = {
  all: () => ['ai-creator'] as const,
  projects: {
    all: () => ['ai-creator', 'projects'] as const,
    list: (filters?: any) => ['ai-creator', 'projects', 'list', filters] as const,
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

export function useProjects(params?: any) {
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
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
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
    mutationFn: ({ projectId, data }: { projectId: string | number; data: any }) =>
      apiClient.aiCreator.createSession(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.sessions.byProject(variables.projectId) })
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      apiClient.aiCreator.updateSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aiCreatorQueryKeys.sessions.detail(variables.id) })
    },
  })
}

// ================================
// Content Generation Hooks
// ================================

export function useGenerateContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.aiCreator.generateContent,
    onSuccess: (data, variables: any) => {
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
    mutationFn: apiClient.aiCreator.generateAssets,
    onSuccess: (data, variables: any) => {
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
    onSuccess: (_, versionId) => {
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

export function useUsageAnalytics(params?: any) {
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