import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { PerformanceMetrics } from "@/components/analytics/performance-metrics"
import { TrendCharts } from "@/components/analytics/trend-charts"
import { TopPerformingPosts } from "@/components/analytics/top-performing-posts"
import { PillarPerformance } from "@/components/analytics/pillar-performance"
import { AnalyticsInsights } from "@/components/analytics/analytics-insights"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Calendar } from "lucide-react"

export default async function AnalyticsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Performance Overview Metrics */}
        <AnalyticsOverview />
        
        {/* Key Performance Metrics */}
        <PerformanceMetrics />
        
        {/* Trend Analysis Charts */}
        <TrendCharts />
        
        {/* Two Column Layout for Secondary Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopPerformingPosts />
          <PillarPerformance />
        </div>
        
        {/* Insights and Recommendations */}
        <AnalyticsInsights />
      </div>
    </div>
  )
} 