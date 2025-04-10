import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { MotionHeader } from "../ui/motion"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { Link, useNavigate } from "react-router-dom"

export default function Header({ onAnalyze }) {
  const [url, setUrl] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [noData, setNoData] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ... rest of your existing code ...

  return (
    <MotionHeader
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b bg-gradient-to-r from-red-50 to-pink-50"
    >
      <div className="container mx-auto px-4 py-6 relative flex flex-col items-center">
        <motion.div
          className="flex flex-col gap-6 items-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center w-full justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                Video Content Analyzer
              </h1>
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:gap-4 mt-4 lg:mt-0">
              {user ? (
                <>
                  <span className="text-gray-600">Hello, {user.username}!</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500 hover:bg-red-50"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500 hover:bg-red-50"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-pink-500 border-pink-500 hover:bg-pink-50"
                    onClick={() => navigate("/signup")}
                  >
                    SignUp
                  </Button>
                </>
              )}
            </div>
          </div>
          {/* ... rest of your existing JSX ... */}
        </motion.div>
      </div>
    </MotionHeader>
  )
}

