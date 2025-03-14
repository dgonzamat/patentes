/**
 * Módulo para la verificación de vehículos robados utilizando el sitio
 * oficial del gobierno de Chile: https://www.autoseguro.gob.cl/
 */

// Función para verificar si un vehículo está reportado como robado
// utilizando web scraping del sitio oficial
export async function checkVehicleStatus(plateNumber: string) {
  try {
    // En un entorno de producción, esta solicitud debería hacerse desde el servidor
    // para evitar problemas de CORS y proteger la lógica de negocio
    const response = await fetch("/api/check-vehicle", {
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
    console.error("Error al verificar el estado del vehículo:", error)
    throw error
  }
}

// Función para formatear el número de placa según el formato chileno
export function formatChileanPlate(plateNumber: string): string {
  // Eliminar espacios y guiones
  const cleaned = plateNumber.replace(/[\s-]/g, "").toUpperCase()

  // Aplicar formato según el patrón
  if (/^[A-Z]{4}\d{2}$/.test(cleaned)) {
    // Formato LLLL-NN
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  } else if (/^[A-Z]{2}\d{4}$/.test(cleaned)) {
    // Formato LL-NNNN
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
  }

  // Si no coincide con los formatos conocidos, devolver sin cambios
  return cleaned
}

// Función para validar el formato de una placa chilena
export function isValidChileanPlate(plateNumber: string): boolean {
  // Para la demostración, aceptamos cualquier formato con al menos 5 caracteres
  return plateNumber.trim().length >= 5
}

