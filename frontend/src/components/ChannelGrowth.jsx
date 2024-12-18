'use client'

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer } from "../ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function ChannelGrowth({ data }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.subscriberGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="hsl(var(--primary))" 
                  name="Subscribers"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topVideos?.map((video, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-20 w-36 overflow-hidden rounded-md">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium line-clamp-2">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.insights?.map((insight, i) => (
                <div key={i} className="space-y-1">
                  <h3 className="font-medium">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

