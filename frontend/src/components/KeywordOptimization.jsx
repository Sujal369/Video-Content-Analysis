import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"

export default function KeywordOptimization({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.topKeywords?.map((keyword, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{keyword.term}</span>
                  <Badge variant="secondary">
                    Score: {keyword.score}
                  </Badge>
                </div>
                <Progress value={keyword.score} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Monthly searches: {keyword.searchVolume.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyword Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.suggestedKeywords?.map((group, i) => (
              <div key={i} className="space-y-2">
                <h3 className="font-medium">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.keywords.map((keyword, j) => (
                    <Badge key={j} variant="outline" className="text-primary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>SEO Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.seoRecommendations?.map((rec, i) => (
              <div key={i} className="space-y-1">
                <h3 className="font-medium">{rec.title}</h3>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                {rec.steps && (
                  <ul className="list-disc pl-4 text-sm text-muted-foreground">
                    {rec.steps.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

