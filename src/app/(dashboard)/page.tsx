"use client"

import { useEffect, useState } from "react"
import { Calendar, Users, TrendingUp, TrendingDown, Clock, ChevronRight, AlertCircle, CheckCircle2, XCircle, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardStats {
  todayReservations: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  monthExpenses: number
  netProfit: number
  totalPlayers: number
  activeTerrains: number
  pendingReservations: number
  monthlyChartData: { month: string; revenue: number; expenses: number }[]
  todaySchedule: {
    id: number
    time: string
    terrain: string
    player: string
    status: string
  }[]
  recentActivity: {
    id: number
    type: 'new' | 'confirmed' | 'canceled'
    message: string
    time: string
  }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

        // Today's reservations
        const { data: todayRes } = await supabase
          .from('reservations')
          .select(`
            id,
            status,
            reservation_date,
            created_at,
            terrain:terrains(code),
            time_slot:time_slots(start_time, end_time, price),
            user:profiles(first_name, last_name, email)
          `)
          .eq('reservation_date', today)
          .order('created_at', { ascending: true })

        // Week revenue
        const { data: weekRes } = await supabase
          .from('reservations')
          .select('time_slot:time_slots(price)')
          .eq('status', 'CONFIRMED')
          .gte('reservation_date', weekAgo)

        // Month revenue (all reservations)
        const { data: allReservations } = await supabase
          .from('reservations')
          .select('reservation_date, status, time_slot:time_slots(price)')

        // All expenses
        const { data: allExpenses } = await supabase
          .from('expenses')
          .select('expense_date, amount')

        // Pending reservations
        const { count: pendingCount } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING')

        // Players count
        const { count: playersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'JOUEUR')

        // Active terrains
        const { count: terrainsCount } = await supabase
          .from('terrains')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // Recent activity (last 5 reservations)
        const { data: recentRes } = await supabase
          .from('reservations')
          .select(`
            id,
            status,
            created_at,
            user:profiles(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        // Calculate revenues
        const todayRevenue = (todayRes || [])
          .filter(r => r.status === 'CONFIRMED')
          .reduce((sum, r) => {
            const slot = r.time_slot as { price?: number } | null
            return sum + (slot?.price || 0)
          }, 0)

        const weekRevenue = (weekRes || []).reduce((sum, r) => {
          const slot = r.time_slot as { price?: number } | null
          return sum + (slot?.price || 0)
        }, 0)

        // Month revenue
        const monthRevenue = (allReservations || [])
          .filter(r => r.status === 'CONFIRMED' && r.reservation_date >= monthStart)
          .reduce((sum, r) => {
            const slot = r.time_slot as { price?: number } | null
            return sum + (slot?.price || 0)
          }, 0)

        // Month expenses
        const monthExpenses = (allExpenses || [])
          .filter(e => e.expense_date >= monthStart)
          .reduce((sum, e) => sum + (e.amount || 0), 0)

        const netProfit = monthRevenue - monthExpenses

        // Calculate monthly data (last 12 months)
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        const monthlyChartData: { month: string; revenue: number; expenses: number }[] = []
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const year = date.getFullYear()
          const month = date.getMonth()
          const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
          const label = `${monthNames[month]} ${year.toString().slice(-2)}`
          
          const monthRevenue = (allReservations || [])
            .filter(r => r.status === 'CONFIRMED' && r.reservation_date.startsWith(monthStr))
            .reduce((sum, r) => {
              const slot = r.time_slot as { price?: number } | null
              return sum + (slot?.price || 0)
            }, 0)
          
          const monthExpensesData = (allExpenses || [])
            .filter(e => e.expense_date.startsWith(monthStr))
            .reduce((sum, e) => sum + (e.amount || 0), 0)
          
          monthlyChartData.push({ month: label, revenue: monthRevenue, expenses: monthExpensesData })
        }

        // Format today's schedule
        const todaySchedule = (todayRes || []).map(r => {
          const terrain = r.terrain as { code?: string } | null
          const timeSlot = r.time_slot as { start_time?: string; end_time?: string } | null
          const user = r.user as { first_name?: string; last_name?: string; email?: string } | null
          const playerName = user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user?.first_name || user?.last_name || user?.email || 'Inconnu'
          return {
            id: r.id,
            time: `${timeSlot?.start_time?.slice(0, 5) || ''} - ${timeSlot?.end_time?.slice(0, 5) || ''}`,
            terrain: terrain?.code || '?',
            player: playerName,
            status: r.status,
          }
        })

        // Format recent activity
        const recentActivity = (recentRes || []).map(r => {
          const user = r.user as { first_name?: string; last_name?: string } | null
          const playerName = user?.first_name || user?.last_name || 'Un joueur'
          const type = r.status === 'CONFIRMED' ? 'confirmed' : r.status === 'CANCELED' ? 'canceled' : 'new'
          const messages = {
            new: `${playerName} a fait une réservation`,
            confirmed: `Réservation de ${playerName} confirmée`,
            canceled: `Réservation de ${playerName} annulée`,
          }
          const createdAt = new Date(r.created_at)
          const now = new Date()
          const diff = now.getTime() - createdAt.getTime()
          const minutes = Math.floor(diff / 60000)
          const hours = Math.floor(diff / 3600000)
          const timeAgo = minutes < 60 ? `Il y a ${minutes}min` : hours < 24 ? `Il y a ${hours}h` : createdAt.toLocaleDateString('fr-FR')
          
          return {
            id: r.id,
            type: type as 'new' | 'confirmed' | 'canceled',
            message: messages[type],
            time: timeAgo,
          }
        })

        setStats({
          todayReservations: (todayRes || []).filter(r => r.status === 'CONFIRMED').length,
          todayRevenue,
          weekRevenue,
          monthRevenue,
          monthExpenses,
          netProfit,
          totalPlayers: playersCount || 0,
          activeTerrains: terrainsCount || 0,
          pendingReservations: pendingCount || 0,
          monthlyChartData,
          todaySchedule,
          recentActivity,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const statusConfig = {
    CONFIRMED: { label: 'Confirmé', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700', icon: Clock },
    CANCELED: { label: 'Annulé', color: 'bg-neutral-100 text-neutral-500', icon: XCircle },
    EXPIRED: { label: 'Expiré', color: 'bg-red-50 text-red-700', icon: XCircle },
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
              <div className="h-10 w-10 bg-neutral-100 rounded-lg mb-4" />
              <div className="h-4 w-20 bg-neutral-100 rounded mb-2" />
              <div className="h-8 w-16 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-950">Tableau de bord</h1>
        <p className="text-sm text-neutral-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Alert for pending reservations */}
      {stats && stats.pendingReservations > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {stats.pendingReservations} réservation{stats.pendingReservations > 1 ? 's' : ''} en attente de confirmation
            </p>
          </div>
          <Link href="/reservations?status=PENDING" className="text-sm font-medium text-amber-700 hover:text-amber-900">
            Voir →
          </Link>
        </div>
      )}

      {/* Main Stats - 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Ce mois</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-600">{stats?.monthRevenue.toLocaleString('fr-FR')} <span className="text-sm font-normal text-neutral-400">F</span></p>
          <p className="text-xs text-neutral-500 mt-1">Chiffre d'affaires</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Ce mois</span>
          </div>
          <p className="text-2xl font-semibold text-red-600">{stats?.monthExpenses.toLocaleString('fr-FR')} <span className="text-sm font-normal text-neutral-400">F</span></p>
          <p className="text-xs text-neutral-500 mt-1">Dépenses</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", (stats?.netProfit || 0) >= 0 ? "bg-emerald-50" : "bg-red-50")}>
              {(stats?.netProfit || 0) >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
            </div>
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Ce mois</span>
          </div>
          <p className={cn("text-2xl font-semibold", (stats?.netProfit || 0) >= 0 ? "text-emerald-600" : "text-red-600")}>
            {(stats?.netProfit || 0) >= 0 ? '+' : ''}{stats?.netProfit.toLocaleString('fr-FR')} <span className="text-sm font-normal text-neutral-400">F</span>
          </p>
          <p className="text-xs text-neutral-500 mt-1">Bénéfice net</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-neutral-950">{stats?.totalPlayers}</p>
          <p className="text-xs text-neutral-500 mt-1">Joueurs inscrits</p>
        </div>
      </div>

      {/* 12-Month Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-neutral-950">Évolution sur 12 mois</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Chiffre d'affaires vs Dépenses</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-neutral-600">Revenus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span className="text-neutral-600">Dépenses</span>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-1 h-52">
          {stats?.monthlyChartData.map((data: { month: string; revenue: number; expenses: number }, i: number) => {
            const maxValue = Math.max(...(stats?.monthlyChartData.map((d: { revenue: number; expenses: number }) => Math.max(d.revenue, d.expenses)) || [1]), 1)
            const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 180 : 0
            const expenseHeight = maxValue > 0 ? (data.expenses / maxValue) * 180 : 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-center gap-0.5" style={{ height: '180px', alignItems: 'flex-end' }}>
                  <div 
                    className="w-[45%] bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                    style={{ height: `${revenueHeight}px`, minHeight: data.revenue > 0 ? '4px' : '0' }}
                    title={`Revenus: ${data.revenue.toLocaleString('fr-FR')} F`}
                  />
                  <div 
                    className="w-[45%] bg-red-400 rounded-t transition-all hover:bg-red-500"
                    style={{ height: `${expenseHeight}px`, minHeight: data.expenses > 0 ? '4px' : '0' }}
                    title={`Dépenses: ${data.expenses.toLocaleString('fr-FR')} F`}
                  />
                </div>
                <span className="text-[9px] text-neutral-500 font-medium">{data.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 text-white">
          <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Aujourd'hui</p>
          <p className="text-xl font-semibold">{stats?.todayRevenue.toLocaleString('fr-FR')} F</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Cette semaine</p>
          <p className="text-xl font-semibold text-neutral-950">{stats?.weekRevenue.toLocaleString('fr-FR')} F</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Réservations</p>
          <p className="text-xl font-semibold text-neutral-950">{stats?.todayReservations} <span className="text-sm font-normal text-neutral-400">aujourd'hui</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-950">Planning du jour</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{stats?.activeTerrains} terrains</span>
            </div>
          </div>
          <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
            {stats?.todaySchedule.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Aucune réservation aujourd'hui</p>
              </div>
            ) : (
              stats?.todaySchedule.map((item) => {
                const config = statusConfig[item.status as keyof typeof statusConfig]
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs font-mono text-neutral-500">{item.time.split(' - ')[0]}</p>
                      <p className="text-[10px] text-neutral-400">{item.time.split(' - ')[1]}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">{item.terrain}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-950 truncate">{item.player}</p>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full shrink-0", config?.color)}>
                      {config?.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
          <div className="p-4 border-t border-neutral-100">
            <Link 
              href="/reservations" 
              className="text-sm text-neutral-500 hover:text-neutral-950 flex items-center justify-center gap-1 transition-colors"
            >
              Toutes les réservations <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-950">Activité récente</h2>
          </div>
          <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
            {stats?.recentActivity.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Aucune activité récente</p>
              </div>
            ) : (
              stats?.recentActivity.map((activity) => {
                const icons = {
                  new: <Calendar className="h-4 w-4 text-blue-600" />,
                  confirmed: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
                  canceled: <XCircle className="h-4 w-4 text-red-500" />,
                }
                const bgColors = {
                  new: 'bg-blue-50',
                  confirmed: 'bg-emerald-50',
                  canceled: 'bg-red-50',
                }
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors">
                    <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0", bgColors[activity.type])}>
                      {icons[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-950">{activity.message}</p>
                      <p className="text-xs text-neutral-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="p-4 border-t border-neutral-100">
            <Link 
              href="/joueurs" 
              className="text-sm text-neutral-500 hover:text-neutral-950 flex items-center justify-center gap-1 transition-colors"
            >
              Voir tous les joueurs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
