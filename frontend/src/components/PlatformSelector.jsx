"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from "react"
import { useNavigate } from 'react-router-dom'  // Import useNavigate for navigation
import instaLogo from '../assets/instagram.png'  // Import Instagram logo
import youtubeLogo from '../assets/youtube.png'  // Import YouTube logo
import tiktokLogo from '../assets/tiktok.png'    // Import TikTok logo

const platforms = [
  { name: "YouTube", icon: youtubeLogo, route: "/youtube" }, // Add routes for each platform
  { name: "Instagram", icon: instaLogo, route: "/instagram" },
  { name: "TikTok", icon: tiktokLogo, route: "/tiktok" }
]

export default function PlatformSelector() {
  const [activePlatform, setActivePlatform] = useState(0)
  const navigate = useNavigate()  // Initialize navigate function

  const handlePlatformClick = (index) => {
    setActivePlatform(index)
    navigate(platforms[index].route)  // Navigate to the corresponding route
  }

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
              onClick={() => handlePlatformClick(index)}  // Use the click handler
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === activePlatform ? 'bg-red-50' : ''}`}>
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
