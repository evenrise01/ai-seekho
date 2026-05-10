'use client'

import { useState } from 'react'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const ROLES = [
  "Marketing",
  "Design",
  "Coding",
  "Sales",
  "HR",
  "Writing"
]

export function RoleSelection() {
  const { data, updateData, next } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.interests)

  const toggle = (role: string) => {
    setSelected(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    )
  }

  const handleContinue = () => {
    updateData({ interests: selected })
    next()
  }

  return (
    <OnboardingLayout
      title="Which area do you want to master AI in?"
      subtitle="Select the areas that interest you most."
      currentStep={3}
      totalSteps={8}
    >
      <div className="grid grid-cols-2 gap-3 mb-8">
        {ROLES.map((role) => {
          const isActive = selected.includes(role)
          return (
            <button
              key={role}
              onClick={() => toggle(role)}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-sm font-bold flex flex-col items-center gap-3 ${
                isActive 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                isActive ? 'bg-white border-white' : 'border-white/10'
              }`}>
                {isActive ? <Check className="h-5 w-5 text-blue-600" /> : <div className="w-4 h-4 rounded-full border border-white/10" />}
              </div>
              {role}
            </button>
          )
        })}
      </div>

      <div className="mt-auto pb-8">
        <Button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl"
        >
          Continue
        </Button>
      </div>
    </OnboardingLayout>
  )
}
