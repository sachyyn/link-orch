'use client'

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Heart, MessageCircle, Share, Users, TrendingUp } from "lucide-react"

interface PerformanceData {
  summary: {
    totalPosts: number
    totalImpressions: number
    totalEngagement: number
    averageEngagementRate: number
    followerGrowth: number
    profileViews: number
  }
}

export function PerformanceMetrics() {
  const [data, setData] = useState<PerformanceData | null>(null)
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
        console.error('Failed to fetch performance metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">Detailed Performance Metrics</h2>
        <div className="space-y-6 py-6 border-t border-b">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <div key={colIndex} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
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

  // Calculate derived metrics
  const avgLikesPerPost = Math.round((data?.summary?.totalEngagement * 0.7) / data?.summary?.totalPosts)
  const avgCommentsPerPost = Math.round((data?.summary?.totalEngagement * 0.2) / data?.summary?.totalPosts)
  const avgSharesPerPost = Math.round((data?.summary?.totalEngagement * 0.1) / data?.summary?.totalPosts)
  const avgImpressionsPerPost = Math.round(data?.summary?.totalImpressions / data?.summary?.totalPosts)

  const performanceCategories = [
    {
      title: "Content Performance",
      metrics: [
        {
          label: "Average Impressions per Post",
          value: formatNumber(avgImpressionsPerPost),
          icon: Eye,
          description: "Reach per content piece"
        },
        {
          label: "Average Likes per Post",
          value: formatNumber(avgLikesPerPost),
          icon: Heart,
          description: "Appreciation per content"
        },
        {
          label: "Average Comments per Post",
          value: formatNumber(avgCommentsPerPost),
          icon: MessageCircle,
          description: "Conversations started"
        },
        {
          label: "Average Shares per Post",
          value: formatNumber(avgSharesPerPost),
          icon: Share,
          description: "Content amplification"
        }
      ]
    },
    {
      title: "Audience Engagement",
      metrics: [
        {
          label: "Total Engagement",
          value: formatNumber(data?.summary?.totalEngagement),
          icon: TrendingUp,
          description: "All interactions combined"
        },
        {
          label: "Engagement Rate",
          value: `${data?.summary?.averageEngagementRate.toFixed(2)}%`,
          icon: Heart,
          description: "Engagement vs impressions"
        },
        {
          label: "Profile Views",
          value: formatNumber(data?.summary?.profileViews),
          icon: Eye,
          description: "Profile page visits"
        },
        {
          label: "Follower Growth",
          value: `+${formatNumber(data?.summary?.followerGrowth)}`,
          icon: Users,
          description: "New followers gained"
        }
      ]
    }
  ]

  const getEngagementLevel = (rate: number) => {
    if (rate >= 5) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (rate >= 3) return { label: "Good", color: "bg-blue-100 text-blue-800" }
    if (rate >= 1) return { label: "Average", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" }
  }

  const engagementLevel = getEngagementLevel(data?.summary?.averageEngagementRate)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Detailed Performance Metrics</h2>
        <Badge className={engagementLevel.color}>
          {engagementLevel.label} ({data?.summary?.averageEngagementRate.toFixed(2)}%)
        </Badge>
      </div>
      
      <div className="space-y-8 py-6 border-t border-b">
        {performanceCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h3 className="text-md font-medium mb-4 text-foreground">{category.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.metrics.map((metric, metricIndex) => {
                const Icon = metric.icon
                return (
                  <div key={metricIndex} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 