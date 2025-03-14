/**
 * Utilidades para manejar problemas de CORS al realizar solicitudes a sitios externos
 */

// Lista de servicios de proxy CORS públicos
const CORS_PROXIES = [
  "https://api.allorigins.win/get?url=",
  "https://cors-anywhere.herokuapp.com/",
  "https://cors.bridged.cc/",
]

/**
 * Realiza una solicitud a través de un proxy CORS
 * @param url URL a la que se desea acceder
 * @param options Opciones de fetch
 * @returns Respuesta de la solicitud
 */
export async function fetchWithCorsProxy(url: string, options: RequestInit = {}): Promise<Response> {
  // Intentar con cada proxy hasta que uno funcione
  let lastError: Error | null = null

  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl, options)

      if (response.ok) {
        return response
      }
    } catch (error) {
      console.error(`Error con proxy ${proxy}:`, error)
      lastError = error as Error
    }
  }

  // Si todos los proxies fallan, lanzar el último error
  throw lastError || new Error("Todos los proxies CORS fallaron")
}

/**
 * Extrae el contenido HTML de una respuesta de proxy CORS
 * @param response Respuesta del proxy CORS
 * @returns Contenido HTML
 */
export async function extractHtmlFromProxyResponse(response: Response): Promise<string> {
  const data = await response.json()

  // Diferentes proxies devuelven el contenido en diferentes formatos
  if (data.contents) {
    return data.contents // allorigins.win
  } else if (data.data) {
    return data.data // algunos otros proxies
  } else {
    return data // formato desconocido, intentar devolver todo
  }
}

