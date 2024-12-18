import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export default function VideoMetadata({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Title Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold">Current Title</h3>
            <p className="text-muted-foreground">{data?.currentTitle || 'No title available'}</p>
            <h3 className="font-semibold">Suggested Titles</h3>
            <ul className="list-disc pl-4">
              {data?.suggestedTitles?.map((title, i) => (
                <li key={i} className="text-muted-foreground">{title}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Description Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-muted-foreground">{data?.description || 'No description available'}</p>
            <h3 className="font-semibold">Key Points</h3>
            <ul className="list-disc pl-4">
              {data?.keyPoints?.map((point, i) => (
                <li key={i} className="text-muted-foreground">{point}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {data?.tags?.map((tag, i) => (
                <span key={i} className="rounded-full bg-secondary px-2 py-1 text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="font-semibold mt-4">Suggested Tags</h3>
            <div className="flex flex-wrap gap-2">
              {data?.suggestedTags?.map((tag, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-2 py-1 text-sm text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

