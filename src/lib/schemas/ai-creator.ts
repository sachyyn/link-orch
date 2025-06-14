import { z } from 'zod'

// ================================
// AI Creator Project Schemas
// ================================

// Content tone enum - matches database enum
export const CONTENT_TONES = [
  'professional',
  'casual', 
  'thought-leader',
  'provocative',
  'educational',
  'inspirational',
  'conversational',
  'custom'
] as const

// Content types enum - matches database enum  
export const CONTENT_TYPES = [
  'text-post',
  'carousel', 
  'video-script',
  'poll',
  'article',
  'story',
  'announcement'
] as const

// Simplified content types for frontend
export const FRONTEND_CONTENT_TYPES = [
  'post',
  'article', 
  'poll',
  'carousel'
] as const

// Base project schema - most comprehensive version
export const createProjectSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(255, "Name must be less than 255 characters"),
  
  description: z.string().optional(),
  
  tone: z.enum(CONTENT_TONES)
    .default('professional'),
  
  // Handle both single and multiple content types
  contentTypes: z.array(z.enum(CONTENT_TYPES))
    .min(1, "At least one content type is required")
    .default(['text-post']),
  
  guidelines: z.string()
    .min(1, "Guidelines are required")
    .max(10000, "Guidelines must be less than 10,000 characters"),
  
  // Optional advanced fields
  targetAudience: z.string().optional(),
  keyTopics: z.string().optional(), 
  brandVoice: z.string().optional(),
  contentPillars: z.string().optional(),
  
  defaultModel: z.string()
    .default('gemini-2.0-flash-exp'),
})

// For API - expects contentTypes as JSON string, all fields required
export const createProjectApiSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(255, "Name must be less than 255 characters"),
  
  description: z.string().optional(),
  
  tone: z.enum(CONTENT_TONES), // Required, no default here for API
  
  contentTypes: z.string()
    .min(1, "Content types are required")
    .refine((val) => {
      try {
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) && parsed.length > 0
      } catch {
        return false
      }
    }, "Content types must be a valid JSON array"),
  
  guidelines: z.string()
    .min(1, "Guidelines are required")
    .max(10000, "Guidelines must be less than 10,000 characters"),
  
  // Optional advanced fields
  targetAudience: z.string().optional(),
  keyTopics: z.string().optional(), 
  brandVoice: z.string().optional(),
  contentPillars: z.string().optional(),
  
  defaultModel: z.string(),
})

// For frontend - simplified initial form  
export const createProjectFormSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Name must be less than 100 characters"),
  
  description: z.string().optional(),
  
  tone: z.enum(CONTENT_TONES),
  
  // Single content type for simplicity  
  contentType: z.enum(FRONTEND_CONTENT_TYPES),
  
  guidelines: z.string()
    .min(1, "Please provide some basic guidelines for your content")
    .max(10000, "Guidelines must be less than 10,000 characters"),
})

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type CreateProjectApiInput = z.infer<typeof createProjectApiSchema>
export type CreateProjectFormInput = z.infer<typeof createProjectFormSchema>

// ================================
// AI Creator Session Schemas
// ================================

// Session status enum - matches database
export const SESSION_STATUS = [
  'ideation',
  'generating', 
  'asset-creation',
  'ready',
  'completed',
  'archived'
] as const

// Target content types for sessions - matches database
export const TARGET_CONTENT_TYPES = CONTENT_TYPES

// Base session schema
export const createSessionSchema = z.object({
  postIdea: z.string()
    .min(1, "Post idea is required")
    .max(1000, "Post idea must be less than 1000 characters"),
  
  additionalContext: z.string().optional(),
  
  targetContentType: z.enum(TARGET_CONTENT_TYPES)
    .default('text-post'),
  
  selectedModel: z.string()
    .min(1, "AI model selection is required")
    .default('gemini-2.0-flash-exp'),
  
  customPrompt: z.string().optional(),
  
  needsAsset: z.boolean()
    .default(false),
})

// For API - matches exact database requirements (no defaults to ensure required fields)
export const createSessionApiSchema = z.object({
  postIdea: z.string()
    .min(1, "Post idea is required")
    .max(1000, "Post idea must be less than 1000 characters"),
  
  additionalContext: z.string().optional(),
  
  targetContentType: z.enum(TARGET_CONTENT_TYPES),
  
  selectedModel: z.string()
    .min(1, "AI model selection is required"),
  
  customPrompt: z.string().optional(),
  
  needsAsset: z.boolean(),
})

// For frontend - simplified session creation form
export const createSessionFormSchema = z.object({
  postIdea: z.string()
    .min(1, "Please describe your post idea")
    .max(500, "Keep your idea under 500 characters"),
  
  additionalContext: z.string().optional(),
  
  targetContentType: z.enum(FRONTEND_CONTENT_TYPES)
    .default('post'),
  
  selectedModel: z.string()
    .default('gemini-2.0-flash-exp'),
  
  needsAsset: z.boolean()
    .default(false),
})

// Session type exports
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type CreateSessionApiInput = z.infer<typeof createSessionApiSchema>
export type CreateSessionFormInput = z.infer<typeof createSessionFormSchema>

// ================================
// Transform Functions
// ================================

// Content type mapping between frontend and database
const CONTENT_TYPE_MAPPING: Record<typeof FRONTEND_CONTENT_TYPES[number], typeof CONTENT_TYPES[number]> = {
  'post': 'text-post',
  'article': 'article',
  'poll': 'poll',
  'carousel': 'carousel',
}

const REVERSE_CONTENT_TYPE_MAPPING: Record<typeof CONTENT_TYPES[number], typeof FRONTEND_CONTENT_TYPES[number]> = {
  'text-post': 'post',
  'article': 'article', 
  'poll': 'poll',
  'carousel': 'carousel',
  'video-script': 'post', // Default fallback
  'story': 'post', // Default fallback
  'announcement': 'post', // Default fallback
}

// Transform form data to API format
export function transformFormToApi(formData: CreateProjectFormInput): CreateProjectApiInput {
  const mappedContentType = CONTENT_TYPE_MAPPING[formData.contentType]
  
  return {
    name: formData.name,
    description: formData.description,
    tone: formData.tone,
    contentTypes: JSON.stringify([mappedContentType]), // Convert single to array JSON
    guidelines: formData.guidelines,
    defaultModel: 'gemini-2.0-flash-exp',
  }
}

// Transform API data to form format (for editing)
export function transformApiToForm(apiData: CreateProjectInput): CreateProjectFormInput {
  const firstContentType = apiData.contentTypes[0] || 'text-post'
  const mappedContentType = REVERSE_CONTENT_TYPE_MAPPING[firstContentType]
  
  return {
    name: apiData.name,
    description: apiData.description,
    tone: apiData.tone,
    contentType: mappedContentType,
    guidelines: apiData.guidelines,
  }
}

// Session transform functions
export function transformSessionFormToApi(formData: CreateSessionFormInput): CreateSessionApiInput {
  const mappedContentType = CONTENT_TYPE_MAPPING[formData.targetContentType]
  
  return {
    postIdea: formData.postIdea,
    additionalContext: formData.additionalContext,
    targetContentType: mappedContentType,
    selectedModel: formData.selectedModel,
    needsAsset: formData.needsAsset,
  }
}

export function transformSessionApiToForm(apiData: CreateSessionInput): CreateSessionFormInput {
  const mappedContentType = REVERSE_CONTENT_TYPE_MAPPING[apiData.targetContentType]
  
  return {
    postIdea: apiData.postIdea,
    additionalContext: apiData.additionalContext,
    targetContentType: mappedContentType,
    selectedModel: apiData.selectedModel,
    needsAsset: apiData.needsAsset,
  }
} 