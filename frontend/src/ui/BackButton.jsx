import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "./button"

export function BackButton() {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
      onClick={() => navigate("/")}
    >
      <ArrowLeft className="h-6 w-6" />
      <span className="sr-only">Back to home</span>
    </Button>
  )
}

