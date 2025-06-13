'use client'

import { useEffect, useState } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, TrendingUp, Eye, Heart } from "lucide-react"

interface TrendData {
  timeSeriesData: Array<{
    date: string
    impressions: number
    engagement: number
    followers: number
    profileViews: number
  }>
}

export function TrendCharts() {
  const [data, setData] = useState<TrendData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'impressions' | 'engagement' | 'followers' | 'profileViews'>('impressions')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/overview')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch trend data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">Performance Trends</h2>
        <div className="space-y-4 py-6 border-t border-b">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const metrics = [
    {
      key: 'impressions' as const,
      label: 'Impressions',
      icon: Eye,
      color: '#3B82F6',
      description: 'Content reach over time'
    },
    {
      key: 'engagement' as const,
      label: 'Engagement',
      icon: Heart,
      color: '#EF4444',
      description: 'User interactions'
    },
    {
      key: 'followers' as const,
      label: 'Followers',
      icon: TrendingUp,
      color: '#10B981',
      description: 'Audience growth'
    },
    {
      key: 'profileViews' as const,
      label: 'Profile Views',
      icon: Eye,
      color: '#8B5CF6',
      description: 'Profile page visits'
    }
  ]

  const selectedMetricConfig = metrics.find(m => m.key === selectedMetric)!

  // Format data for charts
  const chartData = data?.timeSeriesData?.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }))

  // Calculate trend indicators
  const currentValue = chartData?.[chartData.length - 1]?.[selectedMetric] || 0
  const previousValue = chartData?.[chartData.length - 2]?.[selectedMetric] || 0
  const trendPercentage = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
  const isPositiveTrend = trendPercentage >= 0

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num?.toLocaleString()
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm" style={{ color: selectedMetricConfig.color }}>
            {selectedMetricConfig.label}: {formatNumber(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Performance Trends</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last 30 days</span>
        </div>
      </div>
      
      <div className="py-6 border-t border-b space-y-6">
        {/* Metric Selection */}
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon
            const isSelected = selectedMetric === metric.key
            return (
              <Button
                key={metric.key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric(metric.key)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {metric.label}
              </Button>
            )
          })}
        </div>

        {/* Current Metric Summary */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">{selectedMetricConfig.description}</p>
            <p className="text-3xl font-bold">{formatNumber(currentValue)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-4 w-4 ${!isPositiveTrend ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">
                {Math.abs(trendPercentage).toFixed(1)}%
              </span>
            </div>
            <span className="text-sm text-muted-foreground">vs yesterday</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={selectedMetricConfig.color}
                strokeWidth={2}
                fill={selectedMetricConfig.color}
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {chartData?.length} data points</span>
          <span>Updated 2 hours ago</span>
        </div>
      </div>
    </div>
  )
} 