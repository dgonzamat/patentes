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

    // Obtener estadísticas del usuario
    const totalScans = await sql`
      SELECT COUNT(*) as total FROM scan_history WHERE user_id = ${userId}
    `

    const stolenVehicles = await sql`
      SELECT COUNT(*) as total FROM scan_history 
      WHERE user_id = ${userId} AND is_stolen = true
    `

    const recentActivity = await sql`
      SELECT 
        DATE(scan_date) as date,
        COUNT(*) as count
      FROM scan_history
      WHERE user_id = ${userId} AND scan_date > NOW() - INTERVAL '30 days'
      GROUP BY DATE(scan_date)
      ORDER BY date DESC
    `

    // Obtener estadísticas por ubicación
    const locationStats = await sql`
      SELECT 
        scan_location,
        COUNT(*) as total,
        SUM(CASE WHEN is_stolen THEN 1 ELSE 0 END) as stolen
      FROM scan_history
      WHERE user_id = ${userId} AND scan_location IS NOT NULL
      GROUP BY scan_location
      ORDER BY total DESC
      LIMIT 5
    `

    return NextResponse.json({
      totalScans: Number.parseInt(totalScans.rows[0].total),
      stolenVehicles: Number.parseInt(stolenVehicles.rows[0].total),
      recentActivity: recentActivity.rows.map((row) => ({
        date: row.date,
        count: Number.parseInt(row.count),
      })),
      locationStats: locationStats.rows.map((row) => ({
        location: row.scan_location,
        total: Number.parseInt(row.total),
        stolen: Number.parseInt(row.stolen),
      })),
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}

