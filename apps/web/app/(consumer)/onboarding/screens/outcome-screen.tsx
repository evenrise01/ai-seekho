'use client'

import { motion } from 'framer-motion'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import { Button } from '@/components/ui/button'
import { Sparkles, Trophy, Zap, Star } from 'lucide-react'

export function OutcomeScreen() {
  const { data, next } = useOnboarding()

  const items = [
    { icon: Zap, label: "Productivity", color: "text-amber-400" },
    { icon: Star, label: "Top Rated", color: "text-blue-400" },
    { icon: Trophy, label: "Career Growth", color: "text-emerald-400" },
    { icon: Sparkles, label: "AI Magic", color: "text-purple-400" },
  ]

  return (
    <OnboardingLayout
      title="You're all set!"
      subtitle={`We've found 12 roadmaps and 48 AI tools that match your profile.`}
      currentStep={7}
      totalSteps={8}
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4 mb-12">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center flex flex-col items-center gap-3"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-gray-300">{item.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl text-center"
        >
          <p className="text-sm text-blue-400 font-medium italic">
            &quot;A perfect match for a {data.persona?.toLowerCase()} interested in {data.interests[0]?.toLowerCase()}!&quot;
          </p>
        </motion.div>
      </div>

      <div className="mt-auto pb-8">
        <Button
          onClick={next}
          className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-900/40"
        >
          See My Roadmap
        </Button>
      </div>
    </OnboardingLayout>
  )
}
