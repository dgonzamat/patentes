import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Camera, History, Map, Search } from "lucide-react"
import { HeroSection } from "@/components/hero-section"
import { FeatureCard } from "@/components/feature-card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Camera className="h-10 w-10 text-primary" />}
            title="Reconocimiento Avanzado"
            description="Captura y procesa placas vehiculares con tecnología OCR de alta precisión"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-primary" />}
            title="Verificación Instantánea"
            description="Consulta la base de datos de vehículos robados en tiempo real"
          />
          <FeatureCard
            icon={<History className="h-10 w-10 text-primary" />}
            title="Historial Completo"
            description="Mantén un registro de todas tus verificaciones anteriores"
          />
          <FeatureCard
            icon={<Map className="h-10 w-10 text-primary" />}
            title="Mapeo Geográfico"
            description="Visualiza la ubicación exacta donde realizaste cada verificación"
          />
          <FeatureCard
            icon={<Search className="h-10 w-10 text-primary" />}
            title="Búsqueda Manual"
            description="Verifica vehículos ingresando el número de placa manualmente"
          />
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold">¿Listo para comenzar?</CardTitle>
              <CardDescription>Verifica vehículos en segundos</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Nuestra aplicación es fácil de usar y está diseñada para ayudarte a identificar vehículos robados de
                manera rápida y eficiente.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/scan" className="w-full">
                <Button className="w-full" size="lg">
                  Comenzar a Escanear
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  )
}

