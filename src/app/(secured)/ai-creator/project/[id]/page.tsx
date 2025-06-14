"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useProject, useSessions, useCreateSession } from "@/hooks/use-ai-creator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Bot, MessageSquare, Calendar, Sparkles, Target, ArrowRight, FileText, Info, Settings } from "lucide-react"
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
    formState: { errors }
  } = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema)
  })

  const project = projectData  // API client already extracts data
  const sessions = sessionsData || []

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
    } catch {
      toast.error("Failed to create session. Please try again.")
    }
  }

  // Simple loading state
  if (projectLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
          <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>

        {/* Content skeleton */}
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="px-6 pt-6 pb-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 lg:py-32">
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/20 flex items-center justify-center">
                <Bot className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Project not found</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The requested AI Creator project could not be found or may have been deleted.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header with Actions */}
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">Content Sessions</h1>
              {sessions.length > 0 && (
                <Badge variant="secondary" className="px-2.5 py-1">
                  {sessions.length} sessions
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Project Details Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="default">
                    <Info className="h-4 w-4" />
                    Project Details
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
                  <SheetHeader className="p-6 pb-4 border-b">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shrink-0">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2 min-w-0 flex-1">
                        <SheetTitle className="text-xl font-semibold leading-tight">
                          {project.name}
                        </SheetTitle>
                        <SheetDescription className="text-base leading-relaxed">
                          {project.description || "No description provided"}
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <div className="p-6 space-y-8">
                    {/* Project Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <h3 className="font-semibold text-foreground">Overview</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-muted/20 p-4 transition-all hover:shadow-lg hover:scale-105">
                          <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 transform translate-x-4 -translate-y-4"></div>
                          <div className="relative">
                            <div className="text-2xl font-bold text-foreground mb-1">{project.totalSessions}</div>
                            <div className="text-sm font-medium text-muted-foreground">Sessions</div>
                          </div>
                        </div>
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-muted/20 p-4 transition-all hover:shadow-lg hover:scale-105">
                          <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 transform translate-x-4 -translate-y-4"></div>
                          <div className="relative">
                            <div className="text-2xl font-bold text-foreground mb-1">{project.totalPosts}</div>
                            <div className="text-sm font-medium text-muted-foreground">Posts</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Project Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <h3 className="font-semibold text-foreground">Settings</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">Content Tone</span>
                          </div>
                          <Badge variant="secondary" className="capitalize font-semibold">
                            {project.tone}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">Created</span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {new Date(project.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Guidelines */}
                    {project.guidelines && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            <h3 className="font-semibold text-foreground">Brand Guidelines</h3>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-muted/20 rounded-xl"></div>
                            <div className="relative p-4 rounded-xl border border-primary/10 bg-background/80 backdrop-blur-sm">
                              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {project.guidelines}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Create Session Dialog */}
              <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
                <DialogTrigger asChild>
                  <Button size="default" className="shadow-sm">
                    <Plus className="h-4 w-4" />
                    New Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Create New Post Session
                    </DialogTitle>
                    <DialogDescription>
                      Start a new AI-powered content creation session for this project.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="postIdea" className="text-sm font-medium">Post Idea</Label>
                      <Textarea
                        id="postIdea"
                        placeholder="Describe your LinkedIn post idea or topic..."
                        className="min-h-[100px] resize-none"
                        {...register("postIdea")}
                      />
                      {errors.postIdea && (
                        <p className="text-sm text-destructive">{errors.postIdea.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalContext" className="text-sm font-medium">Additional Context <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                      <Textarea
                        id="additionalContext"
                        placeholder="Add any specific context, target audience, or key points..."
                        className="min-h-[80px] resize-none"
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
                        disabled={createSessionMutation.isPending}
                        className="min-w-[120px]"
                      >
                        {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

      {/* Main Content - Focused on Sessions */}
      <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {sessions.length === 0 ? (
          // Clean empty state
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-8">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Plus className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
              
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-3">Create Your First Session</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Start generating AI-powered LinkedIn content. Each session helps you create engaging posts tailored to your brand voice.
                </p>
                
                <Button 
                  onClick={() => setCreateSessionOpen(true)}
                  size="lg"
                  className="shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Create First Session
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Sessions grid - main focus
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {sessions.map((session: { id: string; postIdea: string; status: string; currentStep: string; totalVersions: number; createdAt: string }) => (
              <Card key={session.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
                <CardHeader className="px-6 pt-6 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-tight line-clamp-2 flex-1">
                        {session.postIdea}
                      </CardTitle>
                      <Badge 
                        variant={session.status === 'completed' ? 'default' : 'secondary'} 
                        className="capitalize shrink-0"
                      >
                        {session.status}
                      </Badge>
                    </div>
                    
                    {session.totalVersions > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{session.totalVersions} versions generated</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(session.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: new Date(session.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                      })}</span>
                    </div>
                    
                    <Link href={`/ai-creator/session/${session.id}`}>
                      <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Open
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 