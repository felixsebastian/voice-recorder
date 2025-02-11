"use client"

import { useState, useRef, useEffect } from "react"
import RecordButton from "./components/RecordButton"
import TranscriptDisplay from "./components/TranscriptDisplay"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileAudio, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import RecordingIndicator from "./components/RecordingIndicator"
import { getAudioDuration } from "@/lib/getAudioDuration"
import { useOnlineState } from "@/lib/useOnlineState"

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [playbackState, setPlaybackState] = useState<"READY" | "PLAYING" | "PAUSED">("READY")
  const [microphoneError, setMicrophoneError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const isOnline = useOnlineState()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const updateDuration = async () => {
      const duration = await getAudioDuration(audioBlob)
      setDuration(duration)
    }

    updateDuration()
  }, [audioBlob])

  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      startRecording()
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)
        chunksRef.current = []
      }

      mediaRecorder.start()
      setMicrophoneError(null)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setMicrophoneError("Microphone access is required for recording. Please allow access and try again.")
      setIsRecording(false)
      setPlaybackState("READY")
    }
  }

  const handleRecord = () => {
    setIsRecording(true)
    setPlaybackState("READY")
    setMicrophoneError(null)
  }

  const handlePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (playbackState === "PAUSED") {
        mediaRecorderRef.current.resume()
        setPlaybackState("PLAYING")
      } else {
        mediaRecorderRef.current.pause()
        setPlaybackState("PAUSED")
      }
    }
  }

  const handleStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setPlaybackState("READY")
    }
  }

  const handleConvertToText = async () => {
    if (!audioBlob) throw Error()
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    setIsPending(true)

    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result?.toString().split(",")[1];
        if (!base64Audio) return console.error("Failed to encode audio");

        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioContent: base64Audio }),
        });

        const data = await response.json();
        setTranscript(data.transcript);
      } catch {
        alert("Failed to convert to texct")
      } finally {
        setIsPending(false)
      }
    };
  }

  const handlePlay = () => {
    if (audioBlob) {
      setPlaybackState("PLAYING")
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.onended = () => setPlaybackState("READY")
      audio.play()
    }
  }

  const handleClear = () => {
    setAudioBlob(null)
    setTranscript("")
    setDuration(0)
    setPlaybackState("READY")
    setIsRecording(false)
    mediaRecorderRef.current = null
    chunksRef.current = []
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Voice Recorder</h1>
        {microphoneError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{microphoneError}</AlertDescription>
          </Alert>
        )}
        {!isOnline && (
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Network offline</AlertTitle>
            <AlertDescription>You are currently offline. You can still record, but text conversion will be disabled until you are back online.</AlertDescription>
          </Alert>
        )}
        <RecordButton
          isRecording={isRecording}
          isPaused={playbackState === "PAUSED"}
          onRecord={handleRecord}
          onPause={handlePause}
          onStop={handleStop}
        />
        {audioBlob && <div className="flex justify-between mb-4 gap-4">
          <Button onClick={handlePlay} disabled={!audioBlob || playbackState === "PLAYING"} variant="outline" className="flex-1">
            <Play className="h-4 w-4" /> Play
          </Button>
          <Button onClick={handleConvertToText} disabled={isPending || !audioBlob || !isOnline} className="flex-1">
            <FileAudio className="h-4 w-4" /> {isPending ? `Converting...` : `Convert to Text`}
          </Button>
          <RecordingIndicator duration={duration} onClear={handleClear} />
        </div>}
        <TranscriptDisplay transcript={transcript} />
      </div>
    </div>
  )
}

