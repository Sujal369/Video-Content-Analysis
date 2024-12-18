'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { fadeIn } from '../ui/motion'
import VideoMetadata from './VideoMetadata'
import SentimentAnalysis from './SentimentAnalysis'
import ChannelGrowth from './ChannelGrowth'
import KeywordOptimization from './KeywordOptimization'
import PlatformSelector from './PlatformSelector'

export default function Home() {
  const [analysisData, setAnalysisData] = useState(null)

  return (
    <motion.main 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PlatformSelector />
      
      <AnimatePresence mode="wait">
        {analysisData ? (
          <motion.div
            key="analysis"
            {...fadeIn}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue="metadata" className="space-y-4">
              <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
                {['metadata', 'sentiment', 'growth', 'keywords'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="metadata">
                <VideoMetadata data={analysisData?.metadata} />
              </TabsContent>
              <TabsContent value="sentiment">
                <SentimentAnalysis data={analysisData?.sentiment} />
              </TabsContent>
              <TabsContent value="growth">
                <ChannelGrowth data={analysisData?.growth} />
              </TabsContent>
              <TabsContent value="keywords">
                <KeywordOptimization data={analysisData?.keywords} />
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            {...fadeIn}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Welcome to YouTube Video Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Enter a YouTube video or channel URL above to begin your comprehensive analysis.
                  Get insights about your content performance, audience engagement, and optimization opportunities.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Views Analysis', 'Engagement Metrics', 'Audience Insights', 'SEO Optimization'].map((feature) => (
                    <Card key={feature} className="p-4">
                      <p className="text-sm font-medium text-center">{feature}</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  )
}

