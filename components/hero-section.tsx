import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Camera, Search } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/10 to-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex items-center justify-center p-2 rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Consulta de Patentes Vehiculares
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Obtén información sobre vehículos mediante el reconocimiento de su patente de forma rápida y sencilla.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/scan">
              <Button size="lg" className="gap-2">
                <Camera className="h-5 w-5" />
                Escanear Patente
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="outline" size="lg" className="gap-2">
                <Search className="h-5 w-5" />
                Consultar Manualmente
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

