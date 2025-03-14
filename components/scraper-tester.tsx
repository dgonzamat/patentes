// Modificar el componente para incluir un toggle de simulación

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle, RefreshCw, Code } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatChileanPlate } from "@/lib/vehicle-verification"
import { PlateResult } from "@/components/plate-result"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ScraperTester() {
  const [plateNumber, setPlateNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const [simulationMode, setSimulationMode] = useState(true)

  // Validamos el formato de la placa
  const isValidPlate = plateNumber.trim().length >= 5

  const handleTest = async () => {
    if (!isValidPlate) {
      setError("Ingresa un número de placa válido (mínimo 5 caracteres)")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)
    setRawResponse(null)

    try {
      const formattedPlate = formatChileanPlate(plateNumber)

      const response = await fetch("/api/test-scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plateNumber: formattedPlate,
          simulationMode,
        }),
      })

      const data = await response.json()
      setRawResponse(JSON.stringify(data, null, 2))

      if (!response.ok) {
        throw new Error(data.error || data.message || "Error al ejecutar el scraper")
      }

      if (data.success && data.result) {
        setResult(data.result)
      } else {
        throw new Error("No se obtuvieron resultados válidos")
      }
    } catch (error) {
      console.error("Error en la prueba:", error)
      setError(error.message || "Error al ejecutar la prueba del scraper")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">Prueba del Scraper</CardTitle>
          <CardDescription>Ingresa una placa para probar el funcionamiento del scraper</CardDescription>
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

          <div className="flex items-center space-x-2">
            <Switch id="simulation-mode" checked={simulationMode} onCheckedChange={setSimulationMode} />
            <Label htmlFor="simulation-mode">
              Modo de simulación {simulationMode ? "(activado)" : "(desactivado)"}
            </Label>
          </div>

          {!simulationMode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El modo real intentará acceder a patentechile.com y puede ser bloqueado por Cloudflare.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleTest} className="gap-2 w-fit mt-2">
                  <RefreshCw className="h-4 w-4" />
                  Intentar nuevamente
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button variant="default" onClick={handleTest} disabled={!isValidPlate || isLoading} className="w-full gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code className="h-4 w-4" />}
            Ejecutar Prueba {simulationMode ? "(Simulación)" : "(Real)"}
          </Button>
        </CardContent>
      </Card>

      {result && <PlateResult data={result} />}

      {rawResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Respuesta Completa</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-96">{rawResponse}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

