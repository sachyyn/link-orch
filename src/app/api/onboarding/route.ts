import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, userProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { jobTitle, company, linkedinUrl, primaryGoal } = body

    // First ensure the user exists in our database
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!existingUser) {
      // Create user record if it doesn't exist
      // This handles cases where Clerk webhook didn't create the user yet
      await db.insert(users).values({
        id: userId,
        email: '', // We'll update this with actual email later
        isActive: true,
      })
    }

    // Check if user profile already exists
    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)

    const profileData = {
      userId,
      jobTitle: jobTitle || null,
      company: company || null,
      linkedinUrl: linkedinUrl || null,
      primaryGoal: primaryGoal || null,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    }

    if (existingProfile) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set(profileData)
        .where(eq(userProfiles.userId, userId))
    } else {
      // Create new profile
      await db.insert(userProfiles).values(profileData)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding data saved successfully' 
    })

  } catch (error) {
    console.error('Error saving onboarding data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 