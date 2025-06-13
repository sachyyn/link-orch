import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader 
        title="Dashboard" 
        description="Welcome back to LinkedinMaster Pro"
      />

      <div className="flex-1 overflow-auto">
        <DashboardContent />
      </div>
    </div>
  )
} 