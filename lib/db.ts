import { sql } from "@vercel/postgres"

// Función para inicializar la base de datos
export async function initDatabase() {
  try {
    // Crear tabla de historial de escaneos
    await sql`
      CREATE TABLE IF NOT EXISTS scan_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        plate_number TEXT NOT NULL,
        is_stolen BOOLEAN NOT NULL DEFAULT FALSE,
        scan_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        scan_location TEXT,
        vehicle_make TEXT,
        vehicle_model TEXT,
        vehicle_year INTEGER,
        vehicle_color TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `

    // Crear índices para mejorar el rendimiento
    await sql`
      CREATE INDEX IF NOT EXISTS scan_history_user_id_idx ON scan_history(user_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS scan_history_plate_number_idx ON scan_history(plate_number)
    `

    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    throw error
  }
}

// Función para obtener estadísticas generales
export async function getGlobalStats() {
  try {
    const totalScans = await sql`SELECT COUNT(*) as total FROM scan_history`
    const stolenVehicles = await sql`SELECT COUNT(*) as total FROM scan_history WHERE is_stolen = true`

    return {
      totalScans: Number.parseInt(totalScans.rows[0].total),
      stolenVehicles: Number.parseInt(stolenVehicles.rows[0].total),
    }
  } catch (error) {
    console.error("Error al obtener estadísticas globales:", error)
    throw error
  }
}

