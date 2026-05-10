'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface OnboardingData {
  phoneNumber?: string
  goals: string[]
  persona?: string
  interests: string[]
  gender?: string
  ageRange?: string
}

interface OnboardingContextType {
  step: number
  setStep: (step: number) => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  next: () => void
  back: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    interests: [],
  })

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(0, s - 1))

  return (
    <OnboardingContext.Provider value={{ step, setStep, data, updateData, next, back }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
