import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { ContentManagement } from "@/components/content/content-management"

export default async function ContentPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader 
        title="Content Management" 
        description="Create, schedule, and manage your LinkedIn content"
      />

      <div className="flex-1 overflow-auto">
        <ContentManagement />
      </div>
    </div>
  )
} 