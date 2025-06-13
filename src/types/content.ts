export interface ContentPost {
  id: number
  title: string
  content: string
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
  scheduledAt: string | null
  publishedAt: string | null
  pillarId?: number
  pillarName?: string
  hashtags: string[]
  mentions: string[]
  mediaUrls: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  createdAt: string
  updatedAt: string
  userId: string
}

export interface ContentPillar {
  id: number
  name: string
  description?: string
  color: string
  targetPercentage?: number
  postCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface ContentCalendarEvent {
  id: number
  postId: number
  title: string
  status: ContentPost['status']
  scheduledAt: string
  pillarName?: string
  pillarColor?: string
}

export interface CreatePostData {
  title?: string
  content: string
  pillarId?: number
  hashtags?: string[]
  mentions?: string[]
  mediaUrls?: string[]
  scheduledAt?: string
  status: 'draft' | 'scheduled' | 'published'
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: number
} 