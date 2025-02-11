"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Copy, Check } from 'lucide-react'

interface TranscriptDisplayProps {
  transcript: string
}

export default function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (transcript) {
      try {
        await navigator.clipboard.writeText(transcript)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }
  }

  return (
    <div className="relative bg-gray-100 rounded-lg p-4 mb-4 h-40 overflow-y-auto">
      {transcript ? (
        <>
          <p className="text-sm pr-8">{transcript}</p>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          Your transcript will appear here after converting the recording to text.
        </p>
      )}
    </div>
  )
}
