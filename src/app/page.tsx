import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import RedirectToOnboarding from "./components/RedirectToOnboarding";
import { Button } from "@/components/ui/button";

function Header() {
  return (
    <header className="border-b border-border bg-background px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">LM</span>
          </div>
          <h1 className="text-xl font-semibold">LinkedinMaster Pro</h1>
        </div>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline">Sign up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center max-w-2xl mx-auto">
          <SignedOut>
            <h1 className="text-4xl font-bold mb-6">
              Welcome to LinkedinMaster Pro
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              The complete LinkedIn management platform for content creators, thought leaders, and social media professionals.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in to start managing your LinkedIn presence with powerful content creation and analytics tools.
              </p>
            </div>
          </SignedOut>
          
          <SignedIn>
            <RedirectToOnboarding />
          </SignedIn>
        </div>
      </div>
    </div>
  );
}