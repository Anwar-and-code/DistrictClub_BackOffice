"use client"

import { useEffect, useState, useMemo } from "react"
import {
  FileBarChart,
  Download,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Types ──────────────────────────────────────────────────────────
interface CashSession {
  id: number
  opened_by: string
  closed_by: string | null
  opening_amount: number
  closing_amount: number | null
  expected_amount: number | null
  notes: string | null
  opened_at: string
  closed_at: string | null
}

interface PosOrder {
  id: number
  order_number: string
  session_id: number
  total: number
  status: string
  order_type: string | null
  payment_method: string
  employee_name: string
  client_name: string | null
  created_at: string
  payment_details: { method_name: string; amount: number }[] | null
  terrain?: { code: string } | null
  time_slot?: { start_time: string; end_time: string; price?: number } | null
}

interface SessionWithOrders extends CashSession {
  orders: PosOrder[]
  totalSales: number
  totalReservations: number
  orderCount: number
  ecart: number | null
}

interface CashierSummary {
  name: string
  sessionCount: number
  totalSales: number
  totalReservations: number
  orderCount: number
  avgEcart: number
  sessions: SessionWithOrders[]
}

// ─── Helpers ────────────────────────────────────────────────────────
const formatCurrency = (v: number) =>
  v.toLocaleString("fr-FR") + " F"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

const formatDateTime = (d: string) => `${formatDate(d)} ${formatTime(d)}`

// ─── Page ───────────────────────────────────────────────────────────
export default function RapportCaissePage() {
  const supabase = createClient()

  const [sessions, setSessions] = useState<CashSession[]>([])
  const [orders, setOrders] = useState<PosOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split("T")[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0])
  const [searchCashier, setSearchCashier] = useState("")
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())

  // ─── Load data ─────────────────────────────────────────────────
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [sessRes, ordRes] = await Promise.all([
        supabase
          .from("pos_cash_register_sessions")
          .select("*")
          .gte("opened_at", `${dateFrom}T00:00:00`)
          .lte("opened_at", `${dateTo}T23:59:59`)
          .order("opened_at", { ascending: false }),
        supabase
          .from("pos_orders")
          .select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time, price)")
          .eq("status", "completed")
          .gte("created_at", `${dateFrom}T00:00:00`)
          .lte("created_at", `${dateTo}T23:59:59`)
          .order("created_at", { ascending: false }),
      ])

      if (sessRes.error) throw sessRes.error
      if (ordRes.error) throw ordRes.error

      setSessions(sessRes.data || [])
      setOrders(ordRes.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [dateFrom, dateTo])

  // ─── Computed: sessions with orders ────────────────────────────
  const sessionsWithOrders: SessionWithOrders[] = useMemo(() => {
    return sessions.map((s) => {
      const sessionOrders = orders.filter((o) => o.session_id === s.id)
      const totalSales = sessionOrders.reduce((sum, o) => sum + o.total, 0)
      const totalReservations = sessionOrders
        .filter((o) => o.order_type === "terrain")
        .reduce((sum, o) => {
          const slotPrice = (o.time_slot as unknown as { price?: number })?.price || 0
          return sum + slotPrice
        }, 0)
      const ecart =
        s.closing_amount !== null && s.expected_amount !== null
          ? s.closing_amount - s.expected_amount
          : null

      return {
        ...s,
        orders: sessionOrders,
        totalSales,
        totalReservations,
        orderCount: sessionOrders.length,
        ecart,
      }
    })
  }, [sessions, orders])

  // ─── Computed: by cashier ──────────────────────────────────────
  const cashierSummaries: CashierSummary[] = useMemo(() => {
    const map = new Map<string, SessionWithOrders[]>()
    for (const s of sessionsWithOrders) {
      const name = s.opened_by || "Inconnu"
      if (!map.has(name)) map.set(name, [])
      map.get(name)!.push(s)
    }

    return Array.from(map.entries())
      .map(([name, sessions]) => {
        const closedSessions = sessions.filter((s) => s.ecart !== null)
        const avgEcart =
          closedSessions.length > 0
            ? closedSessions.reduce((sum, s) => sum + (s.ecart || 0), 0) / closedSessions.length
            : 0

        return {
          name,
          sessionCount: sessions.length,
          totalSales: sessions.reduce((sum, s) => sum + s.totalSales, 0),
          totalReservations: sessions.reduce((sum, s) => sum + s.totalReservations, 0),
          orderCount: sessions.reduce((sum, s) => sum + s.orderCount, 0),
          avgEcart,
          sessions,
        }
      })
      .filter(
        (c) =>
          !searchCashier ||
          c.name.toLowerCase().includes(searchCashier.toLowerCase())
      )
      .sort((a, b) => b.totalSales + b.totalReservations - (a.totalSales + a.totalReservations))
  }, [sessionsWithOrders, searchCashier])

  // ─── KPI totals ───────────────────────────────────────────────
  const totalCA = useMemo(
    () =>
      sessionsWithOrders.reduce(
        (sum, s) => sum + s.totalSales + s.totalReservations,
        0
      ),
    [sessionsWithOrders]
  )
  const totalOrders = useMemo(
    () => sessionsWithOrders.reduce((sum, s) => sum + s.orderCount, 0),
    [sessionsWithOrders]
  )
  const closedSessions = useMemo(
    () => sessionsWithOrders.filter((s) => s.ecart !== null),
    [sessionsWithOrders]
  )
  const avgEcart = useMemo(
    () =>
      closedSessions.length > 0
        ? closedSessions.reduce((sum, s) => sum + (s.ecart || 0), 0) /
          closedSessions.length
        : 0,
    [closedSessions]
  )

  // ─── Payment method breakdown ─────────────────────────────────
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of orders) {
      if (o.payment_details && Array.isArray(o.payment_details)) {
        for (const p of o.payment_details) {
          const name = p.method_name || "Inconnu"
          map[name] = (map[name] || 0) + (p.amount || 0)
        }
      } else {
        const pmMap: Record<string, string> = {
          cash: "Espèces",
          card: "Carte",
          mobile_money: "Mobile Money",
          mobile: "Mobile Money",
          mixed: "Mixte",
        }
        const name = pmMap[o.payment_method] || o.payment_method || "Espèces"
        map[name] = (map[name] || 0) + o.total
      }
    }
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [orders])

  // ─── Toggle session expand ────────────────────────────────────
  const toggleSession = (id: number) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─── Export CSV ───────────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      "Session",
      "Caissier",
      "Ouverture",
      "Fermeture",
      "Fond de caisse",
      "Nb commandes",
      "CA Produits",
      "CA Réservations",
      "CA Total",
      "Montant fermé",
      "Montant attendu",
      "Écart",
    ]
    const rows = sessionsWithOrders.map((s) => [
      `#${s.id}`,
      s.opened_by,
      formatDateTime(s.opened_at),
      s.closed_at ? formatDateTime(s.closed_at) : "En cours",
      s.opening_amount,
      s.orderCount,
      s.totalSales,
      s.totalReservations,
      s.totalSales + s.totalReservations,
      s.closing_amount ?? "",
      s.expected_amount ?? "",
      s.ecart ?? "",
    ])

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `rapport_caisse_${dateFrom}_${dateTo}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Export téléchargé")
  }

  // ─── Payment icon helper ──────────────────────────────────────
  const PaymentIcon = ({ name }: { name: string }) => {
    const n = name.toLowerCase()
    if (n.includes("espèce") || n.includes("cash")) return <Banknote className="h-4 w-4 text-emerald-600" />
    if (n.includes("carte") || n.includes("card")) return <CreditCard className="h-4 w-4 text-blue-600" />
    if (n.includes("mobile") || n.includes("wave") || n.includes("orange")) return <Smartphone className="h-4 w-4 text-orange-600" />
    return <DollarSign className="h-4 w-4 text-neutral-500" />
  }

  // ─── Session card ─────────────────────────────────────────────
  const SessionCard = ({ session }: { session: SessionWithOrders }) => {
    const isOpen = expandedSessions.has(session.id)
    const caTotal = session.totalSales + session.totalReservations
    const isActive = !session.closed_at

    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <button
          onClick={() => toggleSession(session.id)}
          className="w-full flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors text-left"
        >
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
              isActive ? "bg-emerald-50" : "bg-neutral-100"
            )}
          >
            <Receipt
              className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-neutral-500")}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-950">
                Session #{session.id}
              </span>
              {isActive && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                  EN COURS
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <User className="h-3 w-3" />
                {session.opened_by}
              </span>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(session.opened_at)}
              </span>
              <span className="text-xs text-neutral-500">
                {session.orderCount} commande{session.orderCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-neutral-950">
              {formatCurrency(caTotal)}
            </p>
            {session.ecart !== null && (
              <p
                className={cn(
                  "text-xs font-medium",
                  session.ecart === 0
                    ? "text-emerald-600"
                    : session.ecart > 0
                    ? "text-blue-600"
                    : "text-red-600"
                )}
              >
                Écart: {session.ecart > 0 ? "+" : ""}
                {formatCurrency(session.ecart)}
              </p>
            )}
          </div>

          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
          )}
        </button>

        {isOpen && (
          <div className="border-t border-neutral-100 p-4 space-y-4 bg-neutral-50/50">
            {/* Session details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 border border-neutral-100">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  Fond de caisse
                </p>
                <p className="text-sm font-semibold text-neutral-950">
                  {formatCurrency(session.opening_amount)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-neutral-100">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  CA Produits
                </p>
                <p className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(session.totalSales)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-neutral-100">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  CA Réservations
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  {formatCurrency(session.totalReservations)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-neutral-100">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  {session.closed_at ? "Fermée le" : "Statut"}
                </p>
                <p className="text-sm font-semibold text-neutral-950">
                  {session.closed_at ? formatDateTime(session.closed_at) : "En cours"}
                </p>
              </div>
            </div>

            {/* Closing info if available */}
            {session.closing_amount !== null && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-neutral-100">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Montant compté
                  </p>
                  <p className="text-sm font-semibold text-neutral-950">
                    {formatCurrency(session.closing_amount)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-neutral-100">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Montant attendu
                  </p>
                  <p className="text-sm font-semibold text-neutral-950">
                    {formatCurrency(session.expected_amount || 0)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-neutral-100">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Écart
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      session.ecart === 0
                        ? "text-emerald-600"
                        : (session.ecart || 0) > 0
                        ? "text-blue-600"
                        : "text-red-600"
                    )}
                  >
                    {(session.ecart || 0) > 0 ? "+" : ""}
                    {formatCurrency(session.ecart || 0)}
                  </p>
                </div>
              </div>
            )}

            {session.notes && (
              <div className="bg-white rounded-lg p-3 border border-neutral-100">
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  Notes
                </p>
                <p className="text-sm text-neutral-700">{session.notes}</p>
              </div>
            )}

            {/* Orders list */}
            {session.orders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Commandes ({session.orders.length})
                </p>
                <div className="space-y-1">
                  {session.orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-neutral-100 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-neutral-500">
                          {o.order_number}
                        </span>
                        <span className="text-neutral-700">
                          {o.order_type === "terrain"
                            ? `Terrain ${o.terrain?.code || ""}`
                            : "Produits"}
                        </span>
                        {o.client_name && (
                          <span className="text-xs text-neutral-400">
                            — {o.client_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400">
                          {formatTime(o.created_at)}
                        </span>
                        <span className="font-medium text-neutral-950">
                          {formatCurrency(
                            o.total +
                              (o.order_type === "terrain"
                                ? (o.time_slot as unknown as { price?: number })
                                    ?.price || 0
                                : 0)
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">
            Rapport Caisse
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Historique des sessions et encaissements
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={isLoading || sessions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      {/* Date filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm text-neutral-700 bg-transparent outline-none"
          />
        </div>
        <span className="text-neutral-400 text-sm">→</span>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm text-neutral-700 bg-transparent outline-none"
          />
        </div>
        <button
          onClick={() => {
            const today = new Date().toISOString().split("T")[0]
            setDateFrom(today)
            setDateTo(today)
          }}
          className="px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => {
            const d = new Date()
            d.setDate(d.getDate() - 7)
            setDateFrom(d.toISOString().split("T")[0])
            setDateTo(new Date().toISOString().split("T")[0])
          }}
          className="px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          7 jours
        </button>
        <button
          onClick={() => {
            const d = new Date()
            d.setDate(d.getDate() - 30)
            setDateFrom(d.toISOString().split("T")[0])
            setDateTo(new Date().toISOString().split("T")[0])
          }}
          className="px-3 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          30 jours
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-neutral-100 rounded w-1/3 mb-3" />
              <div className="h-8 bg-neutral-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center mb-3">
                <FileBarChart className="h-4.5 w-4.5 text-neutral-600" />
              </div>
              <p className="text-xs text-neutral-500 mb-1">Sessions</p>
              <p className="text-2xl font-semibold text-neutral-950">
                {sessions.length}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <p className="text-xs text-neutral-500 mb-1">CA Total</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCurrency(totalCA)}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <Receipt className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <p className="text-xs text-neutral-500 mb-1">Commandes</p>
              <p className="text-2xl font-semibold text-neutral-950">
                {totalOrders}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
                <DollarSign className="h-4.5 w-4.5 text-violet-600" />
              </div>
              <p className="text-xs text-neutral-500 mb-1">Ticket moyen</p>
              <p className="text-2xl font-semibold text-neutral-950">
                {totalOrders > 0
                  ? formatCurrency(Math.round(totalCA / totalOrders))
                  : "—"}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center mb-3",
                  avgEcart === 0
                    ? "bg-emerald-50"
                    : Math.abs(avgEcart) < 500
                    ? "bg-amber-50"
                    : "bg-red-50"
                )}
              >
                <AlertTriangle
                  className={cn(
                    "h-4.5 w-4.5",
                    avgEcart === 0
                      ? "text-emerald-600"
                      : Math.abs(avgEcart) < 500
                      ? "text-amber-600"
                      : "text-red-600"
                  )}
                />
              </div>
              <p className="text-xs text-neutral-500 mb-1">Écart moyen</p>
              <p
                className={cn(
                  "text-2xl font-semibold",
                  avgEcart === 0
                    ? "text-emerald-600"
                    : Math.abs(avgEcart) < 500
                    ? "text-amber-600"
                    : "text-red-600"
                )}
              >
                {closedSessions.length > 0
                  ? `${avgEcart > 0 ? "+" : ""}${formatCurrency(Math.round(avgEcart))}`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Payment breakdown */}
          {paymentBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-8">
              <h3 className="text-sm font-semibold text-neutral-950 mb-4">
                Répartition par mode de paiement
              </h3>
              <div className="flex flex-wrap gap-4">
                {paymentBreakdown.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2 bg-neutral-50 rounded-lg px-4 py-2.5"
                  >
                    <PaymentIcon name={p.name} />
                    <span className="text-sm text-neutral-700">{p.name}</span>
                    <span className="text-sm font-semibold text-neutral-950 ml-1">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs: All sessions / By cashier */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-neutral-100 p-1 rounded-lg">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium rounded-md"
              >
                Toutes les sessions
              </TabsTrigger>
              <TabsTrigger
                value="cashier"
                className="data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium rounded-md"
              >
                Par caissier
              </TabsTrigger>
            </TabsList>

            {/* All sessions tab */}
            <TabsContent value="all" className="space-y-3">
              {sessionsWithOrders.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <FileBarChart className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm">Aucune session sur cette période</p>
                </div>
              ) : (
                sessionsWithOrders.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))
              )}
            </TabsContent>

            {/* By cashier tab */}
            <TabsContent value="cashier" className="space-y-6">
              {/* Search */}
              <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 max-w-xs">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher un caissier..."
                  value={searchCashier}
                  onChange={(e) => setSearchCashier(e.target.value)}
                  className="text-sm text-neutral-700 bg-transparent outline-none flex-1"
                />
              </div>

              {cashierSummaries.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <User className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm">Aucun caissier trouvé</p>
                </div>
              ) : (
                cashierSummaries.map((c) => (
                  <div
                    key={c.name}
                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
                  >
                    {/* Cashier header */}
                    <div className="p-5 border-b border-neutral-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-neutral-950 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-950">
                              {c.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {c.sessionCount} session
                              {c.sessionCount > 1 ? "s" : ""} · {c.orderCount}{" "}
                              commande{c.orderCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-600">
                            {formatCurrency(c.totalSales + c.totalReservations)}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-medium",
                              c.avgEcart === 0
                                ? "text-emerald-600"
                                : Math.abs(c.avgEcart) < 500
                                ? "text-amber-600"
                                : "text-red-600"
                            )}
                          >
                            Écart moyen:{" "}
                            {c.avgEcart > 0 ? "+" : ""}
                            {formatCurrency(Math.round(c.avgEcart))}
                          </p>
                        </div>
                      </div>

                      {/* Mini summary */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                            Produits
                          </p>
                          <p className="text-sm font-semibold text-neutral-950">
                            {formatCurrency(c.totalSales)}
                          </p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                            Réservations
                          </p>
                          <p className="text-sm font-semibold text-neutral-950">
                            {formatCurrency(c.totalReservations)}
                          </p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                            Ticket moyen
                          </p>
                          <p className="text-sm font-semibold text-neutral-950">
                            {c.orderCount > 0
                              ? formatCurrency(
                                  Math.round(
                                    (c.totalSales + c.totalReservations) /
                                      c.orderCount
                                  )
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sessions list */}
                    <div className="divide-y divide-neutral-100">
                      {c.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-neutral-400">
                              #{s.id}
                            </span>
                            <span className="text-sm text-neutral-700">
                              {formatDate(s.opened_at)}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {formatTime(s.opened_at)}
                              {s.closed_at
                                ? ` → ${formatTime(s.closed_at)}`
                                : " (en cours)"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-neutral-500">
                              {s.orderCount} cmd
                            </span>
                            <span className="text-sm font-medium text-neutral-950">
                              {formatCurrency(s.totalSales + s.totalReservations)}
                            </span>
                            {s.ecart !== null && (
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-0.5 rounded-full",
                                  s.ecart === 0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : (s.ecart || 0) > 0
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-red-50 text-red-700"
                                )}
                              >
                                {s.ecart > 0 ? "+" : ""}
                                {formatCurrency(s.ecart)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
