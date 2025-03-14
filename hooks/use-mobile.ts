"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Verificar si estamos en el navegador
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      // Comprobar inicialmente
      checkMobile()

      // Configurar listener para cambios de tamaño
      window.addEventListener("resize", checkMobile)

      // Limpiar listener
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
}

