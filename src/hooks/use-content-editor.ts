import React from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useCreatePost, useUpdatePost, usePost, usePillars } from '@/hooks/use-api'

export interface ContentEditorFormData {
  title?: string
  content: string
  status: 'draft' | 'scheduled' | 'published'
  pillarId?: number
  hashtags: string[]
  mentions: string[]
  mediaUrls: string[]
  scheduledAt?: string
  scheduledTime?: string
}

interface UseContentEditorProps {
  postId?: string
  initialData?: Partial<ContentEditorFormData>
}

export function useContentEditor({ postId, initialData }: UseContentEditorProps = {}) {
  const router = useRouter()
  const { toast } = useToast()
  
  // React Query hooks
  const createPostMutation = useCreatePost()
  const updatePostMutation = useUpdatePost()
  const { data: existingPost, isLoading: isLoadingPost } = usePost(postId!)
  const { data: pillarsData, isLoading: isLoadingPillars } = usePillars()

  // Initialize form
  const form = useForm<ContentEditorFormData>({
    defaultValues: {
      title: '',
      content: '',
      status: 'draft',
      pillarId: undefined,
      hashtags: [],
      mentions: [],
      mediaUrls: [],
      scheduledAt: '',
      scheduledTime: '',
      ...initialData,
    },
  })

  // Update form when existing post data loads
  React.useEffect(() => {
    if (existingPost && postId) {
      form.reset({
        title: existingPost.title || '',
        content: existingPost.content || '',
        status: existingPost.status,
        pillarId: existingPost.pillarId || undefined,
        hashtags: existingPost.hashtags || [],
        mentions: existingPost.mentions || [],
        mediaUrls: existingPost.mediaUrls || [],
        scheduledAt: existingPost.scheduledAt ? format(new Date(existingPost.scheduledAt), 'yyyy-MM-dd') : '',
        scheduledTime: existingPost.scheduledAt ? format(new Date(existingPost.scheduledAt), 'HH:mm') : '',
      })
    }
  }, [existingPost, postId, form])

  // Save as draft function
  const saveAsDraft = async () => {
    try {
      const data = form.getValues()
      
      // Create payload that matches validation schema for draft
      const payload: any = {
        content: data.content,
        status: 'draft' as const,
      }

      // Only include title if it has content (schema requires min(1) if provided)
      if (data.title && data.title.trim()) {
        payload.title = data.title.trim()
      }

      // Only include pillarId if it's set
      if (data.pillarId) {
        payload.pillarId = data.pillarId
      }

      // Only include arrays if they have content
      if (data.hashtags && data.hashtags.length > 0) {
        payload.hashtags = data.hashtags
      }

      if (data.mentions && data.mentions.length > 0) {
        payload.mentions = data.mentions
      }

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



      if (postId) {
        // Update existing post
        await updatePostMutation.mutateAsync({
          id: postId,
          data: payload,
        })
      } else {
        // Create new post
        await createPostMutation.mutateAsync(payload)
      }
      
      toast({
        title: 'Draft Saved',
        description: 'Post has been saved as draft',
      })

      // Navigate back to content list
      router.push('/content')
    } catch (error) {
      console.error('Error saving draft:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save draft',
        variant: 'destructive',
      })
    }
  }

  // Form submission handler
  const onSubmit = async (data: ContentEditorFormData) => {
    try {
      // Combine date and time for scheduling
      const scheduledDateTime = data.scheduledAt && data.scheduledTime && data.status === 'scheduled'
        ? new Date(`${data.scheduledAt}T${data.scheduledTime}:00`)
        : undefined

      // Validate scheduled date is in the future
      if (scheduledDateTime && scheduledDateTime <= new Date()) {
        toast({
          title: 'Invalid Date',
          description: 'Scheduled date must be in the future',
          variant: 'destructive',
        })
        return
      }

      // Create payload that matches validation schema
      const payload: any = {
        content: data.content,
        status: data.status,
      }

      // Only include title if it has content (schema requires min(1) if provided)
      if (data.title && data.title.trim()) {
        payload.title = data.title.trim()
      }

      // Only include pillarId if it's set
      if (data.pillarId) {
        payload.pillarId = data.pillarId
      }

      // Only include arrays if they have content
      if (data.hashtags && data.hashtags.length > 0) {
        payload.hashtags = data.hashtags
      }

      if (data.mentions && data.mentions.length > 0) {
        payload.mentions = data.mentions
      }

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

      // Only include scheduledAt if it's set and status is scheduled
      if (scheduledDateTime && data.status === 'scheduled') {
        payload.scheduledAt = scheduledDateTime.toISOString()
      }



      if (postId) {
        // Update existing post
        await updatePostMutation.mutateAsync({
          id: postId,
          data: payload,
        })
        
        toast({
          title: 'Post Updated',
          description: `Post has been ${data.status === 'published' ? 'published' : data.status === 'scheduled' ? 'scheduled' : 'saved as draft'}`,
        })
      } else {
        // Create new post
        await createPostMutation.mutateAsync(payload)
        
        toast({
          title: 'Post Created',
          description: `Post has been ${data.status === 'published' ? 'published' : data.status === 'scheduled' ? 'scheduled' : 'saved as draft'}`,
        })
      }

      // Navigate back to content list
      router.push('/content')
    } catch (error) {
      console.error('Error submitting post:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save post',
        variant: 'destructive',
      })
    }
  }

  // Helper functions for form management
  const addHashtag = (hashtag: string) => {
    if (!hashtag.trim()) return
    
    const formattedTag = hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`
    const currentHashtags = form.getValues('hashtags')
    
    if (!currentHashtags.includes(formattedTag)) {
      form.setValue('hashtags', [...currentHashtags, formattedTag])
    }
  }

  const removeHashtag = (tagToRemove: string) => {
    const currentHashtags = form.getValues('hashtags')
    form.setValue('hashtags', currentHashtags.filter(tag => tag !== tagToRemove))
  }

  const addMention = (mention: string) => {
    if (!mention.trim()) return
    
    const formattedMention = mention.trim().startsWith('@') ? mention.trim() : `@${mention.trim()}`
    const currentMentions = form.getValues('mentions')
    
    if (!currentMentions.includes(formattedMention)) {
      form.setValue('mentions', [...currentMentions, formattedMention])
    }
  }

  const removeMention = (mentionToRemove: string) => {
    const currentMentions = form.getValues('mentions')
    form.setValue('mentions', currentMentions.filter(mention => mention !== mentionToRemove))
  }

  // Auto-save functionality
  const autoSave = async () => {
    if (!form.getValues('content') && !form.getValues('title')) return
    
    try {
      const data = form.getValues()
      
      // Create payload that matches validation schema for auto-save
      const payload: any = {
        content: data.content,
        status: 'draft' as const,
      }

      // Only include title if it has content (schema requires min(1) if provided)
      if (data.title && data.title.trim()) {
        payload.title = data.title.trim()
      }

      // Only include pillarId if it's set
      if (data.pillarId) {
        payload.pillarId = data.pillarId
      }

      // Only include arrays if they have content
      if (data.hashtags && data.hashtags.length > 0) {
        payload.hashtags = data.hashtags
      }

      if (data.mentions && data.mentions.length > 0) {
        payload.mentions = data.mentions
      }

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

      if (postId) {
        await updatePostMutation.mutateAsync({
          id: postId,
          data: payload,
        })
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  return {
    // Form state and methods
    form,
    onSubmit: form.handleSubmit(onSubmit),
    saveAsDraft,
    
    // Loading states
    isLoading: isLoadingPost || isLoadingPillars,
    isSubmitting: createPostMutation.isPending || updatePostMutation.isPending,
    
    // Data
    pillars: pillarsData?.pillars || [],
    existingPost,
    
    // Helper functions
    addHashtag,
    removeHashtag,
    addMention,
    removeMention,
    autoSave,
    
    // Form validation
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  }
} 