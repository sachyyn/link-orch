import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, userProfiles } from '@/db/schema'
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

    // Get user from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in authentication provider' },
        { status: 404 }
      )
    }

    // Get user profile from database
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)

    // Get user record from database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return NextResponse.json({
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      imageUrl: clerkUser.imageUrl || null,
      profile: profile ? {
        jobTitle: profile.jobTitle,
        company: profile.company,
        linkedinUrl: profile.linkedinUrl,
        primaryGoal: profile.primaryGoal,
        onboardingCompleted: profile.onboardingCompleted,
        onboardingCompletedAt: profile.onboardingCompletedAt?.toISOString() || null,
      } : null,
      isActive: dbUser?.isActive || true,
    })

  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
} 