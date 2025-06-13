import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center max-w-2xl mx-auto">
        <SignedOut>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to LinkedinMaster Pro
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The complete LinkedIn management platform for content creators, thought leaders, and social media professionals.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Sign in to start managing your LinkedIn presence with powerful content creation and analytics tools.
            </p>
          </div>
        </SignedOut>
        
        <SignedIn>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome back to LinkedinMaster Pro!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ready to elevate your LinkedIn presence? Access your content pipeline, analytics, and engagement tools.
          </p>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🚀 What's Next?
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-black font-semibold">•</span>
                <span className="text-gray-700">Create and schedule your LinkedIn content using our content pillars system</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-black font-semibold">•</span>
                <span className="text-gray-700">Track your engagement metrics and optimize your posting strategy</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-black font-semibold">•</span>
                <span className="text-gray-700">Manage your professional network and build meaningful connections</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-black font-semibold">•</span>
                <span className="text-gray-700">Organize events and convert engagement into business opportunities</span>
              </div>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}