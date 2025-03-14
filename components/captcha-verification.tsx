"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CaptchaVerificationProps {
  onVerified: (verified: boolean) => void
  isVerified: boolean
}

export function CaptchaVerification({ onVerified, isVerified }: CaptchaVerificationProps) {
  const [error, setError] = useState<string | null>(null)

  const handleVerification = (checked: boolean) => {
    if (checked) {
      setError(null)
      onVerified(true)
    } else {
      onVerified(false)
    }
  }

  return (
    <Card className="mb-4 border border-primary/20">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Verificación de Seguridad</h3>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2 mb-1">
          <Checkbox id="captcha" checked={isVerified} onCheckedChange={handleVerification} />
          <Label htmlFor="captcha" className="text-sm">
            Confirmo que no soy un robot y acepto los términos de uso
          </Label>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Esta verificación es necesaria para prevenir consultas automatizadas
        </p>
      </CardContent>
    </Card>
  )
}

