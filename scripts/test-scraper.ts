/**
 * Script para probar el funcionamiento del scraper de patentechile.com
 *
 * Ejecutar con: npx ts-node scripts/test-scraper.ts
 */

import { PatenteChileScraper } from "../lib/patente-scraper"
import { formatChileanPlate } from "../lib/vehicle-verification"

// Placas de prueba
const TEST_PLATES = ["ABCD12", "XY1234", "JVJV20"]

async function runTest() {
  console.log("=== INICIANDO PRUEBA DEL SCRAPER DE PATENTECHILE.COM ===")
  console.log("Fecha y hora:", new Date().toLocaleString())
  console.log("---------------------------------------------------")

  const scraper = new PatenteChileScraper()

  try {
    // Inicializar el scraper
    console.log("Inicializando scraper...")
    await scraper.initialize()
    console.log("Scraper inicializado correctamente")

    // Probar cada placa
    for (const plate of TEST_PLATES) {
      console.log("\n---------------------------------------------------")
      console.log(`Probando placa: ${plate}`)
      console.log("Formato normalizado:", formatChileanPlate(plate))

      try {
        console.time("Tiempo de búsqueda")
        const result = await scraper.searchByPlate(plate)
        console.timeEnd("Tiempo de búsqueda")

        console.log("RESULTADO:")
        console.log(JSON.stringify(result, null, 2))

        // Verificar si el resultado parece válido
        if (result.plateNumber === plate) {
          console.log("✅ Verificación exitosa")
        } else {
          console.log("⚠️ La placa en el resultado no coincide con la solicitada")
        }
      } catch (error) {
        console.log("❌ Error al buscar la placa:")
        console.error(error)

        // Verificar si es un error de Cloudflare
        if (error.message && error.message.includes("Cloudflare")) {
          console.log("⚠️ Detectado bloqueo de Cloudflare")
          console.log("Recomendación: Usar un proxy o esperar antes de intentar nuevamente")
        }
      }
    }
  } catch (error) {
    console.error("Error general en la prueba:", error)
  } finally {
    // Cerrar el scraper
    console.log("\n---------------------------------------------------")
    console.log("Cerrando scraper...")
    await scraper.close()
    console.log("Scraper cerrado correctamente")
    console.log("=== FIN DE LA PRUEBA ===")
  }
}

// Ejecutar la prueba
runTest().catch(console.error)

