import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { ContentEditor } from "@/components/content/content-editor"

export default async function NewContentPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader 
        title="Create New Post" 
        description="Craft your LinkedIn content with rich formatting and scheduling"
      />

      <div className="flex-1 overflow-auto">
        <ContentEditor />
      </div>
    </div>
  )
} 