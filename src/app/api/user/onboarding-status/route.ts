import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { userProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has completed onboarding
    const [profile] = await db
      .select({ onboardingCompleted: userProfiles.onboardingCompleted })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)

    const hasCompletedOnboarding = profile?.onboardingCompleted || false

    return NextResponse.json({ 
      hasCompletedOnboarding,
      shouldRedirectTo: hasCompletedOnboarding ? '/dashboard' : '/onboarding'
    })

  } catch (error) {
    console.error('Error checking onboarding status:', error)
    // Default to redirecting to onboarding on error
    return NextResponse.json({ 
      hasCompletedOnboarding: false,
      shouldRedirectTo: '/onboarding'
    })
  }
} 