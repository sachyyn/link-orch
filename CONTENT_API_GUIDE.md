# LinkedinMaster Pro - Content Management API Guide

## 🎯 Overview

The Content Management API provides comprehensive CRUD operations for managing LinkedIn content posts and content pillars. This system supports the complete content lifecycle from creation to publishing, with robust scheduling, workflow management, and bulk operations.

## 📁 API Structure

```
/api/content/
├── posts/               # Post management endpoints
│   ├── route.ts        # List posts (GET) & Create post (POST)
│   ├── [id]/route.ts   # Single post operations (GET, PUT, DELETE)
│   └── bulk/route.ts   # Bulk operations (POST)
└── pillars/            # Content pillar management
    └── route.ts        # List pillars (GET) & Create pillar (POST)
```

## 🔧 Core Features

### ✅ Implemented Features

1. **Complete Post Management**
   - Full CRUD operations (Create, Read, Update, Delete)
   - Advanced filtering and pagination
   - Scheduling with future date validation
   - Status workflow management (draft → scheduled → published)
   - Bulk operations for efficiency

2. **Content Pillar System**
   - Pillar creation and management
   - Target percentage allocation tracking
   - Performance analytics per pillar
   - Color-coded organization

3. **Security & Validation**
   - Authentication required for all endpoints
   - Input sanitization and validation
   - User-scoped data access
   - Comprehensive error handling

## 📋 API Endpoints

### Posts Management

#### `GET /api/content/posts`
**List Posts with Filtering & Pagination**

```typescript
// Query Parameters
interface QueryParams {
  page?: number          // Page number (default: 1)
  limit?: number         // Items per page (default: 20, max: 100)
  status?: string        // Filter by status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
  pillarId?: number      // Filter by content pillar ID
  search?: string        // Search in title and content
  startDate?: string     // Filter posts created after date (ISO string)
  endDate?: string       // Filter posts created before date (ISO string)
}

// Response
interface PostListResponse {
  posts: PostResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

**Example Request:**
```bash
GET /api/content/posts?status=published&pillarId=1&page=1&limit=10
```

#### `POST /api/content/posts`
**Create New Post**

```typescript
// Request Body
interface CreatePostRequest {
  title: string
  content: string
  status?: 'draft' | 'scheduled' | 'published' | 'archived'  // default: 'draft'
  scheduledAt?: string     // ISO date string (must be future)
  pillarId?: number        // Content pillar association
  hashtags?: string[]      // Hashtags for the post
  mentions?: string[]      // User mentions
  mediaUrls?: string[]     // Media attachments
}

// Response: PostResponse
```

**Example Request:**
```bash
POST /api/content/posts
Content-Type: application/json

{
  "title": "Building a Strong LinkedIn Presence",
  "content": "Here are 5 strategies to improve your LinkedIn engagement...",
  "status": "scheduled",
  "scheduledAt": "2024-02-01T10:00:00Z",
  "pillarId": 1,
  "hashtags": ["#LinkedIn", "#PersonalBranding", "#Growth"],
  "mentions": ["@linkedinhelp"]
}
```

#### `GET /api/content/posts/[id]`
**Get Single Post**

Returns detailed information for a specific post owned by the authenticated user.

#### `PUT /api/content/posts/[id]`
**Update Post**

```typescript
// Request Body (all fields optional for partial updates)
interface UpdatePostRequest {
  title?: string
  content?: string
  status?: 'draft' | 'scheduled' | 'published' | 'archived'
  scheduledAt?: string
  pillarId?: number
  hashtags?: string[]
  mentions?: string[]
  mediaUrls?: string[]
}
```

#### `DELETE /api/content/posts/[id]`
**Delete Post**

Deletes a post with business rule validation (e.g., published posts cannot be deleted).

### Bulk Operations

#### `POST /api/content/posts/bulk`
**Bulk Operations on Multiple Posts**

```typescript
// Bulk Delete
interface BulkDeleteRequest {
  operation: 'delete'
  postIds: number[]
}

// Bulk Status Update
interface BulkStatusUpdateRequest {
  operation: 'status_update'
  postIds: number[]
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
}

// Bulk Schedule
interface BulkScheduleRequest {
  operation: 'schedule'
  postIds: number[]
  scheduledAt: string  // ISO date string
}

// Response
interface BulkOperationResponse {
  success: boolean
  operation: string
  processed: number
  failed: number
  results: Array<{
    postId: number
    success: boolean
    error?: string
  }>
}
```

**Example Requests:**
```bash
# Bulk delete posts
POST /api/content/posts/bulk
{
  "operation": "delete",
  "postIds": [1, 2, 3]
}

# Bulk status update
POST /api/content/posts/bulk
{
  "operation": "status_update",
  "postIds": [4, 5, 6],
  "status": "published"
}

# Bulk scheduling
POST /api/content/posts/bulk
{
  "operation": "schedule",
  "postIds": [7, 8, 9],
  "scheduledAt": "2024-02-15T14:00:00Z"
}
```

### Content Pillars

#### `GET /api/content/pillars`
**List All Pillars with Analytics**

```typescript
interface PillarListResponse {
  pillars: PillarResponse[]
  totalPosts: number
  analytics: {
    mostActiveMonth: string
    topPerformingPillar: string
    averagePostsPerPillar: number
  }
}
```

#### `POST /api/content/pillars`
**Create New Pillar**

```typescript
interface CreatePillarRequest {
  name: string              // 2-50 characters
  description?: string      // Optional description
  color: string            // Hex color (e.g., #3B82F6)
  targetPercentage: number // 1-100, total cannot exceed 100%
}
```

## 🔒 Authentication & Security

### Required Headers
```bash
Authorization: Bearer <clerk-session-token>
Content-Type: application/json
```

### Security Features
- **Authentication Required:** All endpoints require valid Clerk session
- **User Scoping:** Users can only access their own content
- **Input Sanitization:** All inputs are sanitized automatically
- **Validation:** Comprehensive input validation using Zod schemas
- **Security Headers:** CORS, XSS protection, content type validation

### Error Handling
```typescript
// Standard Error Response Format
interface ErrorResponse {
  error: string
  code?: string
  details?: any
}

// HTTP Status Codes
200 - Success
201 - Created
400 - Bad Request (validation errors)
401 - Unauthorized (authentication required)
403 - Forbidden (access denied)
404 - Not Found
500 - Internal Server Error
```

## 📊 Data Models

### Post Response
```typescript
interface PostResponse {
  id: number
  title: string
  content: string
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
  scheduledAt: string | null     // ISO date string
  publishedAt: string | null     // ISO date string
  pillarId: number | null        // Associated content pillar
  pillarName?: string           // Pillar name for convenience
  hashtags: string[]            // Post hashtags
  mentions: string[]            // User mentions
  mediaUrls: string[]           // Media attachment URLs
  viewCount: number             // Post view count
  createdAt: string             // ISO date string
  updatedAt: string             // ISO date string
}
```

### Pillar Response
```typescript
interface PillarResponse {
  id: number
  name: string
  description: string
  color: string                 // Hex color code
  targetPercentage: number      // Target content allocation %
  postCount: number             // Number of associated posts
  lastPostDate: string | null   // Last post creation date
  createdAt: string
  updatedAt: string
}
```

## 🚀 Usage Examples

### Frontend Integration
```typescript
// Fetch posts with filtering
const fetchPosts = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`/api/content/posts?${params}`, {
    headers: {
      'Authorization': `Bearer ${clerkToken}`,
    },
  })
  return response.json()
}

// Create new post
const createPost = async (postData) => {
  const response = await fetch('/api/content/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  })
  return response.json()
}

// Bulk operations
const bulkUpdateStatus = async (postIds, status) => {
  const response = await fetch('/api/content/posts/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation: 'status_update',
      postIds,
      status,
    }),
  })
  return response.json()
}
```

## 📝 Business Rules

### Post Management Rules
1. **Scheduling:** Scheduled date must be in the future
2. **Status Workflow:** Draft → Scheduled → Published (no reverse)
3. **Deletion:** Published posts cannot be deleted (archive instead)
4. **Pillar Association:** Must exist and belong to user

### Pillar Management Rules
1. **Name:** Must be 2-50 characters, unique per user
2. **Color:** Must be valid hex color code
3. **Target Percentage:** 1-100%, total allocation cannot exceed 100%
4. **Deletion:** Cannot delete pillars with associated posts

### Bulk Operations Rules
1. **Batch Size:** Maximum 100 posts per operation
2. **Permissions:** Can only operate on user's own posts
3. **Atomicity:** Operations are processed individually (partial success possible)
4. **Validation:** Each post validated individually with detailed error reporting

## 🔄 Next Steps

### Phase 3.3 - Analytics API (Pending)
- Post performance tracking
- Engagement metrics collection
- Performance snapshots
- Analytics dashboard endpoints

### Phase 3.4 - Business Logic API (Pending) 
- Event management endpoints
- Lead tracking and management
- Campaign management
- ROI and conversion tracking

## 💡 Notes

- **Mock Implementation:** Current endpoints use mock data to demonstrate functionality
- **Database Integration:** Real database operations will be implemented after resolving Drizzle type conflicts
- **Performance:** Pagination and filtering implemented for scalability
- **Extensibility:** Designed for easy addition of new features and endpoints

---

*This API provides a complete foundation for LinkedIn content management with room for advanced features like AI content suggestions, automated scheduling, and advanced analytics.* 