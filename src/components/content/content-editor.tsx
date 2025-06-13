"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Save, 
  Send, 
  Calendar as CalendarIcon, 
  Hash, 
  AtSign, 
  Image, 
  FileText,
  X,
  Plus,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { ContentPost } from "@/types/content"

interface ContentPillar {
  id: number
  name: string
  color: string
}

// Mock pillars data - TODO: Replace with actual API call
const mockPillars: ContentPillar[] = [
  { id: 1, name: 'Thought Leadership', color: '#3B82F6' },
  { id: 2, name: 'Company Culture', color: '#10B981' },
  { id: 3, name: 'Educational Content', color: '#F59E0B' },
  { id: 4, name: 'Personal Stories', color: '#8B5CF6' },
]

interface ContentEditorProps {
  postId?: string
  initialData?: Partial<ContentPost>
}

export function ContentEditor({ postId, initialData }: ContentEditorProps) {
  const router = useRouter()
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>(
    (initialData?.status as 'draft' | 'scheduled' | 'published') || 'draft'
  )
  const [pillarId, setPillarId] = useState<number | undefined>(initialData?.pillarId)
  const [hashtags, setHashtags] = useState<string[]>(initialData?.hashtags || [])
  const [mentions, setMentions] = useState<string[]>(initialData?.mentions || [])
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialData?.mediaUrls || [])
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt) : undefined
  )
  const [scheduledTime, setScheduledTime] = useState(
    initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save draft functionality
  useEffect(() => {
    if (!content && !title) return

    const autoSaveTimer = setTimeout(() => {
      console.log("Auto-saving draft...")
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [content, title])

  // Handle hashtag management
  const addHashtag = (hashtag: string) => {
    if (!hashtag.trim()) return
    
    const formattedTag = hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`
    
    if (!hashtags.includes(formattedTag)) {
      setHashtags([...hashtags, formattedTag])
    }
  }

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove))
  }

  // Handle mention management
  const addMention = (mention: string) => {
    if (!mention.trim()) return
    
    const formattedMention = mention.trim().startsWith('@') ? mention.trim() : `@${mention.trim()}`
    
    if (!mentions.includes(formattedMention)) {
      setMentions([...mentions, formattedMention])
    }
  }

  const removeMention = (mentionToRemove: string) => {
    setMentions(mentions.filter(mention => mention !== mentionToRemove))
  }

  // Form validation
  const validateForm = () => {
    if (!content.trim()) {
      alert("Content is required")
      return false
    }

    if (status === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        alert("Scheduled date and time are required when scheduling a post")
        return false
      }
    }

    return true
  }

  // Form submission handlers
  const handleSubmit = async (submitStatus: 'draft' | 'scheduled' | 'published') => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Combine date and time for scheduling
      const scheduledDateTime = scheduledDate && scheduledTime && submitStatus === 'scheduled'
        ? new Date(`${format(scheduledDate, 'yyyy-MM-dd')}T${scheduledTime}:00`)
        : undefined

      const payload = {
        title: title || undefined,
        content: content,
        status: submitStatus,
        pillarId: pillarId,
        hashtags: hashtags,
        mentions: mentions,
        mediaUrls: mediaUrls,
        scheduledAt: scheduledDateTime?.toISOString(),
      }
      
      // API call based on action
      console.log(`${submitStatus === 'draft' ? 'Saving draft' : submitStatus === 'scheduled' ? 'Scheduling post' : 'Publishing post'}:`, payload)
      
      // Show success toast
      router.push('/dashboard/content')
    } catch (error) {
      console.error(`Error ${submitStatus === 'draft' ? 'saving draft' : submitStatus === 'scheduled' ? 'scheduling post' : 'publishing post'}:`, error)
      // Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Post Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for internal organization..."
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">LinkedIn Post Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What insights would you like to share on LinkedIn?"
              className="min-h-[300px] resize-none text-base"
              maxLength={3000}
            />
            <div className="text-sm text-muted-foreground text-right">
              {content.length}/3000 characters
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Media & Assets</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
              <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop images, videos, or documents
              </p>
              <Button variant="outline" size="sm" type="button">
                <Plus className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>LinkedIn Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">You</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-medium">Your Name</div>
                  <div className="text-sm whitespace-pre-wrap">
                    {content || "Your LinkedIn post content will appear here..."}
                  </div>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hashtags.map((tag) => (
                        <span key={tag} className="text-blue-600 text-sm">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Content Pillar */}
          <div className="space-y-2">
            <Label>Content Pillar</Label>
            <Select value={pillarId?.toString()} onValueChange={(value) => setPillarId(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pillar" />
              </SelectTrigger>
              <SelectContent>
                {mockPillars.map((pillar) => (
                  <SelectItem key={pillar.id} value={pillar.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: pillar.color }}
                      />
                      {pillar.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="space-y-2">
              <HashtagInput onAdd={addHashtag} />
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeHashtag(tag)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Mentions */}
          <div className="space-y-2">
            <Label>Mentions</Label>
            <div className="space-y-2">
              <MentionInput onAdd={addMention} />
              <div className="flex flex-wrap gap-1">
                {mentions.map((mention) => (
                  <Badge key={mention} variant="secondary" className="text-xs">
                    {mention}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeMention(mention)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="space-y-2">
            <Label>Publishing Options</Label>
            <Select value={status} onValueChange={(value: 'draft' | 'scheduled' | 'published') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as Draft</SelectItem>
                <SelectItem value="scheduled">Schedule for Later</SelectItem>
                <SelectItem value="published">Publish Now</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scheduling Fields */}
          {status === 'scheduled' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Scheduled Time</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            {status === 'scheduled' ? (
              <Button 
                className="w-full" 
                onClick={() => handleSubmit('scheduled')}
                disabled={isSubmitting || !scheduledDate}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            ) : status === 'published' ? (
              <Button 
                className="w-full" 
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Publish Now
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper components for hashtag and mention input
function HashtagInput({ onAdd }: { onAdd: (hashtag: string) => void }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAdd(e.currentTarget.value)
      e.currentTarget.value = ''
    }
  }

  const handleAddClick = (e: React.MouseEvent) => {
    const input = e.currentTarget.previousElementSibling as HTMLInputElement
    if (input) {
      onAdd(input.value)
      input.value = ''
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add hashtag..."
        onKeyDown={handleKeyDown}
      />
      <Button size="sm" onClick={handleAddClick} type="button">
        <Hash className="h-4 w-4" />
      </Button>
    </div>
  )
}

function MentionInput({ onAdd }: { onAdd: (mention: string) => void }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAdd(e.currentTarget.value)
      e.currentTarget.value = ''
    }
  }

  const handleAddClick = (e: React.MouseEvent) => {
    const input = e.currentTarget.previousElementSibling as HTMLInputElement
    if (input) {
      onAdd(input.value)
      input.value = ''
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add mention..."
        onKeyDown={handleKeyDown}
      />
      <Button size="sm" onClick={handleAddClick} type="button">
        <AtSign className="h-4 w-4" />
      </Button>
    </div>
  )
} 