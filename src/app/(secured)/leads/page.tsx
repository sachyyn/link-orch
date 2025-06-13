import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { LeadManagement } from "@/components/leads/lead-management"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Download } from "lucide-react"

export default async function LeadsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto">
        <LeadManagement />
      </div>
    </div>
  )
} 