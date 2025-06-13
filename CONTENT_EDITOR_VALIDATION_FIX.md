# Content Editor Validation Fix Documentation

## Issue Description

The Content Editor was failing with validation errors when submitting posts to the API:

```
API Error: Error [ValidationError]: Invalid request data
{
  statusCode: 400,
  code: 'VALIDATION_ERROR',
  errors: [Array]
}
```

## Root Cause Analysis

### Primary Issue: Empty Title Validation
The Zod validation schema defined:
```typescript
title: z.string().min(1).max(500).optional()
```

This means:
- ✅ Field can be omitted entirely (optional)
- ✅ If provided, must have at least 1 character  
- ❌ Cannot send empty string `""`

### Original Implementation Problem
The form was sending:
```javascript
const payload = {
  title: data.title || '', // Sends "" when empty - INVALID!
  content: data.content,
  // ...
}
```

### Secondary Issues
1. **Save Draft Button**: Used form submission without proper status setting
2. **URL Validation**: Schema expects valid URLs for `mediaUrls` array
3. **Optional Field Handling**: Sending `undefined` values unnecessarily

## Solution Implementation

### 1. Conditional Payload Construction
```javascript
// Only include title if it has content (schema requires min(1) if provided)
if (data.title && data.title.trim()) {
  payload.title = data.title.trim()
}

// Only include pillarId if it's set
if (data.pillarId) {
  payload.pillarId = data.pillarId
}
```

### 2. Enhanced Array Validation
```javascript
if (data.mediaUrls && data.mediaUrls.length > 0) {
  // Ensure all media URLs are valid URLs (schema requires z.string().url())
  const validUrls = data.mediaUrls.filter(url => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  })
  if (validUrls.length > 0) {
    payload.mediaUrls = validUrls
  }
}
```

### 3. Dedicated Draft Saving
Created separate `saveAsDraft()` function:
```javascript
const saveAsDraft = async () => {
  const data = form.getValues()
  const payload = {
    content: data.content,
    status: 'draft' as const,
    // ... conditional fields
  }
  // Save logic
}
```

### 4. Fixed Component Integration
```javascript
// Before: Problematic form submission
<Button onClick={() => form.setValue('status', 'draft')} type="submit">

// After: Direct function call
<Button onClick={saveAsDraft} type="button">
```

## Testing Results

Created validation test script that confirmed:
- ✅ Basic post with just content: **Valid**
- ❌ Post with empty title string: **Invalid** (String must contain at least 1 character)
- ✅ Post with valid title: **Valid**
- ✅ Post with empty arrays: **Valid**
- ✅ Post with valid arrays: **Valid**

## Files Modified

1. **src/hooks/use-content-editor.ts**
   - Added conditional payload construction for both submission and auto-save
   - Created dedicated `saveAsDraft()` function
   - Enhanced URL validation for media URLs

2. **src/components/content/content-editor.tsx**
   - Updated to use `saveAsDraft` function
   - Fixed button type and onClick handler

## Key Learning Points

### Zod Validation Patterns
- `z.string().min(1).optional()` is stricter than it appears
- Empty string `""` ≠ omitted field for optional validation
- Always test edge cases with validation schemas

### Form Handling Best Practices
- Separate concerns: form submission vs. draft saving
- Use conditional object construction for API payloads
- Validate data before sending to prevent API errors

### React Hook Form Integration
- Use `getValues()` for accessing current form state
- Handle button actions with dedicated functions
- Avoid mixing `setValue()` with immediate form submission

## Benefits Achieved

1. **Error-Free Submissions**: All validation errors resolved
2. **Better UX**: Proper draft saving and form submission
3. **Data Integrity**: Only valid data sent to API
4. **Maintainable Code**: Clear separation of concerns
5. **Type Safety**: Maintained throughout the fixes

## Next Steps Suggestions

1. **Enhanced Validation**: Add client-side validation for better UX
2. **Error Handling**: Improve error messages for validation failures
3. **Testing**: Add unit tests for payload construction logic
4. **Type Safety**: Replace `any` types with proper interfaces
5. **Performance**: Consider debouncing for auto-save functionality

## Validation Schema Reference

```typescript
export const contentPostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1),
  status: z.enum(['draft', 'scheduled', 'published', 'failed', 'archived']).default('draft'),
  scheduledAt: z.string().datetime().optional(),
  pillarId: z.number().optional(),
  hashtags: z.array(z.string()).max(30).optional(),
  mentions: z.array(z.string()).max(10).optional(),
  mediaUrls: z.array(z.string().url()).max(10).optional(),
})
``` 