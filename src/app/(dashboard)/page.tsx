"use client"

import { useEffect, useState } from "react"
import { 
  Calendar, Users, TrendingUp, TrendingDown, Clock, ChevronRight, 
  AlertCircle, CheckCircle2, XCircle, Wallet, Target, Zap, 
  Trophy, Star, ArrowUpRight, ArrowDownRight, Activity,
  Timer, MapPin, Flame, CalendarClock, CircleDollarSign,
  UserCheck, AlertTriangle, Sparkles, BarChart3, Percent,
  Sun, Moon, Sunrise, Award, Crown, Medal
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TerrainPerformance {
  code: string
  reservations: number
  revenue: number
  occupancyRate: number
  color: string
}

interface TopPlayer {
  id: string
  name: string
  totalReservations: number
  totalSpent: number
}

interface DashboardStats {
  // Revenus
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  lastMonthRevenue: number
  monthExpenses: number
  netProfit: number
  // Réservations
  todayReservations: number
  weekReservations: number
  monthReservations: number
  pendingReservations: number
  canceledThisMonth: number
  // Joueurs
  totalPlayers: number
  newPlayersThisMonth: number
  activePlayersThisMonth: number
  // Terrains
  activeTerrains: number
  // Taux d'occupation
  occupancyRateToday: number
  occupancyRateWeek: number
  occupancyRateMonth: number
  // Performance
  avgRevenuePerReservation: number
  peakHours: { hour: string; count: number }[]
  terrainPerformance: TerrainPerformance[]
  topPlayers: TopPlayer[]
  // Graphiques
  monthlyChartData: { month: string; revenue: number; expenses: number }[]
  weeklyChartData: { day: string; revenue: number; reservations: number }[]
  // Planning
  todaySchedule: {
    id: number
    time: string
    terrain: string
    terrainCode: string
    player: string
    status: string
    price: number
  }[]
  // Heures d'occupation par créneau
  hourlyOccupancy: { hour: string; rate: number }[]
}

const TERRAIN_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      try {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

        // Fetch all data in parallel
        const [
          { data: allReservations },
          { data: allExpenses },
          { data: terrains },
          { data: timeSlots },
          { count: playersCount },
          { data: newPlayers },
          { data: profiles }
        ] = await Promise.all([
          supabase.from('reservations').select(`
            id, status, reservation_date, created_at, user_id,
            terrain:terrains(id, code),
            time_slot:time_slots(start_time, end_time, price)
          `),
          supabase.from('expenses').select('expense_date, amount'),
          supabase.from('terrains').select('id, code, is_active').eq('is_active', true),
          supabase.from('time_slots').select('id, start_time, end_time, price'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'JOUEUR'),
          supabase.from('profiles').select('id').eq('role', 'JOUEUR').gte('created_at', monthStart),
          supabase.from('profiles').select('id, first_name, last_name').eq('role', 'JOUEUR')
        ])

        const reservations = allReservations || []
        const expenses = allExpenses || []
        const activeTerrains = terrains || []
        const slots = timeSlots || []
        const playerProfiles = profiles || []

        // Helper functions
        const getPrice = (r: typeof reservations[0]) => {
          const slot = r.time_slot as { price?: number } | null
          return slot?.price || 0
        }

        const getTerrainCode = (r: typeof reservations[0]) => {
          const terrain = r.terrain as { code?: string } | null
          return terrain?.code || '?'
        }

        // Today's stats
        const todayRes = reservations.filter(r => r.reservation_date === today)
        const todayConfirmed = todayRes.filter(r => r.status === 'CONFIRMED')
        const todayRevenue = todayConfirmed.reduce((sum, r) => sum + getPrice(r), 0)

        // Week stats
        const weekRes = reservations.filter(r => r.reservation_date >= weekAgo && r.status === 'CONFIRMED')
        const weekRevenue = weekRes.reduce((sum, r) => sum + getPrice(r), 0)

        // Month stats
        const monthRes = reservations.filter(r => r.reservation_date >= monthStart)
        const monthConfirmed = monthRes.filter(r => r.status === 'CONFIRMED')
        const monthRevenue = monthConfirmed.reduce((sum, r) => sum + getPrice(r), 0)
        const monthCanceled = monthRes.filter(r => r.status === 'CANCELED').length

        // Last month revenue for comparison
        const lastMonthRes = reservations.filter(r => 
          r.reservation_date >= lastMonthStart && 
          r.reservation_date <= lastMonthEnd && 
          r.status === 'CONFIRMED'
        )
        const lastMonthRevenue = lastMonthRes.reduce((sum, r) => sum + getPrice(r), 0)

        // Expenses
        const monthExpenses = expenses
          .filter(e => e.expense_date >= monthStart)
          .reduce((sum, e) => sum + (e.amount || 0), 0)

        // Pending reservations
        const pendingCount = reservations.filter(r => r.status === 'PENDING').length

        // Active players this month (unique users with reservations)
        const activePlayerIds = new Set(monthRes.map(r => r.user_id))
        const activePlayersThisMonth = activePlayerIds.size

        // Occupancy rate calculation
        const slotsPerDay = slots.length
        const terrainsActive = activeTerrains.length
        const totalSlotsToday = slotsPerDay * terrainsActive
        const occupancyRateToday = totalSlotsToday > 0 
          ? Math.round((todayConfirmed.length / totalSlotsToday) * 100) 
          : 0

        // Week occupancy (7 days)
        const totalSlotsWeek = slotsPerDay * terrainsActive * 7
        const occupancyRateWeek = totalSlotsWeek > 0 
          ? Math.round((weekRes.length / totalSlotsWeek) * 100) 
          : 0

        // Month occupancy
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const daysPassed = now.getDate()
        const totalSlotsMonth = slotsPerDay * terrainsActive * daysPassed
        const occupancyRateMonth = totalSlotsMonth > 0 
          ? Math.round((monthConfirmed.length / totalSlotsMonth) * 100) 
          : 0

        // Peak hours analysis
        const hourCounts: Record<string, number> = {}
        reservations.filter(r => r.status === 'CONFIRMED').forEach(r => {
          const slot = r.time_slot as { start_time?: string } | null
          if (slot?.start_time) {
            const hour = slot.start_time.slice(0, 5)
            hourCounts[hour] = (hourCounts[hour] || 0) + 1
          }
        })
        const peakHours = Object.entries(hourCounts)
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        // Terrain performance
        const terrainStats: Record<string, { reservations: number; revenue: number }> = {}
        activeTerrains.forEach(t => {
          terrainStats[t.code] = { reservations: 0, revenue: 0 }
        })
        monthConfirmed.forEach(r => {
          const code = getTerrainCode(r)
          if (terrainStats[code]) {
            terrainStats[code].reservations++
            terrainStats[code].revenue += getPrice(r)
          }
        })
        const terrainPerformance = Object.entries(terrainStats).map(([code, data], idx) => ({
          code,
          reservations: data.reservations,
          revenue: data.revenue,
          occupancyRate: totalSlotsMonth > 0 
            ? Math.round((data.reservations / (slotsPerDay * daysPassed)) * 100)
            : 0,
          color: TERRAIN_COLORS[idx % TERRAIN_COLORS.length]
        })).sort((a, b) => b.revenue - a.revenue)

        // Top players
        const playerStats: Record<string, { reservations: number; spent: number }> = {}
        reservations.filter(r => r.status === 'CONFIRMED').forEach(r => {
          if (r.user_id) {
            if (!playerStats[r.user_id]) {
              playerStats[r.user_id] = { reservations: 0, spent: 0 }
            }
            playerStats[r.user_id].reservations++
            playerStats[r.user_id].spent += getPrice(r)
          }
        })
        const topPlayers = Object.entries(playerStats)
          .map(([id, data]) => {
            const profile = playerProfiles.find(p => p.id === id)
            return {
              id,
              name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Joueur' : 'Joueur',
              totalReservations: data.reservations,
              totalSpent: data.spent
            }
          })
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5)

        // Average revenue per reservation
        const avgRevenuePerReservation = monthConfirmed.length > 0
          ? Math.round(monthRevenue / monthConfirmed.length)
          : 0

        // Monthly chart data (last 6 months)
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        const monthlyChartData: { month: string; revenue: number; expenses: number }[] = []
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
          
          monthlyChartData.push({ month: label, revenue: rev, expenses: exp })
        }

        // Weekly chart data (last 7 days)
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
        const weeklyChartData: { day: string; revenue: number; reservations: number }[] = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const dayRes = reservations.filter(r => r.reservation_date === dateStr && r.status === 'CONFIRMED')
          weeklyChartData.push({
            day: dayNames[date.getDay()],
            revenue: dayRes.reduce((sum, r) => sum + getPrice(r), 0),
            reservations: dayRes.length
          })
        }

        // Today's schedule
        const todaySchedule = todayRes
          .map(r => {
            const terrain = r.terrain as { code?: string } | null
            const slot = r.time_slot as { start_time?: string; end_time?: string; price?: number } | null
            return {
              id: r.id,
              time: `${slot?.start_time?.slice(0, 5) || ''} - ${slot?.end_time?.slice(0, 5) || ''}`,
              startTime: slot?.start_time || '',
              terrain: terrain?.code || '?',
              terrainCode: terrain?.code || '?',
              player: 'Joueur',
              status: r.status,
              price: slot?.price || 0
            }
          })
          .sort((a, b) => a.startTime.localeCompare(b.startTime))

        // Hourly occupancy for today
        const hourlyOccupancy: { hour: string; rate: number }[] = []
        const uniqueHours = [...new Set(slots.map(s => s.start_time.slice(0, 5)))].sort()
        uniqueHours.forEach(hour => {
          const slotRes = todayConfirmed.filter(r => {
            const slot = r.time_slot as { start_time?: string } | null
            return slot?.start_time?.slice(0, 5) === hour
          })
          const rate = terrainsActive > 0 ? Math.round((slotRes.length / terrainsActive) * 100) : 0
          hourlyOccupancy.push({ hour, rate })
        })

        setStats({
          todayRevenue,
          weekRevenue,
          monthRevenue,
          lastMonthRevenue,
          monthExpenses,
          netProfit: monthRevenue - monthExpenses,
          todayReservations: todayConfirmed.length,
          weekReservations: weekRes.length,
          monthReservations: monthConfirmed.length,
          pendingReservations: pendingCount,
          canceledThisMonth: monthCanceled,
          totalPlayers: playersCount || 0,
          newPlayersThisMonth: newPlayers?.length || 0,
          activePlayersThisMonth,
          activeTerrains: terrainsActive,
          occupancyRateToday,
          occupancyRateWeek,
          occupancyRateMonth,
          avgRevenuePerReservation,
          peakHours,
          terrainPerformance,
          topPlayers,
          monthlyChartData,
          weeklyChartData,
          todaySchedule,
          hourlyOccupancy
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatCurrency = (value: number) => value.toLocaleString('fr-FR') + ' F'
  const formatPercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`
  }

  const statusConfig = {
    CONFIRMED: { label: 'Confirmé', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    CANCELED: { label: 'Annulé', color: 'bg-neutral-100 text-neutral-500', dot: 'bg-neutral-400' },
    EXPIRED: { label: 'Expiré', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-neutral-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-neutral-200 animate-pulse h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-neutral-200 animate-pulse h-64" />
          ))}
        </div>
      </div>
    )
  }

  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Bonjour' : today.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const monthChange = stats ? formatPercent(stats.monthRevenue, stats.lastMonthRevenue) : '0%'
  const isPositiveChange = stats ? stats.monthRevenue >= stats.lastMonthRevenue : true

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header avec salutation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            {greeting} ! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {stats && stats.pendingReservations > 0 && (
            <Link 
              href="/reservations?status=PENDING"
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{stats.pendingReservations} en attente</span>
            </Link>
          )}
        </div>
      </div>

      {/* Score de santé du club - Bande principale */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative grid grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Chiffre d'affaires du mois */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <CircleDollarSign className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider">Ce mois</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.monthRevenue || 0)}</p>
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              isPositiveChange ? "text-emerald-400" : "text-red-400"
            )}>
              {isPositiveChange ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>{monthChange} vs mois dernier</span>
            </div>
          </div>

          {/* Taux d'occupation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider">Occupation</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{stats?.occupancyRateMonth || 0}</span>
              <span className="text-lg text-neutral-400">%</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Ce mois</p>
          </div>

          {/* Réservations */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider">Réservations</span>
            </div>
            <p className="text-3xl font-bold">{stats?.monthReservations || 0}</p>
            <p className="text-xs text-neutral-500 mt-2">{stats?.todayReservations || 0} aujourd'hui</p>
          </div>

          {/* Bénéfice net */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider">Bénéfice</span>
            </div>
            <p className={cn(
              "text-3xl font-bold",
              (stats?.netProfit || 0) >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {formatCurrency(stats?.netProfit || 0)}
            </p>
            <p className="text-xs text-neutral-500 mt-2">Revenus - Dépenses</p>
          </div>

          {/* Joueurs actifs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider">Joueurs</span>
            </div>
            <p className="text-3xl font-bold">{stats?.activePlayersThisMonth || 0}</p>
            <p className="text-xs text-neutral-500 mt-2">
              <span className="text-emerald-400">+{stats?.newPlayersThisMonth || 0}</span> nouveaux
            </p>
          </div>
        </div>
      </div>

      {/* Ligne de KPIs secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Aujourd'hui */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Sun className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {stats?.occupancyRateToday || 0}% occupé
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats?.todayRevenue || 0)}</p>
          <p className="text-sm text-neutral-500 mt-1">Revenus du jour</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
            <Calendar className="h-3 w-3" />
            <span>{stats?.todayReservations || 0} réservations</span>
          </div>
        </div>

        {/* Cette semaine */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {stats?.occupancyRateWeek || 0}% occupé
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats?.weekRevenue || 0)}</p>
          <p className="text-sm text-neutral-500 mt-1">Revenus semaine</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
            <Calendar className="h-3 w-3" />
            <span>{stats?.weekReservations || 0} réservations</span>
          </div>
        </div>

        {/* Dépenses du mois */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.monthExpenses || 0)}</p>
          <p className="text-sm text-neutral-500 mt-1">Dépenses du mois</p>
          <Link href="/depenses" className="flex items-center gap-1 mt-3 text-xs text-blue-600 hover:text-blue-700">
            <span>Voir détails</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Panier moyen */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats?.avgRevenuePerReservation || 0)}</p>
          <p className="text-sm text-neutral-500 mt-1">Prix moyen / réservation</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
            <span>{stats?.activeTerrains || 0} terrains actifs</span>
          </div>
        </div>
      </div>

      {/* Section principale en 3 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: Planning du jour */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900">Planning du jour</h2>
                <p className="text-xs text-neutral-500">{stats?.todaySchedule.length || 0} réservations</p>
              </div>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {stats?.todaySchedule.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">Aucune réservation aujourd'hui</p>
                <p className="text-xs text-neutral-400 mt-1">Les créneaux sont tous disponibles</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {(stats?.todaySchedule || []).map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig]
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors">
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-mono font-semibold text-neutral-900">{item.time.split(' - ')[0]}</p>
                        <p className="text-[10px] text-neutral-400">{item.time.split(' - ')[1]}</p>
                      </div>
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-sm", 
                        item.status === 'CONFIRMED' ? 'bg-emerald-500' : 
                        item.status === 'PENDING' ? 'bg-amber-500' : 'bg-neutral-400'
                      )}>
                        {item.terrain}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{item.player}</p>
                        <p className="text-xs text-neutral-500">{formatCurrency(item.price)}</p>
                      </div>
                      <div className={cn("w-2 h-2 rounded-full", config?.dot)} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-neutral-100 bg-neutral-50">
            <Link 
              href="/reservations" 
              className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1 transition-colors font-medium"
            >
              Voir toutes les réservations <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Colonne 2: Performance des terrains + Heures de pointe */}
        <div className="space-y-6">
          {/* Performance par terrain */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900">Performance terrains</h2>
                  <p className="text-xs text-neutral-500">Ce mois</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {(stats?.terrainPerformance || []).map((terrain, idx) => (
                <div key={terrain.code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: terrain.color }}
                      >
                        {terrain.code}
                      </div>
                      <span className="text-sm font-medium text-neutral-900">Terrain {terrain.code}</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900">{formatCurrency(terrain.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ width: `${terrain.occupancyRate}%`, backgroundColor: terrain.color }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 w-12 text-right">{terrain.occupancyRate}%</span>
                  </div>
                  <p className="text-xs text-neutral-400">{terrain.reservations} réservations</p>
                </div>
              ))}
              {stats?.terrainPerformance.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-neutral-500">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Heures de pointe */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900">Heures de pointe</h2>
                  <p className="text-xs text-neutral-500">Créneaux les plus demandés</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {stats?.peakHours.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">Pas assez de données</p>
              ) : (
                <div className="space-y-3">
                  {(stats?.peakHours || []).map((peak, idx) => (
                    <div key={peak.hour} className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                        idx === 0 ? "bg-amber-100 text-amber-700" :
                        idx === 1 ? "bg-neutral-200 text-neutral-600" :
                        idx === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-neutral-100 text-neutral-500"
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-900">{peak.hour}</span>
                          <span className="text-sm text-neutral-500">{peak.count} réservations</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              idx === 0 ? "bg-amber-500" : "bg-neutral-300"
                            )}
                            style={{ width: `${(peak.count / (stats?.peakHours[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne 3: Top joueurs + Évolution hebdo */}
        <div className="space-y-6">
          {/* Top joueurs fidèles */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900">Top joueurs fidèles</h2>
                  <p className="text-xs text-neutral-500">Par montant dépensé</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-neutral-100">
              {stats?.topPlayers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-neutral-200 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">Aucun joueur</p>
                </div>
              ) : (
                (stats?.topPlayers || []).map((player, idx) => (
                  <div key={player.id} className="flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      idx === 0 ? "bg-amber-100" :
                      idx === 1 ? "bg-neutral-200" :
                      idx === 2 ? "bg-orange-100" :
                      "bg-neutral-100"
                    )}>
                      {idx === 0 ? <Crown className="h-4 w-4 text-amber-600" /> :
                       idx === 1 ? <Medal className="h-4 w-4 text-neutral-500" /> :
                       idx === 2 ? <Award className="h-4 w-4 text-orange-600" /> :
                       <span className="text-xs font-bold text-neutral-500">{idx + 1}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{player.name}</p>
                      <p className="text-xs text-neutral-500">{player.totalReservations} réservations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900">{formatCurrency(player.totalSpent)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-neutral-100 bg-neutral-50">
              <Link 
                href="/joueurs" 
                className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1 transition-colors font-medium"
              >
                Voir tous les joueurs <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mini graphique hebdo */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900">Activité 7 jours</h2>
                  <p className="text-xs text-neutral-500">Revenus quotidiens</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between gap-2 h-24">
                {(stats?.weeklyChartData || []).map((day, idx) => {
                  const maxRevenue = Math.max(...((stats?.weeklyChartData || []).map(d => d.revenue)), 1)
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 80 : 4
                  const isToday = idx === 6
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={cn(
                          "w-full rounded-t transition-all",
                          isToday ? "bg-blue-500" : "bg-neutral-200 hover:bg-neutral-300"
                        )}
                        style={{ height: `${Math.max(height, 4)}px` }}
                        title={`${day.day}: ${formatCurrency(day.revenue)}`}
                      />
                      <span className={cn(
                        "text-[10px] font-medium",
                        isToday ? "text-blue-600" : "text-neutral-400"
                      )}>
                        {day.day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique mensuel en bas */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Évolution sur 6 mois</h2>
              <p className="text-xs text-neutral-500">Revenus vs Dépenses</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-neutral-600">Revenus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-neutral-600">Dépenses</span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-4 h-48">
          {(stats?.monthlyChartData || []).map((data, i) => {
            const maxValue = Math.max(...((stats?.monthlyChartData || []).map(d => Math.max(d.revenue, d.expenses))), 1)
            const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 160 : 0
            const expenseHeight = maxValue > 0 ? (data.expenses / maxValue) * 160 : 0
            const profit = data.revenue - data.expenses
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center gap-1" style={{ height: '160px', alignItems: 'flex-end' }}>
                  <div 
                    className="w-[40%] bg-emerald-500 rounded-t transition-all hover:bg-emerald-600 cursor-pointer"
                    style={{ height: `${Math.max(revenueHeight, 4)}px` }}
                    title={`Revenus: ${formatCurrency(data.revenue)}`}
                  />
                  <div 
                    className="w-[40%] bg-red-400 rounded-t transition-all hover:bg-red-500 cursor-pointer"
                    style={{ height: `${Math.max(expenseHeight, 4)}px` }}
                    title={`Dépenses: ${formatCurrency(data.expenses)}`}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-500">{data.month}</span>
                <span className={cn(
                  "text-[10px] font-medium",
                  profit >= 0 ? "text-emerald-600" : "text-red-500"
                )}>
                  {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Occupation horaire du jour */}
      {stats?.hourlyOccupancy && stats.hourlyOccupancy.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">Occupation par créneau aujourd'hui</h2>
              <p className="text-xs text-neutral-500">Taux d'occupation en temps réel</p>
            </div>
          </div>
          <div className="flex items-end gap-1">
            {stats.hourlyOccupancy.map((slot) => (
              <div key={slot.hour} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    "w-full rounded-t transition-all",
                    slot.rate >= 100 ? "bg-emerald-500" :
                    slot.rate >= 50 ? "bg-blue-500" :
                    slot.rate > 0 ? "bg-amber-400" :
                    "bg-neutral-200"
                  )}
                  style={{ height: `${Math.max(slot.rate * 0.8, 4)}px`, minHeight: '4px' }}
                  title={`${slot.hour}: ${slot.rate}% occupé`}
                />
                <span className="text-[9px] text-neutral-400 font-medium">{slot.hour}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-neutral-600">100% (complet)</span>
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
        </div>
      )}
    </div>
  )
}
