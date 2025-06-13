import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/react-query'
import type {
  DashboardStats,
  Post,
  ContentPillar,
  AnalyticsOverview,
  Comment,
  ResponseTemplate,
  EngagementMetrics,
  Lead,
  Event,
  OnboardingStatus,
  PostFilters,
  CommentFilters,
  LeadFilters,
  EventFilters,
  AnalyticsFilters,
  EngagementMetricsFilters,
  TemplateFilters,
  PostCreateRequest,
  PostUpdateRequest,
  LeadCreateRequest,
  EventCreateRequest,
  CommentUpdateRequest,
  APIResponse,
  PaginatedResponse
} from '@/types/api'

// ================================
// Dashboard Hooks
// ================================

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: apiClient.dashboard.getStats,
  })
}

// ================================
// Content Management Hooks
// ================================

export function usePosts(params?: {
  page?: number
  limit?: number
  status?: string
  pillarId?: number
  search?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: queryKeys.content.posts(),
    queryFn: () => apiClient.content.getPosts(params),
  })
}

export function usePost(id: string | number) {
  return useQuery({
    queryKey: queryKeys.content.post(id),
    queryFn: () => apiClient.content.getPost(id),
    enabled: !!id,
  })
}

export function usePillars() {
  return useQuery({
    queryKey: queryKeys.content.pillars(),
    queryFn: apiClient.content.getPillars,
  })
}

// Content Mutations
export function useCreatePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.content.createPost,
    onSuccess: () => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: queryKeys.content.posts() })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      apiClient.content.updatePost(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific post and posts list
      queryClient.invalidateQueries({ queryKey: queryKeys.content.post(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.content.posts() })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.content.deletePost,
    onSuccess: (_, postId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.content.post(postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.content.posts() })
    },
  })
}

export function useBulkUpdatePosts() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.content.bulkUpdatePosts,
    onSuccess: () => {
      // Invalidate all content-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all() })
    },
  })
}

export function useCreatePillar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.content.createPillar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.pillars() })
    },
  })
}

// ================================
// Analytics Hooks
// ================================

export function useAnalyticsOverview(params?: {
  period?: '7d' | '30d' | '90d' | '1y'
  includeComparisons?: boolean
}) {
  return useQuery({
    queryKey: queryKeys.analytics.overview(params?.period),
    queryFn: () => apiClient.analytics.getOverview(params),
  })
}

export function usePostAnalytics(id: string | number, params?: {
  includeComparisons?: boolean
}) {
  return useQuery({
    queryKey: queryKeys.analytics.post(id),
    queryFn: () => apiClient.analytics.getPostAnalytics(id, params),
    enabled: !!id,
  })
}

export function useAnalyticsReports(params?: {
  type?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: queryKeys.analytics.reports(),
    queryFn: () => apiClient.analytics.getReports(params),
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.analytics.generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.reports() })
    },
  })
}

// ================================
// Engagement Hooks
// ================================

export function useComments(params?: {
  page?: number
  limit?: number
  status?: 'unread' | 'read' | 'replied' | 'ignored'
  priority?: 'low' | 'medium' | 'high'
  sentiment?: 'positive' | 'neutral' | 'negative'
  search?: string
  postId?: number
}) {
  return useQuery({
    queryKey: queryKeys.engagement.comments(params),
    queryFn: () => apiClient.engagement.getComments(params),
  })
}

export function useComment(id: string | number) {
  return useQuery({
    queryKey: queryKeys.engagement.comment(id),
    queryFn: () => apiClient.engagement.getComment(id),
    enabled: !!id,
  })
}

export function useEngagementMetrics(params?: {
  period?: 'week' | 'month' | 'quarter'
  startDate?: string
  endDate?: string
  postId?: number
}) {
  return useQuery({
    queryKey: queryKeys.engagement.metrics(params),
    queryFn: () => apiClient.engagement.getMetrics(params),
  })
}

export function useEngagementTemplates(params?: {
  category?: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
  search?: string
}) {
  return useQuery({
    queryKey: queryKeys.engagement.templates(),
    queryFn: () => apiClient.engagement.getTemplates(params),
  })
}

// Engagement Mutations
export function useUpdateComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string | number
      data: {
        status?: 'unread' | 'read' | 'replied' | 'ignored'
        priority?: 'low' | 'medium' | 'high'
        response?: string
        responseTemplateId?: number
      }
    }) => apiClient.engagement.updateComment(id, data),
    onSuccess: (_, variables) => {
      // Update specific comment and invalidate comments list
      queryClient.invalidateQueries({ queryKey: queryKeys.engagement.comment(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.engagement.comments() })
      // Also invalidate metrics as they might have changed
      queryClient.invalidateQueries({ queryKey: queryKeys.engagement.metrics() })
    },
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.engagement.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.engagement.templates() })
    },
  })
}

// ================================
// Business Hooks
// ================================

export function useLeads(params?: {
  page?: number
  limit?: number
  status?: string
  source?: string
  priority?: string
  search?: string
  tags?: string
}) {
  return useQuery({
    queryKey: queryKeys.business.leads(params),
    queryFn: () => apiClient.business.getLeads(params),
  })
}

export function useEvents(params?: {
  page?: number
  limit?: number
  status?: string
  eventType?: string
  search?: string
  from?: string
  to?: string
}) {
  return useQuery({
    queryKey: queryKeys.business.events(params),
    queryFn: () => apiClient.business.getEvents(params),
  })
}

// Business Mutations
export function useCreateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.business.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.leads() })
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.business.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.events() })
    },
  })
}

// ================================
// User Hooks
// ================================

export function useOnboardingStatus() {
  return useQuery({
    queryKey: queryKeys.user.onboardingStatus(),
    queryFn: apiClient.user.getOnboardingStatus,
  })
}

export function useUpdateOnboardingStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiClient.user.updateOnboardingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.onboardingStatus() })
    },
  })
} 