'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function RedirectToOnboarding() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/user/onboarding-status')
          if (response.ok) {
            const data = await response.json()
            router.push(data.shouldRedirectTo)
          } else {
            // Default to onboarding if API fails
            router.push('/onboarding')
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          // Default to onboarding if API fails
          router.push('/onboarding')
        }
      }
    }

    checkOnboardingStatus()
  }, [isLoaded, user, router])

  // Show loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
      <p className="text-gray-600">Checking your account status...</p>
    </div>
  )
} 