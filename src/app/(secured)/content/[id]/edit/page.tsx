import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from "@/components/layouts/dashboard-header"
import { ContentEditor } from "@/components/content/content-editor"

interface EditContentPageProps {
  params: {
    id: string
  }
}

export default async function EditContentPage({ params }: EditContentPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  const { id } = params

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader 
        title="Edit Post" 
        description={`Editing post #${id}`}
      />

      <div className="flex-1 overflow-auto">
        <ContentEditor postId={id} />
      </div>
    </div>
  )
} 