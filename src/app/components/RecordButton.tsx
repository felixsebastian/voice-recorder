import { Button } from "@/components/ui/button"
import { Mic, Pause, Square } from "lucide-react"

interface RecordButtonProps {
  isRecording: boolean
  isPaused: boolean
  onRecord: () => void
  onPause: () => void
  onStop: () => void
}

export default function RecordButton({ isRecording, isPaused, onRecord, onPause, onStop }: RecordButtonProps) {
  if (!isRecording) {
    return (
      <Button onClick={onRecord} className="w-full mb-4">
        <Mic className="mr-2 h-4 w-4" /> Record
      </Button>
    )
  }

  return (
    <div className="flex justify-between mb-4">
      <Button onClick={onPause} variant="outline" className="flex-1 mr-2">
        {isPaused ? <Mic className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
        {isPaused ? "Resume" : "Pause"}
      </Button>
      <Button onClick={onStop} variant="destructive" className="flex-1 ml-2">
        <Square className="mr-2 h-4 w-4" /> Stop
      </Button>
    </div>
  )
}

