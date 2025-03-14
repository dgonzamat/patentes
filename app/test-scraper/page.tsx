"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScraperTester } from "@/components/scraper-tester"

export default function TestScraperPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Prueba del Scraper</CardTitle>
          <CardDescription>Verifica el funcionamiento del scraper de patentechile.com</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ScraperTester />
        </CardContent>
      </Card>
    </main>
  )
}

