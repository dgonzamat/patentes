import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} DetectAuto. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm font-medium text-muted-foreground underline underline-offset-4">
            Términos
          </Link>
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground underline underline-offset-4">
            Privacidad
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground underline underline-offset-4">
            Acerca de
          </Link>
        </div>
      </div>
    </footer>
  )
}

