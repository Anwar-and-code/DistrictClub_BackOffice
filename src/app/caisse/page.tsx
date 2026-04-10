"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Coffee,
  CupSoda,
  Cookie,
  CircleDot,
  DollarSign,
  CreditCard,
  Smartphone,
  Receipt,
  Package,
  Search,
  Banknote,
  Pencil,
  ArrowLeft,
  RotateCcw,
  ClipboardList,
  MapPin,
  Clock,
  Check,
  Printer,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Info,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import Link from "next/link"
import VirtualKeyboard, { useVirtualKeyboardEnabled } from "@/components/ui/virtual-keyboard"

// ─── Types ───────────────────────────────────────────────────────────
interface PosCategory {
  id: number
  name: string
  icon: string | null
  display_order: number
  is_active: boolean
}

interface PosProduct {
  id: number
  category_id: number | null
  name: string
  product_type: "bien" | "service"
  price: number
  price_ttc: number
  selling_price_ht: number
  tax_rate: number
  purchase_price: number
  stock_quantity: number | null
  is_active: boolean
}

interface CartItem {
  product: PosProduct
  quantity: number
}

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
  total: number
  status: "pending" | "completed" | "cancelled"
  order_type: "table" | "terrain" | null
  payment_method: string
  cash_received: number | null
  change_given: number | null
  employee_name: string
  table_id: number | null
  terrain_id: number | null
  time_slot_id: number | null
  reservation_id: number | null
  reservation_date: string | null
  client_name: string | null
  client_phone: string | null
  created_at: string
  payment_details?: { method_name: string; payment_method_id: number; amount: number; amount_received: number; amount_returned: number }[] | null
  table?: { name: string } | null
  terrain?: { code: string } | null
  time_slot?: { start_time: string; end_time: string; price?: number } | null
  reservation?: { actual_price: number | null } | null
}

interface Terrain {
  id: number
  code: string
  is_active: boolean
}

interface TimeSlot {
  id: number
  start_time: string
  end_time: string
  price: number
  is_active: boolean
}

interface PosTable {
  id: number
  name: string
  capacity: number
  shape: "round" | "square" | "rectangle"
  is_active: boolean
}

interface ActiveReservation {
  id: number
  terrain_id: number
  time_slot_id: number
  reservation_date: string
  status: string
  user_id?: string
  client_id?: string | null
  duration_minutes?: number
  actual_price?: number | null
  terrain?: { id: number; code: string }
  time_slot?: { id: number; start_time: string; end_time: string; price?: number }
  user?: { id: string; first_name: string | null; last_name: string | null; email?: string; phone: string | null } | null
  client?: { id: string; full_name: string; phone: string } | null
}

// ─── Icon Map ────────────────────────────────────────────────────────
const categoryIcons: Record<string, React.ReactNode> = {
  coffee: <Coffee className="h-4 w-4" />,
  "cup-soda": <CupSoda className="h-4 w-4" />,
  cookie: <Cookie className="h-4 w-4" />,
  "circle-dot": <CircleDot className="h-4 w-4" />,
}

// ─── Helpers ─────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR").format(amount) + " F"

const translatePaymentMethod = (method: string): string => {
  const map: Record<string, string> = { cash: "Espèces", card: "Carte", mobile_money: "Mobile", mobile: "Mobile" }
  return map[method] || method || "—"
}

const generateOrderNumber = () => {
  const now = new Date()
  const date = now.toISOString().slice(2, 10).replace(/-/g, "")
  const time = now.toTimeString().slice(0, 5).replace(":", "")
  const rand = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0")
  return `T${date}-${time}${rand}`
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function CaissePage() {
  const { employee } = useAuth()
  const supabase = createClient()
  const [vkEnabled] = useVirtualKeyboardEnabled()

  // Data
  const [categories, setCategories] = useState<PosCategory[]>([])
  const [products, setProducts] = useState<PosProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Cash session
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [openingAmount, setOpeningAmount] = useState("")

  // Checkout
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Close session
  const [showCloseSession, setShowCloseSession] = useState(false)
  const [closingAmount, setClosingAmount] = useState("")
  const [closingNotes, setClosingNotes] = useState("")

  // Today's stats
  const [todayOrders, setTodayOrders] = useState<PosOrder[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<PosOrder | null>(null)
  const [selectedTicketItems, setSelectedTicketItems] = useState<{ product_name: string; quantity: number; unit_price: number; total: number }[]>([])
  const [ticketReservationPrice, setTicketReservationPrice] = useState(0)
  const [selectedTicketPayments, setSelectedTicketPayments] = useState<{ method_name: string; amount: number; amount_received: number; amount_returned: number }[]>([])
  const [sessionExpenses, setSessionExpenses] = useState<{ id: number; description: string; amount: number; category: string; created_at: string }[]>([])
  const [showZReport, setShowZReport] = useState(false)
  const [historyPage, setHistoryPage] = useState(0)
  const [zReportDate, setZReportDate] = useState("")
  const [zReportOrders, setZReportOrders] = useState<PosOrder[]>([])
  const [zReportExpenses, setZReportExpenses] = useState<{ id: number; description: string; amount: number; category: string; created_at: string }[]>([])
  const [zReportLoading, setZReportLoading] = useState(false)

  // Commander
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [posTables, setPosTables] = useState<PosTable[]>([])
  const [activeReservations, setActiveReservations] = useState<ActiveReservation[]>([])
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [showTerrainModal, setShowTerrainModal] = useState(false)
  const [occupiedTableIds, setOccupiedTableIds] = useState<number[]>([])

  // Pending orders
  const [pendingOrders, setPendingOrders] = useState<PosOrder[]>([])
  const [showPending, setShowPending] = useState(false)
  const [payingOrder, setPayingOrder] = useState<PosOrder | null>(null)
  const [payingOrderItems, setPayingOrderItems] = useState<{ product_name: string; quantity: number; unit_price: number; total: number }[]>([])

  // Payment (multi-payment like reservations)
  const [sysPaymentMethods, setSysPaymentMethods] = useState<{ id: number; name: string; is_active: boolean }[]>([])
  const [orderPayments, setOrderPayments] = useState<{ payment_method_id: number; amount: number; amount_received: number; amount_returned: number }[]>([])
  const [selectedPayMethodId, setSelectedPayMethodId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState("")
  const [reservationPrice, setReservationPrice] = useState(0)

  // Product management
  const [showProductModal, setShowProductModal] = useState<{
    type: "create" | "edit"
    product?: PosProduct
  } | null>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category_id: "",
    stock_quantity: "",
  })
  const [isSavingProduct, setIsSavingProduct] = useState(false)

  // Expenses
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", beneficiaire: "", expense_type_id: "" })
  const [isSavingExpense, setIsSavingExpense] = useState(false)
  const [expenseTypes, setExpenseTypes] = useState<{ id: number; name: string; description: string | null }[]>([])

  // Reservation modal
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [resModalDate, setResModalDate] = useState(new Date().toISOString().split("T")[0])
  const [resModalReservations, setResModalReservations] = useState<ActiveReservation[]>([])
  const [resModalSelectedRes, setResModalSelectedRes] = useState<ActiveReservation | null>(null)
  const [resModalQuickAdd, setResModalQuickAdd] = useState<{ terrainId: number; slotId: number } | null>(null)
  const [resModalQuickAddForm, setResModalQuickAddForm] = useState({ name: "", phone: "", duration: 90 as 30 | 60 | 90 })
  const [resModalLoading, setResModalLoading] = useState(false)

  // All order payment details (order_id → [{method_name, amount}])
  const [allOrderPayments, setAllOrderPayments] = useState<Record<number, { method_name: string; amount: number }[]>>({})

  // ─── Load Data ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [catRes, prodRes, sessionRes, terrainRes, slotRes] = await Promise.all([
        supabase
          .from("pos_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("pos_products")
          .select("*")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("pos_cash_register_sessions")
          .select("*")
          .is("closed_at", null)
          .order("opened_at", { ascending: false })
          .limit(1),
        supabase
          .from("terrains")
          .select("*")
          .eq("is_active", true)
          .order("code"),
        supabase
          .from("time_slots")
          .select("*")
          .eq("is_active", true)
          .order("start_time"),
      ])

      if (catRes.error) throw catRes.error
      if (prodRes.error) throw prodRes.error
      if (sessionRes.error) throw sessionRes.error

      setCategories(catRes.data || [])
      setProducts(prodRes.data || [])
      setCurrentSession(sessionRes.data?.[0] || null)
      setTerrains(terrainRes.data || [])
      setTimeSlots(slotRes.data || [])

      // Load tables
      const { data: tablesData } = await supabase
        .from("pos_tables")
        .select("*")
        .eq("is_active", true)
        .order("name")
      setPosTables(tablesData || [])

      // Load system payment methods
      const { data: pmData } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("display_order")
      setSysPaymentMethods(pmData || [])

      // Load expense types
      const { data: etData } = await supabase
        .from("expense_types")
        .select("id, name, description")
        .eq("is_active", true)
        .order("name")
      setExpenseTypes(etData || [])

      setSessionChecked(true)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
      setSessionChecked(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadTodayOrders = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data } = await supabase
      .from("pos_orders")
      .select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time, price), reservation:reservations(actual_price)")
      .gte("created_at", `${today}T00:00:00`)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
    setTodayOrders(data || [])
  }, [])

  const loadPendingOrders = useCallback(async () => {
    const { data } = await supabase
      .from("pos_orders")
      .select("*, table:pos_tables(name), terrain:terrains(code), time_slot:time_slots(start_time, end_time, price)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
    setPendingOrders(data || [])
    // Compute occupied table ids
    const tIds = (data || []).filter((o: PosOrder) => o.table_id).map((o: PosOrder) => o.table_id as number)
    setOccupiedTableIds(tIds)
  }, [])

  // ─── Load active reservations (today, CONFIRMED/PAID) ───────────
  const loadActiveReservations = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data } = await supabase
      .from("reservations")
      .select(`
        id, reservation_date, status, created_at, terrain_id, time_slot_id, user_id, client_id, duration_minutes, actual_price,
        terrain:terrains(id, code),
        time_slot:time_slots(id, start_time, end_time, price),
        user:profiles!reservations_user_id_profiles_fkey(id, first_name, last_name, email, phone),
        client:clients(id, full_name, phone)
      `)
      .eq("reservation_date", today)
      .in("status", ["CONFIRMED", "PAID"])
      .order("time_slot_id")
    setActiveReservations((data || []) as unknown as ActiveReservation[])
  }, [])

  const loadAllOrderPayments = useCallback(async (orders: PosOrder[]) => {
    const result: Record<number, { method_name: string; amount: number }[]> = {}
    if (orders.length === 0) { setAllOrderPayments(result); return }

    // 1) First: use payment_details JSONB from orders (most reliable)
    for (const order of orders) {
      if (order.payment_details && Array.isArray(order.payment_details) && order.payment_details.length > 0) {
        result[order.id] = order.payment_details.map((p) => ({
          method_name: p.method_name || "Inconnu",
          amount: p.amount || 0,
        }))
      }
    }

    // 2) For orders without payment_details JSONB, try pos_order_payments table
    const missingIds = orders.filter((o) => !result[o.id]).map((o) => o.id)
    if (missingIds.length > 0) {
      const { data: opData } = await supabase
        .from("pos_order_payments")
        .select("order_id, amount, payment_method:payment_methods(name)")
        .in("order_id", missingIds)

      if (opData && opData.length > 0) {
        for (const row of opData) {
          const oid = row.order_id as number
          if (!result[oid]) result[oid] = []
          const pm = row.payment_method as unknown as { name: string } | null
          result[oid].push({
            method_name: pm?.name || "Inconnu",
            amount: row.amount as number,
          })
        }
      }
    }

    // 3) For terrain orders still missing, try reservation_payments
    const terrainOrders = orders.filter((o) => o.reservation_id && !result[o.id])
    if (terrainOrders.length > 0) {
      const resIds = terrainOrders.map((o) => o.reservation_id as number)
      const { data: rpData } = await supabase
        .from("reservation_payments")
        .select("reservation_id, amount, payment_method:payment_methods(name)")
        .in("reservation_id", resIds)

      if (rpData && rpData.length > 0) {
        const resIdToOrderId: Record<number, number> = {}
        terrainOrders.forEach((o) => { if (o.reservation_id) resIdToOrderId[o.reservation_id] = o.id })

        for (const row of rpData) {
          const orderId = resIdToOrderId[row.reservation_id as number]
          if (!orderId) continue
          if (!result[orderId]) result[orderId] = []
          const pm = row.payment_method as unknown as { name: string } | null
          result[orderId].push({
            method_name: pm?.name || "Inconnu",
            amount: row.amount as number,
          })
        }
      }
    }

    // 4) Last resort: single entry from order.payment_method
    for (const order of orders) {
      if (!result[order.id]) {
        const pmMap: Record<string, string> = { cash: "Espèces", card: "Carte", mobile_money: "Mobile", mobile: "Mobile", mixed: "Paiement multiple" }
        const methodName = pmMap[order.payment_method] || order.payment_method || "Espèces"
        let total = order.total
        if (order.order_type === "terrain") {
          if (order.reservation?.actual_price != null) {
            total += order.reservation.actual_price
          } else if (order.time_slot) {
            const slot = order.time_slot as unknown as { price?: number }
            total += slot.price || 0
          }
        }
        result[order.id] = [{ method_name: methodName, amount: total }]
      }
    }

    setAllOrderPayments(result)
  }, [])

  const loadSessionExpenses = useCallback(async () => {
    if (!currentSession) return
    const { data } = await supabase
      .from("pos_expenses")
      .select("*")
      .eq("session_id", currentSession.id)
      .order("created_at", { ascending: false })
    setSessionExpenses(data || [])
  }, [currentSession])

  // ─── Z Report date navigation ─────────────────────────────────
  const loadZReportForDate = useCallback(async (date: string) => {
    setZReportLoading(true)
    try {
      const nextDay = new Date(date + "T12:00:00")
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().split("T")[0]

      const [ordRes, expRes] = await Promise.all([
        supabase
          .from("pos_orders")
          .select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time, price), reservation:reservations(actual_price)")
          .gte("created_at", `${date}T00:00:00`)
          .lt("created_at", `${nextDayStr}T00:00:00`)
          .eq("status", "completed")
          .order("created_at", { ascending: false }),
        supabase
          .from("pos_expenses")
          .select("id, description, amount, category, created_at")
          .gte("created_at", `${date}T00:00:00`)
          .lt("created_at", `${nextDayStr}T00:00:00`)
      ])
      setZReportOrders(ordRes.data || [])
      setZReportExpenses(expRes.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setZReportLoading(false)
    }
  }, [])

  // ─── Reservation Modal Functions ────────────────────────────────
  const loadResModalReservations = useCallback(async (date: string) => {
    setResModalLoading(true)
    try {
      const { data } = await supabase
        .from("reservations")
        .select(`
          id, reservation_date, status, created_at, terrain_id, time_slot_id, user_id, client_id, duration_minutes, actual_price,
          terrain:terrains(id, code),
          time_slot:time_slots(id, start_time, end_time, price),
          user:profiles!reservations_user_id_profiles_fkey(id, first_name, last_name, email, phone),
          client:clients(id, full_name, phone)
        `)
        .eq("reservation_date", date)
        .neq("status", "CANCELED")
      setResModalReservations((data || []) as unknown as ActiveReservation[])
    } catch (error) {
      console.error(error)
    } finally {
      setResModalLoading(false)
    }
  }, [])

  const getResEffectivePrice = (r: ActiveReservation) => r.actual_price ?? r.time_slot?.price ?? 0

  const getSlotDurationMinutes = (slotId: number) => {
    const slot = timeSlots.find(ts => ts.id === slotId)
    if (!slot) return 60
    const [sh, sm] = slot.start_time.split(':').map(Number)
    const [eh, em] = slot.end_time.split(':').map(Number)
    return (eh * 60 + em) - (sh * 60 + sm)
  }

  const getDurationOptions = (slotId: number): (30 | 60 | 90)[] => {
    const slotDur = getSlotDurationMinutes(slotId)
    if (slotDur <= 60) return [30, 60]
    return [30, 60, 90]
  }

  const getPriceForDuration = (slotId: number, duration: number) => {
    const slot = timeSlots.find(ts => ts.id === slotId)
    if (!slot) return 0
    const slotDur = getSlotDurationMinutes(slotId)
    const units = slotDur / 30
    const pricePerUnit = slot.price / units
    return Math.round(pricePerUnit * (duration / 30))
  }

  const getResPlayerName = (r: ActiveReservation) => {
    if (r.client?.full_name) return r.client.full_name
    if (r.user?.first_name && r.user?.last_name) return `${r.user.first_name} ${r.user.last_name}`
    return r.user?.first_name || r.user?.last_name || "Client"
  }

  const getResPlayerPhone = (r: ActiveReservation): string | null => {
    if (r.client?.phone) return r.client.phone
    return r.user?.phone || null
  }

  const formatResPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }

  const handleResModalStatusChange = async (resId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", resId)
      if (error) throw error
      toast.success(newStatus === "CANCELED" ? "Réservation annulée" : newStatus === "CONFIRMED" ? "Réservation confirmée" : "Statut mis à jour")
      setResModalSelectedRes(null)
      loadResModalReservations(resModalDate)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleResModalQuickAdd = async () => {
    if (!resModalQuickAdd) return
    const phoneDigits = resModalQuickAddForm.phone.replace(/\D/g, "")
    if (!resModalQuickAddForm.name.trim() || phoneDigits.length !== 10) return
    if (!phoneDigits.startsWith("01") && !phoneDigits.startsWith("05") && !phoneDigits.startsWith("07")) {
      toast.error("Le numéro doit commencer par 01, 05 ou 07")
      return
    }
    let step = ""
    try {
      // Check availability
      step = "availability"
      const { data: existing, error: existingErr } = await supabase
        .from("reservations")
        .select("id")
        .eq("terrain_id", resModalQuickAdd.terrainId)
        .eq("time_slot_id", resModalQuickAdd.slotId)
        .eq("reservation_date", resModalDate)
        .neq("status", "CANCELED")
        .limit(1)
      if (existingErr) throw existingErr
      if (existing && existing.length > 0) {
        toast.error("Ce créneau vient d'être réservé")
        setResModalQuickAdd(null)
        loadResModalReservations(resModalDate)
        return
      }
      // Get or create client
      step = "clientLookup"
      let clientId: string
      const { data: existingClient, error: lookupErr } = await supabase.from("clients").select("id").eq("phone", phoneDigits).maybeSingle()
      if (lookupErr) throw lookupErr
      if (existingClient) {
        clientId = existingClient.id
      } else {
        step = "clientInsert"
        const { data: newClient, error: clientErr } = await supabase
          .from("clients")
          .insert({ full_name: resModalQuickAddForm.name.trim(), phone: phoneDigits })
          .select("id")
          .single()
        if (clientErr) throw clientErr
        clientId = newClient.id
      }
      // Get manual reservation user id
      step = "settings"
      const { data: settings, error: settingsErr } = await supabase.from("app_settings").select("manual_reservation_user_id").eq("id", 1).maybeSingle()
      if (settingsErr) throw settingsErr
      const userId = settings?.manual_reservation_user_id || "304ab821-ba18-44f2-be5c-f3741cfa4f44"
      // Create reservation
      step = "reservationInsert"
      const dur = resModalQuickAddForm.duration
      const slotDur = getSlotDurationMinutes(resModalQuickAdd.slotId)
      const actualPrice = getPriceForDuration(resModalQuickAdd.slotId, dur)
      const { data: newRes, error: resErr } = await supabase.from("reservations").insert({
        terrain_id: resModalQuickAdd.terrainId,
        time_slot_id: resModalQuickAdd.slotId,
        reservation_date: resModalDate,
        user_id: userId,
        client_id: clientId,
        status: "CONFIRMED",
        duration_minutes: dur,
        actual_price: dur < slotDur ? actualPrice : null,
      })
        .select(`
          *,
          terrain:terrains(id, code),
          time_slot:time_slots(id, start_time, end_time, price),
          client:clients(id, full_name, phone)
        `)
        .single()
      if (resErr) throw resErr
      toast.success("Réservation créée")
      setResModalQuickAdd(null)
      setResModalQuickAddForm({ name: "", phone: "", duration: 90 })
      loadResModalReservations(resModalDate)
    } catch (error: unknown) {
      const e = error && typeof error === "object" ? error as Record<string, unknown> : null
      const msg = String(e?.message || e?.details || e?.hint || (error instanceof Error ? error.message : "Erreur lors de la réservation"))
      console.error(`[quickAdd][${step}]`, msg, "code:", e?.code, "details:", e?.details, "hint:", e?.hint)
      toast.error(msg)
    }
  }

  const openTicketDetail = async (order: PosOrder) => {
    setSelectedTicket(order)
    setSelectedTicketItems([])
    setTicketReservationPrice(0)
    setSelectedTicketPayments([])

    const { data: items } = await supabase
      .from("pos_order_items")
      .select("product_name, quantity, unit_price, total")
      .eq("order_id", order.id)
    setSelectedTicketItems(items || [])

    if (order.reservation_id) {
      const { data: res } = await supabase
        .from("reservations")
        .select("actual_price, time_slot:time_slots(price)")
        .eq("id", order.reservation_id)
        .single()
      if (res) {
        const slot = res.time_slot as unknown as { price: number } | null
        setTicketReservationPrice(res.actual_price ?? slot?.price ?? 0)
      }
    }

    // Load payment details — try multiple sources in priority order
    // 1) payment_details JSONB on pos_orders (most reliable, always saved with the order)
    if (order.payment_details && Array.isArray(order.payment_details) && order.payment_details.length > 0) {
      setSelectedTicketPayments(order.payment_details.map((p) => ({
        method_name: p.method_name || "Inconnu",
        amount: p.amount || 0,
        amount_received: p.amount_received || p.amount || 0,
        amount_returned: p.amount_returned || 0,
      })))
    } else {
      // 2) Try pos_order_payments table
      const mapPmtRow = (p: Record<string, unknown>) => {
        const pm = p.payment_method as unknown as { name: string } | null
        return {
          method_name: pm?.name || "Inconnu",
          amount: (p.amount as number) || 0,
          amount_received: (p.amount_received as number) || (p.amount as number) || 0,
          amount_returned: (p.amount_returned as number) || 0,
        }
      }

      let { data: orderPmts } = await supabase
        .from("pos_order_payments")
        .select("payment_method_id, amount, amount_received, amount_returned, payment_method:payment_methods(name)")
        .eq("order_id", order.id)
      if (!orderPmts) {
        const { data: basicPmts } = await supabase
          .from("pos_order_payments")
          .select("payment_method_id, amount, payment_method:payment_methods(name)")
          .eq("order_id", order.id)
        orderPmts = basicPmts as any
      }

      if (orderPmts && orderPmts.length > 0) {
        setSelectedTicketPayments(orderPmts.map(mapPmtRow))
      } else if (order.reservation_id) {
        // 3) Try reservation_payments
        let { data: resPmts } = await supabase
          .from("reservation_payments")
          .select("payment_method_id, amount, amount_received, amount_returned, payment_method:payment_methods(name)")
          .eq("reservation_id", order.reservation_id)
        if (!resPmts) {
          const { data: basicRes } = await supabase
            .from("reservation_payments")
            .select("payment_method_id, amount, payment_method:payment_methods(name)")
            .eq("reservation_id", order.reservation_id)
          resPmts = basicRes as any
        }
        if (resPmts && resPmts.length > 0) {
          setSelectedTicketPayments(resPmts.map(mapPmtRow))
        }
      }
    }
  }

  const openTerrainInfoTicket = async (res: ActiveReservation) => {
    // Look for an existing completed order linked to this reservation
    const { data: orders } = await supabase
      .from("pos_orders")
      .select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time, price), table:pos_tables(name)")
      .eq("reservation_id", res.id)
      .in("status", ["completed", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)

    if (orders && orders.length > 0) {
      openTicketDetail(orders[0] as PosOrder)
    } else {
      // No order exists — build a synthetic ticket with reservation info only
      const effectivePrice = getResEffectivePrice(res)
      const syntheticOrder: PosOrder = {
        id: 0,
        order_number: "—",
        total: 0,
        status: "completed",
        order_type: "terrain",
        payment_method: "",
        cash_received: null,
        change_given: null,
        employee_name: "",
        table_id: null,
        terrain_id: res.terrain_id,
        time_slot_id: res.time_slot_id,
        reservation_id: res.id,
        reservation_date: res.reservation_date,
        client_name: getResPlayerName(res),
        client_phone: getResPlayerPhone(res),
        created_at: new Date().toISOString(),
        terrain: res.terrain ? { code: res.terrain.code } : null,
        time_slot: res.time_slot ? { start_time: res.time_slot.start_time, end_time: res.time_slot.end_time, price: effectivePrice } : null,
      }
      setSelectedTicket(syntheticOrder)
      setSelectedTicketItems([])
      setTicketReservationPrice(effectivePrice)
      setSelectedTicketPayments([])

      // If reservation is PAID, try to load reservation_payments
      if (res.status === "PAID") {
        const { data: resPmts } = await supabase
          .from("reservation_payments")
          .select("payment_method_id, amount, amount_received, amount_returned, payment_method:payment_methods(name)")
          .eq("reservation_id", res.id)
        if (resPmts && resPmts.length > 0) {
          setSelectedTicketPayments(resPmts.map((p: Record<string, unknown>) => {
            const pm = p.payment_method as unknown as { name: string } | null
            return { method_name: pm?.name || "Inconnu", amount: p.amount as number, amount_received: p.amount_received as number, amount_returned: p.amount_returned as number }
          }))
        }
      }
    }
  }

  useEffect(() => {
    loadData()
    loadTodayOrders()
    loadPendingOrders()
    loadActiveReservations()
  }, [loadData, loadTodayOrders, loadPendingOrders, loadActiveReservations])

  // ─── Cart Logic ──────────────────────────────────────────────────
  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.product.price_ttc * i.quantity,
    0
  )
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  // ─── Open Session ────────────────────────────────────────────────
  const handleOpenSession = async () => {
    if (!openingAmount || parseInt(openingAmount) < 0) {
      toast.error("Veuillez saisir un montant valide")
      return
    }
    try {
      const { data, error } = await supabase
        .from("pos_cash_register_sessions")
        .insert({
          opened_by: employee?.full_name || employee?.username || "Employé",
          opening_amount: parseInt(openingAmount),
        })
        .select()
        .single()

      if (error) throw error
      setCurrentSession(data)
      setOpeningAmount("")
      toast.success("Caisse ouverte")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'ouverture")
    }
  }

  // ─── Close Session ───────────────────────────────────────────────
  const handleCloseSession = async () => {
    if (!currentSession || !closingAmount) {
      toast.error("Montant invalide")
      return
    }

    const sessionOrders = todayOrders.filter(
      (o) => new Date(o.created_at) >= new Date(currentSession.opened_at)
    )
    const totalProductSales = sessionOrders.reduce((sum, o) => sum + o.total, 0)
    const totalReservationSales = sessionOrders
      .filter((o) => o.order_type === "terrain")
      .reduce((sum, o) => sum + getOrderSlotPrice(o), 0)
    const expensesTotal = sessionExpenses.reduce((sum, e) => sum + e.amount, 0)
    const expectedAmount = currentSession.opening_amount + totalProductSales + totalReservationSales - expensesTotal

    try {
      const { error } = await supabase
        .from("pos_cash_register_sessions")
        .update({
          closed_by: employee?.full_name || employee?.username || "Employé",
          closing_amount: parseInt(closingAmount),
          expected_amount: expectedAmount,
          notes: closingNotes || null,
          closed_at: new Date().toISOString(),
        })
        .eq("id", currentSession.id)

      if (error) throw error
      setCurrentSession(null)
      setShowCloseSession(false)
      setClosingAmount("")
      setClosingNotes("")
      setCart([])
      toast.success("Caisse fermée")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la fermeture")
    }
  }

  // ─── Checkout ────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0 || !currentSession) return

    const cashReceivedNum = parseInt(cashReceived) || 0
    if (paymentMethod === "cash" && cashReceivedNum < cartTotal) {
      toast.error("Montant reçu insuffisant")
      return
    }

    setIsProcessing(true)
    try {
      const orderNumber = generateOrderNumber()
      const changeGiven =
        paymentMethod === "cash" ? cashReceivedNum - cartTotal : 0

      const { data: order, error: orderError } = await supabase
        .from("pos_orders")
        .insert({
          order_number: orderNumber,
          session_id: currentSession.id,
          total: cartTotal,
          payment_method: paymentMethod,
          cash_received: paymentMethod === "cash" ? cashReceivedNum : null,
          change_given: paymentMethod === "cash" ? changeGiven : null,
          employee_name:
            employee?.full_name || employee?.username || "Employé",
        })
        .select()
        .single()

      if (orderError) throw orderError

      const items = cart.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price_ttc,
        total: i.product.price_ttc * i.quantity,
      }))

      const { error: itemsError } = await supabase
        .from("pos_order_items")
        .insert(items)
      if (itemsError) throw itemsError

      for (const item of cart) {
        if (item.product.product_type === "bien" && item.product.stock_quantity !== null) {
          await supabase
            .from("pos_products")
            .update({
              stock_quantity: item.product.stock_quantity - item.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product.id)

          // Log stock movement
          await supabase.from("pos_stock_movements").insert({
            product_id: item.product.id,
            product_name: item.product.name,
            movement_type: "sale",
            quantity: item.quantity,
            reference_type: "order",
            reference_id: order.id,
            reference_number: orderNumber,
            note: `Vente ${orderNumber}`,
            created_by:
              employee?.full_name || employee?.username || "Employé",
          })
        }
      }

      setCart([])
      setShowCheckout(false)
      setCashReceived("")
      setPaymentMethod("cash")
      loadTodayOrders()
      loadData()

      if (paymentMethod === "cash" && changeGiven > 0) {
        toast.success(
          `Ticket ${orderNumber} — Monnaie: ${formatCurrency(changeGiven)}`
        )
      } else {
        toast.success(`Ticket ${orderNumber} validé`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'encaissement")
    } finally {
      setIsProcessing(false)
    }
  }

  // ─── Shared: decrement stock + log movements ───────────────────
  const decrementStockForCart = async (orderId: number, orderNumber: string) => {
    for (const item of cart) {
      if (item.product.product_type === "bien" && item.product.stock_quantity !== null) {
        await supabase
          .from("pos_products")
          .update({
            stock_quantity: item.product.stock_quantity - item.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.product.id)

        await supabase.from("pos_stock_movements").insert({
          product_id: item.product.id,
          product_name: item.product.name,
          movement_type: "sale",
          quantity: item.quantity,
          reference_type: "order",
          reference_id: orderId,
          reference_number: orderNumber,
          note: `Commande ${orderNumber}`,
          created_by:
            employee?.full_name || employee?.username || "Employé",
        })
      }
    }
  }

  // ─── Create pending order (shared logic) ───────────────────────
  const createPendingOrder = async (extra: {
    order_type: "table" | "terrain"
    table_id?: number | null
    terrain_id?: number | null
    time_slot_id?: number | null
    reservation_id?: number | null
    reservation_date?: string | null
    client_name?: string | null
    client_phone?: string | null
  }) => {
    if (cart.length === 0 || !currentSession) return

    setIsProcessing(true)
    try {
      const orderNumber = generateOrderNumber()

      const { data: order, error: orderError } = await supabase
        .from("pos_orders")
        .insert({
          order_number: orderNumber,
          session_id: currentSession.id,
          total: cartTotal,
          status: "pending",
          payment_method: "cash",
          employee_name:
            employee?.full_name || employee?.username || "Employé",
          ...extra,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const items = cart.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price_ttc,
        total: i.product.price_ttc * i.quantity,
      }))

      const { error: itemsError } = await supabase
        .from("pos_order_items")
        .insert(items)
      if (itemsError) throw itemsError

      await decrementStockForCart(order.id, orderNumber)

      setCart([])
      loadData()
      loadPendingOrders()
      return orderNumber
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error)
      console.error("createPendingOrder error:", msg, error)
      toast.error("Erreur lors de la commande")
    } finally {
      setIsProcessing(false)
    }
    return null
  }

  // ─── Append items to an existing pending order ─────────────────
  const appendToPendingOrder = async (existingOrder: PosOrder) => {
    if (cart.length === 0) return

    setIsProcessing(true)
    try {
      const items = cart.map((i) => ({
        order_id: existingOrder.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price_ttc,
        total: i.product.price_ttc * i.quantity,
      }))

      const { error: itemsError } = await supabase
        .from("pos_order_items")
        .insert(items)
      if (itemsError) throw itemsError

      // Update order total
      const { error: updateError } = await supabase
        .from("pos_orders")
        .update({ total: existingOrder.total + cartTotal })
        .eq("id", existingOrder.id)
      if (updateError) throw updateError

      await decrementStockForCart(existingOrder.id, existingOrder.order_number)

      setCart([])
      loadData()
      loadPendingOrders()
      toast.success(`Articles ajoutés à ${existingOrder.order_number}`)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'ajout")
    } finally {
      setIsProcessing(false)
    }
  }

  // ─── Commande Table ────────────────────────────────────────────
  const handleCommandeTable = async (table: PosTable) => {
    // Check if table already has a pending order
    const existing = pendingOrders.find(
      (o) => o.order_type === "table" && o.table_id === table.id
    )
    setShowTablePicker(false)
    if (existing) {
      // If cart has items, append them first then open pay modal
      if (cart.length > 0) {
        await appendToPendingOrder(existing)
        // Reload the order with updated total
        const { data: refreshed } = await supabase
          .from("pos_orders")
          .select("*, table:pos_tables(name), terrain:terrains(code), time_slot:time_slots(start_time, end_time, price)")
          .eq("id", existing.id)
          .single()
        if (refreshed) {
          await openPayModal(refreshed as PosOrder)
        } else {
          await openPayModal(existing)
        }
      } else {
        // No cart items — directly open encaissement
        await openPayModal(existing)
      }
    } else {
      const num = await createPendingOrder({
        order_type: "table",
        table_id: table.id,
      })
      if (num) toast.success(`Commande ${num} — ${table.name}`)
    }
  }

  // ─── Commande Terrain ──────────────────────────────────────────
  const handleCommandeTerrain = async (res: ActiveReservation) => {
    if (res.status === "PAID") {
      toast.error("Ce court est déjà payé, impossible de passer une commande")
      return
    }
    if (cart.length === 0) {
      toast.error("Le panier est vide")
      return
    }
    // Check if this terrain+slot already has a pending order
    const existing = pendingOrders.find(
      (o) =>
        o.order_type === "terrain" &&
        o.terrain_id === res.terrain_id &&
        o.time_slot_id === res.time_slot_id
    )
    setShowTerrainModal(false)
    if (existing) {
      await appendToPendingOrder(existing)
    } else {
      const num = await createPendingOrder({
        order_type: "terrain",
        terrain_id: res.terrain_id,
        time_slot_id: res.time_slot_id,
        reservation_id: res.id,
        reservation_date: res.reservation_date,
        client_name: getResPlayerName(res),
        client_phone: getResPlayerPhone(res),
      })
      if (num) toast.success(`Commande ${num} — ${res.terrain?.code} ${getResPlayerName(res)}`)
    }
  }

  // ─── Encaisser Terrain (with or without products) ─────────────
  const handleEncaisserTerrain = async (res: ActiveReservation) => {
    if (res.status === "PAID") {
      toast.error("Cette réservation est déjà payée")
      return
    }
    setShowTerrainModal(false)

    // Check if there's already a pending order for this terrain+slot
    const existing = pendingOrders.find(
      (o) =>
        o.order_type === "terrain" &&
        o.terrain_id === res.terrain_id &&
        o.time_slot_id === res.time_slot_id
    )

    if (existing) {
      // Open pay modal for existing order
      await openPayModal(existing)
    } else {
      // Create a minimal pending order (0 products) just to hold reservation info
      if (!currentSession) return
      setIsProcessing(true)
      try {
        const orderNumber = generateOrderNumber()
        const { data: order, error: orderError } = await supabase
          .from("pos_orders")
          .insert({
            order_number: orderNumber,
            session_id: currentSession.id,
            total: 0,
            status: "pending",
            payment_method: "cash",
            employee_name: employee?.full_name || employee?.username || "Employé",
            order_type: "terrain",
            terrain_id: res.terrain_id,
            time_slot_id: res.time_slot_id,
            reservation_id: res.id,
            reservation_date: res.reservation_date,
            client_name: getResPlayerName(res),
            client_phone: getResPlayerPhone(res),
          })
          .select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time, price), table:pos_tables(name)")
          .single()

        if (orderError) throw orderError

        await loadPendingOrders()
        await openPayModal(order as PosOrder)
      } catch (error) {
        console.error(error)
        toast.error("Erreur lors de la création de la commande")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  // ─── Open pay modal: load order items + reservation price ──────
  const openPayModal = async (order: PosOrder) => {
    setPayingOrder(order)
    setOrderPayments([])
    setSelectedPayMethodId(null)
    setPayAmount("")
    setShowPending(false)

    // Load order items
    const { data: items } = await supabase
      .from("pos_order_items")
      .select("product_name, quantity, unit_price, total")
      .eq("order_id", order.id)
    setPayingOrderItems(items || [])

    // Load reservation créneau price if terrain order
    if (order.order_type === "terrain" && order.time_slot_id) {
      if (order.reservation_id) {
        const { data: resData } = await supabase
          .from("reservations")
          .select("actual_price, time_slot:time_slots(price)")
          .eq("id", order.reservation_id)
          .single()
        if (resData) {
          const slot = resData.time_slot as unknown as { price: number } | null
          setReservationPrice(resData.actual_price ?? slot?.price ?? 0)
        } else {
          const slot = timeSlots.find((s) => s.id === order.time_slot_id)
          setReservationPrice(slot?.price || 0)
        }
      } else {
        const slot = timeSlots.find((s) => s.id === order.time_slot_id)
        setReservationPrice(slot?.price || 0)
      }
    } else {
      setReservationPrice(0)
    }
  }

  // ─── Multi-payment helpers ────────────────────────────────────
  const getPayTotalToPay = () => {
    if (!payingOrder) return 0
    const includeReservation = payingOrder.order_type === "terrain" && payingOrder.reservation_id !== null && reservationPrice > 0
    return payingOrder.total + (includeReservation ? reservationPrice : 0)
  }
  const getPayTotalPaid = () => orderPayments.reduce((s, p) => s + p.amount, 0)
  const getPayRemaining = () => getPayTotalToPay() - getPayTotalPaid()
  const getPayMethodName = (id: number) => sysPaymentMethods.find((m) => m.id === id)?.name || "Inconnu"

  const payAmountRef = useRef<HTMLInputElement>(null)

  const addOrderPayment = () => {
    if (!selectedPayMethodId || !payAmount || parseFloat(payAmount) <= 0) {
      toast.error("Sélectionnez un mode de paiement et entrez un montant valide")
      return
    }
    const amount = parseFloat(payAmount)
    const remaining = getPayRemaining()
    const maxAllowed = remaining + 10000

    if (amount > maxAllowed) {
      toast.error(`Le montant ne peut pas dépasser ${formatCurrency(maxAllowed)}`)
      return
    }

    const returned = amount > remaining ? amount - remaining : 0
    const effectiveAmount = amount > remaining ? remaining : amount

    setOrderPayments([...orderPayments, { payment_method_id: selectedPayMethodId, amount: effectiveAmount, amount_received: amount, amount_returned: returned }])
    setPayAmount("")
    setSelectedPayMethodId(null)
  }

  const removeOrderPayment = (index: number) => {
    setOrderPayments(orderPayments.filter((_, i) => i !== index))
  }

  // ─── Pay pending order (+ settle reservation if CONFIRMED) ────
  const handlePayPendingOrder = async () => {
    if (!payingOrder || !currentSession) return

    const totalToPay = getPayTotalToPay()
    const totalPaid = getPayTotalPaid()

    if (totalPaid !== totalToPay) {
      toast.error(`Le montant total (${formatCurrency(totalPaid)}) doit être égal au total (${formatCurrency(totalToPay)})`)
      return
    }

    setIsProcessing(true)
    try {
      // Map payment method IDs to pos_orders constraint values (cash, card, mobile_money, mixed)
      const mapMethodToConstraint = (methodId: number): string => {
        const name = getPayMethodName(methodId).toLowerCase()
        if (name.includes("espèce") || name.includes("espece") || name.includes("cash")) return "cash"
        if (name.includes("carte") || name.includes("card")) return "card"
        return "mobile_money"
      }
      const uniqueMethods = new Set(orderPayments.map((p) => p.payment_method_id))
      const primaryMethod = uniqueMethods.size > 1
        ? "mixed"
        : orderPayments.length > 0
          ? mapMethodToConstraint(orderPayments[0].payment_method_id)
          : "cash"
      const totalReceived = orderPayments.reduce((s, p) => s + p.amount_received, 0)
      const totalReturned = orderPayments.reduce((s, p) => s + p.amount_returned, 0)

      // Build payment_details JSON for guaranteed storage on the order itself
      const paymentDetailsJson = orderPayments.map((p) => ({
        method_name: getPayMethodName(p.payment_method_id),
        payment_method_id: p.payment_method_id,
        amount: p.amount,
        amount_received: p.amount_received,
        amount_returned: p.amount_returned,
      }))

      // Update order: status + payment info + payment_details JSONB
      const updatePayload: Record<string, unknown> = {
        status: "completed",
        payment_method: primaryMethod,
        cash_received: totalReceived || null,
        change_given: totalReturned || null,
        payment_details: paymentDetailsJson,
      }
      const { error } = await supabase
        .from("pos_orders")
        .update(updatePayload)
        .eq("id", payingOrder.id)

      if (error) {
        // If payment_details column doesn't exist yet, retry without it
        const { error: err2 } = await supabase
          .from("pos_orders")
          .update({
            status: "completed",
            payment_method: primaryMethod,
            cash_received: totalReceived || null,
            change_given: totalReturned || null,
          })
          .eq("id", payingOrder.id)
        if (err2) throw err2
      }

      // Also save to pos_order_payments table (best-effort, for relational queries)
      for (const payment of orderPayments) {
        const { error: popErr } = await supabase.from("pos_order_payments").insert({
          order_id: payingOrder.id,
          payment_method_id: payment.payment_method_id,
          amount: payment.amount,
          amount_received: payment.amount_received,
          amount_returned: payment.amount_returned,
        })
        if (popErr) {
          // Retry with basic columns if extra columns don't exist
          await supabase.from("pos_order_payments").insert({
            order_id: payingOrder.id,
            payment_method_id: payment.payment_method_id,
            amount: payment.amount,
          })
        }
      }

      // Settle linked reservation if requested
      const shouldSettleReservation = payingOrder.order_type === "terrain" && payingOrder.reservation_id !== null && reservationPrice > 0
      if (shouldSettleReservation && payingOrder.reservation_id) {
        // Insert reservation payments for the reservation portion
        if (reservationPrice > 0) {
          for (const payment of orderPayments) {
            // Proportionally allocate payments to reservation
            const ratio = reservationPrice / totalToPay
            const resAmount = Math.round(payment.amount * ratio)
            if (resAmount > 0) {
              const { error: rpErr } = await supabase.from("reservation_payments").insert({
                reservation_id: payingOrder.reservation_id,
                payment_method_id: payment.payment_method_id,
                amount: resAmount,
                amount_received: resAmount,
                amount_returned: 0,
              })
              if (rpErr) {
                await supabase.from("reservation_payments").insert({
                  reservation_id: payingOrder.reservation_id,
                  payment_method_id: payment.payment_method_id,
                  amount: resAmount,
                })
              }
            }
          }
        }

        await supabase
          .from("reservations")
          .update({ status: "PAID", updated_at: new Date().toISOString() })
          .eq("id", payingOrder.reservation_id)
      }

      setPayingOrder(null)
      setPayingOrderItems([])
      loadTodayOrders()
      loadPendingOrders()
      loadActiveReservations()

      const msgs: string[] = [`${payingOrder.order_number} encaissé`]
      if (totalReturned > 0) msgs.push(`Monnaie: ${formatCurrency(totalReturned)}`)
      if (shouldSettleReservation) msgs.push("Réservation soldée")
      toast.success(msgs.join(" — "))
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : typeof error === "object" && error !== null && "message" in error ? String((error as Record<string, unknown>).message) : JSON.stringify(error)
      console.error("Encaissement error:", msg, error)
      toast.error(`Erreur: ${msg || "Erreur lors de l'encaissement"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // ─── Cancel pending order ──────────────────────────────────────
  const handleCancelPendingOrder = async (order: PosOrder) => {
    try {
      // Restore stock for cancelled items
      const { data: items } = await supabase
        .from("pos_order_items")
        .select("*")
        .eq("order_id", order.id)

      if (items) {
        for (const item of items) {
          const product = products.find((p) => p.id === item.product_id)
          if (product && product.product_type === "bien") {
            await supabase
              .from("pos_products")
              .update({
                stock_quantity: (product.stock_quantity || 0) + item.quantity,
                updated_at: new Date().toISOString(),
              })
              .eq("id", product.id)
          }
        }
      }

      await supabase
        .from("pos_orders")
        .update({ status: "cancelled" })
        .eq("id", order.id)

      // Remove stock movements for this order
      await supabase
        .from("pos_stock_movements")
        .delete()
        .eq("reference_type", "order")
        .eq("reference_id", order.id)

      loadData()
      loadPendingOrders()
      loadActiveReservations()
      toast.success(`Commande ${order.order_number} annulée`)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'annulation")
    }
  }

  // ─── Product Management ──────────────────────────────────────────
  const openProductModal = (type: "create" | "edit", product?: PosProduct) => {
    if (type === "edit" && product) {
      setProductForm({
        name: product.name,
        price: product.price_ttc.toString(),
        category_id: product.category_id?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "",
      })
    } else {
      setProductForm({
        name: "",
        price: "",
        category_id: selectedCategory?.toString() || "",
        stock_quantity: "",
      })
    }
    setShowProductModal({ type, product })
  }

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Nom et prix sont obligatoires")
      return
    }
    setIsSavingProduct(true)
    try {
      const data = {
        name: productForm.name,
        price: parseInt(productForm.price),
        price_ttc: parseInt(productForm.price),
        selling_price_ht: parseInt(productForm.price),
        category_id: productForm.category_id
          ? parseInt(productForm.category_id)
          : null,
        stock_quantity: productForm.stock_quantity
          ? parseInt(productForm.stock_quantity)
          : null,
      }

      if (showProductModal?.type === "edit" && showProductModal.product) {
        const { error } = await supabase
          .from("pos_products")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", showProductModal.product.id)
        if (error) throw error
        toast.success("Produit modifié")
      } else {
        const { error } = await supabase.from("pos_products").insert(data)
        if (error) throw error
        toast.success("Produit ajouté")
      }

      setShowProductModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSavingProduct(false)
    }
  }

  // ─── Save Expense ──────────────────────────────────────────────
  const handleSaveExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      toast.error("Description et montant sont obligatoires")
      return
    }
    if (!currentSession) return
    setIsSavingExpense(true)
    try {
      const { error } = await supabase.from("pos_expenses").insert({
        session_id: currentSession.id,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        beneficiaire: expenseForm.beneficiaire || null,
        expense_type_id: expenseForm.expense_type_id ? parseInt(expenseForm.expense_type_id) : null,
        employee_name: employee?.full_name || employee?.username || "Employé",
      })
      if (error) throw error
      setShowExpenseModal(false)
      setExpenseForm({ description: "", amount: "", beneficiaire: "", expense_type_id: "" })
      toast.success("Dépense enregistrée")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement de la dépense")
    } finally {
      setIsSavingExpense(false)
    }
  }

  // ─── Filtered Products ──────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category_id !== selectedCategory) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false
    return true
  })

  // ─── Today Stats ────────────────────────────────────────────────
  // Helper: get terrain slot price from an order's joined time_slot
  const getOrderSlotPrice = (o: PosOrder) => {
    if (o.order_type !== "terrain") return 0
    if (o.reservation?.actual_price != null) return o.reservation.actual_price
    if (!o.time_slot) return 0
    return (o.time_slot as { start_time: string; end_time: string; price?: number }).price || 0
  }
  // Helper: full total for an order (cart products + terrain fee if applicable)
  const getOrderFullTotal = (o: PosOrder) => o.total + getOrderSlotPrice(o)

  const todayCaisseTotal = todayOrders.reduce((sum, o) => sum + o.total, 0)
  const todayTerrainTotal = todayOrders
    .filter((o) => o.order_type === "terrain")
    .reduce((sum, o) => sum + getOrderSlotPrice(o), 0)
  const todayExpensesTotal = sessionExpenses.reduce((sum, e) => sum + e.amount, 0)
  const todayTotal = todayTerrainTotal + todayCaisseTotal - todayExpensesTotal
  const todayCashCaisse = todayOrders
    .filter((o) => o.payment_method === "cash")
    .reduce((sum, o) => sum + o.total, 0)
  const todayCashReservation = todayOrders
    .filter((o) => o.payment_method === "cash" && o.order_type === "terrain")
    .reduce((sum, o) => sum + getOrderSlotPrice(o), 0)
  const todayCash = todayCashCaisse + todayCashReservation

  // Real payment breakdown from loaded per-order payment details
  const realPaymentBreakdown = Object.values(allOrderPayments).flat().reduce((acc, p) => {
    acc[p.method_name] = (acc[p.method_name] || 0) + p.amount
    return acc
  }, {} as Record<string, number>)
  // Fallback: simple breakdown from order.payment_method if no detail loaded
  const paymentBreakdown = Object.keys(realPaymentBreakdown).length > 0
    ? realPaymentBreakdown
    : todayOrders.reduce((acc, o) => {
        // Never show 'mixed' as a category — use translatePaymentMethod which maps to real names
        const method = o.payment_method === "mixed" ? "Espèces" : translatePaymentMethod(o.payment_method)
        acc[method] = (acc[method] || 0) + o.total
        return acc
      }, {} as Record<string, number>)

  // ─── Loading ────────────────────────────────────────────────────
  if (isLoading || !sessionChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════
  // SCREEN 1: FOND DE CAISSE (no session open)
  // ═══════════════════════════════════════════════════════════════════
  if (!currentSession) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au back-office
          </Link>

          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                <span className="text-neutral-950 font-bold">D</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">District Club</h1>
                <p className="text-sm text-neutral-500">Ouverture de caisse</p>
              </div>
            </div>

            {/* Employee info */}
            <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl mb-6">
              <div className="h-9 w-9 rounded-full bg-neutral-700 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {employee?.full_name?.charAt(0) || employee?.username?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {employee?.full_name || employee?.username}
                </p>
                <p className="text-xs text-neutral-500 capitalize">{employee?.role}</p>
              </div>
            </div>

            {/* Amount input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Fond de caisse (FCFA)
              </label>
              <input
                type="number"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="w-full px-4 py-4 text-2xl font-semibold text-white bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-neutral-600 text-center"
                placeholder="0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleOpenSession()
                }}
              />
              <p className="text-xs text-neutral-600 mt-2 text-center">
                Montant en espèces présent dans le tiroir-caisse
              </p>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[0, 10000, 25000, 50000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setOpeningAmount(amount.toString())}
                  className={cn(
                    "py-2.5 text-sm font-medium rounded-xl border transition-colors",
                    openingAmount === amount.toString()
                      ? "bg-white text-neutral-950 border-white"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
                  )}
                >
                  {amount === 0 ? "0 F" : formatCurrency(amount)}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenSession}
              disabled={!openingAmount && openingAmount !== "0"}
              className="w-full py-4 bg-white text-neutral-950 text-sm font-semibold rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Ouvrir la caisse
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════
  // SCREEN 2: POS INTERFACE
  // Cart LEFT — Products RIGHT — Options BOTTOM
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen bg-neutral-100 flex flex-col overflow-hidden">
      {/* ─── MAIN AREA: Cart Left + Products Right ──────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══ LEFT: CART / TICKET ═══════════════════════════════════ */}
        <div className="w-[380px] bg-neutral-900 flex flex-col border-r border-neutral-800">
          {/* Cart header */}
          <div className="px-5 py-3 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-semibold text-white">
                  Ticket en cours
                </span>
                {cartItemCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-white text-neutral-900 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Vider
                </button>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <ShoppingBag className="h-10 w-10 mb-2 stroke-1 text-neutral-600" />
                <p className="text-sm text-neutral-500 font-medium">Panier vide</p>
                <p className="text-xs text-neutral-600 mt-1 text-center">
                  Sélectionnez des produits à droite
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {cart.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-800/50 transition-colors"
                  >
                    {/* Line number */}
                    <span className="text-[10px] text-neutral-600 w-4 text-right font-mono">
                      {idx + 1}
                    </span>
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-tight">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {formatCurrency(item.product.price_ttc)}
                      </p>
                    </div>
                    {/* Quantity */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="h-6 w-6 flex items-center justify-center rounded-md bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="h-6 w-6 flex items-center justify-center rounded-md bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {/* Subtotal */}
                    <span className="text-sm font-bold text-white w-20 text-right">
                      {formatCurrency(item.product.price_ttc * item.quantity)}
                    </span>
                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-neutral-600 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart total + action buttons */}
          <div className="border-t border-neutral-800 bg-neutral-900">
            {cart.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-base font-bold text-neutral-300">Total</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            )}
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={() => {
                  loadPendingOrders()
                  setShowTablePicker(true)
                }}
                disabled={posTables.length === 0}
                className="relative flex-1 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pendingOrders.filter(o => o.order_type === "table").length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                )}
                <ClipboardList className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => {
                  loadActiveReservations()
                  loadPendingOrders()
                  setShowTerrainModal(true)
                }}
                className="relative flex-1 py-3.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {(pendingOrders.filter(o => o.order_type === "terrain").length + activeReservations.filter(r => r.status === "CONFIRMED" && !pendingOrders.some(o => o.reservation_id === r.id)).length) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                )}
                <MapPin className="h-4 w-4" />
                Terrain
              </button>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: PRODUCTS ═══════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-stone-100">
          {/* Search + categories */}
          <div className="px-6 py-3 bg-white border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-stone-50 text-neutral-900 placeholder:text-stone-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                  !selectedCategory
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                )}
              >
                <Package className="h-3.5 w-3.5" />
                Tout ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.category_id === cat.id
                ).length
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat.id ? null : cat.id
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                      selectedCategory === cat.id
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    )}
                  >
                    {cat.icon && categoryIcons[cat.icon]}
                    {cat.name} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-400">
                <Package className="h-12 w-12 mb-3 stroke-1" />
                <p className="text-sm">Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((i) => i.product.id === product.id)
                  const category = categories.find(
                    (c) => c.id === product.category_id
                  )
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={cn(
                        "relative flex flex-col p-4 rounded-xl border transition-all text-left group active:scale-[0.97]",
                        inCart
                          ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-md"
                      )}
                    >
                      {inCart && (
                        <span className="absolute -top-2.5 -right-2.5 h-7 w-7 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                          {inCart.quantity}
                        </span>
                      )}
                      <span className="text-sm font-medium text-neutral-900 mb-1 leading-tight">
                        {product.name}
                      </span>
                      <span className="text-[11px] text-stone-400 mb-3">
                        {category?.name || "Sans catégorie"}
                      </span>
                      <div className="flex items-center justify-between w-full mt-auto">
                        <span className="text-base font-bold text-neutral-900">
                          {formatCurrency(product.price_ttc)}
                        </span>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation()
                            openProductModal("edit", product)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation()
                              openProductModal("edit", product)
                            }
                          }}
                          className="p-1 text-stone-300 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                        </div>
                      </div>
                      {product.stock_quantity !== null &&
                        product.stock_quantity <= 5 && (
                          <span
                            className={cn(
                              "mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit",
                              product.stock_quantity <= 0
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-600"
                            )}
                          >
                            {product.stock_quantity <= 0
                              ? "Rupture"
                              : `Stock: ${product.stock_quantity}`}
                          </span>
                        )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM BAR ──────────────────────────────────────────────── */}
      <div className="h-[48px] bg-neutral-900 flex items-center justify-between px-3 border-t border-neutral-800">
        {/* Left: Back-office + Dépenses + Réservation + Historique */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            ← Back-office
          </Link>
          <div className="w-px h-4 bg-neutral-700" />
          <button
            onClick={() => {
              setExpenseForm({ description: "", amount: "", beneficiaire: "", expense_type_id: "" })
              setShowExpenseModal(true)
            }}
            className="px-3 py-1.5 text-xs font-semibold text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition-colors"
          >
            Dépenses
          </button>
          <button
            onClick={() => {
              const d = new Date().toISOString().split("T")[0]
              setResModalDate(d)
              loadResModalReservations(d)
              setShowReservationModal(true)
            }}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 transition-colors"
          >
            Réservation
          </button>
          <button
            onClick={async () => {
              await loadTodayOrders()
              const today = new Date().toISOString().split("T")[0]
              const { data: ord } = await supabase.from("pos_orders").select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time, price), reservation:reservations(actual_price)").gte("created_at", `${today}T00:00:00`).eq("status", "completed").order("created_at", { ascending: false })
              loadAllOrderPayments(ord || [])
              loadSessionExpenses()
              setHistoryPage(0)
              setShowHistory(true)
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white border border-neutral-600 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Historique
          </button>
        </div>

        {/* Right: Fermer caisse */}
        <button
          onClick={async () => {
            await loadTodayOrders()
            const today = new Date().toISOString().split("T")[0]
            const { data: ord } = await supabase.from("pos_orders").select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time, price), reservation:reservations(actual_price)").gte("created_at", `${today}T00:00:00`).eq("status", "completed").order("created_at", { ascending: false })
            loadAllOrderPayments(ord || [])
            loadSessionExpenses()
            setShowCloseSession(true)
          }}
          className="px-4 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          Fermer caisse
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* ─── Checkout Modal ─────────────────────────────────────────── */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-950">
                Encaissement
              </h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total */}
            <div className="text-center py-4 mb-5 bg-neutral-50 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Total à payer</p>
              <p className="text-4xl font-bold text-neutral-950">
                {formatCurrency(cartTotal)}
              </p>
            </div>

            {/* Payment Method */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                Mode de paiement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "cash", label: "Espèces", icon: <Banknote className="h-5 w-5" /> },
                  { key: "card", label: "Carte", icon: <CreditCard className="h-5 w-5" /> },
                  {
                    key: "mobile_money",
                    label: "Mobile",
                    icon: <Smartphone className="h-5 w-5" />,
                  },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-xs font-medium transition-all",
                      paymentMethod === m.key
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    )}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Input */}
            {paymentMethod === "cash" && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                  Montant reçu
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-4 py-4 text-2xl font-semibold text-center border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-0 focus:border-neutral-900"
                  placeholder={cartTotal.toString()}
                  autoFocus
                />
                {cashReceived && parseInt(cashReceived) >= cartTotal && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-xl text-center">
                    <p className="text-xs text-emerald-600 mb-0.5">Monnaie à rendre</p>
                    <p className="text-xl font-bold text-emerald-700">
                      {formatCurrency(parseInt(cashReceived) - cartTotal)}
                    </p>
                  </div>
                )}

                {/* Quick amounts */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    cartTotal,
                    ...[500, 1000, 2000, 5000, 10000].map(
                      (r) => Math.ceil(cartTotal / r) * r
                    ).filter((v, i, a) => v > cartTotal && a.indexOf(v) === i).slice(0, 4),
                  ].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCashReceived(amount.toString())}
                      className={cn(
                        "px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                        cashReceived === amount.toString()
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items summary */}
            <div className="border-t border-neutral-100 pt-3 mb-5 max-h-28 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-xs text-neutral-500 py-1"
                >
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>{formatCurrency(item.product.price_ttc * item.quantity)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={
                isProcessing ||
                (paymentMethod === "cash" &&
                  (!cashReceived || parseInt(cashReceived) < cartTotal))
              }
              className="w-full py-4 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Valider le paiement
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Table Picker Modal ──────────────────────────────────────── */}
      {showTablePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">Choisir une table</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {cart.length} article{cart.length > 1 ? "s" : ""} — <span className="font-semibold text-blue-600">{formatCurrency(cartTotal)}</span>
                </p>
              </div>
              <button
                onClick={() => setShowTablePicker(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {posTables.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 stroke-1" />
                  <p className="text-sm font-medium">Aucune table configurée</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {posTables.map((table) => {
                    const isOccupied = occupiedTableIds.includes(table.id)
                    const existingOrder = pendingOrders.find(
                      (o) => o.order_type === "table" && o.table_id === table.id
                    )
                    return (
                      <button
                        key={table.id}
                        onClick={() => handleCommandeTable(table)}
                        disabled={isProcessing}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                          isOccupied
                            ? "border-orange-300 bg-orange-50 hover:border-orange-400 hover:shadow-md"
                            : "border-neutral-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
                        )}
                      >
                        <div className={cn(
                          "h-14 w-14 rounded-lg border-2 flex items-center justify-center",
                          table.shape === "round" && "rounded-full",
                          table.shape === "rectangle" && "h-10 w-20",
                          isOccupied
                            ? "bg-orange-100 border-orange-300"
                            : "bg-neutral-100 border-neutral-300"
                        )}>
                          <span className="text-sm font-bold text-neutral-700">{table.name}</span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          isOccupied
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}>
                          {isOccupied ? "Occupée" : "Libre"}
                        </span>
                        {existingOrder && (
                          <span className="text-[10px] font-bold text-blue-600">{formatCurrency(existingOrder.total)}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Terrain Modal (Large Grid — Reservation-page style) ─────── */}
      {showTerrainModal && (() => {
        const activeTerrains = terrains.filter((t) => t.is_active)
        const reservationSlotIds = [...new Set(activeReservations.map((r) => r.time_slot_id))]
        const relevantSlots = timeSlots
          .filter((s) => reservationSlotIds.includes(s.id))
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
        const getRes = (terrainId: number, slotId: number) =>
          activeReservations.find((r) => r.terrain_id === terrainId && r.time_slot_id === slotId)

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] mx-4 max-h-[94vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 py-3 border-b border-neutral-200 flex items-center justify-between flex-shrink-0 bg-white">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-neutral-950">Terrains</h2>
                  <span className="text-sm text-neutral-500">
                    {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
                    {activeReservations.length} réservation{activeReservations.length > 1 ? "s" : ""}
                  </span>
                  {cart.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      Panier: {cart.length} article{cart.length > 1 ? "s" : ""} · {formatCurrency(cartTotal)}
                    </span>
                  )}
                </div>
                <button onClick={() => setShowTerrainModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-auto bg-gray-100">
                {activeTerrains.length === 0 || relevantSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
                    <MapPin className="w-14 h-14 mb-4 stroke-1" />
                    <p className="text-base font-medium">Aucune réservation active aujourd&apos;hui</p>
                    <p className="text-sm mt-1">Les réservations confirmées apparaîtront ici</p>
                  </div>
                ) : (
                  <table className="w-full table-fixed border-collapse bg-white">
                    <colgroup>
                      <col className="w-20" />
                      {activeTerrains.map((t) => <col key={t.id} />)}
                    </colgroup>
                    <thead className="sticky top-0 z-20">
                      <tr>
                        <th className="border-b border-r border-gray-700 bg-gray-900 py-3 px-2">
                          <span className="text-xs font-medium text-gray-400">Heure</span>
                        </th>
                        {activeTerrains.map((t) => (
                          <th key={t.id} className="border-b border-r border-gray-700 py-3 bg-gray-900 last:border-r-0">
                            <span className="text-sm font-semibold text-white">Terrain {t.code}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relevantSlots.map((slot, slotIdx) => (
                        <tr key={slot.id} className={slotIdx % 2 === 1 ? "bg-gray-50" : "bg-white"}>
                          {/* Time column */}
                          <td className="border-b border-r border-gray-300 py-3 px-3 align-middle">
                            <div className="text-base font-bold text-gray-900">{slot.start_time.slice(0, 5)}</div>
                            <div className="text-sm text-gray-400">{slot.end_time.slice(0, 5)}</div>
                            <div className="text-xs font-semibold text-emerald-600 mt-0.5">{formatCurrency(slot.price)}</div>
                          </td>

                          {/* Terrain cells */}
                          {activeTerrains.map((t) => {
                            const res = getRes(t.id, slot.id)
                            if (!res) {
                              return (
                                <td key={t.id} className="border-b border-r border-gray-200 p-0 last:border-r-0" style={{ height: 130 }}>
                                  <div className="h-full w-full flex items-center justify-center text-gray-200">
                                    <span className="text-2xl font-light">—</span>
                                  </div>
                                </td>
                              )
                            }

                            const isPaid = res.status === "PAID"
                            const existingOrder = pendingOrders.find(
                              (o) => o.order_type === "terrain" && o.terrain_id === t.id && o.time_slot_id === slot.id
                            )

                            return (
                              <td key={t.id} className="border-b border-r border-gray-200 p-0 last:border-r-0" style={{ height: 130 }}>
                                <div className={cn(
                                  "h-full w-full px-4 py-3 flex flex-col",
                                  isPaid
                                    ? "bg-emerald-50"
                                    : existingOrder
                                      ? "bg-blue-50"
                                      : "bg-amber-50"
                                )}>
                                  {/* Top: status badge + info */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded",
                                        isPaid ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
                                      )}>
                                        {isPaid ? "Payé" : "Confirmé"}
                                      </span>
                                      {existingOrder && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-700">
                                          Produits: {formatCurrency(existingOrder.total)}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openTerrainInfoTicket(res) }}
                                      className="p-1 rounded-md hover:bg-white/60 text-gray-500 hover:text-gray-800 transition-colors"
                                      title="Voir le ticket"
                                    >
                                      <Info className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {/* Middle: client info */}
                                  <div className="flex-1 min-w-0">
                                    <p className={cn("font-bold text-base truncate leading-tight", isPaid ? "text-gray-400" : "text-gray-900")}>
                                      {getResPlayerName(res)}
                                    </p>
                                    {getResPlayerPhone(res) && (
                                      <p className="text-sm text-gray-500 font-mono mt-0.5">{formatResPhone(getResPlayerPhone(res)!)}</p>
                                    )}
                                  </div>

                                  {/* Bottom: action buttons */}
                                  {!isPaid && (
                                    <div className="flex gap-2 mt-2">
                                      {cart.length > 0 && (
                                        <button
                                          onClick={() => handleCommandeTerrain(res)}
                                          disabled={isProcessing}
                                          className="flex-1 py-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-40"
                                        >
                                          + Produits
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleEncaisserTerrain(res)}
                                        disabled={isProcessing}
                                        className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-40"
                                      >
                                        Encaisser
                                      </button>
                                    </div>
                                  )}
                                  {isPaid && (
                                    <div className="mt-2 text-center">
                                      <span className="text-xs text-emerald-600 font-semibold">✓ Réservation payée</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ─── Pending Orders Modal ─────────────────────────────────────── */}
      {showPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">
                  Commandes en attente
                </h2>
                {pendingOrders.length > 0 && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {pendingOrders.length} commande{pendingOrders.length > 1 ? "s" : ""} — Total: <span className="font-semibold text-blue-600">{formatCurrency(pendingOrders.reduce((s, o) => s + o.total, 0))}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowPending(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 stroke-1" />
                  <p className="text-sm font-medium">Aucune commande en attente</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className={cn(
                        "border-2 rounded-2xl overflow-hidden transition-all hover:shadow-lg",
                        order.order_type === "terrain"
                          ? "border-emerald-200 hover:border-emerald-300"
                          : "border-blue-200 hover:border-blue-300"
                      )}
                    >
                      {/* Card header with type color */}
                      <div className={cn(
                        "px-4 py-3 flex items-center justify-between",
                        order.order_type === "terrain"
                          ? "bg-emerald-50"
                          : "bg-blue-50"
                      )}>
                        <div className="flex items-center gap-2">
                          {order.order_type === "terrain" ? (
                            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                              <ClipboardList className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div>
                            {order.order_type === "terrain" && order.terrain ? (
                              <p className="text-sm font-bold text-neutral-900">Terrain {order.terrain.code}</p>
                            ) : order.order_type === "table" && order.table ? (
                              <p className="text-sm font-bold text-neutral-900">{order.table.name}</p>
                            ) : (
                              <p className="text-sm font-bold text-neutral-900">{order.order_number}</p>
                            )}
                            <p className="text-[11px] text-neutral-500 font-mono">{order.order_number}</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-neutral-950">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      {/* Card body - clear info */}
                      <div className="px-4 py-3 space-y-2">
                        {/* Créneau for terrain */}
                        {order.order_type === "terrain" && order.time_slot && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-neutral-800">
                              {order.time_slot.start_time.slice(0, 5)} – {order.time_slot.end_time.slice(0, 5)}
                            </span>
                          </div>
                        )}

                        {/* Joueur */}
                        {order.client_name && (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-neutral-600">{order.client_name.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-medium text-neutral-800">{order.client_name}</span>
                          </div>
                        )}

                        {/* Téléphone */}
                        {order.client_phone && (
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-600 font-medium">{order.client_phone}</span>
                          </div>
                        )}

                        {/* Time + employee */}
                        <p className="text-[11px] text-neutral-400">
                          {new Date(order.created_at).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {order.employee_name}
                        </p>
                      </div>

                      {/* Card actions */}
                      <div className="px-4 pb-3 flex gap-2">
                        <button
                          onClick={() => openPayModal(order)}
                          className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Banknote className="h-4 w-4" />
                          Encaisser
                        </button>
                        <button
                          onClick={() => handleCancelPendingOrder(order)}
                          className="px-4 py-2.5 text-red-600 text-sm font-medium border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5"
                        >
                          <X className="h-4 w-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Pay Pending Order Modal (Reservations-style + Ticket) ──────── */}
      {payingOrder && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setPayingOrder(null)}
        >
          <div
            className="flex gap-4 max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── LEFT: Ticket Preview ── */}
            <div className="w-[280px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5" id="ticket-preview">
                <div className="text-center mb-4">
                  <p className="text-lg font-bold text-neutral-900">District Club</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {new Date(payingOrder.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    {" · "}
                    {new Date(payingOrder.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="border-t border-dashed border-neutral-200 my-3" />

                <div className="text-xs text-neutral-500 mb-2 space-y-0.5">
                  <p><span className="font-medium text-neutral-700">N°</span> {payingOrder.order_number}</p>
                  <p><span className="font-medium text-neutral-700">Employé:</span> {payingOrder.employee_name}</p>
                  {payingOrder.order_type === "table" && payingOrder.table && (
                    <p><span className="font-medium text-neutral-700">Table:</span> {payingOrder.table.name}</p>
                  )}
                  {payingOrder.order_type === "terrain" && payingOrder.terrain && (
                    <p><span className="font-medium text-neutral-700">Terrain:</span> {payingOrder.terrain.code}
                      {payingOrder.time_slot && ` · ${payingOrder.time_slot.start_time.slice(0, 5)}–${payingOrder.time_slot.end_time.slice(0, 5)}`}
                    </p>
                  )}
                  {payingOrder.client_name && (
                    <p><span className="font-medium text-neutral-700">Client:</span> {payingOrder.client_name}</p>
                  )}
                </div>

                <div className="border-t border-dashed border-neutral-200 my-3" />

                <div className="space-y-1.5">
                  {payingOrderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-neutral-700">{item.quantity}x {item.product_name}</span>
                      <span className="font-medium text-neutral-900 tabular-nums">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-neutral-200 my-3" />

                <div className="flex justify-between text-xs font-bold">
                  <span>Sous-total</span>
                  <span className="tabular-nums">{formatCurrency(payingOrder.total)}</span>
                </div>

                {payingOrder.order_type === "terrain" && payingOrder.reservation_id && reservationPrice > 0 && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-amber-700">Réservation</span>
                    <span className="font-medium text-amber-700 tabular-nums">{formatCurrency(reservationPrice)}</span>
                  </div>
                )}

                <div className="border-t border-neutral-300 my-3" />

                <div className="flex justify-between text-sm font-bold">
                  <span>TOTAL</span>
                  <span className="tabular-nums">{formatCurrency(getPayTotalToPay())}</span>
                </div>

                {orderPayments.length > 0 && (
                  <>
                    <div className="border-t border-dashed border-neutral-200 my-3" />
                    <div className="space-y-1">
                      {orderPayments.map((p, i) => (
                        <div key={i} className="flex justify-between text-[11px] text-neutral-500">
                          <span>{getPayMethodName(p.payment_method_id)}</span>
                          <span className="tabular-nums">{formatCurrency(p.amount_received)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed border-neutral-200 my-2" />
                    <div className="flex justify-between text-xs font-bold">
                      <span>Total payé</span>
                      <span className="tabular-nums">{formatCurrency(orderPayments.reduce((s, p) => s + p.amount_received, 0))}</span>
                    </div>
                    {orderPayments.reduce((s, p) => s + p.amount_returned, 0) > 0 && (
                      <div className="flex justify-between text-xs font-bold mt-0.5 text-orange-600">
                        <span>Rendu</span>
                        <span className="tabular-nums">{formatCurrency(orderPayments.reduce((s, p) => s + p.amount_returned, 0))}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="text-center mt-5">
                  <p className="text-[10px] text-neutral-400">Merci de votre visite !</p>
                </div>
              </div>

              <div className="p-3 border-t border-neutral-100">
                <button
                  onClick={() => {
                    if (!payingOrder) return
                    const date = new Date(payingOrder.created_at)
                    const dateStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                    const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                    const includeRes = payingOrder.order_type === "terrain" && payingOrder.reservation_id && reservationPrice > 0
                    const totalToPay = getPayTotalToPay()
                    const totalReceived = orderPayments.reduce((s, p) => s + p.amount_received, 0)
                    const totalReturned = orderPayments.reduce((s, p) => s + p.amount_returned, 0)

                    let infoLines = `<tr><td>N°</td><td style="text-align:right">${payingOrder.order_number}</td></tr>`
                    infoLines += `<tr><td>Employé</td><td style="text-align:right">${payingOrder.employee_name}</td></tr>`
                    if (payingOrder.order_type === "table" && payingOrder.table) {
                      infoLines += `<tr><td>Table</td><td style="text-align:right">${payingOrder.table.name}</td></tr>`
                    }
                    if (payingOrder.order_type === "terrain" && payingOrder.terrain) {
                      infoLines += `<tr><td>Terrain</td><td style="text-align:right">${payingOrder.terrain.code}${payingOrder.time_slot ? ` · ${payingOrder.time_slot.start_time.slice(0, 5)}–${payingOrder.time_slot.end_time.slice(0, 5)}` : ""}</td></tr>`
                    }
                    if (payingOrder.client_name) {
                      infoLines += `<tr><td>Client</td><td style="text-align:right">${payingOrder.client_name}</td></tr>`
                    }

                    let itemRows = ""
                    payingOrderItems.forEach((item) => {
                      itemRows += `<tr><td>${item.quantity}x ${item.product_name}</td><td style="text-align:right">${formatCurrency(item.total)}</td></tr>`
                    })

                    let paymentRows = ""
                    orderPayments.forEach((p) => {
                      paymentRows += `<tr><td>${getPayMethodName(p.payment_method_id)}</td><td style="text-align:right">${formatCurrency(p.amount_received)}</td></tr>`
                    })

                    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Ticket ${payingOrder.order_number}</title>
<style>
  @page { size: 80mm auto; margin: 2mm 4mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; width: 72mm; margin: 0 auto; }
  .center { text-align: center; }
  .title { font-size: 16px; font-weight: bold; }
  .date { font-size: 10px; color: #555; margin-top: 2px; }
  .sep { border-top: 1px dashed #000; margin: 6px 0; }
  .sep-bold { border-top: 1px solid #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1px 0; vertical-align: top; font-size: 12px; }
  .bold { font-weight: bold; }
  .total-row td { font-size: 14px; font-weight: bold; padding: 3px 0; }
  .footer { font-size: 10px; color: #555; margin-top: 10px; }
</style>
</head>
<body>
  <div class="center">
    <div class="title">District Club</div>
    <div class="date">${dateStr} · ${timeStr}</div>
  </div>
  <div class="sep"></div>
  <table>${infoLines}</table>
  <div class="sep"></div>
  <table>${itemRows}</table>
  <div class="sep"></div>
  <table>
    <tr><td class="bold">Sous-total</td><td style="text-align:right" class="bold">${formatCurrency(payingOrder.total)}</td></tr>
    ${includeRes ? `<tr><td>Réservation</td><td style="text-align:right">${formatCurrency(reservationPrice)}</td></tr>` : ""}
  </table>
  <div class="sep-bold"></div>
  <table>
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${formatCurrency(totalToPay)}</td></tr>
  </table>
  ${orderPayments.length > 0 ? `
  <div class="sep"></div>
  <table>${paymentRows}</table>
  <div class="sep"></div>
  <table>
    <tr><td class="bold">Total payé</td><td style="text-align:right" class="bold">${formatCurrency(totalReceived)}</td></tr>
    ${totalReturned > 0 ? `<tr><td class="bold">Rendu</td><td style="text-align:right" class="bold">${formatCurrency(totalReturned)}</td></tr>` : ""}
  </table>
  ` : ""}
  <div class="sep"></div>
  <div class="center footer">Merci de votre visite !</div>
</body>
</html>`

                    const iframe = document.createElement("iframe")
                    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:none;"
                    document.body.appendChild(iframe)
                    const iDoc = iframe.contentWindow?.document
                    if (!iDoc) return
                    iDoc.open()
                    iDoc.write(html)
                    iDoc.close()
                    iframe.contentWindow?.focus()
                    setTimeout(() => {
                      iframe.contentWindow?.print()
                      setTimeout(() => document.body.removeChild(iframe), 1000)
                    }, 300)
                  }}
                  className="w-full py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimer le ticket
                </button>
              </div>
            </div>

            {/* ── RIGHT: Payment Form ── */}
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[92vh] overflow-y-auto">
              {/* Orange Header */}
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-5 py-4 relative rounded-t-2xl">
                <button
                  onClick={() => setPayingOrder(null)}
                  className="absolute top-3 right-3 text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
                <h3 className="font-bold text-white text-lg">Encaissement</h3>
                <p className="text-white/90 text-xs">
                  {payingOrder.order_number}
                  {payingOrder.order_type === "table" && payingOrder.table && ` — ${payingOrder.table.name}`}
                  {payingOrder.order_type === "terrain" && payingOrder.terrain && ` — Terrain ${payingOrder.terrain.code}`}
                  {payingOrder.client_name && ` · ${payingOrder.client_name}`}
                </p>
                <div className="flex justify-between mt-3">
                  <div>
                    <p className="text-white/80 text-xs">Total à payer</p>
                    <p className="text-white text-xl font-bold">{formatCurrency(getPayTotalToPay())}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs">Reste à payer</p>
                    <p className={cn(
                      "text-xl font-bold",
                      getPayRemaining() === 0 ? "text-white" : "text-emerald-300"
                    )}>{formatCurrency(getPayRemaining())}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Reservation to settle (always included for terrain orders) */}
                {payingOrder.order_type === "terrain" && payingOrder.reservation_id && reservationPrice > 0 && (
                  <div className="mb-4 flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50">
                    <div className="w-5 h-5 rounded-md bg-amber-600 border-2 border-amber-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-amber-800">Réservation incluse</p>
                        <span className="text-sm font-bold text-amber-700">{formatCurrency(reservationPrice)}</span>
                      </div>
                      <p className="text-xs text-amber-600">
                        {payingOrder.client_name && `${payingOrder.client_name} — `}
                        Terrain {payingOrder.terrain?.code}{payingOrder.time_slot ? ` · ${payingOrder.time_slot.start_time.slice(0, 5)}–${payingOrder.time_slot.end_time.slice(0, 5)}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Methods + Amount (collapsible, hidden when fully paid) */}
                {getPayRemaining() > 0 && (
                  <details open className="mb-4 group">
                    <summary className="flex items-center justify-between cursor-pointer text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 select-none">
                      <span>Mode de paiement</span>
                      <svg className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {sysPaymentMethods.map((method, index) => (
                        <button
                          key={method.id}
                          onClick={() => {
                            setSelectedPayMethodId(method.id)
                            setTimeout(() => payAmountRef.current?.focus(), 50)
                          }}
                          className={cn(
                            "p-2 rounded-lg border flex flex-col items-center gap-1 transition-all",
                            selectedPayMethodId === method.id
                              ? "border-orange-400 bg-orange-50"
                              : "border-neutral-200 hover:border-neutral-300"
                          )}
                        >
                          <div className={cn(
                            "h-7 w-7 rounded flex items-center justify-center",
                            selectedPayMethodId === method.id ? "bg-orange-100" : "bg-neutral-100"
                          )}>
                            <CreditCard className={cn(
                              "h-3.5 w-3.5",
                              selectedPayMethodId === method.id ? "text-orange-500" : "text-neutral-400"
                            )} />
                          </div>
                          <span className={cn(
                            "font-medium text-xs text-center leading-tight",
                            selectedPayMethodId === method.id ? "text-orange-600" : "text-neutral-600"
                          )}>{method.name}</span>
                          <span className="text-[10px] text-neutral-400">{index + 1}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          ref={payAmountRef}
                          type="text"
                          inputMode="numeric"
                          value={payAmount}
                          onChange={(e) => {
                            const v = e.target.value
                            if (v === "" || /^\d*\.?\d*$/.test(v)) setPayAmount(v)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); addOrderPayment() }
                          }}
                          placeholder="Montant ..."
                          className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                      <button
                        onClick={addOrderPayment}
                        disabled={!selectedPayMethodId || !payAmount}
                        className={cn(
                          "px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5",
                          selectedPayMethodId && payAmount
                            ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                            : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        )}
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter
                      </button>
                    </div>
                  </details>
                )}

                {/* Total Paid & Returned summary */}
                {orderPayments.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Total payé</p>
                      <div className="px-3 py-2 bg-emerald-50 rounded-xl text-sm font-bold text-emerald-700">
                        {formatCurrency(getPayTotalPaid())}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Rendu</p>
                      <div className="px-3 py-2 bg-neutral-100 rounded-xl text-sm font-bold text-neutral-700">
                        {formatCurrency(orderPayments.reduce((s, p) => s + p.amount_returned, 0))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Added Payments List */}
                {orderPayments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Paiements ajoutés</p>
                    <div className="space-y-1.5">
                      {orderPayments.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium text-sm text-neutral-700">{getPayMethodName(payment.payment_method_id)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-neutral-900">{formatCurrency(payment.amount)}</span>
                            <button
                              onClick={() => removeOrderPayment(index)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPayingOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-medium text-sm hover:bg-neutral-50 transition-colors"
                  >
                    Annuler <span className="text-neutral-400 text-xs">Esc</span>
                  </button>
                  <button
                    onClick={handlePayPendingOrder}
                    disabled={getPayRemaining() !== 0 || isProcessing}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5",
                      getPayRemaining() === 0 && !isProcessing
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Valider <span className="text-white/70 text-xs">Entrée</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── Close Session Modal ────────────────────────────────────── */}
      {showCloseSession && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex gap-4 mx-4 items-start">
            {/* Left: Modal content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-neutral-950">
                  Fermer la caisse
                </h2>
                <button
                  onClick={() => setShowCloseSession(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Session summary */}
              <div className="bg-neutral-50 rounded-xl p-4 mb-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Fond de caisse</span>
                  <span className="font-medium">
                    {formatCurrency(currentSession.opening_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Vente caisse</span>
                  <span className="font-medium text-emerald-600">
                    +{formatCurrency(todayCaisseTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Vente Réservation</span>
                  <span className="font-medium text-emerald-600">
                    +{formatCurrency(todayTerrainTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dépenses</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(todayExpensesTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nb tickets</span>
                  <span className="font-medium">{todayOrders.length}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2.5">
                  <span className="font-semibold text-neutral-700">Attendu en caisse</span>
                  <span className="font-bold text-neutral-900">
                    {formatCurrency(currentSession.opening_amount + todayCaisseTotal + todayTerrainTotal - todayExpensesTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                    Montant compté en caisse (FCFA)
                  </label>
                  <input
                    type="number"
                    value={closingAmount}
                    onChange={(e) => setClosingAmount(e.target.value)}
                    className="w-full px-4 py-4 text-2xl font-semibold text-center border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-0 focus:border-neutral-900"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                {closingAmount && (
                  <div
                    className={cn(
                      "text-sm font-medium p-3 rounded-xl text-center",
                      parseInt(closingAmount) ===
                        currentSession.opening_amount + todayCaisseTotal + todayTerrainTotal - todayExpensesTotal
                        ? "bg-emerald-50 text-emerald-700"
                        : parseInt(closingAmount) <
                            currentSession.opening_amount + todayCaisseTotal + todayTerrainTotal - todayExpensesTotal
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {parseInt(closingAmount) ===
                    currentSession.opening_amount + todayCaisseTotal + todayTerrainTotal - todayExpensesTotal
                      ? "La caisse est juste"
                      : `Écart: ${formatCurrency(
                          parseInt(closingAmount) -
                            (currentSession.opening_amount + todayCaisseTotal + todayTerrainTotal - todayExpensesTotal)
                        )}`}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none text-sm"
                    rows={2}
                    placeholder="Remarques..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCloseSession(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCloseSession}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Fermer la caisse
                </button>
              </div>
            </div>

            {/* Right: Numpad */}
            {vkEnabled && (
              <div className="w-[220px] bg-neutral-900 rounded-2xl shadow-2xl flex flex-col p-4 self-center">
                <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider text-center mb-3 select-none">Clavier numérique</p>
                {([["7","8","9"],["4","5","6"],["1","2","3"],["C","0","⌫"]] as string[][]).map((row, ri) => (
                  <div key={ri} className="flex gap-2 mb-2 justify-center">
                    {row.map((key) => {
                      const isAction = key === "⌫" || key === "C"
                      return (
                        <button
                          key={key}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            if (key === "C") setClosingAmount("")
                            else if (key === "⌫") setClosingAmount(p => p.slice(0, -1))
                            else setClosingAmount(p => p + key)
                          }}
                          className={cn(
                            "h-14 w-16 rounded-lg font-semibold text-lg transition-all active:scale-95 select-none flex items-center justify-center",
                            isAction
                              ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                              : "bg-white hover:bg-neutral-200 text-neutral-900 shadow-sm"
                          )}
                        >
                          {key}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── History Modal ──────────────────────────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">Historique du jour</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { const d = new Date().toISOString().split("T")[0]; setZReportDate(d); setZReportOrders(todayOrders); setZReportExpenses(sessionExpenses); setShowHistory(false); setShowZReport(true) }} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Printer className="h-3.5 w-3.5" />
                  Rapport Z
                </button>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-neutral-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center gap-6 text-sm flex-shrink-0 flex-wrap">
              <div><span className="text-neutral-500">Total</span><span className="ml-2 font-bold text-neutral-900">{formatCurrency(todayTotal)}</span></div>
              <div className="w-px h-4 bg-neutral-300" />
              <div><span className="text-neutral-500">Réservations</span><span className="ml-2 font-bold text-emerald-700">{formatCurrency(todayTerrainTotal)}</span></div>
              <div className="w-px h-4 bg-neutral-300" />
              <div><span className="text-neutral-500">Caisse</span><span className="ml-2 font-bold text-blue-700">{formatCurrency(todayCaisseTotal)}</span></div>
              <div className="w-px h-4 bg-neutral-300" />
              <div><span className="text-neutral-500">Dépenses</span><span className="ml-2 font-bold text-red-600">-{formatCurrency(todayExpensesTotal)}</span></div>
              <div className="w-px h-4 bg-neutral-300" />
              <div><span className="text-neutral-500">Tickets</span><span className="ml-2 font-bold text-neutral-900">{todayOrders.length}</span></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {todayOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                  <Receipt className="h-12 w-12 mb-3 stroke-1" />
                  <p className="text-sm font-medium">Aucun ticket aujourd&apos;hui</p>
                </div>
              ) : (
                <>
                <table className="w-full">
                  <thead className="sticky top-0 bg-white border-b border-neutral-200 z-10">
                    <tr className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      <th className="px-6 py-2.5 text-left">N°</th>
                      <th className="px-3 py-2.5 text-left">Heure</th>
                      <th className="px-3 py-2.5 text-left">Type</th>
                      <th className="px-3 py-2.5 text-left">Détail</th>
                      <th className="px-3 py-2.5 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {todayOrders.slice(historyPage * 10, (historyPage + 1) * 10).map((order) => {
                      return (
                        <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-3">
                            <button onClick={() => openTicketDetail(order)} className="text-sm font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                              {order.order_number}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-sm text-neutral-600">
                            {new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-3 py-3">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", order.order_type === "terrain" ? "bg-emerald-100 text-emerald-700" : order.order_type === "table" ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-600")}>
                              {order.order_type === "terrain" ? "Terrain" : order.order_type === "table" ? "Table" : "Direct"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-neutral-500">
                            {order.order_type === "terrain" && order.terrain
                              ? `${(order.terrain as { code: string }).code}${order.time_slot ? ` · ${(order.time_slot as { start_time: string }).start_time.slice(0, 5)}` : ""}${order.client_name ? ` · ${order.client_name}` : ""}`
                              : order.order_type === "table" && order.table ? (order.table as { name: string }).name : "—"}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-bold text-neutral-900">{formatCurrency(getOrderFullTotal(order))}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {/* Pagination */}
                {todayOrders.length > 10 && (
                  <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between bg-white sticky bottom-0">
                    <span className="text-xs text-neutral-500">
                      {historyPage * 10 + 1}–{Math.min((historyPage + 1) * 10, todayOrders.length)} sur {todayOrders.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={historyPage === 0}
                        onClick={() => setHistoryPage(p => p - 1)}
                        className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-semibold text-neutral-700">
                        {historyPage + 1} / {Math.ceil(todayOrders.length / 10)}
                      </span>
                      <button
                        disabled={(historyPage + 1) * 10 >= todayOrders.length}
                        onClick={() => setHistoryPage(p => p + 1)}
                        className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
              {sessionExpenses.length > 0 && (
                <div className="border-t-2 border-neutral-200">
                  <div className="px-6 py-2.5 bg-red-50/50"><span className="text-xs font-bold text-red-700 uppercase tracking-wider">Dépenses</span></div>
                  <table className="w-full">
                    <tbody className="divide-y divide-neutral-100">
                      {sessionExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-2.5 text-sm text-neutral-700">{exp.description}</td>
                          <td className="px-3 py-2.5 text-xs text-neutral-400">{new Date(exp.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-3 py-2.5"><span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">{exp.category}</span></td>
                          <td className="px-3 py-2.5 text-right"><span className="text-sm font-bold text-red-600">-{formatCurrency(exp.amount)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Ticket Detail Modal ─────────────────────────────────────── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-sm font-bold text-neutral-950">Ticket {selectedTicket.order_number}</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const el = document.getElementById("ticket-reprint-content")
                    if (!el) return
                    const win = window.open("", "_blank", "width=302,height=600")
                    if (!win) return
                    win.document.write(`<html><head><title>Ticket ${selectedTicket.order_number}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:72mm;padding:4mm}</style></head><body>`)
                    win.document.write(el.innerHTML)
                    win.document.write("</body></html>")
                    win.document.close()
                    win.focus()
                    setTimeout(() => { win.print(); win.close() }, 250)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimer
                </button>
                <button onClick={() => setSelectedTicket(null)} className="p-1.5 hover:bg-neutral-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-100">
              <div id="ticket-reprint-content" className="bg-white mx-auto shadow-sm border border-neutral-200" style={{ width: "72mm", fontFamily: "'Courier New', monospace", fontSize: "12px", padding: "4mm" }}>
                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", marginBottom: "2px" }}>DISTRICT CLUB</div>
                <div style={{ textAlign: "center", fontSize: "10px", color: "#666", marginBottom: "6px" }}>
                  {new Date(selectedTicket.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} à {new Date(selectedTicket.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}><span>Ticket</span><span style={{ fontWeight: "bold" }}>{selectedTicket.order_number}</span></div>
                {selectedTicket.employee_name && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}><span>Caissier</span><span>{selectedTicket.employee_name}</span></div>
                )}
                {selectedTicket.order_type === "terrain" && selectedTicket.terrain && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}><span>Terrain</span><span style={{ fontWeight: "bold" }}>{(selectedTicket.terrain as { code: string }).code}</span></div>
                )}
                {selectedTicket.order_type === "terrain" && selectedTicket.time_slot && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}><span>Créneau</span><span>{(selectedTicket.time_slot as { start_time: string; end_time: string }).start_time.slice(0, 5)} - {(selectedTicket.time_slot as { start_time: string; end_time: string }).end_time.slice(0, 5)}</span></div>
                )}
                {selectedTicket.client_name && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}><span>Client</span><span>{selectedTicket.client_name}</span></div>
                )}
                {selectedTicket.order_type === "table" && selectedTicket.table && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}><span>Table</span><span style={{ fontWeight: "bold" }}>{(selectedTicket.table as { name: string }).name}</span></div>
                )}
                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                {selectedTicket.order_type === "terrain" && ticketReservationPrice > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>Réservation terrain</span><span>{formatCurrency(ticketReservationPrice)}</span></div>
                )}
                {selectedTicketItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{item.quantity}x {item.product_name}</span><span>{formatCurrency(item.total)}</span></div>
                ))}
                {selectedTicketItems.length === 0 && !(selectedTicket.order_type === "terrain" && ticketReservationPrice > 0) && (
                  <div style={{ textAlign: "center", fontSize: "10px", color: "#999", padding: "4px 0" }}>Aucun article</div>
                )}
                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: "bold", fontSize: "14px" }}>
                  <span>TOTAL</span>
                  <span>{formatCurrency(selectedTicket.total + (selectedTicket.order_type === "terrain" ? ticketReservationPrice : 0))}</span>
                </div>
                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                {(() => {
                  const pmts = selectedTicketPayments.length > 0
                    ? selectedTicketPayments
                    : (allOrderPayments[selectedTicket.id] || []).map(p => ({ ...p, amount_received: p.amount, amount_returned: 0 }))
                  const ticketGrandTotal = selectedTicket.total + (selectedTicket.order_type === "terrain" ? ticketReservationPrice : 0)
                  if (pmts.length > 0) {
                    return (
                      <>
                        <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "3px", textTransform: "uppercase" }}>Paiement</div>
                        {pmts.map((p, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}>
                            <span>{p.method_name}</span>
                            <span style={{ fontWeight: "bold" }}>{formatCurrency(p.amount)}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}>
                          <span>Rendu</span>
                          <span>{formatCurrency(selectedTicket.change_given || 0)}</span>
                        </div>
                      </>
                    )
                  }
                  return (
                    <>
                      <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "3px", textTransform: "uppercase" }}>Paiement</div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}>
                        <span>{translatePaymentMethod(selectedTicket.payment_method)}</span>
                        <span style={{ fontWeight: "bold" }}>{formatCurrency(ticketGrandTotal)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: "11px" }}>
                        <span>Rendu</span>
                        <span>{formatCurrency(selectedTicket.change_given || 0)}</span>
                      </div>
                    </>
                  )
                })()}
                <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                <div style={{ textAlign: "center", fontSize: "9px", color: "#999" }}>Merci de votre visite !</div>
                <div style={{ textAlign: "center", fontSize: "9px", color: "#999" }}>DISTRICT CLUB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Z Report Print Preview ───────────────────────────────────── */}
      {showZReport && (() => {
        const zCaisse = zReportOrders.reduce((s, o) => s + o.total, 0)
        const zReservation = zReportOrders
          .filter(o => o.order_type === "terrain")
          .reduce((s, o) => s + getOrderSlotPrice(o), 0)
        const zDepenses = zReportExpenses.reduce((s, e) => s + e.amount, 0)
        const zTotal = zReservation + zCaisse - zDepenses
        const zPmBreakdown = zReportOrders.reduce((acc, o) => {
          // Use payment_details JSONB first, then allOrderPayments, then fallback
          const pmts = (o.payment_details && Array.isArray(o.payment_details) && o.payment_details.length > 0)
            ? o.payment_details.map((p) => ({ method_name: p.method_name, amount: p.amount }))
            : allOrderPayments[o.id]
          if (pmts && pmts.length > 0) {
            for (const p of pmts) {
              acc[p.method_name] = (acc[p.method_name] || 0) + p.amount
            }
          } else {
            const method = translatePaymentMethod(o.payment_method)
            const total = o.total + getOrderSlotPrice(o)
            acc[method] = (acc[method] || 0) + total
          }
          return acc
        }, {} as Record<string, number>)
        const zDateObj = new Date(zReportDate + "T12:00:00")
        const zDateLabel = zDateObj.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" })

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[92vh] flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-100 flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-neutral-950">Rapport Z</h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const el = document.getElementById("z-report-content")
                        if (!el) return
                        const win = window.open("", "_blank", "width=302,height=600")
                        if (!win) return
                        win.document.write(`<html><head><title>Rapport Z</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:72mm;padding:4mm}</style></head><body>`)
                        win.document.write(el.innerHTML)
                        win.document.write("</body></html>")
                        win.document.close()
                        win.focus()
                        setTimeout(() => { win.print(); win.close() }, 250)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimer
                    </button>
                    <button onClick={() => setShowZReport(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Date navigation */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      const d = new Date(zReportDate + "T12:00:00")
                      d.setDate(d.getDate() - 1)
                      const nd = d.toISOString().split("T")[0]
                      setZReportDate(nd)
                      loadZReportForDate(nd)
                    }}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold text-neutral-700 min-w-[130px] text-center">{zDateLabel}</span>
                  <button
                    onClick={() => {
                      const d = new Date(zReportDate + "T12:00:00")
                      d.setDate(d.getDate() + 1)
                      const nd = d.toISOString().split("T")[0]
                      setZReportDate(nd)
                      loadZReportForDate(nd)
                    }}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      const nd = new Date().toISOString().split("T")[0]
                      setZReportDate(nd)
                      setZReportOrders(todayOrders)
                      setZReportExpenses(sessionExpenses)
                    }}
                    className="px-2 py-1 text-[10px] font-medium bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                  >
                    Aujourd&apos;hui
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-neutral-100">
                {zReportLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ) : (
                  <div id="z-report-content" className="bg-white mx-auto shadow-sm border border-neutral-200" style={{ width: "72mm", fontFamily: "'Courier New', monospace", fontSize: "12px", padding: "4mm" }}>
                    <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>DISTRICT CLUB</div>
                    <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px", marginBottom: "2px" }}>RAPPORT Z</div>
                    <div style={{ textAlign: "center", fontSize: "10px", color: "#666" }}>{zDateLabel}</div>
                    <div style={{ textAlign: "center", fontSize: "10px", color: "#666", marginBottom: "6px" }}>{employee?.full_name || employee?.username}</div>
                    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: "bold", fontSize: "13px" }}><span>TOTAL</span><span>{formatCurrency(zTotal)}</span></div>
                    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>Réservations</span><span>{formatCurrency(zReservation)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>Caisse</span><span>{formatCurrency(zCaisse)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>Dépenses</span><span style={{ color: "#dc2626" }}>-{formatCurrency(zDepenses)}</span></div>
                    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                    <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase" }}>Modalités de paiement</div>
                    {Object.entries(zPmBreakdown).map(([method, amount]) => (
                      <div key={method} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span>{method}</span><span>{formatCurrency(amount)}</span></div>
                    ))}
                    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                    <div style={{ fontSize: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}><span>Nb tickets</span><span>{zReportOrders.length}</span></div>
                      {currentSession && <div style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}><span>Fond de caisse</span><span>{formatCurrency(currentSession.opening_amount)}</span></div>}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}><span>Nb dépenses</span><span>{zReportExpenses.length}</span></div>
                    </div>
                    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: "bold" }}><span>NET EN CAISSE</span><span>{formatCurrency(zTotal)}</span></div>
                    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
                    <div style={{ textAlign: "center", fontSize: "9px", color: "#999", marginTop: "6px" }}>Généré le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ─── Product Modal ──────────────────────────────────────────── */}
      {/* ─── Expense Modal ──────────────────────────────────────────── */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowExpenseModal(false)}>
          <div className="flex gap-4 items-center" onClick={e => e.stopPropagation()}>
          <div className="bg-white rounded-2xl shadow-2xl w-[384px]">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Nouvelle dépense</h2>
              <button onClick={() => setShowExpenseModal(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Type de dépense */}
              {expenseTypes.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Type</label>
                  <select
                    value={expenseForm.expense_type_id}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expense_type_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
                  >
                    <option value="">-- Aucun --</option>
                    {expenseTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Description *</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  placeholder="Ex: Achat de serviettes"
                  autoFocus
                />
              </div>

              {/* Montant */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Montant (FCFA) *</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-3 text-lg font-bold text-center border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-400"
                  placeholder="0"
                />
              </div>

              {/* Bénéficiaire */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Bénéficiaire <span className="text-neutral-300">(optionnel)</span></label>
                <input
                  type="text"
                  value={expenseForm.beneficiaire}
                  onChange={(e) => setExpenseForm({ ...expenseForm, beneficiaire: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                  placeholder="Nom du bénéficiaire"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveExpense}
                disabled={isSavingExpense || !expenseForm.description || !expenseForm.amount}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSavingExpense ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
          {vkEnabled && <VirtualKeyboard enabled inline />}
          </div>
        </div>
      )}

      {/* ─── Reservation Modal ────────────────────────────────────────── */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setShowReservationModal(false); setResModalSelectedRes(null); setResModalQuickAdd(null) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-[98vw] max-w-[1400px] h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header with date nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-neutral-900">Réservations</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const d = new Date(resModalDate)
                    d.setDate(d.getDate() - 1)
                    const nd = d.toISOString().split("T")[0]
                    setResModalDate(nd)
                    loadResModalReservations(nd)
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-neutral-800 min-w-[140px] text-center">
                  {new Date(resModalDate + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" })}
                </span>
                <button
                  onClick={() => {
                    const d = new Date(resModalDate)
                    d.setDate(d.getDate() + 1)
                    const nd = d.toISOString().split("T")[0]
                    setResModalDate(nd)
                    loadResModalReservations(nd)
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const nd = new Date().toISOString().split("T")[0]
                    setResModalDate(nd)
                    loadResModalReservations(nd)
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Aujourd&apos;hui
                </button>
              </div>
              <button onClick={() => { setShowReservationModal(false); setResModalSelectedRes(null); setResModalQuickAdd(null) }} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto">
              {resModalLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col className="w-16" />
                    {terrains.filter(t => t.is_active).map(t => (
                      <col key={t.id} />
                    ))}
                  </colgroup>
                  <thead className="sticky top-0 z-20">
                    <tr>
                      <th className="border-b border-r border-gray-300 bg-gray-900 py-3 px-2">
                        <span className="text-xs font-medium text-gray-400">Heure</span>
                      </th>
                      {terrains.filter(t => t.is_active).map(t => (
                        <th key={t.id} className="border-b border-r border-gray-700 py-3 bg-gray-900 last:border-r-0">
                          <span className="text-sm font-semibold text-white">Terrain {t.code}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.filter(s => s.is_active).map((slot, slotIndex) => {
                      const activeTerrainsList = terrains.filter(t => t.is_active)
                      const getResForCell = (terrainId: number, slotId: number) =>
                        resModalReservations.find(r => r.terrain_id === terrainId && r.time_slot_id === slotId)

                      return (
                        <tr key={slot.id} className={slotIndex % 2 === 1 ? "bg-gray-50" : "bg-white"}>
                          {/* Time */}
                          <td className="border-b border-r border-gray-300 py-3 px-3 align-middle">
                            <div className="text-base font-bold text-gray-900">{slot.start_time.slice(0, 5)}</div>
                            <div className="text-sm text-gray-500">{slot.end_time.slice(0, 5)}</div>
                          </td>

                          {/* Cells */}
                          {activeTerrainsList.map(t => {
                            const res = getResForCell(t.id, slot.id)
                            const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
                              PENDING: { label: "En attente", color: "text-amber-700", bg: "bg-amber-100" },
                              CONFIRMED: { label: "Confirmé", color: "text-blue-700", bg: "bg-blue-100" },
                              PAID: { label: "Payé", color: "text-emerald-700", bg: "bg-emerald-100" },
                            }

                            if (!res) {
                              return (
                                <td key={t.id} className="border-b border-r border-gray-200 p-0 h-16 last:border-r-0">
                                  <div
                                    onClick={() => {
                                      setResModalQuickAdd({ terrainId: t.id, slotId: slot.id })
                                      const slotDur = getSlotDurationMinutes(slot.id)
                                      setResModalQuickAddForm({ name: "", phone: "", duration: (slotDur <= 60 ? 60 : 90) as 30 | 60 | 90 })
                                    }}
                                    className="h-full w-full flex items-center justify-center cursor-pointer hover:bg-gray-50 group"
                                  >
                                    <span className="text-gray-300 group-hover:text-gray-400 text-xl font-light">+</span>
                                  </div>
                                </td>
                              )
                            }

                            const cfg = statusCfg[res.status] || statusCfg.PENDING

                            return (
                              <td key={t.id} className="border-b border-r border-gray-200 p-0 h-16 last:border-r-0">
                                <div
                                  onClick={() => setResModalSelectedRes(res)}
                                  className={cn(
                                    "h-full w-full cursor-pointer px-3 py-2 flex items-center justify-between",
                                    cfg.bg
                                  )}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-base truncate text-gray-900">
                                      {getResPlayerName(res)}
                                    </p>
                                    {getResPlayerPhone(res) && (
                                      <p className={cn("text-sm font-mono", cfg.color)}>
                                        {formatResPhone(getResPlayerPhone(res)!)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1 ml-2">
                                    <span className={cn(
                                      "text-xs font-bold px-2 py-0.5 rounded",
                                      res.status === "PENDING" && "bg-amber-200 text-amber-800",
                                      res.status === "CONFIRMED" && "bg-blue-200 text-blue-800",
                                      res.status === "PAID" && "bg-emerald-200 text-emerald-800"
                                    )}>
                                      {cfg.label}
                                    </span>
                                    <span className="text-sm font-bold text-gray-700">
                                      {getResEffectivePrice(res) ? getResEffectivePrice(res).toLocaleString("fr-FR") + " F" : ""}
                                    </span>
                                    {res.duration_minutes && res.duration_minutes < getSlotDurationMinutes(res.time_slot_id) && (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                                        <Clock className="h-2.5 w-2.5" />
                                        {res.duration_minutes >= 60 ? `${res.duration_minutes / 60}h` : `${res.duration_minutes}min`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Reservation Quick Add Sub-modal ────────────────────────── */}
      {resModalQuickAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setResModalQuickAdd(null)}>
          <div className="flex gap-4 items-center" onClick={e => e.stopPropagation()}>
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden">
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-5 py-4">
              <h3 className="font-bold text-white text-base">Nouvelle réservation</h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {terrains.find(t => t.id === resModalQuickAdd.terrainId)?.code}
                </span>
                <span className="text-white/80 text-xs">
                  {timeSlots.find(ts => ts.id === resModalQuickAdd.slotId)?.start_time.slice(0, 5)} - {timeSlots.find(ts => ts.id === resModalQuickAdd.slotId)?.end_time.slice(0, 5)}
                </span>
                <span className="text-white/60 text-xs">
                  {formatCurrency(getPriceForDuration(resModalQuickAdd.slotId, resModalQuickAddForm.duration))}
                </span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 block mb-1.5">Nom du client *</label>
                <input
                  type="text"
                  value={resModalQuickAddForm.name}
                  onChange={e => setResModalQuickAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Prénom Nom"
                  autoFocus
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 block mb-1.5">Téléphone *</label>
                <input
                  type="tel"
                  value={resModalQuickAddForm.phone}
                  onChange={e => setResModalQuickAddForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="07 XX XX XX XX"
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Format: 10 chiffres commençant par 01, 05 ou 07</p>
              </div>
              {/* Duration Selector */}
              <div>
                <label className="text-xs font-medium text-neutral-500 block mb-1.5">Durée</label>
                {(() => {
                  const options = getDurationOptions(resModalQuickAdd.slotId)
                  return (
                    <div className={cn("grid gap-2", options.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
                      {options.map((d) => {
                        const price = getPriceForDuration(resModalQuickAdd.slotId, d)
                        const label = d === 30 ? '30 min' : d === 60 ? '1h' : '1h30'
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setResModalQuickAddForm(f => ({ ...f, duration: d }))}
                            className={cn(
                              "flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-all",
                              resModalQuickAddForm.duration === d
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                            )}
                          >
                            <span className="text-xs font-bold">{label}</span>
                            <span className={cn(
                              "text-[10px] font-medium",
                              resModalQuickAddForm.duration === d ? "text-neutral-300" : "text-neutral-400"
                            )}>
                              {formatCurrency(price)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => { setResModalQuickAdd(null); setResModalQuickAddForm({ name: "", phone: "", duration: 90 }) }}
                className="flex-1 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-600 font-semibold text-sm hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                disabled={!resModalQuickAddForm.name.trim() || resModalQuickAddForm.phone.replace(/\D/g, "").length !== 10}
                onClick={handleResModalQuickAdd}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all",
                  resModalQuickAddForm.name.trim() && resModalQuickAddForm.phone.replace(/\D/g, "").length === 10
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
              >
                Réserver
              </button>
            </div>
          </div>
          {vkEnabled && <VirtualKeyboard enabled inline />}
          </div>
        </div>
      )}

      {/* ─── Reservation Detail Sub-modal ────────────────────────────── */}
      {resModalSelectedRes && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setResModalSelectedRes(null)}>
          <div className="bg-white rounded-xl shadow-xl w-80" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400">#{resModalSelectedRes.id}</span>
                <h3 className="font-bold text-gray-900">{getResPlayerName(resModalSelectedRes)}</h3>
              </div>
              <button onClick={() => setResModalSelectedRes(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info */}
            <div className="px-4 py-3 space-y-2 text-sm border-b">
              {getResPlayerPhone(resModalSelectedRes) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Téléphone</span>
                  <span className="font-mono font-semibold">{formatResPhone(getResPlayerPhone(resModalSelectedRes)!)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Terrain</span>
                <span className="font-semibold">{resModalSelectedRes.terrain?.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Créneau</span>
                <span className="font-semibold">
                  {resModalSelectedRes.time_slot?.start_time?.slice(0, 5)} - {resModalSelectedRes.time_slot?.end_time?.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Durée</span>
                {resModalSelectedRes.duration_minutes && resModalSelectedRes.duration_minutes < getSlotDurationMinutes(resModalSelectedRes.time_slot_id) ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    {resModalSelectedRes.duration_minutes >= 60 ? `${resModalSelectedRes.duration_minutes / 60}h` : `${resModalSelectedRes.duration_minutes}min`}
                  </span>
                ) : (
                  <span className="font-semibold">{getSlotDurationMinutes(resModalSelectedRes.time_slot_id) >= 90 ? '1h30' : '1h'}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Prix</span>
                <span className="font-bold text-emerald-600">
                  {getResEffectivePrice(resModalSelectedRes).toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className={cn(
                  "font-bold",
                  resModalSelectedRes.status === "PAID" ? "text-emerald-700" : resModalSelectedRes.status === "CONFIRMED" ? "text-blue-700" : "text-amber-700"
                )}>
                  {resModalSelectedRes.status === "PAID" ? "Payé" : resModalSelectedRes.status === "CONFIRMED" ? "Confirmé" : "En attente"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              {resModalSelectedRes.status === "PAID" && (
                <button
                  onClick={() => handleResModalStatusChange(resModalSelectedRes.id, "CONFIRMED")}
                  className="w-full py-2 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600"
                >
                  Annuler le paiement
                </button>
              )}
              {resModalSelectedRes.status === "PENDING" && (
                <button
                  onClick={() => handleResModalStatusChange(resModalSelectedRes.id, "CONFIRMED")}
                  className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600"
                >
                  Confirmer
                </button>
              )}
              {(resModalSelectedRes.status === "PENDING" || resModalSelectedRes.status === "CONFIRMED") && (
                <>
                  <button
                    onClick={() => handleResModalStatusChange(resModalSelectedRes.id, "CANCELED")}
                    className="w-full py-2 rounded-lg border border-red-300 text-red-600 font-semibold text-sm hover:bg-red-50"
                  >
                    Annuler la réservation
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-950">
                {showProductModal.type === "create"
                  ? "Nouveau produit"
                  : "Modifier le produit"}
              </h2>
              <button
                onClick={() => setShowProductModal(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Ex: Café expresso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={productForm.category_id}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Sans catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Stock (optionnel)
                </label>
                <input
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      stock_quantity: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Laisser vide pour illimité"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProductModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSavingProduct}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSavingProduct
                  ? "..."
                  : showProductModal.type === "create"
                    ? "Ajouter"
                    : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Virtual Keyboard ─────────────────────────────────────────── */}
      <VirtualKeyboard enabled={vkEnabled && !payingOrder && !showExpenseModal && !resModalQuickAdd} />
    </div>
  )
}
