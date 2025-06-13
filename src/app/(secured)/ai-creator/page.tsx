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
import { Plus, Bot } from "lucide-react"
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Creator</h1>
          <p className="text-muted-foreground">
            Create LinkedIn content with AI-powered ideation and generation
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New AI Project</DialogTitle>
              <DialogDescription>
                Set up a new project for AI-powered LinkedIn content creation.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., LinkedIn Thought Leadership"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and goals of this project..."
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Default Tone</Label>
                  <Select
                    value={watch("tone")}
                    onValueChange={(value) => setValue("tone", value as typeof CONTENT_TONES[number])}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select
                    value={watch("contentType")}
                    onValueChange={(value) => setValue("contentType", value as typeof FRONTEND_CONTENT_TYPES[number])}
                  >
                    <SelectTrigger>
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
                <Label htmlFor="guidelines">Brand Guidelines</Label>
                <Textarea
                  id="guidelines"
                  placeholder="Describe your brand voice, style preferences, key messages..."
                  {...register("guidelines")}
                  rows={3}
                />
                {errors.guidelines && (
                  <p className="text-sm text-destructive">{errors.guidelines.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        // Empty state
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first AI project to start generating LinkedIn content.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: { id: string; name: string; description?: string; tone: string; totalSessions: number; totalPosts: number; createdAt: string }) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <CardDescription>
                  {project.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tone:</span>
                    <span className="capitalize">{project.tone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sessions:</span>
                    <span>{project.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Posts:</span>
                    <span>{project.totalPosts}</span>
                  </div>
                  <Link href={`/ai-creator/project/${project.id}`}>
                    <Button className="w-full">
                      Open Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 