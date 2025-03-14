"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { HistoryItem } from "@/components/history-item"
import { Search, Calendar } from "lucide-react"
import { useScanHistory } from "@/hooks/use-scan-history"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HistoryPage() {
  const { history, isLoading } = useScanHistory()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterType === "all" || (filterType === "stolen" && item.isStolen) || (filterType === "clean" && !item.isStolen)
    return matchesSearch && matchesFilter
  })

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Historial de Búsquedas</CardTitle>
          <CardDescription>Revisa todas tus verificaciones anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de placa..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="stolen">Robados</SelectItem>
                <SelectItem value="clean">Sin problemas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 w-full bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No hay resultados</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "No se encontraron registros que coincidan con tu búsqueda."
                  : "Aún no has realizado ninguna verificación."}
              </p>
              {(searchQuery || filterType !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                  }}
                >
                  Mostrar todos los registros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

