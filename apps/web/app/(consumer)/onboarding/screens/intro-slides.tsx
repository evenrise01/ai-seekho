'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from '@/providers/onboarding-provider'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const slides = [
  {
    id: 1.1,
    heading: "Learn any AI tool in 15 minutes.",
    subtext: "Bite-sized lessons on the tools that matter for your career growth.",
    visual: "/ai_tool_tiles_wall_1778318712261.png",
    visualType: 'wall'
  },
  {
    id: 1.2,
    heading: "Step-by-step career roadmaps.",
    subtext: "Master AI for your specific role—from PMs to HR and beyond.",
    visualType: 'carousel'
  },
  {
    id: 1.3,
    heading: "Request any AI tool.",
    subtext: "Can't find a tool? Request it, and we'll build a roadmap for you.",
    visualType: 'social'
  }
]

export function IntroSlides() {
  const { next, setStep } = useOnboarding()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 4000) // 4 seconds per slide (3 + transition)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[currentSlide]!

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Visual Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            {slide.visualType === 'wall' && (
              <div className="relative w-full h-full max-h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={slide.visual!}
                  alt="AI Tools Wall"
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
              </div>
            )}

            {slide.visualType === 'carousel' && (
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                {['Product Manager', 'HR Manager', 'Marketer', 'Designer'].map((role, i) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center"
                  >
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-5 h-5 bg-blue-500 rounded-full" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">{role}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {slide.visualType === 'social' && (
              <div className="space-y-3 w-full max-w-xs">
                {[
                  { user: "Sarah K.", text: "Can you add a course on Perplexity?" },
                  { user: "David L.", text: "Need a roadmap for AI in Sales." },
                  { user: "Alex M.", text: "Requesting Claude 3.5 Sonnet guide!" }
                ].map((req, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl flex gap-3 items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-500/30 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-purple-400 font-bold">{req.user}</p>
                      <p className="text-xs text-gray-300">{req.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="p-8 pb-12 bg-gradient-to-t from-black via-black to-transparent">
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {slide.heading}
              </h2>
              <p className="text-gray-400 text-sm">
                {slide.subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="flex gap-1.5 mb-10">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-4">
          <Button
            onClick={next}
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-900/20"
          >
            Get Started
          </Button>
          <Button
            onClick={() => {}}
            variant="ghost"
            className="w-full h-12 text-gray-400 hover:text-white"
          >
            Login
          </Button>
          
          <p className="text-[10px] text-gray-600 text-center px-4">
            By continuing, I agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
