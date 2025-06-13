"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp,
  MessageSquare,
  Reply,
  Clock,
  Target,
  Zap
} from "lucide-react"

interface EngagementMetric {
  id: number
  postId: number
  postTitle: string
  comments: number
  replies: number
  responseRate: number
  avgResponseTime: number // in hours
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  createdAt: string
}

interface EngagementTrackingProps {
  metrics: EngagementMetric[]
}

// Mock chart data for demonstration
const responseTimeData = [
  { date: '2024-02-10', avgTime: 3.2, target: 4.0 },
  { date: '2024-02-11', avgTime: 2.8, target: 4.0 },
  { date: '2024-02-12', avgTime: 4.1, target: 4.0 },
  { date: '2024-02-13', avgTime: 2.5, target: 4.0 },
  { date: '2024-02-14', avgTime: 3.8, target: 4.0 },
  { date: '2024-02-15', avgTime: 2.2, target: 4.0 },
  { date: '2024-02-16', avgTime: 1.9, target: 4.0 },
]

const engagementTrendData = [
  { date: '2024-02-10', comments: 8, replies: 6 },
  { date: '2024-02-11', comments: 12, replies: 10 },
  { date: '2024-02-12', comments: 15, replies: 11 },
  { date: '2024-02-13', comments: 9, replies: 8 },
  { date: '2024-02-14', comments: 18, replies: 14 },
  { date: '2024-02-15', comments: 22, replies: 18 },
  { date: '2024-02-16', comments: 16, replies: 13 },
]

export function EngagementTracking({ metrics }: EngagementTrackingProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-400 text-lg mb-2">No engagement data</div>
        <div className="text-gray-500 text-sm">Engagement metrics will appear here as you interact with comments</div>
      </div>
    )
  }

  // Calculate aggregated metrics
  const totalComments = metrics.reduce((sum, metric) => sum + (metric?.comments || 0), 0)
  const totalReplies = metrics.reduce((sum, metric) => sum + (metric?.replies || 0), 0)
  const averageResponseRate = metrics.reduce((sum, metric) => sum + (metric?.responseRate || 0), 0) / Math.max(metrics.length, 1)
  const averageResponseTime = metrics.reduce((sum, metric) => sum + (metric?.avgResponseTime || 0), 0) / Math.max(metrics.length, 1)

  // Calculate total sentiment breakdown
  const totalSentiment = metrics.reduce((acc, metric) => {
    if (metric?.sentiment) {
      acc.positive += metric.sentiment.positive || 0
      acc.neutral += metric.sentiment.neutral || 0
      acc.negative += metric.sentiment.negative || 0
    }
    return acc
  }, { positive: 0, neutral: 0, negative: 0 })

  const sentimentData = [
    { name: 'Positive', value: totalSentiment.positive, color: '#22c55e' },
    { name: 'Neutral', value: totalSentiment.neutral, color: '#6b7280' },
    { name: 'Negative', value: totalSentiment.negative, color: '#ef4444' },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getResponseRateBadge = (rate: number) => {
    if (rate >= 80) return { color: 'bg-green-100 text-green-800', label: 'Excellent' }
    if (rate >= 60) return { color: 'bg-blue-100 text-blue-800', label: 'Good' }
    if (rate >= 40) return { color: 'bg-yellow-100 text-yellow-800', label: 'Average' }
    return { color: 'bg-red-100 text-red-800', label: 'Needs Improvement' }
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalComments}</div>
                <div className="text-sm text-gray-600">Total Comments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Reply className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalReplies}</div>
                <div className="text-sm text-gray-600">Replies Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{averageResponseRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Response Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{averageResponseTime.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Response Time Trend</h3>
              <Badge variant="outline" className="gap-1">
                <Target className="h-3 w-3" />
                Target: 4h
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [`${value}h`, name === 'avgTime' ? 'Actual' : 'Target']}
                  labelFormatter={(value) => formatDate(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="#3b82f6" 
                  fill="#3b82f680" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Engagement Trend</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engagementTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'comments' ? 'Comments' : 'Replies']}
                  labelFormatter={(value) => formatDate(value)}
                />
                <Bar dataKey="comments" fill="#3b82f6" />
                <Bar dataKey="replies" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Analysis and Post Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Sentiment Analysis</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Comments']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Post Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.slice(0, 3).map((metric) => {
                const responseBadge = getResponseRateBadge(metric?.responseRate || 0)
                return (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {metric.postTitle || 'Untitled Post'}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {metric?.comments || 0} comments
                          </span>
                          <span className="flex items-center gap-1">
                            <Reply className="h-3 w-3" />
                            {metric?.replies || 0} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {metric?.avgResponseTime || 0}h avg
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${responseBadge.color} text-xs`}
                      >
                        {responseBadge.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Response Rate</span>
                        <span>{metric?.responseRate || 0}%</span>
                      </div>
                      <Progress value={metric?.responseRate || 0} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Performance Insights</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Doing Well</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• High positive sentiment ({totalSentiment.positive} positive comments)</li>
                <li>• Response rate above 75%</li>
                <li>• Quick average response time</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Opportunities</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Increase reply rate to boost engagement</li>
                <li>• Create more response templates</li>
                <li>• Focus on high-engagement posts</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Target className="h-4 w-4" />
                <span className="font-medium">Goals</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Maintain response time under 4 hours</li>
                <li>• Achieve 90% response rate</li>
                <li>• Increase positive sentiment ratio</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 