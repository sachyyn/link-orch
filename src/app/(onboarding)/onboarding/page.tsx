'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    jobTitle: '',
    company: '',
    linkedinUrl: '',
    primaryGoal: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else {
      try {
        // Save onboarding data to database
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          router.push('/dashboard')
        } else {
          console.error('Failed to save onboarding data')
          // Still redirect even if save fails
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error saving onboarding data:', error)
        // Still redirect even if save fails
        router.push('/dashboard')
      }
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black mx-auto mb-4">
              <span className="text-lg font-bold text-white">LM</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome to Link Pro
            </h1>
            <p className="text-gray-600">
              Let&apos;s set up your profile to get started
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g., Marketing Manager"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your company name"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black mx-auto mb-4">
            <span className="text-lg font-bold text-white">LM</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            LinkedIn & Goals
          </h1>
          <p className="text-gray-600">
            Help us personalize your experience
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile URL <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="url"
              id="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label htmlFor="primaryGoal" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Goal
            </label>
            <select
              id="primaryGoal"
              value={formData.primaryGoal}
              onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select your main goal</option>
              <option value="thought-leadership">Build thought leadership</option>
              <option value="network-growth">Grow professional network</option>
              <option value="lead-generation">Generate leads</option>
              <option value="brand-awareness">Increase brand awareness</option>
              <option value="content-creation">Improve content creation</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 