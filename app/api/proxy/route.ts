import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

/**
 * Ruta de API que actúa como proxy para acceder a patentechile.com
 * Utiliza Puppeteer para evitar bloqueos de Cloudflare
 */
export async function POST(request: NextRequest) {
  let browser = null

  try {
    const { url, plateNumber } = await request.json()

    if (!url || !plateNumber) {
      return NextResponse.json({ error: "URL y número de placa son requeridos" }, { status: 400 })
    }

    console.log(`Iniciando proxy para acceder a: ${url}`)

    // Iniciar navegador
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    })

    const page = await browser.newPage()

    // Configurar para parecer un navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )
    await page.setViewport({ width: 1920, height: 1080 })

    // Navegar a la URL
    await page.goto(url, { waitUntil: "networkidle2" })

    // Verificar si hay bloqueo de Cloudflare
    const title = await page.title()
    const content = await page.content()

    if (
      title.includes("Attention Required") ||
      title.includes("Error 1005") ||
      (content.includes("Cloudflare") && content.includes("Ray ID"))
    ) {
      // Capturar una captura de pantalla del bloqueo
      await page.screenshot({ path: `cloudflare-block-${Date.now()}.png` })

      return NextResponse.json({ error: "Acceso bloqueado por Cloudflare" }, { status: 403 })
    }

    // Buscar el campo de búsqueda y completarlo
    await page.type('input[name="patente"]', plateNumber, { delay: 100 })

    // Esperar un tiempo aleatorio antes de enviar
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    // Enviar el formulario
    await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: "networkidle2" })])

    // Capturar el HTML de la página de resultados
    const html = await page.content()

    // Capturar una captura de pantalla para verificación
    await page.screenshot({ path: `results-${Date.now()}.png` })

    return NextResponse.json({
      success: true,
      html,
    })
  } catch (error) {
    console.error("Error en el proxy:", error)

    return NextResponse.json({ error: "Error al acceder al sitio", details: error.message }, { status: 500 })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

