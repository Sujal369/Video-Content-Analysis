import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog"
import jsPDF from "jspdf" // Import jsPDF for PDF generation

ChartJS.register(ArcElement, Tooltip, Legend)

// Animation variants for smooth transitions
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}

export default function DetailedAnalysis() {
  const { user } = useAuth()
  const [analysisData, setAnalysisData] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [activeAnalysis, setActiveAnalysis] = useState(null) // Track active analysis
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null) // Track selected history item for dialog
  const chartRef = useRef(null)

  useEffect(() => {
    const fetchDetailedAnalysis = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch("http://localhost:5000/api/detailed-analysis", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch analysis data")
        }
        const data = await response.json()
        setAnalysisData(data.data[0])
        setSearchHistory(data.data)
        setActiveAnalysis(data.data[0]) // Set initial active analysis to the most recent one
      } catch (error) {
        console.error("Failed to fetch detailed analysis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetailedAnalysis()
  }, [])

  const deleteHistoryItem = async (id) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`http://localhost:5000/api/delete-analysis/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to delete history item")
      }
      setSearchHistory(searchHistory.filter((item) => item._id !== id))
      if (activeAnalysis?._id === id) {
        setActiveAnalysis(null) // Clear active analysis if the deleted item is being displayed
      }
    } catch (error) {
      console.error("Failed to delete history item:", error)
    }
  }

  const handleHistoryItemClick = (item) => {
    setSelectedHistoryItem(item) // Open the dialog for the clicked item
    setActiveAnalysis(null) // Clear the main view
  }

  const handleDialogClose = () => {
    setSelectedHistoryItem(null) // Close the dialog
    setActiveAnalysis(analysisData) // Restore the recent search analysis
  }

  const downloadPDF = (analysis) => {
    const doc = new jsPDF()

    // Set font and title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("Video Analysis Report", 10, 20)

    // Add metadata
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Title: ${analysis.metadata.title}`, 10, 30)
    doc.text(`Channel: ${analysis.metadata.author}`, 10, 40)
    doc.text(`Views: ${analysis.metadata.views}`, 10, 50)
    doc.text(`Likes: ${analysis.metadata.likes}`, 10, 60)
    doc.text(`Subscribers: ${analysis.metadata.subscribers}`, 10, 70)
    doc.text(`Description: ${analysis.metadata.description}`, 10, 80)

    // Add sentiment distribution
    doc.setFont("helvetica", "bold")
    doc.text("Sentiment Analysis", 10, 100)
    doc.setFont("helvetica", "normal")
    analysis.sentiment_distribution.forEach((item, index) => {
      doc.text(`${item.sentiment}: ${item.value}%`, 10, 110 + index * 10)
    })

    // Add title suggestions
    doc.setFont("helvetica", "bold")
    doc.text("Title Suggestions", 10, 150)
    doc.setFont("helvetica", "normal")
    analysis.title_suggestions.forEach((title, index) => {
      doc.text(`${index + 1}. ${title}`, 10, 160 + index * 10)
    })

    // Add summary
    doc.setFont("helvetica", "bold")
    doc.text("Video Summary & Improvement Tips", 10, 200)
    doc.setFont("helvetica", "normal")
    const splitSummary = doc.splitTextToSize(analysis.summary, 180)
    doc.text(splitSummary, 10, 210)

    // Save the PDF
    doc.save(`video_analysis_report_${analysis.metadata.title}.pdf`)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial="hidden" animate="visible" exit="exit" variants={fadeIn} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Detailed Analysis for {user?.username}
        </h1>

        {/* Display Active Analysis (Main View) */}
        <AnimatePresence mode="wait">
          {activeAnalysis && (
            <motion.div
              key="active-analysis"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            >
              {/* Sentiment Analysis Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Pie
                      data={{
                        labels: activeAnalysis.sentiment_distribution.map((item) => item.sentiment),
                        datasets: [
                          {
                            data: activeAnalysis.sentiment_distribution.map((item) => item.value),
                            backgroundColor: [
                              "rgba(76, 175, 80, 0.8)",
                              "rgba(244, 67, 54, 0.8)",
                              "rgba(255, 193, 7, 0.8)",
                            ],
                            borderColor: ["#4CAF50", "#F44336", "#FFC107"],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                      ref={chartRef}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Video Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Title</h3>
                    <p className="text-gray-600">{activeAnalysis.metadata.title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Channel</h3>
                    <p className="text-gray-600">{activeAnalysis.metadata.author}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Views</h3>
                      <p className="text-gray-600">{activeAnalysis.metadata.views}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Likes</h3>
                      <p className="text-gray-600">{activeAnalysis.metadata.likes}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Subscribers</h3>
                      <p className="text-gray-600">{activeAnalysis.metadata.subscribers}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Description</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{activeAnalysis.metadata.description}</p>
                  </div>
                  {/* Download PDF Button */}
                  <Button onClick={() => downloadPDF(activeAnalysis)} className="mt-4">
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              {/* Title Suggestions and Summary */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Title Suggestions & Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Title Suggestions */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-4">Title Suggestions</h3>
                      <ul className="space-y-2">
                        {activeAnalysis.title_suggestions?.map((title, index) => (
                          <li key={index} className="text-gray-600">
                            {index + 1}. {title}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: Summary & Improvements */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-4">Video Summary & Improvement Tips</h3>
                      <p className="text-gray-600 whitespace-pre-line">{activeAnalysis.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search History */}
        <div className="mt-8">
          <Button onClick={() => setShowHistory(!showHistory)} className="mb-4">
            {showHistory ? "Hide Search History" : "Show Search History"}
          </Button>

          <AnimatePresence mode="wait">
            {showHistory && (
              <motion.div
                key="search-history"
                variants={scaleUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Search History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchHistory.length > 0 ? (
                      <ul className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <motion.li
                            key={index}
                            className="flex justify-between items-center"
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <span
                              className="cursor-pointer hover:text-red-500"
                              onClick={() => handleHistoryItemClick(item)}
                            >
                              {item.metadata.title}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => deleteHistoryItem(item._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => downloadPDF(item)}>
                                Download PDF
                              </Button>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <p>No search history available.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Dialog for Selected History Item */}
      <Dialog open={!!selectedHistoryItem} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedHistoryItem?.metadata?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Sentiment Analysis Card */}
            {selectedHistoryItem?.sentiment_distribution?.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Pie
                      data={{
                        labels: selectedHistoryItem.sentiment_distribution.map((item) => item.sentiment),
                        datasets: [
                          {
                            data: selectedHistoryItem.sentiment_distribution.map((item) => item.value),
                            backgroundColor: [
                              "rgba(76, 175, 80, 0.8)",
                              "rgba(244, 67, 54, 0.8)",
                              "rgba(255, 193, 7, 0.8)",
                            ],
                            borderColor: ["#4CAF50", "#F44336", "#FFC107"],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No sentiment analysis data available.</p>
                </CardContent>
              </Card>
            )}

            {/* Video Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Title</h3>
                  <p className="text-gray-600">{selectedHistoryItem?.metadata?.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Channel</h3>
                  <p className="text-gray-600">{selectedHistoryItem?.metadata?.author}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Views</h3>
                    <p className="text-gray-600">{selectedHistoryItem?.metadata?.views}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Likes</h3>
                    <p className="text-gray-600">{selectedHistoryItem?.metadata?.likes}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Subscribers</h3>
                    <p className="text-gray-600">{selectedHistoryItem?.metadata?.subscribers}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedHistoryItem?.metadata?.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Title Suggestions and Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Title Suggestions & Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Title Suggestions */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Title Suggestions</h3>
                    <ul className="space-y-2">
                      {selectedHistoryItem?.title_suggestions?.map((title, index) => (
                        <li key={index} className="text-gray-600">
                          {index + 1}. {title}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Summary & Improvements */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4">Video Summary & Improvement Tips</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedHistoryItem?.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}