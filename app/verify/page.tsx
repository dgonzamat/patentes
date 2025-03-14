"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, ExternalLink } from "lucide-react"
import { CaptchaVerification } from "@/components/captcha-verification"
import { PlateResult } from "@/components/plate-result"
import { useToast } from "@/hooks/use-toast"

export default function VerifyPage() {
  const [plateNumber, setPlateNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  // Validamos el formato de la placa
  const isValidPlate = plateNumber.trim().length >= 5

  const handleVerification = async () => {
    if (!isValidPlate) {
      toast({
        title: "Error",
        description: "Ingresa un número de placa válido (mínimo 5 caracteres)",
        variant: "destructive",
      })
      return
    }

    if (!isCaptchaVerified) {
      toast({
        title: "Verificación requerida",
        description: "Por favor, completa la verificación de seguridad antes de continuar",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Usar el scraper para obtener información del vehículo
      const response = await fetch("/api/check-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plateNumber,
          captchaToken: "verified", // En producción, usaríamos un token real
        }),
      })

      if (!response.ok) {
        throw new Error("Error al verificar el vehículo")
      }

      const data = await response.json()

      // Modificar la respuesta para eliminar información sobre robo
      const vehicleData = {
        plateNumber: data.plateNumber,
        vehicleInfo: data.vehicleInfo,
        confidence: data.confidence,
        source: data.source,
        verificationMethod: data.verificationMethod,
        disclaimer: "Esta información es solo para fines informativos.",
      }

      setResult(vehicleData)

      // Resetear el CAPTCHA después de una verificación exitosa
      setIsCaptchaVerified(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo verificar el vehículo. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExternalVerification = () => {
    if (!isValidPlate) {
      toast({
        title: "Error",
        description: "Ingresa un número de placa válido antes de verificar externamente",
        variant: "destructive",
      })
      return
    }

    if (!isCaptchaVerified) {
      toast({
        title: "Verificación requerida",
        description: "Por favor, completa la verificación de seguridad antes de continuar",
        variant: "destructive",
      })
      return
    }

    // Abrir el sitio oficial en una nueva pestaña
    window.open(`https://www.patentechile.com/resultados?patente=${encodeURIComponent(plateNumber)}`, "_blank")
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Consultar Patente</CardTitle>
          <CardDescription>Obtén información sobre un vehículo a partir de su patente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CaptchaVerification onVerified={setIsCaptchaVerified} isVerified={isCaptchaVerified} />

          <div className="space-y-2">
            <Input
              placeholder="Ingresa la placa (ej. ABCD12 o AB1234)"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              className="text-center font-medium text-lg"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-center">Formatos aceptados: ABCD12, AB1234, etc.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="default"
              onClick={handleVerification}
              disabled={!isValidPlate || !isCaptchaVerified || isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Consultar Patente
            </Button>

            <Button
              variant="outline"
              onClick={handleExternalVerification}
              disabled={!isValidPlate || !isCaptchaVerified || isLoading}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Verificar Externamente
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <PlateResult data={result} />
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

