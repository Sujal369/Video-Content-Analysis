'use client'

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer } from "../ui/chart"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'

export default function SentimentAnalysis({ data }) {
  const sentimentColors = {
    Positive: 'hsl(var(--success))',
    Neutral: 'hsl(var(--warning))',
    Negative: 'hsl(var(--destructive))'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Comment Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.sentimentDistribution}
                  dataKey="value"
                  nameKey="sentiment"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data?.sentimentDistribution?.map((entry, index) => (
                    <Cell key={index} fill={sentimentColors[entry.sentiment]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.topComments?.map((comment, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm text-muted-foreground">{comment.text}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${
                    comment.sentiment === 'Positive' ? 'text-success' :
                    comment.sentiment === 'Negative' ? 'text-destructive' :
                    'text-warning'
                  }`}>
                    {comment.sentiment}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {comment.likes} likes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

