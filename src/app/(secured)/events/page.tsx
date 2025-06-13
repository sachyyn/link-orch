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
      <div className="flex-1 overflow-auto">
        <EventManagement />
      </div>
    </div>
  )
} 