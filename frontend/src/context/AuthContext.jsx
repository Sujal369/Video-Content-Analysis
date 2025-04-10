"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verify token on app load
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  // Function to verify the token with the backend
  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user) // Set user state if token is valid
      } else {
        localStorage.removeItem("authToken") // Remove invalid token
        setUser(null) // Clear user state
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("authToken") // Remove invalid token
      setUser(null) // Clear user state
    } finally {
      setLoading(false)
    }
  }

  // Function to log in the user and store the token
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.token) {
        localStorage.setItem("authToken", data.token) // Store token in local storage
        setUser(data.user) // Set user state
      } else {
        throw new Error(data.error || "Login failed")
      }
    } catch (error) {
      throw error
    }
  }

  // Function to sign up the user and store the token
  const signup = async (username, email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await response.json()
      if (data.token) {
        localStorage.setItem("authToken", data.token) // Store token in local storage
        setUser(data.user) // Set user state
      } else {
        throw new Error(data.error || "Signup failed")
      }
    } catch (error) {
      throw error
    }
  }

  // Function to log out the user and remove the token
  const logout = () => {
    localStorage.removeItem("authToken") // Remove token from local storage
    setUser(null) // Clear user state
  }

  // Function to handle forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        throw new Error("Failed to send reset email")
      }
    } catch (error) {
      throw error
    }
  }

  // Function to handle reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      if (!response.ok) {
        throw new Error("Password reset failed")
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, forgotPassword, resetPassword, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}