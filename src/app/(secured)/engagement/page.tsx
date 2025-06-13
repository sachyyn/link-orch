import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { EngagementManagement } from "@/components/engagement/engagement-management"
import { Button } from "@/components/ui/button"
import { Filter, Download, Plus } from "lucide-react"

export default async function EngagementPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader 
        title="Engagement Management" 
        description="Monitor comments, messages, and interactions across your LinkedIn content"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <EngagementManagement />
      </div>
    </div>
  )
} 