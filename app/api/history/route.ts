import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { auth } from "@clerk/nextjs"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Consultar historial de escaneos del usuario
    const { rows } = await sql`
      SELECT 
        id, 
        plate_number, 
        is_stolen, 
        scan_date, 
        scan_location,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_color
      FROM scan_history
      WHERE user_id = ${userId}
      ORDER BY scan_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Transformar los resultados al formato esperado por el cliente
    const history = rows.map((row) => ({
      id: row.id,
      plateNumber: row.plate_number,
      isStolen: row.is_stolen,
      scanDate: new Date(row.scan_date).toLocaleString("es-ES"),
      scanLocation: row.scan_location,
      vehicleInfo: {
        make: row.vehicle_make,
        model: row.vehicle_model,
        year: row.vehicle_year,
        color: row.vehicle_color,
      },
    }))

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error al obtener el historial:", error)
    return NextResponse.json({ error: "Error al obtener el historial" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await request.json()
    const { plateNumber, isStolen, scanLocation, vehicleInfo } = data

    // Validar datos requeridos
    if (!plateNumber) {
      return NextResponse.json({ error: "El número de placa es requerido" }, { status: 400 })
    }

    // Guardar el escaneo en la base de datos
    const result = await sql`
      INSERT INTO scan_history (
        user_id,
        plate_number,
        is_stolen,
        scan_date,
        scan_location,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_color
      ) VALUES (
        ${userId},
        ${plateNumber},
        ${isStolen},
        NOW(),
        ${scanLocation || null},
        ${vehicleInfo?.make || null},
        ${vehicleInfo?.model || null},
        ${vehicleInfo?.year || null},
        ${vehicleInfo?.color || null}
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error("Error al guardar el escaneo:", error)
    return NextResponse.json({ error: "Error al guardar el escaneo" }, { status: 500 })
  }
}

