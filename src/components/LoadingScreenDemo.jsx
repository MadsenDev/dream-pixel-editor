import React, { useState } from 'react'
import { motion } from 'framer-motion'

// A simple demo component to showcase the loading screen animations
const LoadingScreenDemo = () => {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <div className="p-8 bg-neutral-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Dream Pixel Loading Screen Demo
        </h1>
        
        <div className="text-center mb-8">
          <button
            onClick={() => setShowDemo(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 font-medium"
          >
            Show Loading Screen Demo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Features</h2>
            <ul className="space-y-2 text-neutral-300">
              <li>🎨 Real Dream Pixel logo with animated rings</li>
              <li>✨ Gradient text animations</li>
              <li>📊 Progress bar with smooth transitions</li>
              <li>💫 Floating particle effects</li>
              <li>🎯 Pixel art preview animation</li>
              <li>🔄 Loading text transitions</li>
              <li>🌟 Background gradient animations</li>
              <li>💎 Glow effects around logo</li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Technical Details</h2>
            <ul className="space-y-2 text-neutral-300">
              <li>Built with Framer Motion</li>
              <li>Responsive design</li>
              <li>Smooth animations</li>
              <li>Performance optimized</li>
              <li>Accessible transitions</li>
              <li>Customizable timing</li>
              <li>Mobile friendly</li>
            </ul>
          </div>
        </div>

        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-purple-900 to-pink-900 flex items-center justify-center z-50"
          >
            <div className="relative z-10 flex flex-col items-center space-y-8">
              {/* Logo Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2 
                }}
                className="relative"
              >
                {/* Animated rings around the logo */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 w-24 h-24 border-4 border-purple-400/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-2 w-20 h-20 border-4 border-pink-400/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-4 w-16 h-16 border-4 border-purple-400/40 rounded-full"
                />
                
                {/* The actual logo */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.9, 1, 0.9]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10 w-24 h-24 flex items-center justify-center"
                >
                  <img 
                    src="/logo.png" 
                    alt="Dream Pixel Logo" 
                    className="w-16 h-16 drop-shadow-lg"
                  />
                </motion.div>
                
                {/* Glow effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
                />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                <motion.h1
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  Dream Pixel
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-neutral-300 text-lg mt-2"
                >
                  Pixel Art Animation Studio
                </motion.p>
              </motion.div>

              {/* Pixel Art Preview */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="grid grid-cols-4 gap-1 p-4 bg-neutral-800/50 rounded-lg backdrop-blur-sm"
              >
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 1.8 + (i * 0.05),
                      duration: 0.3,
                      ease: "backOut"
                    }}
                  />
                ))}
              </motion.div>

              <button
                onClick={() => setShowDemo(false)}
                className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                Close Demo
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default LoadingScreenDemo
