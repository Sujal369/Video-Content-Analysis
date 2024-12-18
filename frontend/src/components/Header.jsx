import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { MotionHeader } from "../ui/motion"
import { motion } from "framer-motion"

export default function Header() {
  const [url, setUrl] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    console.log('Analyzing:', url)
  }

  return (
    <MotionHeader
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b bg-gradient-to-r from-red-50 to-pink-50"
    >
      <div className="container mx-auto px-4 py-6">
        <motion.div 
          className="flex flex-col gap-6 items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Search className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              YouTube Analyzer
            </h1>
          </div>
          <form 
            onSubmit={handleAnalyze} 
            className="flex w-full max-w-2xl gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div 
              className="relative flex-1"
              animate={{ scale: isHovered ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                type="url"
                placeholder="Enter YouTube URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-12 h-12 text-lg shadow-sm"
                required
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </motion.div>
            <Button 
              type="submit"
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-lg px-8"
            >
              Analyze
            </Button>
          </form>
        </motion.div>
      </div>
    </MotionHeader>
  )
}

