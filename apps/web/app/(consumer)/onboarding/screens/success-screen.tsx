'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export function SuccessScreen() {
  const handleGetStarted = () => {
    window.location.href = '/'
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20 
        }}
        className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/20"
      >
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          You&apos;re all set!
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-xs mx-auto">
          Welcome to the AI revolution. Let&apos;s start learning.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs"
      >
        <Button
          onClick={handleGetStarted}
          className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl"
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  )
}
