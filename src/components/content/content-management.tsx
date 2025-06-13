"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Filter, Search, Calendar, Table2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ContentTable } from "./content-table"
import { ContentCalendar } from "./content-calendar"

export function ContentManagement() {
  const router = useRouter()
  const [view, setView] = useState<"table" | "calendar">("table")
  const [searchQuery, setSearchQuery] = useState("")

  const handleNewPost = () => {
    router.push('/dashboard/content/new')
  }

  return (
    <div className="p-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <Tabs value={view} onValueChange={(value) => setView(value as "table" | "calendar")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={handleNewPost}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Content Views */}
      {view === "table" ? (
        <ContentTable searchQuery={searchQuery} />
      ) : (
        <ContentCalendar searchQuery={searchQuery} />
      )}
    </div>
  )
} 