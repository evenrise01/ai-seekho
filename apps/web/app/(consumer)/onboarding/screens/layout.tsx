'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useOnboarding } from '@/providers/onboarding-provider'

interface OnboardingLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  currentStep: number
  totalSteps: number
}

export function OnboardingLayout({ 
  children, 
  title, 
  subtitle, 
  currentStep, 
  totalSteps 
}: OnboardingLayoutProps) {
  const { back } = useOnboarding()

  return (
    <div className="fixed inset-0 bg-black flex flex-col p-6 pt-12 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={back}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i < currentStep ? 'w-4 bg-blue-500' : 'w-4 bg-gray-800'
              } ${i === currentStep - 1 ? 'bg-blue-400' : ''}`}
            />
          ))}
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-400 text-sm">
            {subtitle}
          </p>
        )}
      </motion.div>

      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
