"use client"

import { useState } from "react"

interface PlateData {
  plateNumber: string
  isStolen: boolean
  vehicleInfo?: {
    make?: string
    model?: string
    year?: number
    color?: string
  }
  reportInfo?: {
    reportDate?: string
    reportLocation?: string
  }
  confidence: number
}

export function usePlateScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [plateData, setPlateData] = useState<PlateData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scanPlate = async (imageSrc: string) => {
    setIsScanning(true)
    setError(null)

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
      setPlateData(data)
    } catch (err) {
      console.error("Error scanning plate:", err)
      setError("Ocurrió un error al procesar la imagen. Por favor, intenta de nuevo.")
    } finally {
      setIsScanning(false)
    }
  }

  const resetScan = () => {
    setPlateData(null)
    setError(null)
  }

  return {
    scanPlate,
    resetScan,
    isScanning,
    plateData,
    error,
  }
}

