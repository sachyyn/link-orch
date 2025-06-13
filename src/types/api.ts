// Dashboard Types
export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  scheduledPosts: number
  draftPosts: number
  totalPillars: number
  profileCompletion: number
  upcomingPosts: number
  lastPostDate?: string
}

// Content Management Types
export interface Post {
  id: number
  title: string
  content: string
  status: 'draft' | 'scheduled' | 'published'
  scheduledAt?: string
  publishedAt?: string
  pillarId?: number
  pillar?: ContentPillar
  hashtags: string[]
  mentions: string[]
  mediaUrls: string[]
  createdAt: string
  updatedAt: string
  analytics?: PostAnalytics
}

export interface ContentPillar {
  id: number
  name: string
  description?: string
  color: string
  targetPercentage?: number
  postCount: number
  createdAt: string
  updatedAt: string
}

export interface BulkPostUpdate {
  postIds: number[]
  action: 'delete' | 'update_status' | 'schedule'
  updates?: {
    status?: 'draft' | 'scheduled' | 'published'
    scheduledAt?: string
  }
}

// Analytics Types
export interface AnalyticsOverview {
  summary: {
    totalPosts: number
    totalImpressions: number
    totalEngagement: number
    averageEngagementRate: number
    followerGrowth: number
    profileViews: number
  }
  trends: {
    impressions: TrendData
    engagement: TrendData
    followers: TrendData
  }
  period: string
  comparisonPeriod?: string
}

export interface TrendData {
  current: number
  previous: number
  changePercentage: number
  trend: 'up' | 'down' | 'stable'
}

export interface PostAnalytics {
  id: number
  postId: number
  impressions: number
  engagements: number
  engagementRate: number
  clicks: number
  shares: number
  comments: number
  likes: number
  period: string
  createdAt: string
}

export interface AnalyticsReport {
  id: number
  name: string
  type: 'performance' | 'engagement' | 'growth' | 'content'
  period: string
  data: any
  createdAt: string
  url?: string
}

// Engagement Types
export interface Comment {
  id: number
  postId: number
  postTitle: string
  authorName: string
  authorProfileUrl?: string
  content: string
  status: 'unread' | 'read' | 'replied' | 'ignored'
  priority: 'low' | 'medium' | 'high'
  sentiment: 'positive' | 'neutral' | 'negative'
  response?: string
  responseTemplateId?: number
  createdAt: string
  updatedAt: string
  linkedinUrl?: string
}

export interface ResponseTemplate {
  id: number
  title: string
  content: string
  category: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface EngagementMetrics {
  id: number
  postId?: number
  postTitle?: string
  comments: number
  replies: number
  responseRate: number
  avgResponseTime: number // in hours
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  period: 'week' | 'month' | 'quarter'
  createdAt: string
}

// Business/Leads Types
export interface Lead {
  id: number
  firstName: string
  lastName: string
  name: string // computed field
  email: string
  company?: string
  jobTitle?: string
  linkedinUrl?: string
  phone?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high'
  source: string
  sourceDetails?: string
  estimatedValue?: number
  notes?: string
  tags: string[]
  lastContactedAt?: string
  nextFollowUpAt?: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: number
  title: string
  description: string
  eventType: 'webinar' | 'workshop' | 'networking' | 'conference' | 'meetup'
  startDateTime: string
  endDateTime: string
  location?: string
  isVirtual: boolean
  maxAttendees?: number
  currentAttendees: number
  registrationRequired: boolean
  registrationUrl?: string
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  tags: string[]
  createdAt: string
  updatedAt: string
}

// User Types
export interface OnboardingStatus {
  currentStep: number
  completedSteps: number[]
  isCompleted: boolean
  totalSteps: number
  lastUpdated: string
}

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  linkedinProfile?: string
  company?: string
  jobTitle?: string
  industry?: string
  profilePicture?: string
  settings: UserSettings
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  timezone: string
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
  autoSchedule: boolean
  defaultPostStatus: 'draft' | 'scheduled'
  theme: 'light' | 'dark' | 'system'
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T = any> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API Request Types
export interface PostCreateRequest {
  title: string
  content: string
  status?: 'draft' | 'scheduled' | 'published'
  scheduledAt?: string
  pillarId?: number
  hashtags?: string[]
  mentions?: string[]
  mediaUrls?: string[]
}

export interface PostUpdateRequest extends Partial<PostCreateRequest> {
  id: number
}

export interface LeadCreateRequest {
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
}

export interface EventCreateRequest {
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
}

export interface CommentUpdateRequest {
  status?: 'unread' | 'read' | 'replied' | 'ignored'
  priority?: 'low' | 'medium' | 'high'
  response?: string
  responseTemplateId?: number
}

// Filter Types
export interface PostFilters {
  page?: number
  limit?: number
  status?: string
  pillarId?: number
  search?: string
  startDate?: string
  endDate?: string
}

export interface CommentFilters {
  page?: number
  limit?: number
  status?: 'unread' | 'read' | 'replied' | 'ignored'
  priority?: 'low' | 'medium' | 'high'
  sentiment?: 'positive' | 'neutral' | 'negative'
  search?: string
  postId?: number
}

export interface LeadFilters {
  page?: number
  limit?: number
  status?: string
  source?: string
  priority?: string
  search?: string
  tags?: string
}

export interface EventFilters {
  page?: number
  limit?: number
  status?: string
  eventType?: string
  search?: string
  from?: string
  to?: string
}

export interface AnalyticsFilters {
  period?: '7d' | '30d' | '90d' | '1y'
  includeComparisons?: boolean
  type?: string
  startDate?: string
  endDate?: string
}

export interface EngagementMetricsFilters {
  period?: 'week' | 'month' | 'quarter'
  startDate?: string
  endDate?: string
  postId?: number
}

export interface TemplateFilters {
  category?: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
  search?: string
} 