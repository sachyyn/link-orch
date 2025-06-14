"use client"

import { useState } from "react"
import { useProjects, useCreateProject } from "@/hooks/use-ai-creator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, Sparkles, Target, Calendar, MoreVertical, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { createProjectFormSchema, transformFormToApi, type CreateProjectFormInput, CONTENT_TONES, FRONTEND_CONTENT_TYPES } from "@/lib/schemas"

type CreateProjectForm = CreateProjectFormInput

export default function AICreatorPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  // Fetch projects using React Query
  const { 
    data: projectsData, 
    isLoading
  } = useProjects()
  
  // Create project mutation
  const createProjectMutation = useCreateProject()

  // Form handling
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      tone: "professional",
      contentType: "post",
      guidelines: ""
    }
  })

  const projects = projectsData?.projects || projectsData || []  // Handle both possible structures

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      // Transform frontend form data to API format
      const apiData = transformFormToApi(data)
      await createProjectMutation.mutateAsync(apiData)
      toast.success("Project created successfully!")
      setCreateDialogOpen(false)
      reset()
    } catch {
      toast.error("Failed to create project. Please try again.")
    }
  }

  // Loading state with improved skeleton design
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between py-6 px-6 lg:px-8">
              <div className="flex items-center gap-6">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="group">
                <CardHeader className="pb-4 px-6 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-6 pb-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="text-center">
                        <Skeleton className="h-6 w-8 mx-auto mb-1" />
                        <Skeleton className="h-3 w-12 mx-auto" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Redesigned Header - Clean action bar without title/description */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between py-6 px-6 lg:px-8">
            {/* Left side - Visual indicator and stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              
              {projects.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    <span className="font-medium text-foreground">{projects.length}</span>
                    <span>projects</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium text-foreground">
                      {projects.reduce((acc: number, p: any) => acc + p.totalPosts, 0)}
                    </span>
                    <span>posts generated</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side - Primary action */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create New AI Project
                </DialogTitle>
                <DialogDescription>
                  Set up a new project for AI-powered LinkedIn content creation.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto pr-1">
                <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., LinkedIn Thought Leadership"
                    className="h-10"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose and goals of this project..."
                    className="min-h-[80px] resize-none"
                    {...register("description")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-sm font-medium">Default Tone</Label>
                    <Select
                      value={watch("tone")}
                      onValueChange={(value) => setValue("tone", value as typeof CONTENT_TONES[number])}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="thought-leader">Thought Leader</SelectItem>
                        <SelectItem value="provocative">Provocative</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentType" className="text-sm font-medium">Content Type</Label>
                    <Select
                      value={watch("contentType")}
                      onValueChange={(value) => setValue("contentType", value as typeof FRONTEND_CONTENT_TYPES[number])}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="poll">Poll</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guidelines" className="text-sm font-medium">Brand Guidelines</Label>
                  <Textarea
                    id="guidelines"
                    placeholder="Describe your brand voice, style preferences, key messages..."
                    className="min-h-[80px] resize-none"
                    {...register("guidelines")}
                    rows={3}
                  />
                  {errors.guidelines && (
                    <p className="text-sm text-destructive">{errors.guidelines.message}</p>
                  )}
                </div>
                </form>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50 flex-shrink-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="create-project-form"
                  disabled={createProjectMutation.isPending}
                  className="min-w-[120px]"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          // Enhanced empty state
          <div className="flex flex-col items-center justify-center py-16 lg:py-24">
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Bot className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            
            <div className="text-center max-w-md mx-auto px-4">
              <h3 className="text-xl font-semibold mb-4">Start Creating with AI</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Create your first AI project to unlock powerful LinkedIn content generation tools. Get personalized posts that match your brand voice.
              </p>
              
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                size="lg"
                className="shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          </div>
        ) : (
          // Enhanced projects grid
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {projects.map((project: { id: string; name: string; description?: string; tone: string; totalSessions: number; totalPosts: number; createdAt: string }) => (
              <Card key={project.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
                <CardHeader className="pb-4 px-6 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight truncate">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 leading-relaxed">
                        {project.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {project.tone}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-6 pb-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">{project.totalSessions}</div>
                      <div className="text-xs text-muted-foreground font-medium">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">{project.totalPosts}</div>
                      <div className="text-xs text-muted-foreground font-medium">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground mb-1">•••</div>
                      <div className="text-xs text-muted-foreground font-medium">Active</div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Link href={`/ai-creator/project/${project.id}`} className="block">
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Open Project
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 