import { db } from '@/db'
import { 
  contentPosts, 
  contentPillars, 
  type ContentPost,
  type NewContentPost,
  type ContentPillar,
  type NewContentPillar,
  eq, 
  and, 
  or, 
  desc, 
  asc, 
  ilike,
  count
} from '@/db/schema'
import { gte, lte } from 'drizzle-orm'

// ================================
// Content Posts Service
// ================================

export interface PostFilters {
  status?: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
  pillarId?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface PostListResult {
  posts: ContentPost[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Get paginated list of posts with filtering
 */
export async function getPosts(userId: string, filters: PostFilters = {}): Promise<PostListResult> {
  const {
    status,
    pillarId,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = filters

  // Build where conditions
  const conditions = [eq(contentPosts.userId, userId)]
  
  if (status) {
    conditions.push(eq(contentPosts.status, status))
  }
  
  if (pillarId) {
    conditions.push(eq(contentPosts.pillarId, pillarId))
  }
  
  if (search) {
    conditions.push(
      or(
        ilike(contentPosts.title, `%${search}%`),
        ilike(contentPosts.content, `%${search}%`)
      )!
    )
  }
  
  if (startDate) {
    conditions.push(gte(contentPosts.createdAt, new Date(startDate)))
  }
  
  if (endDate) {
    conditions.push(lte(contentPosts.createdAt, new Date(endDate)))
  }

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(contentPosts)
    .where(and(...conditions))

  const total = totalResult.count
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  // Get posts with pagination
  const posts = await db
    .select({
      id: contentPosts.id,
      userId: contentPosts.userId,
      pillarId: contentPosts.pillarId,
      title: contentPosts.title,
      content: contentPosts.content,
      postType: contentPosts.postType,
      mediaUrls: contentPosts.mediaUrls,
      documentUrls: contentPosts.documentUrls,
      hashtags: contentPosts.hashtags,
      mentions: contentPosts.mentions,
      status: contentPosts.status,
      scheduledAt: contentPosts.scheduledAt,
      publishedAt: contentPosts.publishedAt,
      linkedinPostId: contentPosts.linkedinPostId,
      linkedinPostUrl: contentPosts.linkedinPostUrl,
      likeCount: contentPosts.likeCount,
      commentCount: contentPosts.commentCount,
      shareCount: contentPosts.shareCount,
      impressionCount: contentPosts.impressionCount,
      sourceTemplate: contentPosts.sourceTemplate,
      aiGenerated: contentPosts.aiGenerated,
      notes: contentPosts.notes,
      createdAt: contentPosts.createdAt,
      updatedAt: contentPosts.updatedAt,
      pillarName: contentPillars.name,
    })
    .from(contentPosts)
    .leftJoin(contentPillars, eq(contentPosts.pillarId, contentPillars.id))
    .where(and(...conditions))
    .orderBy(desc(contentPosts.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    posts: posts as ContentPost[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

/**
 * Get a single post by ID
 */
export async function getPostById(userId: string, postId: string): Promise<ContentPost | null> {
  const [post] = await db
    .select({
      id: contentPosts.id,
      userId: contentPosts.userId,
      pillarId: contentPosts.pillarId,
      title: contentPosts.title,
      content: contentPosts.content,
      postType: contentPosts.postType,
      mediaUrls: contentPosts.mediaUrls,
      documentUrls: contentPosts.documentUrls,
      hashtags: contentPosts.hashtags,
      mentions: contentPosts.mentions,
      status: contentPosts.status,
      scheduledAt: contentPosts.scheduledAt,
      publishedAt: contentPosts.publishedAt,
      linkedinPostId: contentPosts.linkedinPostId,
      linkedinPostUrl: contentPosts.linkedinPostUrl,
      likeCount: contentPosts.likeCount,
      commentCount: contentPosts.commentCount,
      shareCount: contentPosts.shareCount,
      impressionCount: contentPosts.impressionCount,
      sourceTemplate: contentPosts.sourceTemplate,
      aiGenerated: contentPosts.aiGenerated,
      notes: contentPosts.notes,
      createdAt: contentPosts.createdAt,
      updatedAt: contentPosts.updatedAt,
      pillarName: contentPillars.name,
    })
    .from(contentPosts)
    .leftJoin(contentPillars, eq(contentPosts.pillarId, contentPillars.id))
    .where(and(
      eq(contentPosts.id, postId),
      eq(contentPosts.userId, userId)
    ))
    .limit(1)

  return post as ContentPost || null
}

/**
 * Create a new post
 */
export async function createPost(userId: string, postData: Omit<NewContentPost, 'userId'>): Promise<ContentPost> {
  const newPost: NewContentPost = {
    ...postData,
    userId,
    publishedAt: postData.status === 'published' ? new Date() : null,
    updatedAt: new Date(),
  }

  const [createdPost] = await db
    .insert(contentPosts)
    .values(newPost)
    .returning()

  return createdPost
}

/**
 * Update a post
 */
export async function updatePost(
  userId: string, 
  postId: string, 
  updateData: Partial<Omit<NewContentPost, 'userId'>>
): Promise<ContentPost | null> {
  const updatedData = {
    ...updateData,
    updatedAt: new Date(),
    publishedAt: updateData.status === 'published' && !updateData.publishedAt ? new Date() : updateData.publishedAt,
  }

  const [updatedPost] = await db
    .update(contentPosts)
    .set(updatedData)
    .where(and(
      eq(contentPosts.id, postId),
      eq(contentPosts.userId, userId)
    ))
    .returning()

  return updatedPost || null
}

/**
 * Delete a post
 */
export async function deletePost(userId: string, postId: string): Promise<boolean> {
  const result = await db
    .delete(contentPosts)
    .where(and(
      eq(contentPosts.id, postId),
      eq(contentPosts.userId, userId)
    ))

  return result.rowCount > 0
}

/**
 * Bulk update posts
 */
export async function bulkUpdatePosts(
  userId: string,
  postIds: string[],
  updateData: Partial<Omit<NewContentPost, 'userId'>>
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const postId of postIds) {
    try {
      const result = await updatePost(userId, postId, updateData)
      if (result) {
        success++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { success, failed }
}

/**
 * Bulk delete posts
 */
export async function bulkDeletePosts(userId: string, postIds: string[]): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const postId of postIds) {
    try {
      const result = await deletePost(userId, postId)
      if (result) {
        success++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { success, failed }
}

// ================================
// Content Pillars Service
// ================================

/**
 * Get all pillars for a user
 */
export async function getPillars(userId: string): Promise<ContentPillar[]> {
  const pillars = await db
    .select()
    .from(contentPillars)
    .where(eq(contentPillars.userId, userId))
    .orderBy(asc(contentPillars.sortOrder), asc(contentPillars.name))

  return pillars
}

/**
 * Get a single pillar by ID
 */
export async function getPillarById(userId: string, pillarId: string): Promise<ContentPillar | null> {
  const [pillar] = await db
    .select()
    .from(contentPillars)
    .where(and(
      eq(contentPillars.id, pillarId),
      eq(contentPillars.userId, userId)
    ))
    .limit(1)

  return pillar || null
}

/**
 * Create a new pillar
 */
export async function createPillar(userId: string, pillarData: Omit<NewContentPillar, 'userId'>): Promise<ContentPillar> {
  const newPillar: NewContentPillar = {
    ...pillarData,
    userId,
    updatedAt: new Date(),
  }

  const [createdPillar] = await db
    .insert(contentPillars)
    .values(newPillar)
    .returning()

  return createdPillar
}

/**
 * Update a pillar
 */
export async function updatePillar(
  userId: string, 
  pillarId: string, 
  updateData: Partial<Omit<NewContentPillar, 'userId'>>
): Promise<ContentPillar | null> {
  const updatedData = {
    ...updateData,
    updatedAt: new Date(),
  }

  const [updatedPillar] = await db
    .update(contentPillars)
    .set(updatedData)
    .where(and(
      eq(contentPillars.id, pillarId),
      eq(contentPillars.userId, userId)
    ))
    .returning()

  return updatedPillar || null
}

/**
 * Delete a pillar
 */
export async function deletePillar(userId: string, pillarId: string): Promise<boolean> {
  const result = await db
    .delete(contentPillars)
    .where(and(
      eq(contentPillars.id, pillarId),
      eq(contentPillars.userId, userId)
    ))

  return result.rowCount > 0
}

 