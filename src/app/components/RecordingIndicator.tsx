import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

interface RecordingIndicatorProps {
  duration: number
  onClear: () => void
}

export default function RecordingIndicator({ duration, onClear }: RecordingIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium">{duration.toString()}s</span>
      <Button variant="outline" size="icon" onClick={onClear}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
