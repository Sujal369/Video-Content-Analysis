import { useState } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Header from "./components/Header"
import Home from "./components/Home"
import Footer from "./components/Footer"
import Instagram from "./components/Instagram"
import Tiktok from "./components/Tiktok"
import { Error404 } from "./components/Error404"
import Login from "./components/auth/login"
import Signup from "./components/auth/signup"
import ForgotPassword from "./components/auth/forgot-password"
import DetailedAnalysis from "./components/DetailedAnalysis"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return <div>Loading...</div>
  }
  if (!user) {
    return <Navigate to="/login" />
  }
  return children
}

function AppContent() {
  const [analysisData, setAnalysisData] = useState({
    chartData: null,
    loading: false,
    metadata: null,
  })
  const location = useLocation()
  const { loading } = useAuth()

  const handleAnalyze = (data) => {
    console.log("Received in App:", data)
    setAnalysisData({
      chartData: data.chartData,
      loading: data.loading,
      metadata: data.metadata,
    })
  }

  const hiddenRoutes = ["/instagram", "/tiktok", "/login", "/signup", "/forgot-password"]
  const isErrorPage = ![
    "/",
    "/youtube",
    "/instagram",
    "/tiktok",
    "/login",
    "/signup",
    "/forgot-password",
    "/detailed-analysis",
  ].includes(location.pathname)
  const hideHeaderFooter = hiddenRoutes.includes(location.pathname) || isErrorPage

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {!hideHeaderFooter && <Header />}

      <Routes>
        <Route path="/" element={<Home onAnalyze={handleAnalyze} />} />
        <Route path="/youtube" element={<Home onAnalyze={handleAnalyze} />} />
        <Route path="/instagram" element={<Instagram />} />
        <Route path="/tiktok" element={<Tiktok />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/detailed-analysis"
          element={
            <ProtectedRoute>
              <DetailedAnalysis />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Routes>

      {!hideHeaderFooter && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

