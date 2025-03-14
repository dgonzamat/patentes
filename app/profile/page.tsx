"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun, User, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [patrolModeEnabled, setPatrolModeEnabled] = useState(false)

  const handleSaveSettings = () => {
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas correctamente",
    })
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src="/placeholder.svg?height=96&width=96" alt="@usuario" />
          <AvatarFallback>
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">Carlos Rodríguez</h1>
        <p className="text-muted-foreground">Usuario desde Marzo 2023</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Información de Cuenta</CardTitle>
              <CardDescription>Actualiza tu información personal y preferencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" defaultValue="Carlos Rodríguez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" defaultValue="carlos.rodriguez@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" defaultValue="+52 55 1234 5678" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                <Label htmlFor="dark-mode" className="flex items-center gap-2">
                  {isDarkMode ? (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Modo oscuro</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Modo claro</span>
                    </>
                  )}
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">Recibe alertas sobre vehículos de interés</p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="patrol-mode">Modo patrulla</Label>
                  <p className="text-sm text-muted-foreground">Escaneo automático durante la conducción</p>
                </div>
                <Switch id="patrol-mode" checked={patrolModeEnabled} onCheckedChange={setPatrolModeEnabled} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Guardar preferencias</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad y Privacidad</CardTitle>
              <CardDescription>Administra la seguridad de tu cuenta y datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="pt-4">
                <Button variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión en todos los dispositivos
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>Actualizar contraseña</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

