/**
 * Módulo para la integración con APIs chilenas de verificación de placas
 *
 * Este archivo contiene las funciones necesarias para conectarse a diferentes
 * APIs de verificación de placas vehiculares en Chile.
 */

// Configuración de las APIs (en producción, estos valores deberían estar en variables de entorno)
const API_CONFIG = {
  autofact: {
    baseUrl: "https://api.autofact.cl/v1",
    apiKey: process.env.AUTOFACT_API_KEY || "",
  },
  patenteCl: {
    baseUrl: "https://api.patente.cl/v1",
    apiKey: process.env.PATENTE_CL_API_KEY || "",
  },
  registroCivil: {
    baseUrl: "https://api.registrocivil.cl/vehiculos/v1",
    apiKey: process.env.REGISTRO_CIVIL_API_KEY || "",
  },
}

/**
 * Verifica un vehículo utilizando la API de Autofact
 * @param plateNumber Número de placa del vehículo
 * @returns Información del vehículo
 */
export async function checkVehicleWithAutofact(plateNumber: string) {
  try {
    if (!API_CONFIG.autofact.apiKey) {
      throw new Error("API key de Autofact no configurada")
    }

    const response = await fetch(`${API_CONFIG.autofact.baseUrl}/vehicles/${plateNumber}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_CONFIG.autofact.apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error en la API de Autofact: ${response.status}`)
    }

    const data = await response.json()

    // Transformar la respuesta al formato esperado por nuestra aplicación
    return {
      plateNumber,
      isStolen: data.stolen || false,
      vehicleInfo: {
        make: data.brand || "Desconocido",
        model: data.model || "Desconocido",
        year: data.year || null,
        color: data.color || "Desconocido",
      },
      ...(data.stolen && {
        reportInfo: {
          reportDate: data.stolenDate || "Fecha desconocida",
          reportLocation: data.stolenLocation || "Ubicación desconocida",
        },
      }),
      confidence: 99.0,
      source: "Autofact",
    }
  } catch (error) {
    console.error("Error al verificar con Autofact:", error)
    throw error
  }
}

/**
 * Verifica un vehículo utilizando la API de Patente.cl
 * @param plateNumber Número de placa del vehículo
 * @returns Información del vehículo
 */
export async function checkVehicleWithPatenteCl(plateNumber: string) {
  try {
    if (!API_CONFIG.patenteCl.apiKey) {
      throw new Error("API key de Patente.cl no configurada")
    }

    const response = await fetch(`${API_CONFIG.patenteCl.baseUrl}/consulta`, {
      method: "POST",
      headers: {
        "X-API-Key": API_CONFIG.patenteCl.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patente: plateNumber }),
    })

    if (!response.ok) {
      throw new Error(`Error en la API de Patente.cl: ${response.status}`)
    }

    const data = await response.json()

    // Transformar la respuesta al formato esperado por nuestra aplicación
    return {
      plateNumber,
      isStolen: data.encargoPorRobo || false,
      vehicleInfo: {
        make: data.marca || "Desconocido",
        model: data.modelo || "Desconocido",
        year: data.año || null,
        color: data.color || "Desconocido",
      },
      ...(data.encargoPorRobo && {
        reportInfo: {
          reportDate: data.fechaEncargo || "Fecha desconocida",
          reportLocation: data.lugarEncargo || "Ubicación desconocida",
        },
      }),
      confidence: 98.0,
      source: "Patente.cl",
    }
  } catch (error) {
    console.error("Error al verificar con Patente.cl:", error)
    throw error
  }
}

/**
 * Verifica un vehículo utilizando la API del Registro Civil
 * @param plateNumber Número de placa del vehículo
 * @returns Información del vehículo
 */
export async function checkVehicleWithRegistroCivil(plateNumber: string) {
  try {
    if (!API_CONFIG.registroCivil.apiKey) {
      throw new Error("API key del Registro Civil no configurada")
    }

    const response = await fetch(`${API_CONFIG.registroCivil.baseUrl}/consulta/${plateNumber}`, {
      method: "GET",
      headers: {
        Authorization: `ApiKey ${API_CONFIG.registroCivil.apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error en la API del Registro Civil: ${response.status}`)
    }

    const data = await response.json()

    // Transformar la respuesta al formato esperado por nuestra aplicación
    return {
      plateNumber,
      isStolen: data.encargo || false,
      vehicleInfo: {
        make: data.marca || "Desconocido",
        model: data.modelo || "Desconocido",
        year: data.anio || null,
        color: data.color || "Desconocido",
      },
      ...(data.encargo && {
        reportInfo: {
          reportDate: data.fechaEncargo || "Fecha desconocida",
          reportLocation: data.lugarEncargo || "Ubicación desconocida",
        },
      }),
      confidence: 100.0,
      source: "Registro Civil de Chile",
    }
  } catch (error) {
    console.error("Error al verificar con Registro Civil:", error)
    throw error
  }
}

/**
 * Verifica un vehículo utilizando múltiples APIs, con fallback
 * @param plateNumber Número de placa del vehículo
 * @returns Información del vehículo
 */
export async function checkVehicleWithMultipleApis(plateNumber: string) {
  // Intentar primero con el Registro Civil (fuente oficial)
  try {
    return await checkVehicleWithRegistroCivil(plateNumber)
  } catch (error) {
    console.log("Fallback a Autofact después de error con Registro Civil")

    // Si falla, intentar con Autofact
    try {
      return await checkVehicleWithAutofact(plateNumber)
    } catch (error) {
      console.log("Fallback a Patente.cl después de error con Autofact")

      // Si falla, intentar con Patente.cl
      try {
        return await checkVehicleWithPatenteCl(plateNumber)
      } catch (error) {
        // Si todas las APIs fallan, lanzar error
        throw new Error("No se pudo verificar el vehículo con ninguna API disponible")
      }
    }
  }
}

