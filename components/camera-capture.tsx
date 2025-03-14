"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, FlipHorizontal, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void
  disabled?: boolean
}

export function CameraCapture({ onCapture, disabled = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const isMobile = useMobile()

  useEffect(() => {
    let stream: MediaStream | null = null

    const setupCamera = async () => {
      try {
        setIsLoading(true)

        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true)
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setIsLoading(false)
      }
    }

    setupCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame to the canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL and pass to parent
        const imageSrc = canvas.toDataURL("image/jpeg", 0.8)
        onCapture(imageSrc)
      }
    }
  }

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn("h-full w-full object-cover transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
        />
        <canvas ref={canvasRef} className="hidden" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full w-full flex items-center justify-center">
              <div className="border-2 border-primary rounded-md w-4/5 h-1/3 opacity-70"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        {isMobile && (
          <Button variant="outline" size="icon" onClick={toggleCamera} disabled={isLoading || disabled}>
            <FlipHorizontal className="h-5 w-5" />
            <span className="sr-only">Cambiar cámara</span>
          </Button>
        )}

        <Button
          onClick={captureImage}
          disabled={isLoading || !isCameraReady || disabled}
          className={cn("gap-2", isMobile ? "flex-1 ml-2" : "w-full")}
        >
          <Camera className="h-5 w-5" />
          Capturar imagen
        </Button>
      </div>
    </div>
  )
}

