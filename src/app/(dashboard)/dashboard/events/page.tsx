import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { EventManagement } from "@/components/events/event-management"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Filter, Download } from "lucide-react"

export default async function EventsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader 
        title="Event Management" 
        description="Create and manage your professional events and networking opportunities"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </Button>
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
              Create Event
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <EventManagement />
      </div>
    </div>
  )
} 