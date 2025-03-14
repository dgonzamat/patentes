"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProxyVerification } from "@/components/proxy-verification"

export default function VerifyPatentePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verificar con PatenteCHILE</CardTitle>
          <CardDescription>Verifica si un vehículo está reportado como robado en Chile</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ProxyVerification />
        </CardContent>
      </Card>
    </main>
  )
}

