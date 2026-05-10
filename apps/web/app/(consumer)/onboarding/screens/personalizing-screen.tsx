'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import Image from 'next/image'

export function PersonalizingScreen() {
  const { next } = useOnboarding()

  useEffect(() => {
    const timer = setTimeout(() => {
      next()
    }, 3500)
    return () => clearTimeout(timer)
  }, [next])

  return (
    <OnboardingLayout
      title="Personalizing your experience..."
      subtitle="We're curating the best AI tools and roadmaps based on your profile."
      currentStep={6}
      totalSteps={8}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-32 h-32 mb-12"
        >
          <Image
            src="/ai_seekho_logo_premium_1778318179449.png"
            alt="Personalizing"
            fill
            className="object-contain grayscale opacity-50"
          />
        </motion.div>

        <div className="w-full max-w-xs bg-gray-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
        
        <div className="mt-8 space-y-2 text-center">
          {[
            "Analyzing your goals...",
            "Matching with 1,000+ AI tools...",
            "Building your career roadmap..."
          ].map((text, i) => (
            <motion.p
              key={text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 1, duration: 0.5 }}
              className="text-xs text-gray-500 font-medium"
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>
    </OnboardingLayout>
  )
}
