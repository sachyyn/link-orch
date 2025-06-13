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
      <div className="flex-1 overflow-auto">
        <ContentManagement />
      </div>
    </div>
  )
} 