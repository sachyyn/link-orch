import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center max-w-2xl mx-auto">
        <SignedOut>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Butter Chat
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A blazingly fast, AI-powered chat application with real-time sync and offline capabilities.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Sign in to start chatting with AI assistants and experience local-first performance.
            </p>
          </div>
        </SignedOut>
        
        <SignedIn>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome back to Butter Chat!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ready to continue your conversations? Your chat history is synced and available instantly.
          </p>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🚀 What's Next?
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-indigo-600 font-semibold">•</span>
                <span className="text-gray-700">Start a new conversation with an AI assistant</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-indigo-600 font-semibold">•</span>
                <span className="text-gray-700">Experience local-first performance with instant responses</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-indigo-600 font-semibold">•</span>
                <span className="text-gray-700">Your conversations sync seamlessly across devices</span>
              </div>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}