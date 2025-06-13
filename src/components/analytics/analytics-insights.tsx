'use client'

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Target,
  Clock
} from "lucide-react"

interface InsightsData {
  insights: Array<{
    type: 'insight' | 'recommendation' | 'alert'
    title: string
    description: string
    actionRequired?: boolean
  }>
}

export function AnalyticsInsights() {
  const [data, setData] = useState<InsightsData | null>(null)
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
        console.error('Failed to fetch insights data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">Insights & Recommendations</h2>
        <div className="space-y-4 py-6 border-t border-b">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return Lightbulb
      case 'recommendation':
        return TrendingUp
      case 'alert':
        return AlertTriangle
      default:
        return CheckCircle
    }
  }

  const getInsightConfig = (type: string) => {
    switch (type) {
      case 'insight':
        return {
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100',
          badge: { label: 'Insight', className: 'bg-blue-100 text-blue-800' }
        }
      case 'recommendation':
        return {
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          badge: { label: 'Recommendation', className: 'bg-green-100 text-green-800' }
        }
      case 'alert':
        return {
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          badge: { label: 'Alert', className: 'bg-yellow-100 text-yellow-800' }
        }
      default:
        return {
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          badge: { label: 'Info', className: 'bg-gray-100 text-gray-800' }
        }
    }
  }

  const getActionButton = (insight: { type: string; actionRequired?: boolean }) => {
    if (!insight.actionRequired) return null

    const actionText = {
      'insight': 'Learn More',
      'recommendation': 'Take Action',
      'alert': 'Review Now'
    }

    return (
      <Button size="sm" variant="outline" className="gap-2 text-xs">
        {actionText[insight.type as keyof typeof actionText] || 'View'}
        <ArrowRight className="h-3 w-3" />
      </Button>
    )
  }

  // Separate insights by priority
  const alerts = data?.insights?.filter(i => i.type === 'alert') || []
  const recommendations = data?.insights?.filter(i => i.type === 'recommendation') || []
  const insights = data?.insights?.filter(i => i.type === 'insight') || []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Insights & Recommendations</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Updated 2 hours ago</span>
        </div>
      </div>
      
      <div className="py-6 border-t border-b">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{recommendations.length}</p>
              <p className="text-sm text-muted-foreground">Recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{insights.length}</p>
              <p className="text-sm text-muted-foreground">Insights</p>
            </div>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {(data?.insights || []).map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            const config = getInsightConfig(insight.type)
            
            return (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                {/* Icon */}
                <div className={`p-2 ${config.bgColor} rounded-lg flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${config.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <Badge className={config.badge.className}>
                      {config.badge.label}
                    </Badge>
                    {insight.actionRequired && (
                      <Badge variant="outline" className="text-xs">
                        Action Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {getActionButton(insight)}
                </div>
              </div>
            )
          })}
        </div>

        {/* No insights message */}
        {(data?.insights?.length || 0) === 0 && (
          <div className="text-center py-8">
            <div className="p-3 bg-muted rounded-lg w-fit mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium mb-1">All looking good!</h3>
            <p className="text-sm text-muted-foreground">
              No urgent insights or recommendations at this time.
            </p>
          </div>
        )}

        {/* Action Summary */}
        {(data?.insights?.length || 0) > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {(data?.insights || []).filter(i => i.actionRequired).length} items need your attention
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Action Plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 