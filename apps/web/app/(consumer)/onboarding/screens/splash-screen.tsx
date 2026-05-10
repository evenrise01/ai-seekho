'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOnboarding } from '@/providers/onboarding-provider'
import Image from 'next/image'

export function SplashScreen() {
  const { next } = useOnboarding()

  useEffect(() => {
    const timer = setTimeout(() => {
      next()
    }, 3000)
    return () => clearTimeout(timer)
  }, [next])

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-48 h-48 mb-8"
      >
        <Image
          src="/ai_seekho_logo_premium_1778318179449.png"
          alt="AI Seekho Logo"
          fill
          className="object-contain"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Seekho
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-xs mx-auto">
          1,000+ AI tools, curated for your career.
        </p>
      </motion.div>

      {/* Subtle loader */}
      <motion.div
        className="absolute bottom-12 w-12 h-1 bg-gray-800 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="h-full bg-blue-500"
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  )
}
