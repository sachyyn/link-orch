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

      <div className="flex-1 overflow-auto">
        <EngagementManagement />
      </div>
    </div>
  )
} 