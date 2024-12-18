"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from "react"

const platforms = [
  { name: "YouTube", icon: "/youtube.svg", active: true },
  { name: "Instagram", icon: "/instagram.svg" },
  { name: "TikTok", icon: "/tiktok.svg" },
  { name: "X", icon: "/x.svg" },
  { name: "Spotify", icon: "/spotify.svg" }
]

export default function PlatformSelector() {
  const [activePlatform, setActivePlatform] = useState(0)

  return (
    <div className="relative w-full max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-center gap-8 overflow-hidden">
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setActivePlatform((prev) => (prev === 0 ? platforms.length - 1 : prev - 1))}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-8">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: index === activePlatform ? 1 : 0.5,
                scale: index === activePlatform ? 1 : 0.8
              }}
              whileHover={{ scale: 0.9 }}
              className="cursor-pointer"
              onClick={() => setActivePlatform(index)}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                index === activePlatform ? 'bg-red-50' : ''
              }`}>
                <img src={platform.icon} alt={platform.name} className="w-8 h-8" />
              </div>
              <p className="text-xs text-center mt-1">{platform.name}</p>
            </motion.div>
          ))}
        </div>
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setActivePlatform((prev) => (prev === platforms.length - 1 ? 0 : prev + 1))}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

