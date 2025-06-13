'use client'

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, ExternalLink, TrendingUp } from "lucide-react"
import Link from "next/link"

interface TopPostsData {
  topPerformingPosts: Array<{
    postId: number
    title: string
    publishedAt: string
    impressions: number
    engagementRate: number
    totalEngagement: number
  }>
}

export function TopPerformingPosts() {
  const [data, setData] = useState<TopPostsData | null>(null)
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
        console.error('Failed to fetch top posts data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h3 className="text-md font-medium mb-4">Top Performing Posts</h3>
        <div className="space-y-4 py-4 border-t">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3 pb-4 border-b last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex gap-4">
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getEngagementRateColor = (rate: number): string => {
    if (rate >= 5) return "text-green-600"
    if (rate >= 3) return "text-blue-600"
    if (rate >= 1) return "text-yellow-600"
    return "text-red-600"
  }

  const getEngagementRateBadge = (rate: number): { label: string; className: string } => {
    if (rate >= 5) return { label: "Excellent", className: "bg-green-100 text-green-800" }
    if (rate >= 3) return { label: "Good", className: "bg-blue-100 text-blue-800" }
    if (rate >= 1) return { label: "Average", className: "bg-yellow-100 text-yellow-800" }
    return { label: "Low", className: "bg-red-100 text-red-800" }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium">Top Performing Posts</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/content" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            View All
          </Link>
        </Button>
      </div>
      
      <div className="py-4 border-t">
        <div className="space-y-4">
          {data?.topPerformingPosts?.map((post, index) => {
            const engagementBadge = getEngagementRateBadge(post.engagementRate)
            
            return (
              <div key={post.postId} className="space-y-3 pb-4 border-b last:border-b-0">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <Badge className={engagementBadge.className}>
                        {engagementBadge.label}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Published {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </div>

                {/* Post Metrics */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{formatNumber(post.impressions)}</span>
                    <span className="text-muted-foreground">views</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{formatNumber(post.totalEngagement)}</span>
                    <span className="text-muted-foreground">interactions</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`h-3 w-3 ${getEngagementRateColor(post.engagementRate)}`} />
                    <span className={`font-medium ${getEngagementRateColor(post.engagementRate)}`}>
                      {post.engagementRate.toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground">rate</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" asChild className="text-xs h-auto py-1 px-2">
                    <Link href={`/dashboard/content/${post.postId}/edit`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Showing top {data?.topPerformingPosts?.length} posts</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Ranked by engagement rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 