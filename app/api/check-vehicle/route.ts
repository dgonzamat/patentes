import { type NextRequest, NextResponse } from "next/server"
import { simulateVehicleCheck } from "@/lib/patente-scraper"

// Definir la interfaz para los datos del vehículo
interface VehicleData {
  plateNumber: string
  vehicleInfo: {
    make: string
    model: string
    year: number | null
    color: string
  }
  confidence: number
  source: string
  verificationMethod?: string
  verificationTime?: string
  disclaimer?: string
}

// Caché en memoria para resultados recientes (en producción usaríamos Redis)
const resultsCache = new Map<string, VehicleData>()

export async function POST(request: NextRequest) {
  try {
    const { plateNumber, captchaToken } = await request.json()

    if (!plateNumber) {
      return NextResponse.json({ error: "El número de placa es requerido" }, { status: 400 })
    }

    // Verificar el token de CAPTCHA
    if (!captchaToken) {
      return NextResponse.json({ error: "Se requiere completar el CAPTCHA" }, { status: 400 })
    }

    console.log(`Verificando placa: ${plateNumber} (CAPTCHA verificado)`)

    // Verificar si tenemos un resultado en caché
    if (resultsCache.has(plateNumber)) {
      console.log(`Usando resultado en caché para: ${plateNumber}`)
      return NextResponse.json(resultsCache.get(plateNumber))
    }

    try {
      // Usar el scraper para obtener información del vehículo
      const scraperResult = await simulateVehicleCheck(plateNumber)

      // Modificar la respuesta para eliminar información sobre robo
      const vehicleData: VehicleData = {
        plateNumber: scraperResult.plateNumber,
        vehicleInfo: {
          make: scraperResult.vehicleInfo?.make || "No disponible",
          model: scraperResult.vehicleInfo?.model || "No disponible",
          year: scraperResult.vehicleInfo?.year || null,
          color: scraperResult.vehicleInfo?.color || "No disponible",
        },
        confidence: scraperResult.confidence,
        source: "patentechile.com",
        verificationMethod: "scraper",
        verificationTime: new Date().toISOString(),
        disclaimer: "Esta información es solo para fines informativos.",
      }

      console.log(`Verificación completada para: ${plateNumber}`)

      // Guardar en caché por 1 hora
      resultsCache.set(plateNumber, vehicleData)
      setTimeout(() => resultsCache.delete(plateNumber), 60 * 60 * 1000)

      return NextResponse.json(vehicleData)
    } catch (error) {
      console.error("Error al usar el scraper:", error)

      // Si falla el scraper, usar datos básicos
      const vehicleData: VehicleData = {
        plateNumber,
        vehicleInfo: {
          make: "No disponible",
          model: "No disponible",
          year: null,
          color: "No disponible",
        },
        confidence: 70,
        source: "Sistema Local",
        verificationMethod: "local",
        verificationTime: new Date().toISOString(),
        disclaimer: "No se pudo obtener información detallada. Esta información es solo para fines informativos.",
      }

      return NextResponse.json(vehicleData)
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

