import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to LinkedinMaster Pro
          </h1>
          <p className="text-gray-600">
            Your LinkedIn management platform is ready to go.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posts This Month</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👁️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome to your LinkedIn management dashboard! Here are some next steps to get you started:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Create Your First Post</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start building your LinkedIn presence with engaging content.
              </p>
              <button className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors">
                Create Post
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Setup Content Calendar</h3>
              <p className="text-sm text-gray-600 mb-4">
                Plan and schedule your content for consistent posting.
              </p>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors">
                Setup Calendar
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Define Content Pillars</h3>
              <p className="text-sm text-gray-600 mb-4">
                Organize your content strategy around key topics.
              </p>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors">
                Create Pillars
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Track Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Monitor your LinkedIn performance and engagement.
              </p>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 bg-gray-100 rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-600">🤖</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">AI Content Assistant</h3>
              <p className="text-sm text-gray-600">Smart content suggestions and optimization</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-600">📊</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Deep insights and performance tracking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-600">🎯</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Lead Management</h3>
              <p className="text-sm text-gray-600">Track and nurture your professional leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 