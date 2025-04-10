"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { motion } from "framer-motion"
import { BackButton } from "../../ui/BackButton"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      setError("Failed to send reset email")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-pink-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <BackButton />
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <p className="text-green-600">Password reset instructions have been sent to your email.</p>
                <Link to="/login" className="text-red-500 hover:text-red-600">
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">
                  Send Reset Link
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link to="/login" className="text-red-500 hover:text-red-600">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

