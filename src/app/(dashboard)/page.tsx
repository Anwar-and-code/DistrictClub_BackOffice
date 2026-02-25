"use client"

import { useEffect, useState } from "react"
import { 
  Clock, Wallet, Banknote, TrendingUp, CalendarDays,
  CircleDot, Monitor
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardStats {
  // Padel - Revenus
  paidRevenue: number      // Encaissé (status = PAID)
  totalReserved: number    // Total réservé (CONFIRMED + PAID + PENDING)
  // Caisse - Revenus POS
  caisseRevenue: number
  // Dépenses
  periodExpenses: number
  // Réservations
  periodReservations: number
  pendingReservations: number
  // Alertes stock
  lowStockProducts: { name: string; quantity: number; threshold: number }[]
  // Graphiques
  monthlyChartData: { month: string; revenue: number; expenses: number; net: number }[]
  // Occupation par créneau aujourd'hui
  hourlyOccupancy: { hour: string; rate: number; reserved: number; total: number }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Date range state - default to today
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      try {
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        
        // Use selected date range
        const periodStart = startDate
        const periodEnd = endDate

        // Fetch all data in parallel
        const [
          { data: allReservations },
          { data: allExpenses },
          { data: terrains },
          { data: timeSlots },
          { data: products },
          { data: posOrders },
          { data: posExpensesData }
        ] = await Promise.all([
          supabase.from('reservations').select(`
            id, status, reservation_date, created_at,
            time_slot:time_slots(start_time, end_time, price)
          `),
          supabase.from('expenses').select('expense_date, amount'),
          supabase.from('terrains').select('id, code, is_active').eq('is_active', true),
          supabase.from('time_slots').select('id, start_time, end_time, price'),
          supabase.from('products').select('id, name, quantity, stock_threshold'),
          supabase.from('pos_orders').select('total, created_at, status, order_type, reservation_id, time_slot:time_slots(price)').eq('status', 'completed'),
          supabase.from('pos_expenses').select('amount, created_at')
        ])

        const reservations = allReservations || []
        const expenses = allExpenses || []
        const activeTerrains = terrains || []
        const slots = timeSlots || []

        // Helper function
        const getPrice = (r: typeof reservations[0]) => {
          const slot = r.time_slot as { price?: number } | null
          return slot?.price || 0
        }

        // Today's stats for occupancy chart
        const todayRes = reservations.filter(r => r.reservation_date === today)
        const todayConfirmed = todayRes.filter(r => r.status === 'CONFIRMED' || r.status === 'PAID')

        // Period stats - filter by selected period
        const periodRes = reservations.filter(r => 
          r.reservation_date >= periodStart && r.reservation_date <= periodEnd
        )
        
        // Encaissé = réservations PAID uniquement
        const paidRevenue = periodRes
          .filter(r => r.status === 'PAID')
          .reduce((sum, r) => sum + getPrice(r), 0)
        
        // Total réservé = CONFIRMED + PAID + PENDING
        const totalReserved = periodRes
          .filter(r => r.status === 'CONFIRMED' || r.status === 'PAID' || r.status === 'PENDING')
          .reduce((sum, r) => sum + getPrice(r), 0)

        // Period expenses (general + POS)
        const periodExpenses = expenses
          .filter(e => e.expense_date >= periodStart && e.expense_date <= periodEnd)
          .reduce((sum, e) => sum + (e.amount || 0), 0)
          + (posExpensesData || []).filter(e => {
            const d = e.created_at?.split('T')[0]
            return d && d >= periodStart && d <= periodEnd
          }).reduce((sum, e) => sum + (e.amount || 0), 0)

        // Caisse revenue (POS orders)
        // All pos_orders product totals are counted here (table + terrain)
        // paidRevenue only counts reservation slot prices, not product totals
        // For terrain orders WITHOUT reservation, also add the slot price (not counted in Padel)
        const caisseRevenue = (posOrders || []).filter(o => {
          const d = o.created_at?.split('T')[0]
          return d && d >= periodStart && d <= periodEnd
        }).reduce((sum, o) => {
          let amount = o.total || 0
          // For terrain orders without reservation, also add the slot price
          if (o.order_type === 'terrain' && !o.reservation_id) {
            const slot = o.time_slot as { price?: number } | null
            amount += slot?.price || 0
          }
          return sum + amount
        }, 0)

        // Period reservations count (confirmed + paid)
        const periodReservations = periodRes.filter(r => 
          r.status === 'CONFIRMED' || r.status === 'PAID'
        ).length

        // Pending reservations (global)
        const pendingCount = reservations.filter(r => r.status === 'PENDING').length

        // Low stock products (alertes)
        const lowStockProducts = (products || [])
          .filter(p => p.quantity <= (p.stock_threshold || 5))
          .map(p => ({
            name: p.name,
            quantity: p.quantity,
            threshold: p.stock_threshold || 5
          }))
          .slice(0, 5)

        // Monthly chart data (last 6 months)
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        const monthlyChartData: { month: string; revenue: number; expenses: number; net: number }[] = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const year = date.getFullYear()
          const month = date.getMonth()
          const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
          const label = monthNames[month]
          
          const rev = reservations
            .filter(r => r.status === 'CONFIRMED' && r.reservation_date?.startsWith(monthStr))
            .reduce((sum, r) => sum + getPrice(r), 0)
          
          const exp = expenses
            .filter(e => e.expense_date?.startsWith(monthStr))
            .reduce((sum, e) => sum + (e.amount || 0), 0)
          
          monthlyChartData.push({ month: label, revenue: rev, expenses: exp, net: rev - exp })
        }

        // Hourly occupancy for today
        const terrainsActive = activeTerrains.length
        const hourlyOccupancy: { hour: string; rate: number; reserved: number; total: number }[] = []
        const uniqueHours = [...new Set(slots.map(s => s.start_time.slice(0, 5)))].sort()
        uniqueHours.forEach(hour => {
          const slotRes = todayConfirmed.filter(r => {
            const slot = r.time_slot as { start_time?: string } | null
            return slot?.start_time?.slice(0, 5) === hour
          })
          const reserved = slotRes.length
          const total = terrainsActive
          const rate = total > 0 ? Math.round((reserved / total) * 100) : 0
          hourlyOccupancy.push({ hour, rate, reserved, total })
        })

        setStats({
          paidRevenue,
          totalReserved,
          caisseRevenue,
          periodExpenses,
          periodReservations,
          pendingReservations: pendingCount,
          lowStockProducts,
          monthlyChartData,
          hourlyOccupancy
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [startDate, endDate])

  const formatCurrency = (value: number) => value.toLocaleString('fr-FR') + ' F'
  const formatPercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-neutral-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-neutral-200 animate-pulse h-32" />
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse h-48" />
        <div className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse h-72" />
      </div>
    )
  }

  const todayDate = new Date()
  const dateStr = todayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  
  // Calcul du pourcentage encaissé vs total réservé
  const paidPercent = stats && stats.totalReserved > 0 
    ? Math.round((stats.paidRevenue / stats.totalReserved) * 100) 
    : 0

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  // Quick period buttons
  const setQuickPeriod = (type: 'today' | 'week' | 'month') => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    if (type === 'today') {
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (type === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      setStartDate(weekAgo.toISOString().split('T')[0])
      setEndDate(todayStr)
    } else {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      setStartDate(monthStart.toISOString().split('T')[0])
      setEndDate(todayStr)
    }
  }

  return (
    <div className="p-8 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header avec sélecteur de période */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tableau de bord</h1>
          <p className="text-sm text-neutral-500 mt-1 capitalize">{dateStr}</p>
        </div>
        
        {/* Sélecteur de période */}
        <div className="flex items-center gap-3">
          {/* Raccourcis rapides */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setQuickPeriod('today')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                startDate === endDate && startDate === today
                  ? "bg-white text-neutral-950 shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setQuickPeriod('week')}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              7 jours
            </button>
            <button
              onClick={() => setQuickPeriod('month')}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Ce mois
            </button>
          </div>
          
          {/* Date pickers */}
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-1.5">
            <CalendarDays className="h-4 w-4 text-neutral-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-neutral-700 bg-transparent border-none outline-none w-28"
            />
            <span className="text-neutral-400">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-neutral-700 bg-transparent border-none outline-none w-28"
            />
          </div>
        </div>
      </div>

      {/* 4 Cartes KPI principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Padel - Encaissé / Total réservé */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CircleDot className="h-5 w-5 text-blue-600" />
            </div>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              paidPercent >= 80 ? "bg-emerald-50 text-emerald-700" :
              paidPercent >= 50 ? "bg-blue-50 text-blue-700" :
              "bg-amber-50 text-amber-700"
            )}>
              {paidPercent}% encaissé
            </span>
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1">Padel</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.paidRevenue || 0)}</p>
          <p className="text-lg font-semibold text-neutral-500">{formatCurrency(stats?.totalReserved || 0)}</p>
          <div className="mt-2 pt-2 border-t border-neutral-100">
            <Link href="/reservations" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Voir détails →
            </Link>
          </div>
        </div>

        {/* 2. Dépenses */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1">Dépenses</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.periodExpenses || 0)}</p>
          <div className="mt-2 pt-2 border-t border-neutral-100">
            <Link href="/depenses" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Voir détails →
            </Link>
          </div>
        </div>

        {/* 3. Caisse */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Monitor className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1">Caisse</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats?.caisseRevenue || 0)}</p>
          <div className="mt-2 pt-2 border-t border-neutral-100">
            <Link href="/caisse" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
              Ouvrir la caisse →
            </Link>
          </div>
        </div>

        {/* 4. Fond Net = Padel + Caisse - Dépenses */}
        {(() => {
          const fondNet = (stats?.paidRevenue || 0) + (stats?.caisseRevenue || 0) - (stats?.periodExpenses || 0)
          return (
            <div className="bg-white rounded-xl p-5 border border-neutral-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  fondNet >= 0 ? "bg-emerald-100" : "bg-orange-100"
                )}>
                  <Banknote className={cn(
                    "h-5 w-5",
                    fondNet >= 0 ? "text-emerald-600" : "text-orange-600"
                  )} />
                </div>
              </div>
              <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium mb-1">Fond Net</p>
              <p className={cn(
                "text-2xl font-bold",
                fondNet >= 0 ? "text-emerald-600" : "text-orange-600"
              )}>
                {fondNet >= 0 ? '+' : ''}{formatCurrency(fondNet)}
              </p>
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-500">
                  Padel + Caisse - Dépenses
                </p>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Occupation par créneau aujourd'hui */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900">Occupation par créneau aujourd'hui</h2>
            <p className="text-xs text-neutral-500">Taux d'occupation des terrains par heure</p>
          </div>
        </div>
        
        {stats?.hourlyOccupancy && stats.hourlyOccupancy.length > 0 ? (
          <>
            <div className="flex items-end gap-2 h-32">
              {stats.hourlyOccupancy.map((slot) => (
                <div key={slot.hour} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[10px] text-neutral-500 font-medium">
                    {slot.reserved}/{slot.total}
                  </div>
                  <div 
                    className={cn(
                      "w-full rounded-t transition-all cursor-pointer hover:opacity-80",
                      slot.rate >= 100 ? "bg-emerald-500" :
                      slot.rate >= 50 ? "bg-blue-500" :
                      slot.rate > 0 ? "bg-amber-400" :
                      "bg-neutral-200"
                    )}
                    style={{ height: `${Math.max(slot.rate * 0.8, 8)}px` }}
                    title={`${slot.hour}: ${slot.rate}% occupé (${slot.reserved}/${slot.total} terrains)`}
                  />
                  <span className="text-xs text-neutral-500 font-medium">{slot.hour}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-neutral-600">Complet (100%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-neutral-600">50-99%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-neutral-600">1-49%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-neutral-200" />
                <span className="text-neutral-600">Libre</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">Aucun créneau configuré</p>
          </div>
        )}
      </div>

      {/* Évolution sur 6 mois - Graphique en barres */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Évolution sur 6 mois</h2>
              <p className="text-xs text-neutral-500">Padel, Dépenses et Bénéfice net</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-neutral-600">Padel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span className="text-neutral-600">Dépenses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-neutral-600">Net</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-end gap-6 h-56">
          {(stats?.monthlyChartData || []).map((data, i) => {
            const maxValue = Math.max(
              ...((stats?.monthlyChartData || []).map(d => Math.max(d.revenue, d.expenses, Math.abs(d.net)))),
              1
            )
            const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 180 : 0
            const expenseHeight = maxValue > 0 ? (data.expenses / maxValue) * 180 : 0
            const netHeight = maxValue > 0 ? (Math.abs(data.net) / maxValue) * 180 : 0
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full flex justify-center gap-1" style={{ height: '180px', alignItems: 'flex-end' }}>
                  <div 
                    className="w-[28%] bg-emerald-500 rounded-t transition-all hover:bg-emerald-600 cursor-pointer"
                    style={{ height: `${Math.max(revenueHeight, 4)}px` }}
                    title={`Padel: ${formatCurrency(data.revenue)}`}
                  />
                  <div 
                    className="w-[28%] bg-red-400 rounded-t transition-all hover:bg-red-500 cursor-pointer"
                    style={{ height: `${Math.max(expenseHeight, 4)}px` }}
                    title={`Dépenses: ${formatCurrency(data.expenses)}`}
                  />
                  <div 
                    className={cn(
                      "w-[28%] rounded-t transition-all cursor-pointer",
                      data.net >= 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-orange-400 hover:bg-orange-500"
                    )}
                    style={{ height: `${Math.max(netHeight, 4)}px` }}
                    title={`Net: ${data.net >= 0 ? '+' : ''}${formatCurrency(data.net)}`}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-700">{data.month}</span>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  data.net >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}>
                  {data.net >= 0 ? '+' : ''}{formatCurrency(data.net)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
