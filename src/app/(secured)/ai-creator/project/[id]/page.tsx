"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useProject, useSessions, useCreateSession } from "@/hooks/use-ai-creator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Plus, Bot, MessageSquare, Calendar, FileText } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Link from "next/link"

// Simple form schema for now - we'll transform to API format
const createSessionSchema = z.object({
  postIdea: z.string().min(10, "Post idea must be at least 10 characters").max(500, "Post idea must be less than 500 characters"),
  additionalContext: z.string().optional(),
})

type CreateSessionForm = z.infer<typeof createSessionSchema>

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  console.log("projectId ===>", projectId)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)
  
  // Fetch project and sessions
  const { 
    data: projectData, 
    isLoading: projectLoading, 
    error: projectError 
  } = useProject(projectId)
  
  const { 
    data: sessionsData, 
    isLoading: sessionsLoading 
  } = useSessions(projectId)
  
  // Create session mutation
  const createSessionMutation = useCreateSession()

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema)
  })

  const project = projectData  // API client already extracts data
  const sessions = sessionsData?.sessions || []

  // Debug logging
  console.log("projectData structure:", projectData)
  console.log("sessionsData structure:", sessionsData)
  console.log("project:", project)

  const onSubmit = async (data: CreateSessionForm) => {
    try {
      // Transform frontend form data to API format
      const apiData = {
        postIdea: data.postIdea,
        additionalContext: data.additionalContext,
        targetContentType: "text-post" as const,
        selectedModel: "gemini-2.0-flash-exp",
        needsAsset: false,
      }
      await createSessionMutation.mutateAsync({
        projectId: projectId,
        data: apiData
      })
      toast.success("Post session created successfully!")
      setCreateSessionOpen(false)
      reset()
    } catch (error) {
      toast.error("Failed to create session. Please try again.")
    }
  }

  // Loading state
  if (projectLoading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (projectError || !project) {
    return (
      <div className="text-center py-12">
        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Project not found</h3>
        <p className="text-muted-foreground mb-4">
          The requested AI Creator project could not be found.
        </p>
        <Link href="/ai-creator">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ai-creator">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        
        <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Post Session</DialogTitle>
              <DialogDescription>
                Start a new AI-powered content creation session for this project.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postIdea">Post Idea</Label>
                <Textarea
                  id="postIdea"
                  placeholder="Describe your LinkedIn post idea or topic..."
                  {...register("postIdea")}
                />
                {errors.postIdea && (
                  <p className="text-sm text-destructive">{errors.postIdea.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
                <Textarea
                  id="additionalContext"
                  placeholder="Add any specific context, target audience, or key points..."
                  {...register("additionalContext")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateSessionOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || createSessionMutation.isPending}
                >
                  {isSubmitting || createSessionMutation.isPending ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            Content Type
          </div>
          <p className="font-medium capitalize">{project.contentType}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MessageSquare className="h-4 w-4" />
            Tone
          </div>
          <p className="font-medium capitalize">{project.tone}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Bot className="h-4 w-4" />
            Sessions
          </div>
          <p className="font-medium">{sessions.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            Created
          </div>
          <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Sessions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Post Sessions</h2>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Create your first post session to start generating AI-powered LinkedIn content.
            </p>
            <Button onClick={() => setCreateSessionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session: any) => (
              <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium line-clamp-2">{session.postIdea}</h3>
                    {session.context && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {session.context}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="capitalize">{session.status}</span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link href={`/ai-creator/session/${session.id}`}>
                    <Button className="w-full" variant="outline">
                      Open Session
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 