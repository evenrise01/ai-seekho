'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useOnboarding } from '@/providers/onboarding-provider'
import { OnboardingLayout } from './layout'
import { Button } from '@/components/ui/button'
import { Check, Star, Zap, GraduationCap, MessageSquarePlus } from 'lucide-react'

export function PaywallScreen() {
  const { setStep } = useOnboarding()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = () => {
    setLoading(true)
    // Mock subscription
    setTimeout(() => {
      setStep(11) // Success screen
    }, 2000)
  }

  const features = [
    { icon: Zap, text: "Access all 1,000+ AI tools" },
    { icon: Star, text: "Personalized roadmaps" },
    { icon: MessageSquarePlus, text: "Request new courses" },
    { icon: GraduationCap, text: "Certificate of completion" }
  ]

  return (
    <OnboardingLayout
      title="Unlock your full potential with Premium."
      currentStep={8}
      totalSteps={8}
    >
      <div className="flex-1 space-y-6">
        {/* Features List */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <f.icon className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm text-gray-300 font-medium">{f.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="space-y-3">
          <button
            onClick={() => setPlan('yearly')}
            className={`w-full p-5 rounded-3xl border-2 text-left transition-all relative ${
              plan === 'yearly' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <div className="absolute -top-3 right-6 bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">Yearly Plan</p>
                <p className={`text-xs ${plan === 'yearly' ? 'text-blue-100' : 'text-gray-500'}`}>
                  ₹1,499 / year (Save 37%)
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl">₹125</p>
                <p className="text-[10px] opacity-60">/ month</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPlan('monthly')}
            className={`w-full p-5 rounded-3xl border-2 text-left transition-all ${
              plan === 'monthly' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">Monthly Plan</p>
                <p className={`text-xs ${plan === 'monthly' ? 'text-blue-100' : 'text-gray-500'}`}>
                  Billed every month
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl">₹199</p>
                <p className="text-[10px] opacity-60">/ month</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-auto pb-8 space-y-4">
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full h-16 text-lg font-bold bg-white text-black hover:bg-gray-100 rounded-3xl"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </Button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full text-sm text-gray-500 hover:text-white transition-colors"
        >
          Continue with limited access
        </button>
      </div>
    </OnboardingLayout>
  )
}
