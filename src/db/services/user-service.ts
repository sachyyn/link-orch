import { db } from '@/db'
import { 
  users, 
  userProfiles, 
  userSubscriptions,
  type UserProfile,
  type NewUserProfile,
  eq, 
  and
} from '@/db/schema'

// ================================
// User Profile Service
// ================================

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)

  return profile || null
}

/**
 * Create user profile
 */
export async function createUserProfile(
  userId: string, 
  profileData: Omit<NewUserProfile, 'userId'>
): Promise<UserProfile> {
  const newProfile: NewUserProfile = {
    ...profileData,
    userId,
    updatedAt: new Date(),
  }

  const [createdProfile] = await db
    .insert(userProfiles)
    .values(newProfile)
    .returning()

  return createdProfile
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string, 
  updateData: Partial<Omit<NewUserProfile, 'userId'>>
): Promise<UserProfile | null> {
  const updatedData = {
    ...updateData,
    updatedAt: new Date(),
  }

  const [updatedProfile] = await db
    .update(userProfiles)
    .set(updatedData)
    .where(eq(userProfiles.userId, userId))
    .returning()

  return updatedProfile || null
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus(userId: string): Promise<boolean> {
  const [profile] = await db
    .select({ onboardingCompleted: userProfiles.onboardingCompleted })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)

  return profile?.onboardingCompleted || false
} 