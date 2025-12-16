"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Book,
  Film,
  Tv,
  Loader2,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Clock,
  BookOpen,
} from "lucide-react"
import { Header } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatLongDuration } from "@/lib/utils"
import type { ChartDataPoint } from "@/lib/db/stats"

// Types
interface ChartApiResponse {
  data: ChartDataPoint[]
  totals: {
    books: number
    movies: number
    shows: number
    total: number
    totalMinutes: number
    pagesRead: number
  }
  period: string
  granularity: string
  startDate: string
  endDate: string
}

type MetricType = "count" | "time" | "pages"
type ChartType = "bar" | "line"
type PeriodType = "current_year" | "last_12_months" | "last_year" | "custom"
type GranularityType = "month" | "week"

// Couleurs de l'app (violet/vert)
const COLORS = {
  books: "#8b5cf6", // violet-500
  movies: "#10b981", // emerald-500
  shows: "#f59e0b", // amber-500
  total: "#6366f1", // indigo-500
}

export default function ChartsPage() {
  const [data, setData] = useState<ChartApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Filtres
  const [period, setPeriod] = useState<PeriodType>("current_year")
  const [granularity, setGranularity] = useState<GranularityType>("month")
  const [metric, setMetric] = useState<MetricType>("count")
  const [chartType, setChartType] = useState<ChartType>("bar")

  // Custom period
  const currentYear = new Date().getFullYear()
  const [customStart, setCustomStart] = useState(`${currentYear}-01-01`)
  const [customEnd, setCustomEnd] = useState(`${currentYear}-12-31`)

  // Attendre le montage côté client pour éviter le warning recharts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          period,
          granularity,
        })

        if (period === "custom") {
          params.set("startDate", customStart)
          params.set("endDate", customEnd)
        }

        const res = await fetch(`/api/stats/charts?${params}`)
        if (!res.ok) throw new Error("Erreur lors du chargement")

        const json = (await res.json()) as ChartApiResponse
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [period, granularity, customStart, customEnd])

  // Préparer les données pour le graphique sélectionné
  const chartData = useMemo(() => {
    if (!data?.data) return []

    return data.data.map((d) => {
      if (metric === "time") {
        return {
          name: d.label,
          Livres: Math.round(d.booksMinutes / 60), // en heures
          Films: Math.round(d.moviesMinutes / 60),
          Séries: Math.round(d.showsMinutes / 60),
          Total: Math.round(d.totalMinutes / 60),
        }
      }
      if (metric === "pages") {
        return {
          name: d.label,
          Pages: d.pagesRead,
        }
      }
      // count
      return {
        name: d.label,
        Livres: d.books,
        Films: d.movies,
        Séries: d.shows,
        Total: d.total,
      }
    })
  }, [data, metric])

  // Formatter pour les tooltips
  const formatValue = (value: number) => {
    if (metric === "time") return `${value}h`
    if (metric === "pages") return `${value.toLocaleString()} p.`
    return value.toString()
  }

  // Rendu du graphique
  const renderChart = (
    dataKey: string,
    color: string,
    title: string,
    icon: React.ReactNode
  ) => {
    const ChartComponent = chartType === "bar" ? BarChart : LineChart

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            {!isMounted ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip
                    formatter={(value) => [formatValue(value as number), dataKey]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  {chartType === "bar" ? (
                    <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={dataKey}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, r: 3 }}
                    />
                  )}
                </ChartComponent>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Graphique combiné (tous les médias)
  const renderCombinedChart = () => {
    const ChartComponent = chartType === "bar" ? BarChart : LineChart

    // Pour les pages, on n'a que les livres
    if (metric === "pages") {
      return renderChart("Pages", COLORS.books, "Pages lues", <BookOpen className="h-4 w-4" />)
    }

    return (
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue combinée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {!isMounted ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip
                    formatter={(value, name) => [formatValue(value as number), name as string]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {chartType === "bar" ? (
                    <>
                      <Bar dataKey="Livres" fill={COLORS.books} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Films" fill={COLORS.movies} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Séries" fill={COLORS.shows} radius={[4, 4, 0, 0]} />
                    </>
                  ) : (
                    <>
                      <Line
                        type="monotone"
                        dataKey="Livres"
                        stroke={COLORS.books}
                        strokeWidth={2}
                        dot={{ fill: COLORS.books, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Films"
                        stroke={COLORS.movies}
                        strokeWidth={2}
                        dot={{ fill: COLORS.movies, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Séries"
                        stroke={COLORS.shows}
                        strokeWidth={2}
                        dot={{ fill: COLORS.shows, r: 3 }}
                      />
                    </>
                  )}
                </ChartComponent>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title="Graphiques" showBack />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Graphiques" showBack />

      <main className="container px-4 py-6">
        {/* Retour aux stats */}
        <Link href="/stats" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour aux statistiques
        </Link>

        <h1 className="font-display text-2xl font-semibold mb-2">
          Évolution dans le temps
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Visualise ta consommation de médias
        </p>

        {error && (
          <Card className="mb-6 border-amber-500/50">
            <CardContent className="pt-4">
              <p className="text-sm text-amber-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Période */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Période
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodType)}
                  className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="current_year">Année {currentYear}</option>
                  <option value="last_12_months">12 derniers mois</option>
                  <option value="last_year">Année {currentYear - 1}</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>

              {/* Granularité */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Granularité
                </label>
                <select
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value as GranularityType)}
                  className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="month">Par mois</option>
                  <option value="week">Par semaine</option>
                </select>
              </div>

              {/* Métrique */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Métrique
                </label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as MetricType)}
                  className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="count">Nombre</option>
                  <option value="time">Temps (heures)</option>
                  <option value="pages">Pages lues</option>
                </select>
              </div>

              {/* Type de graphique */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Affichage
                </label>
                <div className="flex gap-1">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setChartType("line")}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Dates personnalisées */}
            {period === "custom" && (
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Du
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Au
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full text-sm border rounded-md px-2 py-1.5 bg-background"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résumé de la période */}
        {data && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-violet-500/10 border-violet-500/20">
              <CardContent className="pt-3 pb-3 text-center">
                <Book className="h-5 w-5 text-violet-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{data.totals.books}</p>
                <p className="text-xs text-muted-foreground">livres</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="pt-3 pb-3 text-center">
                <Film className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{data.totals.movies}</p>
                <p className="text-xs text-muted-foreground">films</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-3 pb-3 text-center">
                <Tv className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{data.totals.shows}</p>
                <p className="text-xs text-muted-foreground">séries</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Temps total de la période */}
        {data && metric === "time" && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Total période</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {formatLongDuration(data.totals.totalMinutes)}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Graphiques */}
        <div className="space-y-4">
          {/* Vue combinée */}
          {renderCombinedChart()}

          {/* Graphiques individuels */}
          {metric !== "pages" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderChart(
                metric === "time" ? "Livres" : "Livres",
                COLORS.books,
                "Livres",
                <Book className="h-4 w-4 text-violet-500" />
              )}
              {renderChart(
                metric === "time" ? "Films" : "Films",
                COLORS.movies,
                "Films",
                <Film className="h-4 w-4 text-emerald-500" />
              )}
              {renderChart(
                metric === "time" ? "Séries" : "Séries",
                COLORS.shows,
                "Séries",
                <Tv className="h-4 w-4 text-amber-500" />
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
