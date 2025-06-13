# AI Creator API Routes Summary

## Complete API Route Structure

All routes follow the established patterns with proper authentication, validation, error handling, and consistent response formats.

### 1. Projects Management

#### `GET /api/ai-creator/projects`
- **Purpose**: Retrieve paginated list of AI Creator projects
- **Auth**: Required
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 20, max: 100)
  - `tone` (filter by content tone)
  - `isActive` (filter by active status)
  - `search` (search in name, description, guidelines)
  - `startDate` / `endDate` (date range filters)
- **Response**: Project list with pagination metadata

#### `POST /api/ai-creator/projects`
- **Purpose**: Create new AI Creator project
- **Auth**: Required
- **Body Schema**:
  ```typescript
  {
    name: string (1-255 chars)
    description?: string
    tone: 'professional' | 'casual' | 'thought-leader' | etc.
    contentTypes: string (JSON array)
    guidelines: string (required)
    targetAudience?: string
    keyTopics?: string
    brandVoice?: string
    contentPillars?: string
    defaultModel: string (default: 'gemini-2.0-flash-exp')
  }
  ```

#### `GET /api/ai-creator/projects/[id]`
- **Purpose**: Get specific project by ID
- **Auth**: Required (user ownership verified)

#### `PUT /api/ai-creator/projects/[id]`
- **Purpose**: Update existing project
- **Auth**: Required (user ownership verified)
- **Body**: Partial project data (all fields optional)

#### `DELETE /api/ai-creator/projects/[id]`
- **Purpose**: Delete project (cascade deletes sessions, versions, assets)
- **Auth**: Required (user ownership verified)

### 2. Sessions Management

#### `GET /api/ai-creator/projects/[id]/sessions`
- **Purpose**: Get all sessions for a specific project
- **Auth**: Required (project ownership verified)
- **Response**: List of sessions for the project

#### `POST /api/ai-creator/projects/[id]/sessions`
- **Purpose**: Create new post session within a project
- **Auth**: Required (project ownership verified)
- **Body Schema**:
  ```typescript
  {
    postIdea: string (required)
    additionalContext?: string
    targetContentType: 'text-post' | 'carousel' | 'video-script' | etc.
    selectedModel: string (required)
    customPrompt?: string
    needsAsset: boolean (default: false)
  }
  ```

#### `GET /api/ai-creator/sessions/[id]`
- **Purpose**: Get specific session by ID
- **Auth**: Required (ownership verified through project)

#### `PUT /api/ai-creator/sessions/[id]`
- **Purpose**: Update session details
- **Auth**: Required (ownership verified)
- **Body**: Partial session data including status updates

#### `DELETE /api/ai-creator/sessions/[id]`
- **Purpose**: Delete session (cascade deletes versions and assets)
- **Auth**: Required (ownership verified)

### 3. Content Versions Management

#### `GET /api/ai-creator/sessions/[id]/versions`
- **Purpose**: Get all content versions for a session
- **Auth**: Required (session ownership verified)
- **Response**: List of generated content versions

#### `POST /api/ai-creator/sessions/[id]/versions`
- **Purpose**: Create new content versions (AI generation results)
- **Auth**: Required (session ownership verified)
- **Body Schema**:
  ```typescript
  {
    versions: Array<{
      versionNumber: number
      generationBatch: number (default: 1)
      content: string (required)
      contentLength?: number
      estimatedReadTime?: number
      hashtags?: string
      mentions?: string
      callToAction?: string
      modelUsed: string (required)
      tokensUsed?: number
      generationTime?: number
      prompt?: string
    }> (1-10 versions per batch)
  }
  ```

#### `POST /api/ai-creator/versions/[id]/select`
- **Purpose**: Select a specific version as the chosen one
- **Auth**: Required
- **Body Schema**:
  ```typescript
  {
    sessionId: number (required)
  }
  ```

### 4. Asset Management

#### `GET /api/ai-creator/sessions/[id]/assets`
- **Purpose**: Get all generated assets for a session
- **Auth**: Required (session ownership verified)

#### `POST /api/ai-creator/sessions/[id]/assets`
- **Purpose**: Create new generated asset
- **Auth**: Required (session ownership verified)
- **Body Schema**:
  ```typescript
  {
    assetType: 'image' | 'carousel' | 'infographic' | etc.
    fileName: string (required)
    fileUrl: string (URL, required)
    fileSize?: number
    prompt: string (required)
    model?: string
    style?: string
    dimensions?: string
    generationTime?: number
    generationCost?: string
  }
  ```

### 5. Usage Analytics

#### `GET /api/ai-creator/usage`
- **Purpose**: Get recent usage logs for analytics
- **Auth**: Required
- **Query Parameters**:
  - `limit` (default: 50, max: 100)
- **Response**: Recent usage logs with totals

#### `POST /api/ai-creator/usage`
- **Purpose**: Log AI operation usage
- **Auth**: Required
- **Body Schema**:
  ```typescript
  {
    actionType: 'content_generation' | 'content_regeneration' | 'image_generation' | 'content_refinement' | 'asset_creation'
    modelUsed: string (required)
    tokensUsed?: number
    apiCost?: string
    processingTime?: number
    projectId?: number
    sessionId?: number
    requestPayload?: string
    responseSize?: number
    isSuccessful: boolean (default: true)
    errorMessage?: string
    userAgent?: string
    ipAddress?: string
  }
  ```

## Route Security & Features

### Authentication & Authorization
- All routes require Clerk authentication
- User ownership verification through database relationships
- Proper cascade delete protection

### Data Validation
- Comprehensive Zod schemas for all inputs
- Type-safe request/response handling
- Input sanitization enabled

### Error Handling
- Consistent error responses
- Proper HTTP status codes
- Security-conscious error messages

### Response Format
- JSON serialization of dates
- Consistent response structures
- Pagination where applicable

## Database Service Integration

All routes use the AI Creator service layer with:
- Proper user ownership verification
- Efficient database queries with joins
- Transaction support where needed
- Type-safe operations

## Development Features

- Request/response logging in development
- Comprehensive API documentation
- Type-safe development experience
- Easy testing and debugging

This API structure provides a complete foundation for the AI Creator module, supporting the full user workflow from project creation through content generation and asset management. 