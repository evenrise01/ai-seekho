'use client'

import { useState } from 'react'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import { Button } from '@/components/ui/button'

const AGES = [
  "Under 18",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+"
]

export function AgeSelection() {
  const { data, updateData, next } = useOnboarding()
  const [selected, setSelected] = useState<string | undefined>(data.ageRange)

  const handleContinue = () => {
    if (selected) {
      updateData({ ageRange: selected })
      next()
    }
  }

  return (
    <OnboardingLayout
      title="How old are you?"
      subtitle="Age helps us curate courses relevant to your career stage."
      currentStep={5}
      totalSteps={8}
    >
      <div className="grid grid-cols-2 gap-3 mb-8">
        {AGES.map((age) => {
          const isActive = selected === age
          return (
            <button
              key={age}
              onClick={() => setSelected(age)}
              className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <span className="font-bold">{age}</span>
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
