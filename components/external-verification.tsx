"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ExternalLink, Search, Loader2, AlertCircle, RefreshCw, Info, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatChileanPlate } from "@/lib/vehicle-verification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface ExternalVerificationProps {
  initialPlate?: string
  onVerificationComplete?: (result: any) => void
}

export function ExternalVerification({ initialPlate = "", onVerificationComplete }: ExternalVerificationProps) {
  const [plateNumber, setPlateNumber] = useState(initialPlate)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  // Validamos el formato de la placa
  const isValidPlate = plateNumber.trim().length >= 5

  const handleVerification = () => {
    // Abrir el sitio oficial en una nueva pestaña con la placa pre-llenada
    const formattedPlate = formatChileanPlate(plateNumber)
    window.open(`https://www.autoseguro.gob.cl/consulta?patente=${encodeURIComponent(formattedPlate)}`, "_blank")
  }

  const handleDirectVerification = async () => {
    if (!isValidPlate) {
      setError("Ingresa un número de placa válido (mínimo 5 caracteres)")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formattedPlate = formatChileanPlate(plateNumber)

      const response = await fetch("/api/check-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plateNumber: formattedPlate }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.plateNumber) {
          // Si tenemos el número de placa, podemos ofrecer verificación externa
          throw new Error(
            `${result.error || "Error al verificar el vehículo"}. Por favor, utilice la verificación externa.`,
          )
        } else {
          throw new Error(result.error || "Error al verificar el vehículo")
        }
      }

      if (result.error) {
        throw new Error(result.error)
      }

      // Si la verificación fue aproximada, mostrar el diálogo informativo
      if (result.verificationMethod === "pattern" && !showInfoDialog) {
        setShowInfoDialog(true)
      }

      if (onVerificationComplete) {
        onVerificationComplete(result)
      }
    } catch (error) {
      console.error("Error en la verificación:", error)
      setError(error.message || "No se pudo verificar el vehículo. Intenta nuevamente o usa la verificación externa.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    handleDirectVerification()
  }

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Verificación de Vehículo</CardTitle>
              <CardDescription>Ingresa la placa del vehículo para verificar su estado</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="text-xs">API Oficial</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Ingresa la placa (ej. JVJV20 o AB1234)"
              value={plateNumber}
              onChange={(e) => {
                setPlateNumber(e.target.value.toUpperCase())
                setError(null)
              }}
              className="text-center font-medium text-lg"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-center">Formatos aceptados: ABCD12, AB1234, etc.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>{error}</span>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Intentar nuevamente
                  </Button>
                  <Button variant="default" size="sm" onClick={handleVerification} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Verificar en sitio oficial
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="default"
              onClick={handleDirectVerification}
              disabled={!isValidPlate || isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Verificar Automáticamente
            </Button>

            <Button
              variant="outline"
              onClick={handleVerification}
              disabled={!isValidPlate || isLoading}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Verificar en Sitio Oficial
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col text-xs text-muted-foreground">
          <p className="text-center">Los datos se obtienen de fuentes oficiales chilenas</p>
        </CardFooter>
      </Card>

      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Información importante
            </DialogTitle>
            <DialogDescription>Acerca de la verificación automática</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p>La verificación automática proporciona resultados aproximados basados en patrones conocidos.</p>
            <p>
              Para obtener información oficial y actualizada, recomendamos utilizar la opción "Verificar en Sitio
              Oficial" que lo redirigirá al sitio web gubernamental.
            </p>
            <p className="font-medium">
              Esta información es solo para fines informativos y no debe considerarse como verificación legal.
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Entendido</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

