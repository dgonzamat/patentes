// Modificar la ruta existente para incluir un modo de simulación

import { type NextRequest, NextResponse } from "next/server"
import { PatenteChileScraper, simulateVehicleCheck } from "@/lib/patente-scraper"

export async function POST(request: NextRequest) {
  let scraper = null

  try {
    const { plateNumber, simulationMode } = await request.json()

    if (!plateNumber) {
      return NextResponse.json({ error: "El número de placa es requerido" }, { status: 400 })
    }

    // Si se solicita modo de simulación, usar datos simulados
    if (simulationMode) {
      console.log(`Usando modo de simulación para la placa: ${plateNumber}`)

      const startTime = Date.now()
      const result = await simulateVehicleCheck(plateNumber)
      const endTime = Date.now()

      return NextResponse.json({
        success: true,
        result,
        executionTime: `${endTime - startTime}ms`,
        timestamp: new Date().toISOString(),
        mode: "simulation",
      })
    }

    // Si no, intentar con el scraper real
    console.log(`Iniciando prueba del scraper para la placa: ${plateNumber}`)

    scraper = new PatenteChileScraper(true)
    await scraper.initialize()

    const startTime = Date.now()
    const result = await scraper.searchByPlate(plateNumber)
    const endTime = Date.now()

    return NextResponse.json({
      success: true,
      result,
      executionTime: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString(),
      mode: "real",
    })
  } catch (error) {
    console.error("Error en la prueba del scraper:", error)

    return NextResponse.json(
      {
        error: "Error al ejecutar el scraper",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  } finally {
    if (scraper) {
      await scraper.close()
    }
  }
}

