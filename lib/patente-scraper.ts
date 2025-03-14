/**
 * Módulo para realizar web scraping del sitio patentechile.com
 * Este módulo utiliza Puppeteer para simular un navegador real y evitar bloqueos
 */

import puppeteer, { type Browser, type Page } from "puppeteer"

// Interfaz para los datos del vehículo
export interface VehicleData {
  plateNumber: string
  isStolen: boolean
  vehicleInfo?: {
    make?: string
    model?: string
    year?: number | null
    color?: string
  }
  reportInfo?: {
    reportDate?: string
    reportLocation?: string
  }
  confidence: number
  source: string
}

// Configuración para el scraper
const SCRAPER_CONFIG = {
  baseUrl: "https://www.patentechile.com",
  searchPath: "/resultados",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  timeout: 30000, // 30 segundos
  waitTime: 2000, // 2 segundos entre acciones
}

/**
 * Clase para manejar el scraping de patentechile.com
 */
export class PatenteChileScraper {
  private browser: Browser | null = null
  private page: Page | null = null
  private debugMode = false

  /**
   * Constructor
   * @param debug Activa el modo de depuración
   */
  constructor(debug = false) {
    this.debugMode = debug
  }

  /**
   * Inicializa el navegador y la página
   */
  async initialize(): Promise<void> {
    try {
      this.log("Inicializando navegador...")

      this.browser = await puppeteer.launch({
        headless: "new", // Usar el nuevo modo headless
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920,1080",
        ],
      })

      this.page = await this.browser.newPage()

      // Configurar el navegador para parecer más humano
      await this.page.setUserAgent(SCRAPER_CONFIG.userAgent)
      await this.page.setViewport({ width: 1920, height: 1080 })

      // Configurar timeouts
      await this.page.setDefaultNavigationTimeout(SCRAPER_CONFIG.timeout)

      // Interceptar y bloquear recursos innecesarios para mejorar el rendimiento
      await this.page.setRequestInterception(true)
      this.page.on("request", (request) => {
        const resourceType = request.resourceType()
        if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
          request.abort()
        } else {
          request.continue()
        }
      })

      // Capturar y registrar errores de consola
      this.page.on("console", (msg) => {
        if (this.debugMode) {
          console.log(`[Página] ${msg.type()}: ${msg.text()}`)
        }
      })

      this.log("Navegador inicializado correctamente")
    } catch (error) {
      console.error("Error al inicializar el navegador:", error)
      await this.close()
      throw error
    }
  }

  /**
   * Cierra el navegador y libera recursos
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
      this.log("Navegador cerrado")
    }
  }

  /**
   * Realiza una búsqueda por número de placa
   * @param plateNumber Número de placa a buscar
   * @returns Datos del vehículo
   */
  async searchByPlate(plateNumber: string): Promise<VehicleData> {
    if (!this.browser || !this.page) {
      await this.initialize()
    }

    if (!this.page) {
      throw new Error("No se pudo inicializar el navegador")
    }

    try {
      this.log(`Buscando información para la placa: ${plateNumber}`)

      // Navegar a la página principal
      this.log(`Navegando a ${SCRAPER_CONFIG.baseUrl}...`)
      await this.page.goto(SCRAPER_CONFIG.baseUrl, { waitUntil: "networkidle2" })
      this.log("Página principal cargada")

      // Capturar screenshot para depuración si está en modo debug
      if (this.debugMode) {
        await this.page.screenshot({ path: `debug-homepage-${Date.now()}.png` })
      }

      // Esperar un tiempo aleatorio para simular comportamiento humano
      await this.randomWait()

      // Verificar si estamos bloqueados por Cloudflare
      if (await this.detectCloudflareBlock()) {
        this.log("Detectado bloqueo de Cloudflare en la página principal")
        if (this.debugMode) {
          await this.page.screenshot({ path: `cloudflare-block-${Date.now()}.png` })
        }
        throw new Error("Acceso bloqueado por Cloudflare. Intente más tarde o use un proxy diferente.")
      }

      // Buscar el campo de búsqueda
      this.log("Buscando campo de entrada para la placa...")
      const inputSelector = 'input[name="patente"]'
      await this.page.waitForSelector(inputSelector, { timeout: SCRAPER_CONFIG.timeout })

      // Completar el campo con la placa
      this.log(`Ingresando placa: ${plateNumber}`)
      await this.page.type(inputSelector, plateNumber, { delay: 100 })

      // Esperar un tiempo aleatorio antes de enviar
      await this.randomWait()

      // Buscar el botón de envío
      const submitButtonSelector = 'button[type="submit"]'
      await this.page.waitForSelector(submitButtonSelector, { timeout: SCRAPER_CONFIG.timeout })

      // Enviar el formulario
      this.log("Enviando formulario...")
      await Promise.all([
        this.page.click(submitButtonSelector),
        this.page.waitForNavigation({ waitUntil: "networkidle2" }),
      ])
      this.log("Formulario enviado, esperando resultados...")

      // Capturar screenshot para depuración si está en modo debug
      if (this.debugMode) {
        await this.page.screenshot({ path: `debug-results-${Date.now()}.png` })
      }

      // Verificar si estamos bloqueados por Cloudflare en la página de resultados
      if (await this.detectCloudflareBlock()) {
        this.log("Detectado bloqueo de Cloudflare en la página de resultados")
        if (this.debugMode) {
          await this.page.screenshot({ path: `cloudflare-block-results-${Date.now()}.png` })
        }
        throw new Error(
          "Acceso bloqueado por Cloudflare en la página de resultados. Intente más tarde o use un proxy diferente.",
        )
      }

      // Extraer la información del vehículo
      this.log("Extrayendo información del vehículo...")
      const vehicleData = await this.extractVehicleData(plateNumber)
      this.log("Información extraída correctamente")

      return vehicleData
    } catch (error) {
      console.error(`Error al buscar la placa ${plateNumber}:`, error)

      // Capturar una captura de pantalla para depuración
      if (this.page && this.debugMode) {
        await this.page.screenshot({ path: `error-${Date.now()}.png` })
      }

      throw error
    }
  }

  /**
   * Extrae los datos del vehículo de la página de resultados
   * @param plateNumber Número de placa buscado
   * @returns Datos del vehículo
   */
  private async extractVehicleData(plateNumber: string): Promise<VehicleData> {
    if (!this.page) {
      throw new Error("Página no inicializada")
    }

    // Verificar si hay resultados o si muestra mensaje de no encontrado
    const noResultsElement = await this.page.$(".no-results-message, .error-message")
    if (noResultsElement) {
      this.log("No se encontraron resultados para esta placa")
      return {
        plateNumber,
        isStolen: false,
        confidence: 100,
        source: "patentechile.com",
        vehicleInfo: {
          make: "No disponible",
          model: "No disponible",
          year: null,
          color: "No disponible",
        },
      }
    }

    // Extraer información del vehículo
    // Nota: Los selectores deben ajustarse según la estructura real del sitio
    const isStolen = await this.page.evaluate(() => {
      // Buscar elementos que indiquen que el vehículo está robado
      // Estos selectores son aproximados y deben ajustarse
      const stolenElement = document.querySelector(".stolen-status, .alert-danger, .text-danger")
      return stolenElement
        ? stolenElement.textContent?.includes("ROBADO") || stolenElement.textContent?.includes("ENCARGO")
        : false
    })

    const vehicleInfo = await this.page.evaluate(() => {
      // Extraer información del vehículo
      // Estos selectores son aproximados y deben ajustarse
      const infoElements = document.querySelectorAll(".vehicle-info, .card-body, .result-item")

      let make = "No disponible"
      let model = "No disponible"
      let year = null
      let color = "No disponible"

      // Buscar en el texto de los elementos
      infoElements.forEach((el) => {
        const text = el.textContent || ""

        // Buscar patrones comunes
        if (text.includes("Marca:")) {
          const match = text.match(/Marca:\s*([^\n,]+)/)
          if (match) make = match[1].trim()
        }

        if (text.includes("Modelo:")) {
          const match = text.match(/Modelo:\s*([^\n,]+)/)
          if (match) model = match[1].trim()
        }

        if (text.includes("Año:")) {
          const match = text.match(/Año:\s*(\d{4})/)
          if (match) year = Number.parseInt(match[1])
        }

        if (text.includes("Color:")) {
          const match = text.match(/Color:\s*([^\n,]+)/)
          if (match) color = match[1].trim()
        }
      })

      return { make, model, year, color }
    })

    // Si el vehículo está robado, extraer información del reporte
    let reportInfo = undefined
    if (isStolen) {
      reportInfo = await this.page.evaluate(() => {
        // Extraer información del reporte
        // Estos selectores son aproximados y deben ajustarse
        const reportElements = document.querySelectorAll(".report-info, .alert-info, .stolen-details")

        let reportDate = "Fecha desconocida"
        let reportLocation = "Ubicación desconocida"

        // Buscar en el texto de los elementos
        reportElements.forEach((el) => {
          const text = el.textContent || ""

          // Buscar patrones comunes
          if (text.includes("Fecha:")) {
            const match = text.match(/Fecha:\s*([^\n,]+)/)
            if (match) reportDate = match[1].trim()
          }

          if (text.includes("Lugar:") || text.includes("Ubicación:")) {
            const match = text.match(/(Lugar|Ubicación):\s*([^\n,]+)/)
            if (match) reportLocation = match[2].trim()
          }
        })

        return { reportDate, reportLocation }
      })
    }

    // Capturar el HTML para análisis posterior si está en modo debug
    if (this.debugMode) {
      const html = await this.page.content()
      require("fs").writeFileSync(`debug-html-${Date.now()}.html`, html)
    }

    return {
      plateNumber,
      isStolen: isStolen || false,
      vehicleInfo,
      reportInfo,
      confidence: 98,
      source: "patentechile.com",
    }
  }

  /**
   * Detecta si la página está bloqueada por Cloudflare
   * @returns true si está bloqueado, false en caso contrario
   */
  private async detectCloudflareBlock(): Promise<boolean> {
    if (!this.page) return false

    const title = await this.page.title()
    const content = await this.page.content()

    return (
      title.includes("Attention Required") ||
      title.includes("Error 1005") ||
      title.includes("Access denied") ||
      (content.includes("Cloudflare") && content.includes("Ray ID"))
    )
  }

  /**
   * Espera un tiempo aleatorio para simular comportamiento humano
   */
  private async randomWait(): Promise<void> {
    const randomTime = Math.floor(Math.random() * 1000) + SCRAPER_CONFIG.waitTime
    this.log(`Esperando ${randomTime}ms...`)
    await new Promise((resolve) => setTimeout(resolve, randomTime))
  }

  /**
   * Registra mensajes de depuración si el modo debug está activado
   * @param message Mensaje a registrar
   */
  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[Scraper] ${message}`)
    }
  }
}

/**
 * Función para verificar un vehículo por su placa
 * @param plateNumber Número de placa
 * @returns Datos del vehículo
 */
export async function checkVehicleWithPatentechile(plateNumber: string): Promise<VehicleData> {
  const scraper = new PatenteChileScraper()

  try {
    await scraper.initialize()
    const vehicleData = await scraper.searchByPlate(plateNumber)
    return vehicleData
  } finally {
    await scraper.close()
  }
}

/**
 * Función para simular la verificación de un vehículo (para pruebas)
 * @param plateNumber Número de placa
 * @returns Datos del vehículo simulados
 */
export async function simulateVehicleCheck(plateNumber: string): Promise<VehicleData> {
  // Simular tiempo de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

  console.log(`Simulando verificación para la placa: ${plateNumber}`)

  // Determinar si el vehículo está "robado" basado en patrones específicos
  const isStolen = plateNumber.includes("J") || plateNumber.includes("Z") || plateNumber.endsWith("0")

  // Determinar marca y modelo basados en la primera letra
  let make, model, year, color

  const firstChar = plateNumber.charAt(0)

  switch (firstChar) {
    case "J":
      make = "Kia"
      model = "Rio"
      year = 2021
      color = "Negro"
      break
    case "A":
      make = "Toyota"
      model = "Corolla"
      year = 2019
      color = "Blanco"
      break
    case "X":
    case "Z":
      make = "Chevrolet"
      model = "Sail"
      year = 2020
      color = "Rojo"
      break
    case "H":
      make = "Hyundai"
      model = "Accent"
      year = 2018
      color = "Gris"
      break
    default:
      make = "Nissan"
      model = "Versa"
      year = 2017
      color = "Azul"
  }

  // Crear objeto de respuesta
  const vehicleData: VehicleData = {
    plateNumber,
    isStolen,
    vehicleInfo: {
      make,
      model,
      year,
      color,
    },
    confidence: 98,
    source: "Simulación (patentechile.com)",
    ...(isStolen && {
      reportInfo: {
        reportDate: "15/02/2023",
        reportLocation: "Santiago, Chile",
      },
    }),
  }

  console.log(`Simulación completada para: ${plateNumber}`)
  return vehicleData
}

