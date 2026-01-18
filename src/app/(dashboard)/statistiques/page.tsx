"use client"

import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, TrendingDown, Calendar, Users, MapPin, Download, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Stats {
  totalReservations: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalUsers: number
  reservationsByStatus: { status: string; count: number }[]
  reservationsByTerrain: { terrain: string; count: number }[]
  reservationsByMonth: { month: string; count: number; revenue: number; expenses: number }[]
  expensesByType: { type: string; amount: number }[]
  topTimeSlots: { slot: string; count: number }[]
  recentTrend: number
}

export default function StatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const supabase = createClient()

  const loadStats = async () => {
    setIsLoading(true)
    try {
      // Get reservations with related data
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select(`
          *,
          terrain:terrains(code),
          time_slot:time_slots(start_time, end_time, price)
        `)
      
      if (resError) throw resError

      // Get expenses with types
      const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('*, expense_type:expense_types(name)')
      
      if (expError) throw expError

      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Calculate stats
      const now = new Date()
      const periodStart = new Date()
      if (period === 'week') periodStart.setDate(now.getDate() - 7)
      else if (period === 'month') periodStart.setMonth(now.getMonth() - 1)
      else periodStart.setFullYear(now.getFullYear() - 1)

      const filteredRes = reservations?.filter(r => 
        new Date(r.created_at) >= periodStart
      ) || []

      const confirmedRes = filteredRes.filter(r => r.status === 'CONFIRMED')
      const totalRevenue = confirmedRes.reduce((sum, r) => sum + (r.time_slot?.price || 0), 0)

      // Filter expenses by period
      const filteredExpenses = expenses?.filter(e => 
        new Date(e.expense_date) >= periodStart
      ) || []
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      const netProfit = totalRevenue - totalExpenses

      // Expenses by type
      const expenseTypeCounts: Record<string, number> = {}
      filteredExpenses.forEach(e => {
        const typeName = e.expense_type?.name || 'Autre'
        expenseTypeCounts[typeName] = (expenseTypeCounts[typeName] || 0) + e.amount
      })

      // By status
      const statusCounts: Record<string, number> = {}
      filteredRes.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
      })

      // By terrain
      const terrainCounts: Record<string, number> = {}
      filteredRes.forEach(r => {
        const code = r.terrain?.code || 'N/A'
        terrainCounts[code] = (terrainCounts[code] || 0) + 1
      })

      // By month (last 6 months)
      const monthlyData: Record<string, { count: number; revenue: number; expenses: number }> = {}
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = months[d.getMonth()]
        monthlyData[key] = { count: 0, revenue: 0, expenses: 0 }
      }
      reservations?.forEach(r => {
        const d = new Date(r.created_at)
        const key = months[d.getMonth()]
        if (monthlyData[key]) {
          monthlyData[key].count++
          if (r.status === 'CONFIRMED') {
            monthlyData[key].revenue += r.time_slot?.price || 0
          }
        }
      })
      expenses?.forEach(e => {
        const d = new Date(e.expense_date)
        const key = months[d.getMonth()]
        if (monthlyData[key]) {
          monthlyData[key].expenses += e.amount || 0
        }
      })

      // Top time slots
      const slotCounts: Record<string, number> = {}
      filteredRes.forEach(r => {
        if (r.time_slot) {
          const slot = `${r.time_slot.start_time.slice(0, 5)} - ${r.time_slot.end_time.slice(0, 5)}`
          slotCounts[slot] = (slotCounts[slot] || 0) + 1
        }
      })

      // Calculate trend (compare with previous period)
      const prevPeriodStart = new Date(periodStart)
      if (period === 'week') prevPeriodStart.setDate(prevPeriodStart.getDate() - 7)
      else if (period === 'month') prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1)
      else prevPeriodStart.setFullYear(prevPeriodStart.getFullYear() - 1)

      const prevPeriodRes = reservations?.filter(r => {
        const d = new Date(r.created_at)
        return d >= prevPeriodStart && d < periodStart
      }) || []

      const trend = prevPeriodRes.length > 0 
        ? ((filteredRes.length - prevPeriodRes.length) / prevPeriodRes.length) * 100 
        : 0

      setStats({
        totalReservations: filteredRes.length,
        totalRevenue,
        totalExpenses,
        netProfit,
        totalUsers: usersCount || 0,
        reservationsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        reservationsByTerrain: Object.entries(terrainCounts).map(([terrain, count]) => ({ terrain, count })).sort((a, b) => b.count - a.count),
        reservationsByMonth: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })),
        expensesByType: Object.entries(expenseTypeCounts).map(([type, amount]) => ({ type, amount })).sort((a, b) => b.amount - a.amount),
        topTimeSlots: Object.entries(slotCounts).map(([slot, count]) => ({ slot, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        recentTrend: trend,
      })
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement des statistiques")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [period])

  const exportCSV = () => {
    if (!stats) return
    
    const headers = ['Métrique', 'Valeur']
    const rows = [
      ['Réservations totales', stats.totalReservations.toString()],
      ['Chiffre d\'affaires', `${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`],
      ['Joueurs inscrits', stats.totalUsers.toString()],
      [''],
      ['Réservations par terrain'],
      ...stats.reservationsByTerrain.map(t => [t.terrain, t.count.toString()]),
      [''],
      ['Créneaux populaires'],
      ...stats.topTimeSlots.map(s => [s.slot, s.count.toString()]),
    ]
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `statistiques_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success("Export téléchargé")
  }

  const statusLabels: Record<string, string> = {
    CONFIRMED: 'Confirmées',
    PENDING: 'En attente',
    CANCELLED: 'Annulées',
  }

  const maxMonthlyCount = Math.max(...(stats?.reservationsByMonth.map(m => m.count) || [1]))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Statistiques</h1>
          <p className="text-sm text-neutral-500 mt-1">Analyse des performances et tendances</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  period === p ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {p === 'week' ? '7 jours' : p === 'month' ? '30 jours' : '12 mois'}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
              <div className="h-4 bg-neutral-100 rounded w-1/3 mb-4" />
              <div className="h-8 bg-neutral-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  stats.recentTrend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}>
                  {stats.recentTrend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(stats.recentTrend).toFixed(1)}%
                </div>
              </div>
              <p className="text-sm text-neutral-500 mb-1">Réservations</p>
              <p className="text-3xl font-semibold text-neutral-950">{stats.totalReservations}</p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-neutral-500 mb-1">Chiffre d'affaires</p>
              <p className="text-3xl font-semibold text-emerald-600">{stats.totalRevenue.toLocaleString('fr-FR')} <span className="text-lg font-normal text-neutral-500">F</span></p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-neutral-500 mb-1">Dépenses</p>
              <p className="text-3xl font-semibold text-red-600">{stats.totalExpenses.toLocaleString('fr-FR')} <span className="text-lg font-normal text-neutral-500">F</span></p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  stats.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50"
                )}>
                  {stats.netProfit >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                </div>
              </div>
              <p className="text-sm text-neutral-500 mb-1">Bénéfice net</p>
              <p className={cn(
                "text-3xl font-semibold",
                stats.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toLocaleString('fr-FR')} <span className="text-lg font-normal text-neutral-500">F</span>
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Chart */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-950 mb-6">Évolution mensuelle</h3>
              <div className="flex items-end gap-2 h-48">
                {stats.reservationsByMonth.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-xs font-medium text-neutral-950 mb-1">{m.count}</span>
                      <div 
                        className="w-full bg-neutral-950 rounded-t-md transition-all"
                        style={{ height: `${(m.count / maxMonthlyCount) * 140}px`, minHeight: m.count > 0 ? '8px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-950 mb-6">Répartition par statut</h3>
              <div className="space-y-4">
                {stats.reservationsByStatus.map((s, i) => {
                  const total = stats.reservationsByStatus.reduce((sum, x) => sum + x.count, 0)
                  const percent = total > 0 ? (s.count / total) * 100 : 0
                  const colors = {
                    CONFIRMED: 'bg-emerald-500',
                    PENDING: 'bg-amber-500',
                    CANCELLED: 'bg-neutral-300',
                  }
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600">{statusLabels[s.status] || s.status}</span>
                        <span className="text-sm font-medium text-neutral-950">{s.count} ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", colors[s.status as keyof typeof colors] || 'bg-neutral-400')}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* By Terrain */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-950 mb-4">Par terrain</h3>
              <div className="space-y-3">
                {stats.reservationsByTerrain.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-neutral-950 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{t.terrain}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-950">Terrain {t.terrain}</span>
                        <span className="text-sm text-neutral-500">{t.count} rés.</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-neutral-950 rounded-full"
                          style={{ width: `${(t.count / (stats.reservationsByTerrain[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Time Slots */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-950 mb-4">Créneaux populaires</h3>
              <div className="space-y-3">
                {stats.topTimeSlots.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-neutral-950 text-white text-xs font-medium flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm font-mono font-medium text-neutral-950">{s.slot}</span>
                    </div>
                    <span className="text-sm text-neutral-500">{s.count} rés.</span>
                  </div>
                ))}
                {stats.topTimeSlots.length === 0 && (
                  <p className="text-sm text-neutral-500 text-center py-4">Aucune donnée</p>
                )}
              </div>
            </div>

            {/* Expenses by Type */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-950 mb-4">Dépenses par type</h3>
              <div className="space-y-3">
                {stats.expensesByType.length > 0 ? stats.expensesByType.slice(0, 5).map((e, i) => {
                  const maxAmount = stats.expensesByType[0]?.amount || 1
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-neutral-950">{e.type}</span>
                          <span className="text-sm text-red-600 font-medium">{e.amount.toLocaleString('fr-FR')} F</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(e.amount / maxAmount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-neutral-500 text-center py-4">Aucune dépense</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
