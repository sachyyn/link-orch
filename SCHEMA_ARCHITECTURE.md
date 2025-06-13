# Schema Architecture - Single Source of Truth

## Overview

This project implements a **single source of truth** for all data validation schemas to prevent the schema duplication issues that were causing validation errors.

## Problem Solved

Previously, we had **multiple schema definitions** in different files:
- Frontend form schemas in UI components
- API validation schemas in route handlers  
- Database schemas in Drizzle definitions
- Inconsistent enum values and field requirements

This led to validation errors when frontend and backend schemas didn't match.

## Solution: Centralized Schema Library

### File Structure
```
src/lib/schemas/
├── index.ts           # Central exports
├── ai-creator.ts      # AI Creator domain schemas
└── [future-domains].ts
```

### Schema Types in `ai-creator.ts`

1. **Base Schema** (`createProjectSchema`)
   - Complete business logic validation
   - Used for internal transformations

2. **API Schema** (`createProjectApiSchema`) 
   - Matches exact API endpoint requirements
   - Handles JSON string formats
   - Used in route handlers

3. **Form Schema** (`createProjectFormSchema`)
   - Simplified UX for frontend forms
   - User-friendly field names
   - Used in React Hook Form

4. **Transform Functions**
   - `transformFormToApi()` - Convert form data to API format
   - `transformApiToForm()` - Convert API data back to form format

### Content Type Mapping

The system handles the difference between user-friendly frontend names and technical database enum values:

```typescript
Frontend → Database
'post' → 'text-post'
'article' → 'article'  
'poll' → 'poll'
'carousel' → 'carousel'
```

## Usage Examples

### In API Routes
```typescript
import { createProjectApiSchema } from '@/lib/schemas/ai-creator'

export const POST = createPostHandler({
  bodySchema: createProjectApiSchema,
  // ...
})
```

### In Frontend Forms
```typescript
import { createProjectFormSchema, transformFormToApi } from '@/lib/schemas/ai-creator'

const form = useForm({
  resolver: zodResolver(createProjectFormSchema)
})

const onSubmit = (data) => {
  const apiData = transformFormToApi(data)
  await createProject(apiData)
}
```

### In Type Definitions
```typescript
import type { CreateProjectFormInput, CreateProjectApiInput } from '@/lib/schemas/ai-creator'
```

## Benefits

1. **No Schema Drift** - Single definition prevents inconsistencies
2. **Type Safety** - Shared TypeScript types across frontend/backend
3. **Easy Maintenance** - Update schema in one place
4. **Clear Contracts** - Explicit transform functions show data flow
5. **Developer Experience** - Import from one location

## Rules for Schema Updates

1. **Always update shared schemas first** in `src/lib/schemas/`
2. **Never create duplicate schemas** in components or routes
3. **Use transform functions** when frontend and API formats differ
4. **Update both TypeScript types and Zod schemas** together
5. **Test schema changes** with both frontend and API

## Migration Checklist

When updating schemas:
- [ ] Update shared schema definition
- [ ] Update transform functions if needed
- [ ] Update frontend forms to use new schema
- [ ] Update API routes to use new schema  
- [ ] Test form submission end-to-end
- [ ] Update TypeScript types
- [ ] Update documentation

## Common Validation Errors Fixed

### 1. Schema Duplication
**Problem**: Multiple schema definitions across API routes and frontend components
**Solution**: Centralized schemas in `src/lib/schemas/` with single source of truth

### 2. Content Type Mapping  
**Problem**: Frontend uses `'post'`, database uses `'text-post'`
**Solution**: Transform functions handle mapping between user-friendly and technical names

### 3. Required vs Optional Fields
**Problem**: API schemas with defaults make TypeScript think fields are optional
**Solution**: Separate API schemas without defaults for strict validation

### 4. Enum Value Mismatches
**Problem**: Frontend enums don't match database enum values
**Solution**: Shared enum definitions that match database schema exactly

## Future Enhancements

1. **Schema Versioning** - Support multiple API versions
2. **Runtime Validation** - Add development-time schema validation
3. **Code Generation** - Generate forms from schemas automatically
4. **Schema Testing** - Automated tests for schema compliance 