import { db } from '@/db'
import { 
  aiProjects,
  aiPostSessions,
  aiContentVersions,
  aiGeneratedAssets,
  aiUsageLogs,
  type AIProject,
  type NewAIProject,
  type AIPostSession,
  type NewAIPostSession,
  type AIContentVersion,
  type NewAIContentVersion,
  type AIGeneratedAsset,
  type NewAIGeneratedAsset,
  type AIUsageLog,
  type NewAIUsageLog,
  type CreateProjectInput,
  type CreateSessionInput,
  type CreateContentVersionInput,
  type CreateAssetInput,
  type CreateUsageLogInput,
  eq, 
  and, 
  or, 
  desc, 
  asc, 
  like, 
  ilike,
  count
} from '@/db/schema'
import { gte, lte } from 'drizzle-orm'

// ================================
// AI Projects Service
// ================================

export interface ProjectFilters {
  tone?: string
  isActive?: boolean
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ProjectListResult {
  projects: AIProject[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Get paginated list of projects with filtering
 */
export async function getProjects(userId: string, filters: ProjectFilters = {}): Promise<ProjectListResult> {
  const {
    tone,
    isActive,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = filters

  // Build where conditions
  const conditions = [eq(aiProjects.userId, userId)]
  
  if (tone) {
    conditions.push(eq(aiProjects.tone, tone as any))
  }
  
  if (typeof isActive === 'boolean') {
    conditions.push(eq(aiProjects.isActive, isActive))
  }
  
  if (search) {
    conditions.push(
      or(
        ilike(aiProjects.name, `%${search}%`),
        ilike(aiProjects.description, `%${search}%`),
        ilike(aiProjects.guidelines, `%${search}%`)
      )!
    )
  }
  
  if (startDate) {
    conditions.push(gte(aiProjects.createdAt, new Date(startDate)))
  }
  
  if (endDate) {
    conditions.push(lte(aiProjects.createdAt, new Date(endDate)))
  }

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(aiProjects)
    .where(and(...conditions))

  const total = totalResult.count
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  // Get projects
  const projects = await db
    .select()
    .from(aiProjects)
    .where(and(...conditions))
    .orderBy(desc(aiProjects.updatedAt))
    .limit(limit)
    .offset(offset)

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(userId: string, projectId: number): Promise<AIProject | null> {
  const [project] = await db
    .select()
    .from(aiProjects)
    .where(and(
      eq(aiProjects.id, projectId),
      eq(aiProjects.userId, userId)
    ))
    .limit(1)

  return project || null
}

/**
 * Create a new AI project
 */
export async function createProject(userId: string, projectData: CreateProjectInput): Promise<AIProject> {
  const newProject: NewAIProject = {
    ...projectData,
    userId,
    updatedAt: new Date(),
  }

  const [createdProject] = await db
    .insert(aiProjects)
    .values(newProject)
    .returning()

  return createdProject
}

/**
 * Update a project
 */
export async function updateProject(
  userId: string, 
  projectId: number, 
  updateData: Partial<CreateProjectInput>
): Promise<AIProject | null> {
  const updatedData = {
    ...updateData,
    updatedAt: new Date(),
  }

  const [updatedProject] = await db
    .update(aiProjects)
    .set(updatedData)
    .where(and(
      eq(aiProjects.id, projectId),
      eq(aiProjects.userId, userId)
    ))
    .returning()

  return updatedProject || null
}

/**
 * Delete a project
 */
export async function deleteProject(userId: string, projectId: number): Promise<boolean> {
  const result = await db
    .delete(aiProjects)
    .where(and(
      eq(aiProjects.id, projectId),
      eq(aiProjects.userId, userId)
    ))

  return result.rowCount > 0
}

// ================================
// AI Post Sessions Service
// ================================

export interface SessionFilters {
  projectId?: number
  status?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface SessionListResult {
  sessions: AIPostSession[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Get sessions for a specific project
 */
export async function getProjectSessions(userId: string, projectId: number): Promise<AIPostSession[]> {
  // Verify user owns the project
  const [project] = await db
    .select({ id: aiProjects.id })
    .from(aiProjects)
    .where(and(
      eq(aiProjects.id, projectId),
      eq(aiProjects.userId, userId)
    ))
    .limit(1)

  if (!project) return []

  const sessions = await db
    .select()
    .from(aiPostSessions)
    .where(eq(aiPostSessions.projectId, projectId))
    .orderBy(desc(aiPostSessions.updatedAt))

  return sessions
}

/**
 * Get a single session by ID
 */
export async function getSessionById(userId: string, sessionId: number): Promise<AIPostSession | null> {
  // Get session and verify user ownership through project
  const [session] = await db
    .select({
      id: aiPostSessions.id,
      projectId: aiPostSessions.projectId,
      postIdea: aiPostSessions.postIdea,
      additionalContext: aiPostSessions.additionalContext,
      targetContentType: aiPostSessions.targetContentType,
      selectedModel: aiPostSessions.selectedModel,
      customPrompt: aiPostSessions.customPrompt,
      status: aiPostSessions.status,
      currentStep: aiPostSessions.currentStep,
      totalVersions: aiPostSessions.totalVersions,
      selectedVersionId: aiPostSessions.selectedVersionId,
      needsAsset: aiPostSessions.needsAsset,
      assetGenerated: aiPostSessions.assetGenerated,
      finalContent: aiPostSessions.finalContent,
      isCompleted: aiPostSessions.isCompleted,
      createdAt: aiPostSessions.createdAt,
      updatedAt: aiPostSessions.updatedAt,
    })
    .from(aiPostSessions)
    .innerJoin(aiProjects, eq(aiPostSessions.projectId, aiProjects.id))
    .where(and(
      eq(aiPostSessions.id, sessionId),
      eq(aiProjects.userId, userId)
    ))
    .limit(1)

  return session || null
}

/**
 * Create a new post session
 */
export async function createSession(userId: string, sessionData: CreateSessionInput): Promise<AIPostSession> {
  // Verify user owns the project
  const [project] = await db
    .select({ id: aiProjects.id })
    .from(aiProjects)
    .where(and(
      eq(aiProjects.id, sessionData.projectId),
      eq(aiProjects.userId, userId)
    ))
    .limit(1)

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  const newSession: NewAIPostSession = {
    ...sessionData,
    updatedAt: new Date(),
  }

  const [createdSession] = await db
    .insert(aiPostSessions)
    .values(newSession)
    .returning()

  return createdSession
}

/**
 * Update a session
 */
export async function updateSession(
  userId: string, 
  sessionId: number, 
  updateData: Partial<CreateSessionInput>
): Promise<AIPostSession | null> {
  // Verify user owns the session through project ownership
  const session = await getSessionById(userId, sessionId)
  if (!session) return null

  const updatedData = {
    ...updateData,
    updatedAt: new Date(),
  }

  const [updatedSession] = await db
    .update(aiPostSessions)
    .set(updatedData)
    .where(eq(aiPostSessions.id, sessionId))
    .returning()

  return updatedSession || null
}

/**
 * Delete a session
 */
export async function deleteSession(userId: string, sessionId: number): Promise<boolean> {
  // Verify user owns the session through project ownership
  const session = await getSessionById(userId, sessionId)
  if (!session) return false

  const result = await db
    .delete(aiPostSessions)
    .where(eq(aiPostSessions.id, sessionId))

  return result.rowCount > 0
}

// ================================
// AI Content Versions Service
// ================================

/**
 * Get content versions for a session
 */
export async function getSessionContentVersions(userId: string, sessionId: number): Promise<AIContentVersion[]> {
  // Verify user owns the session
  const session = await getSessionById(userId, sessionId)
  if (!session) return []

  const versions = await db
    .select()
    .from(aiContentVersions)
    .where(eq(aiContentVersions.sessionId, sessionId))
    .orderBy(asc(aiContentVersions.versionNumber))

  return versions
}

/**
 * Create content versions
 */
export async function createContentVersions(
  userId: string, 
  sessionId: number,
  versionsData: CreateContentVersionInput[]
): Promise<AIContentVersion[]> {
  // Verify user owns the session
  const session = await getSessionById(userId, sessionId)
  if (!session) {
    throw new Error('Session not found or access denied')
  }

  const newVersions: NewAIContentVersion[] = versionsData.map(version => ({
    ...version,
    sessionId,
  }))

  const createdVersions = await db
    .insert(aiContentVersions)
    .values(newVersions)
    .returning()

  return createdVersions
}

/**
 * Select a content version
 */
export async function selectContentVersion(
  userId: string, 
  sessionId: number, 
  versionId: number
): Promise<boolean> {
  // Verify user owns the session
  const session = await getSessionById(userId, sessionId)
  if (!session) return false

  // Unselect all versions for this session
  await db
    .update(aiContentVersions)
    .set({ isSelected: false })
    .where(eq(aiContentVersions.sessionId, sessionId))

  // Select the chosen version
  const [selectedVersion] = await db
    .update(aiContentVersions)
    .set({ isSelected: true })
    .where(and(
      eq(aiContentVersions.id, versionId),
      eq(aiContentVersions.sessionId, sessionId)
    ))
    .returning()

  if (!selectedVersion) return false

  // Update session with selected version
  await db
    .update(aiPostSessions)
    .set({ 
      selectedVersionId: versionId,
      finalContent: selectedVersion.content,
      updatedAt: new Date()
    })
    .where(eq(aiPostSessions.id, sessionId))

  return true
}

// ================================
// AI Generated Assets Service
// ================================

/**
 * Create a generated asset
 */
export async function createAsset(
  userId: string, 
  sessionId: number, 
  assetData: CreateAssetInput
): Promise<AIGeneratedAsset> {
  // Verify user owns the session
  const session = await getSessionById(userId, sessionId)
  if (!session) {
    throw new Error('Session not found or access denied')
  }

  const newAsset: NewAIGeneratedAsset = {
    ...assetData,
    sessionId,
  }

  const [createdAsset] = await db
    .insert(aiGeneratedAssets)
    .values(newAsset)
    .returning()

  return createdAsset
}

/**
 * Get assets for a session
 */
export async function getSessionAssets(userId: string, sessionId: number): Promise<AIGeneratedAsset[]> {
  // Verify user owns the session
  const session = await getSessionById(userId, sessionId)
  if (!session) return []

  const assets = await db
    .select()
    .from(aiGeneratedAssets)
    .where(eq(aiGeneratedAssets.sessionId, sessionId))
    .orderBy(desc(aiGeneratedAssets.createdAt))

  return assets
}

// ================================
// AI Usage Logs Service
// ================================

/**
 * Create a usage log entry
 */
export async function createUsageLog(logData: CreateUsageLogInput): Promise<AIUsageLog> {
  const newLog: NewAIUsageLog = {
    ...logData,
  }

  const [createdLog] = await db
    .insert(aiUsageLogs)
    .values(newLog)
    .returning()

  return createdLog
}

/**
 * Get recent usage logs for a user
 */
export async function getRecentUsageLogs(userId: string, limit: number = 50): Promise<AIUsageLog[]> {
  const logs = await db
    .select()
    .from(aiUsageLogs)
    .where(eq(aiUsageLogs.userId, userId))
    .orderBy(desc(aiUsageLogs.createdAt))
    .limit(limit)

  return logs
} 