import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { fadeIn } from "../ui/motion"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import PlatformSelector from "./PlatformSelector"
import { Button } from "../ui/button"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Input } from "../ui/input"
import { Search } from "lucide-react"

ChartJS.register(ArcElement, Tooltip, Legend)

export default function Home({ onAnalyze }) {
  const [url, setUrl] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [noData, setNoData] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const chartRef = useRef(null)

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  const validateYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/
    return regex.test(url)
  }

  const handleUrlChange = (e) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setIsValidUrl(validateYouTubeUrl(newUrl))
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setLoading(true)
    setNoData(false)

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("http://127.0.0.1:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoUrl: url }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analysis.")
      }

      const data = await response.json()
      console.log("API Response:", data)

      if (data.success && data.sentimentDistribution.length > 0) {
        const transformedData = {
          labels: data.sentimentDistribution.map((item) => item.sentiment),
          datasets: [
            {
              data: data.sentimentDistribution.map((item) => item.value),
              backgroundColor: ["rgba(76, 175, 80, 0.8)", "rgba(244, 67, 54, 0.8)", "rgba(255, 193, 7, 0.8)"],
              borderColor: ["#4CAF50", "#F44336", "#FFC107"],
              borderWidth: 2,
              hoverOffset: 10,
            },
          ],
        }

        setChartData(transformedData)
        setMetadata(data.metadata)
      } else {
        setNoData(true)
      }
    } catch (error) {
      console.error("Error analyzing:", error)
      setNoData(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.main
      className="container mx-auto px-4 py-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PlatformSelector />

      {user ? (
        <form
          onSubmit={handleAnalyze}
          className="flex flex-col lg:flex-row w-full max-w-2xl gap-2 mx-auto mt-8"
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
              onChange={handleUrlChange}
              className="pr-12 h-12 text-lg shadow-sm"
              required
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </motion.div>
          <Button
            type="submit"
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-lg px-8"
            disabled={loading || !isValidUrl}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </form>
      ) : (
        <div className="text-center mt-8">
          <p className="text-lg mb-4">Please log in to analyze YouTube videos.</p>
          <Button onClick={() => navigate("/login")} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3">
            Log In
          </Button>
        </div>
      )}

      {!isValidUrl && <div className="text-red-500 mt-2 text-center">The input URL is not valid</div>}
      {noData && <div className="text-red-500 mt-2 text-center">Please check your input URL</div>}

      {loading && (
        <motion.div key="loading" {...fadeIn} className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!loading && chartData && (
          <motion.div key="analysis" {...fadeIn} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Sentiment Analysis Section */}
              <div>
                <h2 className="text-center text-2xl font-semibold mb-4">Sentiment Analysis Results</h2>
                <div className="flex justify-center items-center mx-auto max-w-full max-w-lg sm:h-[250px] md:h-[200px] lg:h-[250px]">
                  <Pie
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    ref={chartRef}
                  />
                </div>
              </div>

              {/* Metadata Section */}
              {metadata && (
                <Card className="h-fit bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800">Video Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Title</h3>
                      <p className="text-gray-600">{metadata.title}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Channel</h3>
                      <p className="text-gray-600">{metadata.author}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-700">Views</h3>
                        <p className="text-gray-600">{metadata.views}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">Likes</h3>
                        <p className="text-gray-600">{metadata.likes}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">Subscribers</h3>
                        <p className="text-gray-600">{metadata.subscribers}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Description</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{metadata.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Details Button */}
      {chartData && (
        <motion.div
          className="fixed bottom-8 right-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => (user ? navigate("/detailed-analysis") : navigate("/login"))}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg"
          >
            More Details
          </Button>
        </motion.div>
      )}
    </motion.main>
  )
}

