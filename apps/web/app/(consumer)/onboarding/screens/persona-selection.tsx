'use client'

import { useState } from 'react'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const PERSONAS = [
  "Student",
  "Professional",
  "Freelancer",
  "Business Owner",
  "Hobbyist"
]

export function PersonaSelection() {
  const { data, updateData, next } = useOnboarding()
  const [selected, setSelected] = useState<string | undefined>(data.persona)

  const handleContinue = () => {
    if (selected) {
      updateData({ persona: selected })
      next()
    }
  }

  return (
    <OnboardingLayout
      title="How would you describe yourself?"
      subtitle="This helps us suggest the best learning path for you."
      currentStep={2}
      totalSteps={8}
    >
      <div className="grid grid-cols-1 gap-3 mb-8">
        {PERSONAS.map((persona) => {
          const isActive = selected === persona
          return (
            <button
              key={persona}
              onClick={() => setSelected(persona)}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{persona}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isActive ? 'border-white bg-white' : 'border-white/20'
                }`}>
                  {isActive && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                </div>
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
