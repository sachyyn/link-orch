'use client'

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Users, Eye, FileText, Heart, MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsOverviewData {
  summary: {
    totalPosts: number
    totalImpressions: number
    totalEngagement: number
    averageEngagementRate: number
    followerGrowth: number
    profileViews: number
  }
  trends: {
    impressions: {
      current: number
      previous: number
      changePercentage: number
      trend: 'up' | 'down' | 'stable'
    }
    engagement: {
      current: number
      previous: number
      changePercentage: number
      trend: 'up' | 'down' | 'stable'
    }
    followers: {
      current: number
      previous: number
      changePercentage: number
      trend: 'up' | 'down' | 'stable'
    }
  }
}

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverviewData | null>(null)
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
        console.error('Failed to fetch analytics overview:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 py-6 border-t border-b">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
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

  const metrics = [
    {
      label: "Total Posts",
      value: data?.summary?.totalPosts,
      icon: FileText,
      trend: null,
      suffix: ""
    },
    {
      label: "Impressions",
      value: data?.summary?.totalImpressions,
      icon: Eye,
      trend: data?.trends?.impressions,
      suffix: ""
    },
    {
      label: "Engagement",
      value: data?.summary?.totalEngagement,
      icon: Heart,
      trend: data?.trends?.engagement,
      suffix: ""
    },
    {
      label: "Engagement Rate",
      value: data?.summary?.averageEngagementRate,
      icon: MessageCircle,
      trend: null,
      suffix: "%"
    },
    {
      label: "Follower Growth",
      value: data?.summary?.followerGrowth,
      icon: Users,
      trend: data?.trends?.followers,
      suffix: ""
    },
    {
      label: "Profile Views",
      value: data?.summary?.profileViews,
      icon: TrendingUp,
      trend: null,
      suffix: ""
    }
  ]

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return TrendingUp
    if (trend === 'down') return TrendingDown
    return null
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-muted-foreground'
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Performance Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 py-6 border-t border-b">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend ? getTrendIcon(metric.trend.trend) : null
          
          return (
            <div key={index} className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                    {metric.suffix}
                  </p>
                  {TrendIcon && metric.trend && (
                    <div className={`flex items-center gap-1 ${getTrendColor(metric.trend.trend)}`}>
                      <TrendIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {Math.abs(metric.trend.changePercentage).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                {metric.trend && (
                  <p className={`text-xs ${getTrendColor(metric.trend.trend)}`}>
                    vs previous period
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 