'use client'

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, FileText, TrendingUp, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PillarData {
  pillarPerformance: Array<{
    pillarId: number
    pillarName: string
    postCount: number
    totalImpressions: number
    averageEngagement: number
    engagementRate: number
    color: string
  }>
}

export function PillarPerformance() {
  const [data, setData] = useState<PillarData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/overview')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch pillar performance data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h3 className="text-md font-medium mb-4">Content Pillar Performance</h3>
        <div className="space-y-4 py-4 border-t">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 pb-4 border-b last:border-b-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-12" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000)?.toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000)?.toFixed(1)}K`
    }
    return num?.toLocaleString()
  }
  // Calculate total posts for percentage calculation
  const totalPosts = data?.pillarPerformance?.reduce((sum, pillar) => sum + pillar.postCount, 0) || 0
  const maxImpressions = data?.pillarPerformance && data.pillarPerformance.length > 0 
    ? Math.max(...data.pillarPerformance.map(p => p.totalImpressions))
    : 0
  // End of Selection

  const getPerformanceLevel = (rate: number): { label: string; className: string } => {
    if (rate >= 5) return { label: "Excellent", className: "bg-green-100 text-green-800" }
    if (rate >= 3) return { label: "Good", className: "bg-blue-100 text-blue-800" }
    if (rate >= 1) return { label: "Average", className: "bg-yellow-100 text-yellow-800" }
    return { label: "Low", className: "bg-red-100 text-red-800" }
  }

  // Sort pillars by engagement rate for better visualization
  const sortedPillars = data?.pillarPerformance ? [...data.pillarPerformance].sort((a, b) => b.engagementRate - a.engagementRate) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium">Content Pillar Performance</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/content" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Manage Pillars
          </Link>
        </Button>
      </div>
      
      <div className="py-4 border-t">
        {sortedPillars.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-muted rounded-lg w-fit mx-auto mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium mb-1">No content pillars found</h3>
            <p className="text-sm text-muted-foreground">
              Create content pillars to track performance by topic.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPillars.map((pillar, index) => {
            const postPercentage = totalPosts > 0 ? (pillar.postCount / totalPosts) * 100 : 0
            const impressionPercentage = maxImpressions > 0 ? (pillar.totalImpressions / maxImpressions) * 100 : 0
            const performanceLevel = getPerformanceLevel(pillar.engagementRate)
            
            return (
              <div key={pillar.pillarId} className="space-y-3 pb-4 border-b last:border-b-0">
                {/* Pillar Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <h4 className="text-sm font-medium">{pillar.pillarName}</h4>
                    <Badge className={performanceLevel.className}>
                      {performanceLevel.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{pillar.engagementRate.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">engagement rate</div>
                  </div>
                </div>

                {/* Performance Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Impression performance</span>
                    <span className="font-medium">{formatNumber(pillar.totalImpressions)}</span>
                  </div>
                  <Progress 
                    value={impressionPercentage} 
                    className="h-2"
                    style={{
                      background: `${pillar.color}20`,
                    }}
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{pillar.postCount}</span>
                    <span className="text-muted-foreground">posts</span>
                    <span className="text-muted-foreground">({postPercentage.toFixed(1)}%)</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{formatNumber(pillar.averageEngagement)}</span>
                    <span className="text-muted-foreground">avg engagement</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{(pillar.totalImpressions / pillar.postCount).toFixed(0)}</span>
                    <span className="text-muted-foreground">avg reach</span>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {index === 0 && "🏆 Top performer"}
                    {index === 1 && "🥈 Strong performance"}
                    {index === 2 && "🥉 Good performance"}
                    {index > 2 && "📈 Growing pillar"}
                  </span>
                  <Button variant="ghost" size="sm" asChild className="text-xs h-auto py-1 px-2">
                    <Link href={`/dashboard/content?pillar=${pillar.pillarId}`}>
                      View Posts
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}

            {/* Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Total {data?.pillarPerformance?.length || 0} content pillars</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Ranked by engagement rate</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 