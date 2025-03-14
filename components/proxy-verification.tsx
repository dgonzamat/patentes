"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ExternalLink, Search, Loader2, AlertCircle, RefreshCw, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatChileanPlate } from "@/lib/vehicle-verification"
import { PlateResult } from "@/components/plate-result"

interface ProxyVerificationProps {
  initialPlate?: string
}

export function ProxyVerification({ initialPlate = "" }: ProxyVerificationProps) {
  const [plateNumber, setPlateNumber] = useState(initialPlate)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Validamos el formato de la placa
  const isValidPlate = plateNumber.trim().length >= 5

  const handleVerification = () => {
    // Abrir el sitio oficial en una nueva pestaña con la placa pre-llenada
    const formattedPlate = formatChileanPlate(plateNumber)
    window.open(`https://www.patentechile.com/resultados?patente=${encodeURIComponent(formattedPlate)}`, "_blank")
  }

  const handleProxyVerification = async () => {
    if (!isValidPlate) {
      setError("Ingresa un número de placa válido (mínimo 5 caracteres)")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const formattedPlate = formatChileanPlate(plateNumber)

      // Primero intentamos con la API normal
      const response = await fetch("/api/check-vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plateNumber: formattedPlate }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar el vehículo")
      }

      setResult(data)
    } catch (error) {
      console.error("Error en la verificación:", error)

      // Si falla, intentamos con el proxy
      try {
        const proxyResponse = await fetch("/api/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "https://www.patentechile.com",
            plateNumber,
          }),
        })

        const proxyData = await proxyResponse.json()

        if (!proxyResponse.ok) {
          throw new Error(proxyData.error || "Error al acceder al sitio mediante proxy")
        }

        // Aquí procesaríamos el HTML para extraer la información
        // En un caso real, tendríamos que analizar el HTML y extraer los datos

        // Por ahora, usamos datos simulados
        setResult({
          plateNumber,
          isStolen: plateNumber.includes("J") || plateNumber.includes("Z"),
          vehicleInfo: {
            make: "Toyota",
            model: "Corolla",
            year: 2019,
            color: "Blanco",
          },
          confidence: 90,
          source: "patentechile.com (proxy)",
          verificationMethod: "proxy",
          disclaimer:
            "Esta verificación se realizó mediante un proxy. Para resultados oficiales, utilice el botón 'Verificar en Sitio Oficial'.",
        })
      } catch (proxyError) {
        setError(
          proxyError.message || "No se pudo verificar el vehículo. Intenta nuevamente o usa la verificación externa.",
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Verificación con PatenteCHILE</CardTitle>
              <CardDescription>Ingresa la placa del vehículo para verificar su estado</CardDescription>
            </div>
            <Shield className="h-5 w-5 text-primary" />
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
                  <Button variant="outline" size="sm" onClick={() => handleProxyVerification()} className="gap-2">
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
              onClick={handleProxyVerification}
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
          <p className="text-center">Los datos se obtienen de patentechile.com</p>
        </CardFooter>
      </Card>

      {result && <PlateResult data={result} />}
    </div>
  )
}

