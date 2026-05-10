'use client'

import { useState } from 'react'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import { Button } from '@/components/ui/button'

const GENDERS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say"
]

export function GenderSelection() {
  const { data, updateData, next } = useOnboarding()
  const [selected, setSelected] = useState<string | undefined>(data.gender)

  const handleContinue = () => {
    if (selected) {
      updateData({ gender: selected })
      next()
    }
  }

  return (
    <OnboardingLayout
      title="What's your gender?"
      subtitle="Help us personalize your content recommendations."
      currentStep={4}
      totalSteps={8}
    >
      <div className="space-y-3 mb-8">
        {GENDERS.map((gender) => {
          const isActive = selected === gender
          return (
            <button
              key={gender}
              onClick={() => setSelected(gender)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                isActive 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <span className="font-bold">{gender}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isActive ? 'border-white bg-white' : 'border-white/20'
              }`}>
                {isActive && <div className="w-3 h-3 rounded-full bg-blue-600" />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-auto pb-8">
        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl"
        >
          Continue
        </Button>
      </div>
    </OnboardingLayout>
  )
}
