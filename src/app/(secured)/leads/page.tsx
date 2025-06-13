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
      <DashboardHeader 
        title="Lead Management" 
        description="Track and nurture your business leads through the sales pipeline"
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
              Add Lead
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <LeadManagement />
      </div>
    </div>
  )
} 