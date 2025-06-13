"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { 
  useSession, 
  useProject, 
  useContentVersions,
  useAssets,
  useGenerateContent,
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
import { Separator } from "@/components/ui/separator"
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
  Wand2
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Link from "next/link"

// Content generation form schema
const generateContentSchema = z.object({
  tone: z.enum(["professional", "casual", "thought-leader", "provocative", "educational", "inspirational", "conversational", "custom"]).optional(),
  contentType: z.enum(["post", "article", "poll", "carousel"]).optional(),
  guidelines: z.string().optional(),
  variations: z.number().min(1).max(5).default(3),
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
  const generateContentMutation = useGenerateContent()
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
  const selectedVersion = versions.find(v => v.selected)

  // Debug logging
  console.log("Session data:", session)
  console.log("Versions:", versions)

  // Content generation handler
  const onGenerateContent = async (data: GenerateContentForm) => {
    try {
      await generateContentMutation.mutateAsync({
        sessionId: sessionId,
        postIdea: session?.postIdea || "",
        tone: data.tone || project?.tone,
        contentType: data.contentType || project?.contentType,
        guidelines: data.guidelines || project?.guidelines,
        variations: data.variations,
      })
      toast.success("Content generated successfully!")
      refetchVersions()
    } catch (error) {
      toast.error("Failed to generate content. Please try again.")
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
    } catch (error) {
      toast.error("Failed to generate asset. Please try again.")
    }
  }

  // Version selection handler
  const onSelectVersion = async (versionId: number) => {
    try {
      await selectVersionMutation.mutateAsync(versionId)
      toast.success("Version selected!")
      refetchVersions()
    } catch (error) {
      toast.error("Failed to select version.")
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Error state
  if (sessionError || !session) {
    return (
      <div className="text-center py-12">
        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Session not found</h3>
        <p className="text-muted-foreground mb-4">
          The requested AI Creator session could not be found.
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
        <Link href={`/ai-creator/project/${session.projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Content Session</h1>
          <p className="text-muted-foreground line-clamp-2">{session.postIdea}</p>
        </div>
        
        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
          {session.status}
        </Badge>
      </div>

      {/* Session Info */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Post Idea</Label>
            <p className="text-sm text-muted-foreground">{session.postIdea}</p>
          </div>
          {session.context && (
            <div>
              <Label className="text-sm font-medium">Context</Label>
              <p className="text-sm text-muted-foreground">{session.context}</p>
            </div>
          )}
          {project && (
            <div className="flex gap-4 text-sm">
              <span><strong>Tone:</strong> {project.tone}</span>
              <span><strong>Type:</strong> {project.contentType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content Generation
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Asset Generation
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Final Review
          </TabsTrigger>
        </TabsList>

        {/* Content Generation Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Generation Controls */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate AI Content
            </h3>
            
            <form onSubmit={contentForm.handleSubmit(onGenerateContent)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tone Override</Label>
                  <Select 
                    value={contentForm.watch("tone")} 
                    onValueChange={(value) => contentForm.setValue("tone", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Use project default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="thought-leader">Thought Leader</SelectItem>
                      <SelectItem value="provocative">Provocative</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Variations</Label>
                  <Select 
                    value={contentForm.watch("variations")?.toString()} 
                    onValueChange={(value) => contentForm.setValue("variations", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 variation</SelectItem>
                      <SelectItem value="2">2 variations</SelectItem>
                      <SelectItem value="3">3 variations</SelectItem>
                      <SelectItem value="4">4 variations</SelectItem>
                      <SelectItem value="5">5 variations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Additional Guidelines (Optional)</Label>
                <Textarea
                  placeholder="Add specific instructions for content generation..."
                  {...contentForm.register("guidelines")}
                />
              </div>

              <Button 
                type="submit" 
                disabled={generateContentMutation.isPending}
                className="flex items-center gap-2"
              >
                {generateContentMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {generateContentMutation.isPending ? "Generating..." : "Generate Content"}
              </Button>
            </form>
          </div>

          {/* Generated Versions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Generated Versions</h3>
            
            {versions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No content generated yet</h4>
                <p className="text-muted-foreground mb-4">
                  Generate your first AI content variation to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {versions.map((version: any, index: number) => (
                  <div 
                    key={version.id} 
                    className={`border rounded-lg p-4 ${version.selected ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={version.selected ? 'default' : 'secondary'}>
                          Version {version.versionNumber}
                        </Badge>
                        {version.selected && (
                          <Badge variant="outline" className="text-green-600">
                            Selected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(version.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {!version.selected && (
                          <Button
                            size="sm"
                            onClick={() => onSelectVersion(version.id)}
                            disabled={selectVersionMutation.isPending}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{version.content}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Asset Generation Tab */}
        <TabsContent value="assets" className="space-y-6">
          {/* Asset Generation Controls */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generate Visual Assets
            </h3>
            
            <form onSubmit={assetForm.handleSubmit(onGenerateAsset)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Asset Type</Label>
                  <Select 
                    value={assetForm.watch("assetType")} 
                    onValueChange={(value) => assetForm.setValue("assetType", value as any)}
                  >
                    <SelectTrigger>
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
                
                <div>
                  <Label>Style</Label>
                  <Select 
                    value={assetForm.watch("style")} 
                    onValueChange={(value) => assetForm.setValue("style", value)}
                  >
                    <SelectTrigger>
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

              <div>
                <Label>Asset Description</Label>
                <Textarea
                  placeholder="Describe the visual asset you want to generate..."
                  {...assetForm.register("prompt")}
                />
                {assetForm.formState.errors.prompt && (
                  <p className="text-sm text-destructive mt-1">
                    {assetForm.formState.errors.prompt.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={generateAssetMutation.isPending}
                className="flex items-center gap-2"
              >
                {generateAssetMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
                {generateAssetMutation.isPending ? "Generating..." : "Generate Asset"}
              </Button>
            </form>
          </div>

          {/* Generated Assets */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Generated Assets</h3>
            
            {assets.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No assets generated yet</h4>
                <p className="text-muted-foreground mb-4">
                  Generate visual assets to complement your LinkedIn post.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset: any) => (
                  <div key={asset.id} className="border rounded-lg p-4">
                    <div className="space-y-2">
                      <Badge variant="outline">{asset.assetType}</Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {asset.prompt}
                      </p>
                      
                      {asset.fileUrl ? (
                        <div className="bg-gray-100 rounded h-32 flex items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                          {/* In real implementation, show actual image */}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
                          <RefreshCw className="h-4 w-4 text-yellow-600 mx-auto mb-1 animate-spin" />
                          <p className="text-xs text-yellow-700">Generating...</p>
                        </div>
                      )}
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Final Review Tab */}
        <TabsContent value="review" className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Post Ready for LinkedIn
            </h3>
            
            {selectedVersion ? (
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Selected Content</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{selectedVersion.content}</pre>
                  </div>
                </div>
                
                {assets.length > 0 && (
                  <div>
                    <Label className="font-medium">Attached Assets</Label>
                    <div className="mt-2 flex gap-2">
                      {assets.slice(0, 3).map((asset: any) => (
                        <Badge key={asset.id} variant="outline">
                          {asset.assetType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex gap-3">
                  <Button onClick={() => copyToClipboard(selectedVersion.content)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Content
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No content selected</h4>
                <p className="text-muted-foreground mb-4">
                  Generate and select a content version to review your final post.
                </p>
                <Button onClick={() => setActiveTab("content")}>
                  Go to Content Generation
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 