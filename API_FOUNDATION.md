# LinkedinMaster Pro - API Foundation

## 🎯 Overview

This document describes the API foundation layer we've built for LinkedinMaster Pro. This foundation provides a robust, secure, and consistent base for all API endpoints in the application.

## 📁 File Structure

```
src/lib/
├── api.ts           # Core API utilities and error handling
├── security.ts      # Security middleware and CORS
├── validations.ts   # Zod validation schemas
└── api-wrapper.ts   # High-level API wrapper functions
```

## 🔧 Core Components

### 1. Error Handling (`@/lib/api.ts`)

**Custom Error Classes:**
- `APIError` - Base API error with status code
- `ValidationError` - Input validation failures 
- `AuthenticationError` - Authentication failures (401)
- `AuthorizationError` - Permission denied (403)
- `NotFoundError` - Resource not found (404)

**Response Helpers:**
- `successResponse()` - Standardized success responses
- `errorResponse()` - Standardized error responses
- `paginatedResponse()` - Paginated data responses

**Authentication:**
- `authenticateUser()` - Throws error if not authenticated
- `getAuthenticatedUserId()` - Returns userId or null

### 2. Security Layer (`@/lib/security.ts`)

**Security Headers:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy
- Referrer-Policy

**CORS Configuration:**
- Configurable allowed origins
- Proper preflight handling
- Production/development settings

**Input Sanitization:**
- XSS prevention
- Script tag removal
- Recursive object sanitization

### 3. Validation Schemas (`@/lib/validations.ts`)

**User & Profile:**
- `userProfileSchema` - User profile data
- `updateUserProfileSchema` - Partial updates

**Content Management:**
- `contentPillarSchema` - Content pillar creation
- `contentPostSchema` - Post creation/editing
- `contentTemplateSchema` - Template management

**Analytics:**
- `postAnalyticsSchema` - Performance metrics
- `engagementMetricSchema` - Engagement tracking

**Business Logic:**
- `eventSchema` - Event management
- `leadSchema` - Lead tracking
- `campaignSchema` - Campaign management
- `serviceSchema` - Service offerings

**Query Parameters:**
- `paginationSchema` - Standard pagination
- `dateRangeSchema` - Date filtering
- `contentFilterSchema` - Content filtering
- `analyticsFilterSchema` - Analytics filtering

### 4. API Wrapper (`@/lib/api-wrapper.ts`)

**Main Function:**
- `createAPIHandler()` - Full-featured API handler

**Specialized Handlers:**
- `createGetHandler()` - GET requests with query params
- `createPostHandler()` - POST requests with body validation
- `createPutHandler()` - PUT requests with body validation
- `createDeleteHandler()` - DELETE requests

**Configurations:**
- `commonConfigs.public` - Public endpoints
- `commonConfigs.protected` - Authenticated endpoints
- `commonConfigs.admin` - Admin endpoints
- `commonConfigs.upload` - File upload endpoints

## 🚀 Usage Examples

### Basic GET Endpoint

```typescript
import { createGetHandler } from '@/lib/api-wrapper'
import { paginationSchema } from '@/lib/validations'

export const GET = createGetHandler(
  async ({ userId, query }) => {
    // Your business logic here
    return { data: 'example' }
  },
  {
    requireAuth: true,
    querySchema: paginationSchema,
    sanitizeInput: true,
  }
)
```

### POST Endpoint with Validation

```typescript
import { createPostHandler } from '@/lib/api-wrapper'
import { contentPostSchema } from '@/lib/validations'

export const POST = createPostHandler(
  async ({ userId, body }) => {
    // Create post logic
    return { id: 123, ...body }
  },
  {
    bodySchema: contentPostSchema,
    requireAuth: true,
  }
)
```

### Complex Endpoint

```typescript
import { createAPIHandler } from '@/lib/api-wrapper'
import { contentFilterSchema, paginationSchema } from '@/lib/validations'

export const GET = createAPIHandler(
  async ({ userId, query }) => {
    // Complex business logic
    return { posts: [], pagination: {} }
  },
  {
    requireAuth: true,
    querySchema: contentFilterSchema.merge(paginationSchema),
    sanitizeInput: true,
    enableLogging: true,
  }
)
```

## 🔒 Security Features

### Authentication
All endpoints can require authentication by setting `requireAuth: true`. The user ID is automatically extracted and passed to your handler.

### Input Validation
Zod schemas validate all input data. Invalid requests return structured error responses with field-level details.

### Input Sanitization
Automatic XSS protection removes dangerous scripts and HTML from string inputs.

### Security Headers
All responses include security headers to prevent common attacks.

### CORS
Proper CORS handling for web clients with configurable origins.

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Invalid request data",
  "code": "VALIDATION_ERROR"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🛠️ Development Features

### Logging
Enable detailed logging in development:
```typescript
{
  enableLogging: process.env.NODE_ENV === 'development'
}
```

### Mock Handlers
Create mock endpoints for testing:
```typescript
import { createMockHandler } from '@/lib/api-wrapper'

export const GET = createMockHandler(
  { message: "Mock data" },
  500 // Optional delay in ms
)
```

## 🔄 Error Handling Flow

1. **Security Middleware** - CORS, headers, size limits
2. **Authentication** - User verification if required
3. **Input Validation** - Zod schema validation
4. **Input Sanitization** - XSS protection
5. **Business Logic** - Your handler function
6. **Response Formatting** - Consistent response structure
7. **Error Catching** - Automatic error handling and logging

## 📝 Next Steps

With this foundation in place, you can now:

1. **Create Content API** - Build post management endpoints
2. **Add Analytics API** - Implement metrics tracking
3. **Build Business API** - Add event and lead management
4. **Add File Upload** - Implement media handling
5. **Create Webhooks** - Add external integrations

## 🎉 Benefits

- **Consistent** - All endpoints follow the same patterns
- **Secure** - Built-in security and validation
- **Type-Safe** - Full TypeScript support
- **Maintainable** - Easy to add new endpoints
- **Testable** - Clear separation of concerns
- **Documented** - Self-documenting with TypeScript

This foundation ensures all future API development will be fast, secure, and consistent! 🚀 