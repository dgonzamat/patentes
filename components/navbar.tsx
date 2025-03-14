"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { Shield, Menu, Camera, History, User, Map, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const routes = [
  {
    href: "/",
    label: "Inicio",
    icon: Shield,
  },
  {
    href: "/scan",
    label: "Escanear",
    icon: Camera,
  },
  {
    href: "/verify",
    label: "Verificar",
    icon: Search,
  },
  {
    href: "/history",
    label: "Historial",
    icon: History,
  },
  {
    href: "/map",
    label: "Mapa",
    icon: Map,
  },
  {
    href: "/profile",
    label: "Perfil",
    icon: User,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">DetectAuto</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-1 transition-colors hover:text-primary",
                pathname === route.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <Link href="/" className="flex items-center gap-2 mb-8">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">DetectAuto</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 text-base font-medium transition-colors hover:text-primary",
                      pathname === route.href ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

