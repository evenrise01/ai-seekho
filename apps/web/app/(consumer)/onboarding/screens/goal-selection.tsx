'use client'

import { useState } from 'react'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const GOALS = [
  "Boost productivity",
  "Advance career",
  "Automate tasks",
  "Learn new skills",
  "Explore tools"
]

export function GoalSelection() {
  const { data, updateData, next } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.goals)

  const toggle = (goal: string) => {
    setSelected(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    )
  }

  const handleContinue = () => {
    updateData({ goals: selected })
    next()
  }

  return (
    <OnboardingLayout
      title="What's your primary goal with AI?"
      subtitle="Select your top goals to help us tailor your experience."
      currentStep={1}
      totalSteps={8}
    >
      <div className="flex flex-wrap gap-3 mb-8">
        {GOALS.map((goal) => {
          const isActive = selected.includes(goal)
          return (
            <button
              key={goal}
              onClick={() => toggle(goal)}
              className={`px-6 py-3 rounded-2xl border-2 transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                isActive 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {goal}
              {isActive && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="h-4 w-4" />
                </motion.div>
              )}
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
