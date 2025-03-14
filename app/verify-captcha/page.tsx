"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CaptchaVerification } from "@/components/captcha-verification"

export default function VerifyCaptchaPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verificar Vehículo</CardTitle>
          <CardDescription>Verificación protegida con CAPTCHA</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <CaptchaVerification />
        </CardContent>
      </Card>
    </main>
  )
}

