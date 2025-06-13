'use client'

import { useState } from "react"
import { useAnalyticsOverview } from "@/hooks/use-api"
import { TrendingUp, TrendingDown, Users, Eye, FileText, Heart, MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface AnalyticsOverviewProps {
  period?: '7d' | '30d' | '90d' | '1y'
}

export function AnalyticsOverview({ period = '30d' }: AnalyticsOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>(period)
  
  // Use React Query hook with real API integration
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useAnalyticsOverview({ 
    period: selectedPeriod,
    includeComparisons: true 
  })

  // Loading state with enhanced skeleton
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-12" />
            ))}
          </div>
        </div>
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

  // Error state with retry option
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Failed to load analytics data</p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No analytics data available</p>
      </div>
    )
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
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Performance Overview</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((periodOption) => (
            <Button
              key={periodOption}
              variant={selectedPeriod === periodOption ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(periodOption)}
            >
              {periodOption}
            </Button>
          ))}
        </div>
      </div>
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