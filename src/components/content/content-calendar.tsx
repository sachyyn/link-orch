"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"

interface ContentCalendarProps {
  posts: any[]
  searchQuery: string
  pillars: any[]
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800', 
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  archived: 'bg-yellow-100 text-yellow-800',
}

export function ContentCalendar({ posts, searchQuery, pillars }: ContentCalendarProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getPostsForDay = (day: Date) => {
    if (!Array.isArray(posts)) return []
    return posts.filter((post: any) => {
      if (!post.scheduledAt) return false
      return isSameDay(new Date(post.scheduledAt), day)
    })
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleAddPost = (day: Date) => {
    // Navigate to create post with pre-filled date
    const dateString = format(day, 'yyyy-MM-dd')
    router.push(`/dashboard/content/new?date=${dateString}`)
  }

  const handleEditPost = (postId: number) => {
    router.push(`/dashboard/content/${postId}/edit`)
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-100"></div>
            <span>Draft</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-100"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100"></div>
            <span>Published</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dayPosts = getPostsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[120px] p-2 border-r border-b last:border-r-0
                  ${isCurrentMonth ? 'bg-background' : 'bg-muted/20'}
                  ${isToday ? 'bg-primary/5 border-primary/20' : ''}
                  hover:bg-muted/50 transition-colors group cursor-pointer
                `}
                onClick={() => handleAddPost(day)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className={`
                      text-sm font-medium
                      ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                      ${isToday ? 'text-primary font-semibold' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddPost(day)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Posts for this day */}
                <div className="space-y-1">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-1 rounded text-xs cursor-pointer hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditPost(post.id)
                      }}
                    >
                      <Badge 
                        variant="outline"
                        className={`${statusColors[post.status as keyof typeof statusColors]} text-xs h-5 truncate max-w-full`}
                      >
                        {post.title.length > 20 ? `${post.title.substring(0, 20)}...` : post.title}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Total posts this month: {Array.isArray(posts) ? posts.filter((post: any) => {
            if (!post.scheduledAt) return false
            const postDate = new Date(post.scheduledAt)
            return isSameMonth(postDate, currentDate)
          }).length : 0}
        </div>
        <div className="flex items-center gap-4">
          <span>
            Scheduled: {Array.isArray(posts) ? posts.filter((p: any) => p.status === 'scheduled').length : 0}
          </span>
          <span>
            Published: {Array.isArray(posts) ? posts.filter((p: any) => p.status === 'published').length : 0}
          </span>
          <span>
            Drafts: {Array.isArray(posts) ? posts.filter((p: any) => p.status === 'draft').length : 0}
          </span>
        </div>
      </div>
    </div>
  )
} 