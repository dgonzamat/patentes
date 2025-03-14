import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VehicleInfo {
  make?: string
  model?: string
  year?: number | null
  color?: string
}

interface PlateData {
  plateNumber: string
  vehicleInfo?: VehicleInfo
  confidence: number
  source?: string
  verificationMethod?: string
  disclaimer?: string
}

interface PlateResultProps {
  data: PlateData
}

export function PlateResult({ data }: PlateResultProps) {
  const { plateNumber, vehicleInfo, confidence, source, verificationMethod, disclaimer } = data

  // Formatear el número de placa con guión si tiene el formato correcto
  const formattedPlate = plateNumber.length === 6 ? `${plateNumber.slice(0, 4)}-${plateNumber.slice(4)}` : plateNumber

  return (
    <Card className="border-0 bg-blue-50 dark:bg-blue-950/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="text-3xl font-bold mb-4">{formattedPlate}</div>

          <div className="bg-blue-500 text-white py-2 px-4 rounded-full flex items-center gap-2 w-full justify-center mb-2">
            <span className="font-medium">Información del Vehículo</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Confianza de lectura: {Math.round(confidence)}%</span>
            {source && source.includes("Oficial") && (
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="text-xs">Fuente Oficial</span>
              </Badge>
            )}
          </div>

          {source && <div className="text-xs text-gray-500 mt-1">Fuente: {source}</div>}
        </div>

        {vehicleInfo && (
          <div className="grid grid-cols-2 gap-y-4 text-base mb-6">
            {vehicleInfo.make && (
              <div>
                <span className="font-medium">Marca:</span> {vehicleInfo.make}
              </div>
            )}
            {vehicleInfo.model && (
              <div>
                <span className="font-medium">Modelo:</span> {vehicleInfo.model}
              </div>
            )}
            {vehicleInfo.year && (
              <div>
                <span className="font-medium">Año:</span> {vehicleInfo.year}
              </div>
            )}
            {vehicleInfo.color && (
              <div>
                <span className="font-medium">Color:</span> {vehicleInfo.color}
              </div>
            )}
          </div>
        )}

        {disclaimer && (
          <Alert
            variant="info"
            className="mt-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs">{disclaimer}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

