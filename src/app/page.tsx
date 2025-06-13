import { SignedIn, SignedOut } from "@clerk/nextjs";
import RedirectToOnboarding from "./components/RedirectToOnboarding";

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
          <RedirectToOnboarding />
        </SignedIn>
      </div>
    </div>
  );
}