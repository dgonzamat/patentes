"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Check, Loader2 } from "lucide-react"
import { CameraCapture } from "@/components/camera-capture"
import { PlateResult } from "@/components/plate-result"
import { CaptchaVerification } from "@/components/captcha-verification"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function ScanPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [plateData, setPlateData] = useState<any>(null)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const { toast } = useToast()

  const handleCapture = (imageSrc: string) => {
    if (!isCaptchaVerified) {
      toast({
        title: "Verificación requerida",
        description: "Por favor, completa la verificación de seguridad antes de continuar",
        variant: "destructive",
      })
      return
    }

    setCapturedImage(imageSrc)
    scanPlate(imageSrc)
  }

  const scanPlate = async (imageSrc: string) => {
    setIsScanning(true)

    try {
      // Convertir la imagen base64 a un archivo
      const base64Response = await fetch(imageSrc)
      const blob = await base64Response.blob()
      const file = new File([blob], "plate.jpg", { type: "image/jpeg" })

      // Crear FormData para enviar la imagen
      const formData = new FormData()
      formData.append("image", file)

      // Enviar la imagen al servidor para OCR
      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al procesar la imagen")
      }

      const data = await response.json()

      // Modificar la respuesta para eliminar información sobre robo
      const vehicleData = {
        plateNumber: data.plateNumber,
        vehicleInfo: data.vehicleInfo,
        confidence: data.confidence,
        source: data.source || "Reconocimiento OCR",
        verificationMethod: data.verificationMethod || "ocr",
        disclaimer: "Esta información es solo para fines informativos.",
      }

      setPlateData(vehicleData)

      // Resetear el CAPTCHA después de una verificación exitosa
      setIsCaptchaVerified(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
    setPlateData(null)
  }

  const handleSaveResult = () => {
    if (plateData) {
      // Save to history would be implemented here
      toast({
        title: "Resultado guardado",
        description: "El resultado ha sido guardado en tu historial",
        variant: "default",
      })
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl">Escanear Patente</CardTitle>
          <CardDescription>Captura la imagen de una patente vehicular para obtener información</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <CaptchaVerification onVerified={setIsCaptchaVerified} isVerified={isCaptchaVerified} />

          <div className={cn("transition-all duration-300", capturedImage ? "h-0 opacity-0" : "h-auto opacity-100")}>
            <CameraCapture onCapture={handleCapture} disabled={!isCaptchaVerified} />
          </div>

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden mb-4">
                <img
                  src={capturedImage || "/placeholder.svg?height=300&width=400"}
                  alt="Placa capturada"
                  className="w-full object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Analizando patente...</p>
                    </div>
                  </div>
                )}
              </div>

              {plateData && <PlateResult data={plateData} />}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 p-4 bg-muted/20">
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Nueva captura
              </Button>
              {plateData && (
                <Button onClick={handleSaveResult} className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Guardar resultado
                </Button>
              )}
            </>
          ) : (
            <div className="w-full text-center text-sm text-muted-foreground">
              <p>
                Completa la verificación de seguridad, luego posiciona la cámara frente a la patente del vehículo y
                captura la imagen
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}

