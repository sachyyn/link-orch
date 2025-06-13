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
      <div className="flex-1 overflow-auto">
        <ContentEditor />
      </div>
    </div>
  )
} 