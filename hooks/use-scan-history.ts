"use client"

import { useState, useEffect } from "react"

interface HistoryItem {
  id: string
  plateNumber: string
  isStolen: boolean
  scanDate: string
  scanLocation?: string
  vehicleInfo?: {
    make?: string
    model?: string
    year?: number
    color?: string
  }
}

export function useScanHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulating API call to fetch history
        // In a real implementation, this would call your backend API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - in a real app, this would come from your API
        const mockHistory: HistoryItem[] = [
          {
            id: "1",
            plateNumber: "ABC1234",
            isStolen: false,
            scanDate: "22/04/2023 14:30",
            scanLocation: "Av. Insurgentes Sur, CDMX",
            vehicleInfo: {
              make: "Toyota",
              model: "Corolla",
              year: 2019,
              color: "Gris",
            },
          },
          {
            id: "2",
            plateNumber: "XYZ9876",
            isStolen: true,
            scanDate: "20/04/2023 09:15",
            scanLocation: "Paseo de la Reforma, CDMX",
            vehicleInfo: {
              make: "Honda",
              model: "Civic",
              year: 2020,
              color: "Rojo",
            },
          },
          {
            id: "3",
            plateNumber: "DEF5678",
            isStolen: false,
            scanDate: "18/04/2023 16:45",
            scanLocation: "Av. Universidad, CDMX",
            vehicleInfo: {
              make: "Volkswagen",
              model: "Jetta",
              year: 2018,
              color: "Blanco",
            },
          },
        ]

        setHistory(mockHistory)
      } catch (err) {
        console.error("Error fetching history:", err)
        setError("No se pudo cargar el historial. Por favor, intenta de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return {
    history,
    isLoading,
    error,
  }
}

