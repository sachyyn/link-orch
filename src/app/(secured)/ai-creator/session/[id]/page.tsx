"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  useSession, 
  useProject, 
  useContentVersions,
  useAssets,
  useStreamingContentGeneration,
  useGenerateAssets,
  useSelectVersion
} from "@/hooks/use-ai-creator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Bot, 
  Sparkles, 
  Image, 
  FileText, 
  Copy, 
  Download,
  RefreshCw,
  Check,
  Wand2,
  Target,
  Zap,
  Info,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Globe
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Content generation form schema
const generateContentSchema = z.object({
  tone: z.enum(["professional", "casual", "thought-leader", "provocative", "educational", "inspirational", "conversational", "custom"]).optional(),
  contentType: z.enum(["post", "article", "poll", "carousel"]).optional(),
  guidelines: z.string().optional(),
  variations: z.number().min(1).max(6),
})

// Asset generation form schema
const generateAssetSchema = z.object({
  assetType: z.enum(["image", "carousel", "infographic", "banner", "thumbnail", "logo", "chart"]),
  prompt: z.string().min(10, "Asset description must be at least 10 characters"),
  style: z.string().optional(),
  dimensions: z.string().optional(),
})

type GenerateContentForm = z.infer<typeof generateContentSchema>
type GenerateAssetForm = z.infer<typeof generateAssetSchema>

// LinkedIn Mockup Component
const LinkedInMockup = ({ content }: { content: string }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-lg mx-auto">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
            U
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">Your Name</h3>
              <span className="text-gray-500 text-xs">• 1st</span>
            </div>
            <p className="text-gray-600 text-xs">Your Professional Title</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-gray-500 text-xs">2m</span>
              <span className="text-gray-400">•</span>
              <Globe className="w-3 h-3 text-gray-500" />
            </div>
          </div>
          
          {/* More Options */}
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
      
      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white fill-current" />
              </div>
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">👏</span>
              </div>
            </div>
            <span className="ml-1">24 reactions</span>
          </div>
          <div className="flex items-center gap-3">
            <span>8 comments</span>
            <span>3 reposts</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-around">
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm font-medium">
            <Heart className="w-4 h-4" />
            Like
          </button>
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm font-medium">
            <MessageCircle className="w-4 h-4" />
            Comment
          </button>
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm font-medium">
            <Repeat2 className="w-4 h-4" />
            Repost
          </button>
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-gray-600 text-sm font-medium">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

// Content Version Card Component
const ContentVersionCard = ({
  version,
  index,
  totalVersions,
  onSelect,
  onCopy,
  isSelecting,
}: {
  version: { id: string; versionNumber: number; isSelected?: boolean; content: string }
  index: number
  totalVersions: number
  onSelect: () => void
  onCopy: () => void
  isSelecting: boolean
}) => {
  const cols = 3
  const rows = Math.ceil(totalVersions / cols)
  const currentRow = Math.floor(index / cols)
  const currentCol = index % cols
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(
            "flex flex-col lg:border-r py-8 relative group/feature dark:border-neutral-800 cursor-pointer",
            (index === 0 || index === cols) && "lg:border-l dark:border-neutral-800",
            currentRow < rows - 1 && "lg:border-b dark:border-neutral-800"
          )}
        >
          {currentRow < rows - 1 && (
            <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
          )}
          {currentRow >= rows - 1 && (
            <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
          )}
          
          <div className="text-lg font-bold mb-2 relative z-10 px-10">
            <div className={cn(
              "absolute left-0 inset-y-0 w-1 rounded-tr-full rounded-br-full transition-all duration-200 origin-center",
              version.isSelected 
                ? "h-8 bg-blue-500" 
                : "h-6 bg-neutral-300 dark:bg-neutral-700 group-hover/feature:h-8 group-hover/feature:bg-blue-500"
            )} />
            <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100 text-md">
              #{index + 1}
              {version.isSelected && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 ml-2 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}
            </span>
          </div>
          
          <div className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10 mb-6 flex-1">
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans line-clamp-6">
                {version.content}
              </pre>
            </div>
          </div>
          
          <div className="flex gap-2 relative z-10 px-10">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onCopy()
              }}
              className="flex-1 text-xs h-8"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            {!version.isSelected && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
                disabled={isSelecting}
                className="flex-1 text-xs h-8"
              >
                {isSelecting ? "Selecting..." : "Select"}
              </Button>
            )}
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl p-0 bg-gray-50">
        
        <div className="p-1">
          <LinkedInMockup content={version.content} />
        </div>
        
        <div className="flex gap-3 p-6 pt-4 border-t bg-white">
          <Button
            variant="outline"
            onClick={onCopy}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Content
          </Button>
          {!version.isSelected && (
            <Button
              onClick={onSelect}
              disabled={isSelecting}
              className="flex-1"
            >
              {isSelecting ? "Selecting..." : "Select This Version"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SessionDetailPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [activeTab, setActiveTab] = useState("content")
  
  // Fetch session data
  const { 
    data: sessionData, 
    isLoading: sessionLoading, 
    error: sessionError 
  } = useSession(sessionId)
  
  // Fetch project data for context
  const { 
    data: projectData
  } = useProject(sessionData?.projectId)
  
  // Fetch content versions
  const { 
    data: versionsData,
    refetch: refetchVersions
  } = useContentVersions(sessionId)
  
  // Fetch assets
  const { 
    data: assetsData,
    refetch: refetchAssets
  } = useAssets(sessionId)
  
  // Mutations
  const streamingContentGeneration = useStreamingContentGeneration()
  const generateAssetMutation = useGenerateAssets()
  const selectVersionMutation = useSelectVersion()

  // Forms
  const contentForm = useForm<GenerateContentForm>({
    resolver: zodResolver(generateContentSchema),
    defaultValues: {
      variations: 3,
    }
  })
  
  const assetForm = useForm<GenerateAssetForm>({
    resolver: zodResolver(generateAssetSchema),
    defaultValues: {
      style: "professional",
      dimensions: "1080x1080"
    }
  })

  const session = sessionData
  const project = projectData
  const versions = versionsData?.versions || []
  const assets = assetsData?.assets || []
  const selectedVersion = versions.find((v: { isSelected?: boolean }) => v.isSelected)

  // Effect to show success toast when generation completes
  useEffect(() => {
    if (streamingContentGeneration.isComplete && streamingContentGeneration.variations.length > 0) {
      toast.success(`Successfully generated ${streamingContentGeneration.variations.length} content variations!`)
    }
  }, [streamingContentGeneration.isComplete, streamingContentGeneration.variations.length])

  // Effect to show errors
  useEffect(() => {
    if (streamingContentGeneration.error) {
      toast.error(streamingContentGeneration.error)
    }
  }, [streamingContentGeneration.error])

  // Version selection handler
  const onSelectVersion = async (versionId: string) => {
    try {
      await selectVersionMutation.mutateAsync(versionId)
      toast.success("Version selected!")
      refetchVersions()
    } catch (_error) {
      console.error("Failed to select version:", _error)
      toast.error("Failed to select version.")
    }
  }

  // Asset generation handler
  const onGenerateAsset = async (data: GenerateAssetForm) => {
    try {
      await generateAssetMutation.mutateAsync({
        sessionId: sessionId,
        assetType: data.assetType,
        prompt: data.prompt,
        style: data.style,
        dimensions: data.dimensions,
      })
      toast.success("Asset generation started!")
      refetchAssets()
    } catch (_error) {
      console.error("Failed to generate asset:", _error)
      toast.error("Failed to generate asset. Please try again.")
    }
  }

  // Content generation handler
  const onGenerateContent = async (data: GenerateContentForm) => {
    try {
      await streamingContentGeneration.generateContent({
        sessionId: sessionId,
        postIdea: session?.postIdea || "",
        tone: data.tone || project?.tone,
        contentType: data.contentType || project?.contentType,
        guidelines: data.guidelines || project?.guidelines,
        variations: data.variations,
      })
      // Note: No manual refetch needed as the streaming hook handles invalidation
    } catch (_error) {
      console.error("Failed to generate content:", _error)
      toast.error("Failed to generate content. Please try again.")
    }
  }

  // Copy content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Content copied to clipboard!")
  }

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header skeleton */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between py-6 px-6 lg:px-8">
              <div className="flex items-center gap-6">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-12 max-w-md mx-auto px-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
            <Bot className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Session not found</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The requested AI Creator session could not be found or may have been deleted.
          </p>
          <Link href="/ai-creator">
            <Button size="lg" className="shadow-lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header - Action focused */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between py-6 px-6 lg:px-8">
            {/* Left side - Navigation and context */}
            <div className="flex items-center gap-6">
              <Link href={`/ai-creator/project/${session.projectId}`}>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    <span className="font-medium text-foreground">{versions.length}</span>
                    <span>versions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Image className="h-4 w-4" />
                    <span className="font-medium text-foreground">{assets.length}</span>
                    <span>assets</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Session info and status */}
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Session Details
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[500px] p-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="px-6 py-6 border-b border-border/50">
                      <SheetTitle className="flex items-center gap-2 text-lg">
                        <Bot className="h-5 w-5 text-primary" />
                        Content Session
                      </SheetTitle>
                      <SheetDescription className="text-sm text-muted-foreground mt-1">
                        View session details and project context
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      <div className="space-y-8">
                        {/* Session Information */}
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-3 block">Session Information</Label>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Post Idea</Label>
                                <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                                  <p className="text-sm leading-relaxed text-foreground">
                                    {session.postIdea}
                                  </p>
                                </div>
                              </div>
                              
                              {session.context && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Context</Label>
                                  <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {session.context}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Project Settings */}
                        {project && (
                          <div className="space-y-6">
                            <div>
                              <Label className="text-sm font-semibold text-foreground mb-3 block">Project Settings</Label>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg border border-border/30">
                                  <span className="text-sm font-medium text-foreground">Tone</span>
                                  <Badge variant="outline" className="capitalize font-medium">{project.tone}</Badge>
                                </div>
                                <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg border border-border/30">
                                  <span className="text-sm font-medium text-foreground">Content Type</span>
                                  <Badge variant="outline" className="capitalize font-medium">{project.contentType}</Badge>
                                </div>
                              </div>
                            </div>
                            
                            {project.guidelines && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Brand Guidelines</Label>
                                <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
                                  <p className="text-sm leading-relaxed text-muted-foreground">
                                    {project.guidelines}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Session Stats */}
                        <div className="space-y-6">
                          <div>
                            <Label className="text-sm font-semibold text-foreground mb-3 block">Session Progress</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-muted/50 rounded-lg p-4 text-center border border-border/30">
                                <div className="text-2xl font-bold text-foreground mb-1">{versions.length}</div>
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Content Versions</div>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-4 text-center border border-border/30">
                                <div className="text-2xl font-bold text-foreground mb-1">{assets.length}</div>
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Visual Assets</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                {session.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {/* Main Workflow Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="content" className="flex items-center gap-2 h-10">
              <Zap className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2 h-10">
              <Image className="h-4 w-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2 h-10">
              <Check className="h-4 w-4" />
              Review
            </TabsTrigger>
          </TabsList>

          {/* Content Generation Tab */}
          <TabsContent value="content" className="space-y-8">
            {/* Generation Controls */}
            <Card className="border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  AI Content Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={contentForm.handleSubmit(onGenerateContent)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tone Override</Label>
                      <Select 
                        value={contentForm.watch("tone")} 
                        onValueChange={(value) => contentForm.setValue("tone", value as "professional" | "casual" | "thought-leader" | "provocative" | "educational" | "inspirational" | "conversational" | "custom" | undefined)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Use project default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="thought_leadership">Thought Leader</SelectItem>
                          <SelectItem value="provocative">Provocative</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="inspirational">Inspirational</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Variations</Label>
                      <Select 
                        value={contentForm.watch("variations")?.toString()} 
                        onValueChange={(value) => contentForm.setValue("variations", parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 variation</SelectItem>
                          <SelectItem value="2">2 variations</SelectItem>
                          <SelectItem value="3">3 variations</SelectItem>
                          <SelectItem value="4">4 variations</SelectItem>
                          <SelectItem value="5">5 variations</SelectItem>
                          <SelectItem value="6">6 variations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Additional Guidelines <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Textarea
                      placeholder="Add specific instructions for content generation..."
                      className="min-h-[100px] resize-none"
                      {...contentForm.register("guidelines")}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={streamingContentGeneration.isStreaming}
                    size="lg"
                    className="w-full md:w-auto shadow-lg"
                  >
                    {streamingContentGeneration.isStreaming ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {streamingContentGeneration.progress > 0 
                          ? `Generating... ${streamingContentGeneration.progressPercentage}%`
                          : 'Starting generation...'
                        }
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Real-time Generation Progress */}
            {streamingContentGeneration.isStreaming && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-blue-900">Generating Content Variations</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {streamingContentGeneration.progress}/{streamingContentGeneration.total}
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${streamingContentGeneration.progressPercentage}%` }}
                      />
                    </div>
                    
                    {streamingContentGeneration.currentApproaches.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-blue-700 font-medium">Content Approaches:</p>
                        <div className="flex flex-wrap gap-2">
                          {streamingContentGeneration.currentApproaches.map((approach) => (
                            <Badge key={approach} variant="outline" className="text-xs capitalize border-blue-300 text-blue-800">
                              {approach.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {streamingContentGeneration.totalTokensUsed > 0 && (
                      <p className="text-xs text-blue-600">
                        Tokens used: {streamingContentGeneration.totalTokensUsed.toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Variations Progress */}
            {streamingContentGeneration.variations.length > 0 && streamingContentGeneration.isStreaming && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-900">Completed Variations</h3>
                    <div className="space-y-3">
                      {streamingContentGeneration.variations.map((variation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs capitalize border-green-300 text-green-800">
                                {variation.approach?.replace('-', ' ')}
                              </Badge>
                              <span className="text-xs text-green-600">
                                {variation.contentLength} chars
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {variation.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {streamingContentGeneration.error && (
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 text-red-500 mt-0.5">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Generation Error</h3>
                      <p className="text-sm text-red-700">{streamingContentGeneration.error}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                        onClick={streamingContentGeneration.reset}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Versions */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Generated Versions</h3>
              </div>
              
              {versions.length === 0 ? (
                <Card className="border-2 border-dashed border-muted-foreground/25">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/25 border border-muted-foreground/20 flex items-center justify-center mb-6">
                      <Bot className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold mb-3">No content generated yet</h4>
                    <p className="text-muted-foreground text-center max-w-md leading-relaxed">
                      Generate your first AI content variation to get started with your LinkedIn post.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border/50 rounded-lg overflow-hidden">
                  {versions.map((version: { id: string; versionNumber: number; isSelected?: boolean; content: string }, index: number) => (
                    <ContentVersionCard
                      key={version.id}
                      version={version}
                      index={index}
                      totalVersions={versions.length}
                      onSelect={() => onSelectVersion(version.id)}
                      onCopy={() => copyToClipboard(version.content)}
                      isSelecting={selectVersionMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Asset Generation Tab */}
          <TabsContent value="assets" className="space-y-8">
            {/* Asset Generation Controls */}
            <Card className="border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Visual Asset Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={assetForm.handleSubmit(onGenerateAsset)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Asset Type</Label>
                      <Select 
                        value={assetForm.watch("assetType")} 
                        onValueChange={(value) => assetForm.setValue("assetType", value as "image" | "carousel" | "infographic" | "banner" | "thumbnail" | "logo" | "chart")}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                          <SelectItem value="infographic">Infographic</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="thumbnail">Thumbnail</SelectItem>
                          <SelectItem value="chart">Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Style</Label>
                      <Select 
                        value={assetForm.watch("style")} 
                        onValueChange={(value) => assetForm.setValue("style", value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Asset Description</Label>
                    <Textarea
                      placeholder="Describe the visual asset you want to generate..."
                      className="min-h-[100px] resize-none"
                      {...assetForm.register("prompt")}
                    />
                    {assetForm.formState.errors.prompt && (
                      <p className="text-sm text-destructive">
                        {assetForm.formState.errors.prompt.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={generateAssetMutation.isPending}
                    size="lg"
                    className="w-full md:w-auto shadow-lg"
                  >
                    {generateAssetMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Image className="h-4 w-4 mr-2" />
                        Generate Asset
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Generated Assets */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Generated Assets</h3>
              </div>
              
              {assets.length === 0 ? (
                <Card className="border-2 border-dashed border-muted-foreground/25">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/25 border border-muted-foreground/20 flex items-center justify-center mb-6">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold mb-3">No assets generated yet</h4>
                    <p className="text-muted-foreground text-center max-w-md leading-relaxed">
                      Generate visual assets to complement your LinkedIn post and increase engagement.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assets.map((asset: { id: string; assetType: string; prompt: string; fileUrl?: string }) => (
                    <Card key={asset.id} className="border-border/50 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize">{asset.assetType}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {asset.prompt}
                          </p>
                          
                          {asset.fileUrl ? (
                            <div className="bg-muted/30 rounded-lg h-32 flex items-center justify-center border border-border/50">
                              <Image className="h-8 w-8 text-muted-foreground" />
                              {/* In real implementation, show actual image */}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                              <RefreshCw className="h-5 w-5 text-yellow-600 mx-auto mb-2 animate-spin" />
                              <p className="text-sm text-yellow-700 font-medium">Generating...</p>
                            </div>
                          )}
                          
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Final Review Tab */}
          <TabsContent value="review" className="space-y-8">
            <Card className="border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Ready for LinkedIn
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {selectedVersion ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Selected Content</Label>
                      <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{selectedVersion.content}</pre>
                      </div>
                    </div>
                    
                    {assets.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Attached Assets</Label>
                        <div className="flex flex-wrap gap-2">
                          {assets.slice(0, 3).map((asset: { id: string; assetType: string }) => (
                            <Badge key={asset.id} variant="outline" className="capitalize">
                              {asset.assetType}
                            </Badge>
                          ))}
                          {assets.length > 3 && (
                            <Badge variant="outline">
                              +{assets.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        onClick={() => copyToClipboard(selectedVersion.content)}
                        size="lg"
                        className="shadow-lg"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Content
                      </Button>
                      <Button variant="outline" size="lg">
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/25 border border-muted-foreground/20 flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold mb-3">No content selected</h4>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                      Generate and select a content version to review your final post before sharing on LinkedIn.
                    </p>
                    <Button onClick={() => setActiveTab("content")} size="lg">
                      Go to Content Generation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 