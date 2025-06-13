"use client"

import { useEffect } from "react"
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
  X,
  Plus,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { useContentEditor } from "@/hooks/use-content-editor"
import { Controller } from "react-hook-form"

interface ContentEditorProps {
  postId?: string
  initialData?: any
}

export function ContentEditor({ postId, initialData }: ContentEditorProps) {
  const {
    form,
    onSubmit,
    saveAsDraft,
    isLoading,
    isSubmitting,
    pillars,
    addHashtag,
    removeHashtag,
    addMention,
    removeMention,
    autoSave,
    errors,
    isDirty,
  } = useContentEditor({ postId, initialData })

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty) return

    const autoSaveTimer = setTimeout(() => {
      autoSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [isDirty, autoSave])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  const watchedContent = form.watch('content')
  const watchedHashtags = form.watch('hashtags')
  const watchedMentions = form.watch('mentions')
  const watchedStatus = form.watch('status')
  const watchedScheduledAt = form.watch('scheduledAt')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Post Title (Optional)</Label>
            <Controller
              name="title"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="title"
                  placeholder="Enter a title for internal organization..."
                  className="text-lg"
                />
              )}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">LinkedIn Post Content</Label>
            <Controller
              name="content"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="content"
                  placeholder="What insights would you like to share on LinkedIn?"
                  className="min-h-[300px] resize-none text-base"
                  maxLength={3000}
                />
              )}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
            <div className="text-sm text-muted-foreground text-right">
              {watchedContent?.length || 0}/3000 characters
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
                    {watchedContent || "Your LinkedIn post content will appear here..."}
                  </div>
                  {watchedHashtags && watchedHashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {watchedHashtags.map((tag) => (
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
            <Controller
              name="pillarId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pillar" />
                  </SelectTrigger>
                  <SelectContent>
                                         {pillars.map((pillar: any) => (
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
              )}
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="space-y-2">
              <HashtagInput onAdd={addHashtag} />
              <div className="flex flex-wrap gap-1">
                {watchedHashtags?.map((tag) => (
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
                {watchedMentions?.map((mention) => (
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
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    <SelectItem value="published">Publish Now</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Scheduling Fields */}
          {watchedStatus === 'scheduled' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Controller
                  name="scheduledAt"
                  control={form.control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Scheduled Time</Label>
                <Controller
                  name="scheduledTime"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="scheduled-time"
                      type="time"
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={saveAsDraft}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            {watchedStatus === 'scheduled' ? (
              <Button 
                className="w-full" 
                disabled={isSubmitting || !watchedScheduledAt}
                type="submit"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            ) : watchedStatus === 'published' ? (
              <Button 
                className="w-full" 
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-2" />
                Publish Now
              </Button>
            ) : null}
          </div>
        </div>
      </form>
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