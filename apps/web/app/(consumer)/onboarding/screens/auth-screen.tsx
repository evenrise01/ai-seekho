'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from '@/providers/onboarding-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Smartphone, Mail, ChevronRight } from 'lucide-react'

export function AuthScreen() {
  const { next, updateData } = useOnboarding()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 10) return
    setStep('otp')
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock OTP verification
    setTimeout(() => {
      updateData({ phoneNumber: phone })
      next()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col p-8 pt-20">
      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-12">
              <div className="w-16 h-16 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Smartphone className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Get started with your phone number.
              </h2>
              <p className="text-gray-400">
                We&apos;ll send a code to verify your account.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                <Input
                  type="tel"
                  placeholder="00000 00000"
                  className="h-16 pl-14 text-xl bg-white/5 border-white/10 rounded-2xl focus:ring-blue-500/50 text-white"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={phone.length < 10}
                className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="mt-auto pb-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-4 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <Mail className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-12">
              <div className="w-16 h-16 bg-purple-600/20 rounded-3xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Mail className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Verify it&apos;s you.
              </h2>
              <p className="text-gray-400">
                Enter the 4-digit code sent to +91 {phone}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex justify-between gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="h-16 text-center text-2xl font-bold bg-white/5 border-white/10 rounded-2xl focus:ring-purple-500/50 text-white"
                    value={otp[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      if (val) {
                        const newOtp = otp.split('')
                        newOtp[i] = val
                        setOtp(newOtp.join(''))
                        // Auto focus next
                        if (i < 3) {
                          const nextEl = e.currentTarget.nextElementSibling as HTMLInputElement
                          nextEl?.focus()
                        }
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) {
                        const prevEl = e.currentTarget.previousElementSibling as HTMLInputElement
                        prevEl?.focus()
                      }
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={otp.length < 4 || loading}
                className="w-full h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 rounded-2xl"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
              
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-sm text-gray-500 hover:text-white"
              >
                Change phone number
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
