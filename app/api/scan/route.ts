import { type NextRequest, NextResponse } from "next/server"
import Tesseract from "tesseract.js"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    // Convertir la imagen a un buffer
    const buffer = await imageFile.arrayBuffer()
    const imageData = Buffer.from(buffer)

    try {
      console.log("Iniciando reconocimiento OCR con Tesseract.js")

      // Usar Tesseract.js para OCR
      const worker = await Tesseract.createWorker("spa")

      // Configurar para reconocimiento de placas
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
      })

      // Reconocer texto en la imagen
      const { data } = await worker.recognize(imageData)

      // Terminar el worker
      await worker.terminate()

      console.log("Texto reconocido:", data.text)

      // Extraer posible placa del texto reconocido
      const plateNumber = extractPlateNumber(data.text)

      if (!plateNumber) {
        return NextResponse.json({ error: "No se pudo identificar una placa vehicular en la imagen" }, { status: 400 })
      }

      console.log("Placa identificada:", plateNumber)

      // Verificar el estado del vehículo
      const vehicleStatus = await checkVehicleStatus(plateNumber, request)

      return NextResponse.json({
        plateNumber,
        confidence: data.confidence,
        ...vehicleStatus,
      })
    } catch (error) {
      console.error("Error en el procesamiento OCR:", error)
      return NextResponse.json(
        { error: "Error en el procesamiento de la imagen. Intente nuevamente o use la verificación manual." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error en el procesamiento de la solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para extraer el número de placa del texto reconocido
function extractPlateNumber(text: string): string | null {
  // Limpiar el texto
  const cleanText = text.replace(/\s+/g, "").toUpperCase()

  // Patrones comunes de placas chilenas
  const patterns = [
    /[A-Z]{4}[-]?\d{2}/, // ABCD12 o ABCD-12
    /[A-Z]{2}[-]?\d{4}/, // AB1234 o AB-1234
    /[A-Z]{2}[-]?[A-Z]{2}[-]?\d{2}/, // AABB12 o AA-BB-12
  ]

  for (const pattern of patterns) {
    const match = cleanText.match(pattern)
    if (match) {
      return match[0].replace(/-/g, "")
    }
  }

  // Si no se encuentra un patrón específico, buscar cualquier secuencia de letras y números
  const genericMatch = cleanText.match(/[A-Z0-9]{6,7}/)
  return genericMatch ? genericMatch[0] : null
}

// Función para verificar el estado del vehículo
async function checkVehicleStatus(plateNumber: string, request: NextRequest) {
  try {
    // Llamar a nuestra API de verificación
    const response = await fetch(new URL("/api/check-vehicle", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plateNumber }),
    })

    if (!response.ok) {
      throw new Error("Error al verificar el vehículo")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al verificar el vehículo:", error)
    throw error
  }
}

