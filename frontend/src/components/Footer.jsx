import { motion } from 'framer-motion'
import { Github, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <motion.footer 
      className="border-t bg-gradient-to-r from-red-50 to-pink-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-600 hover:text-red-500 transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-600 hover:text-red-500 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-600 hover:text-red-500 transition-colors"
            >
              <Github className="h-5 w-5" />
            </motion.a>
          </div>
          <p className="text-center text-sm text-gray-600">
            YouTube Video Analyzer - Powered by Hugging Face and OpenAI
          </p>
          <p className="text-center text-xs text-gray-500">
            © 2024 All rights reserved
          </p>
        </div>
      </div>
    </motion.footer>
  )
}

