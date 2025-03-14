import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Calendar, MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface HistoryItemData {
  id: string
  plateNumber: string
  isStolen: boolean
  scanDate: string
  scanLocation?: string
  vehicleInfo?: {
    make?: string
    model?: string
    year?: number
    color?: string
  }
}

interface HistoryItemProps {
  item: HistoryItemData
}

export function HistoryItem({ item }: HistoryItemProps) {
  const { plateNumber, isStolen, scanDate, scanLocation, vehicleInfo } = item

  return (
    <Card className={cn("border-l-4 overflow-hidden", isStolen ? "border-l-destructive" : "border-l-success")}>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="text-lg font-bold">{plateNumber}</div>
              <Badge
                variant={isStolen ? "destructive" : "success"}
                className="text-xs font-medium flex items-center gap-1 w-fit"
              >
                {isStolen ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Robado
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Sin problemas
                  </>
                )}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
              {vehicleInfo?.make && (
                <div>
                  <span className="font-medium">Marca:</span> {vehicleInfo.make}
                </div>
              )}
              {vehicleInfo?.model && (
                <div>
                  <span className="font-medium">Modelo:</span> {vehicleInfo.model}
                </div>
              )}
              {vehicleInfo?.year && (
                <div>
                  <span className="font-medium">Año:</span> {vehicleInfo.year}
                </div>
              )}
              {vehicleInfo?.color && (
                <div>
                  <span className="font-medium">Color:</span> {vehicleInfo.color}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{scanDate}</span>
              </div>
              {scanLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{scanLocation}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end p-4 bg-muted/20">
            <Link href={`/history/${item.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Detalles
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

