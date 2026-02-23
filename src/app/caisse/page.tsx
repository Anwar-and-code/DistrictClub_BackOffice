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
  TrendingUp,
  Package,
  Search,
  Banknote,
  Lock,
  History,
  Pencil,
  ArrowLeft,
  RotateCcw,
  Hash,
  ClipboardList,
  MapPin,
  Clock,
  CalendarDays,
  Check,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  table?: { name: string } | null
  terrain?: { code: string } | null
  time_slot?: { start_time: string; end_time: string } | null
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
  terrain?: { code: string }
  time_slot?: { start_time: string; end_time: string }
  client?: { full_name: string; phone: string } | null
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

  // Commander
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [posTables, setPosTables] = useState<PosTable[]>([])
  const [activeReservations, setActiveReservations] = useState<ActiveReservation[]>([])
  const [showCommandType, setShowCommandType] = useState(false)
  const [showTablePlan, setShowTablePlan] = useState(false)
  const [showTerrainPicker, setShowTerrainPicker] = useState(false)
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
      .select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time)")
      .gte("created_at", `${today}T00:00:00`)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
    setTodayOrders(data || [])
  }, [])

  const loadPendingOrders = useCallback(async () => {
    const { data } = await supabase
      .from("pos_orders")
      .select("*, table:pos_tables(name), terrain:terrains(code), time_slot:time_slots(start_time, end_time)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
    setPendingOrders(data || [])
    // Compute occupied table ids
    const tIds = (data || []).filter((o: PosOrder) => o.table_id).map((o: PosOrder) => o.table_id as number)
    setOccupiedTableIds(tIds)
  }, [])

  useEffect(() => {
    loadData()
    loadTodayOrders()
    loadPendingOrders()
  }, [loadData, loadTodayOrders, loadPendingOrders])

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
    const cashSales = sessionOrders
      .filter((o) => o.payment_method === "cash")
      .reduce((sum, o) => sum + o.total, 0)
    const expectedAmount = currentSession.opening_amount + cashSales

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

  // ─── Load active reservations (today, CONFIRMED/PAID) ───────────
  const loadActiveReservations = async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data } = await supabase
      .from("reservations")
      .select("*, terrain:terrains(code), time_slot:time_slots(start_time, end_time), client:clients(full_name, phone)")
      .eq("reservation_date", today)
      .in("status", ["CONFIRMED", "PAID"])
      .order("time_slot_id")
    setActiveReservations(data || [])
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
    } catch (error) {
      console.error(error)
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
    setShowTablePlan(false)
    if (existing) {
      await appendToPendingOrder(existing)
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
      toast.error("Ce terrain est déjà payé, impossible de passer une commande")
      return
    }
    // Check if this terrain+slot already has a pending order
    const existing = pendingOrders.find(
      (o) =>
        o.order_type === "terrain" &&
        o.terrain_id === res.terrain_id &&
        o.time_slot_id === res.time_slot_id
    )
    setShowTerrainPicker(false)
    if (existing) {
      await appendToPendingOrder(existing)
    } else {
      const num = await createPendingOrder({
        order_type: "terrain",
        terrain_id: res.terrain_id,
        time_slot_id: res.time_slot_id,
        reservation_id: res.id,
        reservation_date: res.reservation_date,
        client_name: res.client?.full_name || null,
        client_phone: res.client?.phone || null,
      })
      if (num) toast.success(`Commande ${num} — ${res.terrain?.code} ${res.client?.full_name || ""}`)
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
      const slot = timeSlots.find((s) => s.id === order.time_slot_id)
      setReservationPrice(slot?.price || 0)
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

      const { error } = await supabase
        .from("pos_orders")
        .update({
          status: "completed",
          payment_method: primaryMethod,
          cash_received: totalReceived || null,
          change_given: totalReturned || null,
        })
        .eq("id", payingOrder.id)

      if (error) throw error

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
              if (rpErr) console.warn("reservation_payments insert:", rpErr)
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

  // ─── Filtered Products ──────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category_id !== selectedCategory) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false
    return true
  })

  // ─── Today Stats ────────────────────────────────────────────────
  const todayTotal = todayOrders.reduce((sum, o) => sum + o.total, 0)
  const todayCash = todayOrders
    .filter((o) => o.payment_method === "cash")
    .reduce((sum, o) => sum + o.total, 0)

  // ─── Loading ────────────────────────────────────────────────────
  if (isLoading || !sessionChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                <span className="text-neutral-950 font-bold">P</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Padel House</h1>
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
      {/* ─── MAIN AREA: Cart Left + Products Right ──────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══ LEFT: CART / TICKET ═══════════════════════════════════ */}
        <div className="w-[380px] bg-white flex flex-col border-r border-neutral-200">
          {/* Cart header */}
          <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-semibold text-neutral-950">
                  Ticket en cours
                </span>
                {cartItemCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-neutral-900 text-white rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
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
              <div className="flex flex-col items-center justify-center h-full text-neutral-300 px-6">
                <ShoppingBag className="h-12 w-12 mb-3 stroke-1" />
                <p className="text-sm text-neutral-400 font-medium">Panier vide</p>
                <p className="text-xs text-neutral-300 mt-1 text-center">
                  Sélectionnez des produits à droite
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {cart.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    {/* Line number */}
                    <span className="text-xs text-neutral-300 w-4 text-right font-mono">
                      {idx + 1}
                    </span>
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatCurrency(item.product.price_ttc)}
                      </p>
                    </div>
                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {/* Subtotal */}
                    <span className="text-sm font-semibold text-neutral-900 w-20 text-right">
                      {formatCurrency(item.product.price_ttc * item.quantity)}
                    </span>
                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart total + pay button */}
          <div className="border-t border-neutral-200 bg-white">
            {cart.length > 0 && (
              <>
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-950">Total</span>
                  <span className="text-2xl font-bold text-neutral-950">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <div className="px-5 pb-4 flex gap-2">
                  <button
                    onClick={() => setShowCommandType(true)}
                    className="flex-1 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Commander
                  </button>
                  <button
                    onClick={() => {
                      setShowCheckout(true)
                      setCashReceived("")
                      setPaymentMethod("cash")
                    }}
                    className="flex-1 py-3.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    Encaisser
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: PRODUCTS ═══════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search + categories */}
          <div className="px-6 py-3 bg-white border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50"
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
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
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
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md"
                      )}
                    >
                      {inCart && (
                        <span className="absolute -top-2.5 -right-2.5 h-7 w-7 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                          {inCart.quantity}
                        </span>
                      )}
                      <span className="text-sm font-medium text-neutral-950 mb-1 leading-tight">
                        {product.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 mb-3">
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
                          className="p-1 text-neutral-300 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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

      {/* ─── BOTTOM BAR: Options ────────────────────────────────────── */}
      <div className="h-14 bg-neutral-900 flex items-center justify-between px-5 gap-3">
        {/* Left options */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back-office
          </Link>
          <div className="w-px h-5 bg-neutral-700" />
          <button
            onClick={() => openProductModal("create")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouveau produit
          </button>
        </div>

        {/* Center: session info */}
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {employee?.full_name || employee?.username}
          </span>
          <span>•</span>
          <span>Fond: {formatCurrency(currentSession.opening_amount)}</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">
            {todayOrders.length} ticket{todayOrders.length > 1 ? "s" : ""} — {formatCurrency(todayTotal)}
          </span>
        </div>

        {/* Right options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadPendingOrders()
              setShowPending(true)
            }}
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Commandes
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-blue-500 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <div className="w-px h-5 bg-neutral-700" />
          <button
            onClick={() => {
              loadTodayOrders()
              setShowHistory(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            Historique
          </button>
          <div className="w-px h-5 bg-neutral-700" />
          <button
            onClick={() => {
              loadTodayOrders()
              setShowCloseSession(true)
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
            Fermer la caisse
          </button>
        </div>
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
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* ─── Command Type Picker ─────────────────────────────────────── */}
      {showCommandType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-950">
                Type de commande
              </h2>
              <button
                onClick={() => setShowCommandType(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 mb-5 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 mb-0.5 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(cartTotal)}</p>
              <p className="text-xs text-blue-500">{cart.length} article{cart.length > 1 ? "s" : ""}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowCommandType(false)
                  loadPendingOrders()
                  setShowTablePlan(true)
                }}
                disabled={posTables.length === 0}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-950">Table</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {posTables.length === 0 ? "Aucune table" : `${posTables.length} table${posTables.length > 1 ? "s" : ""}`}
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowCommandType(false)
                  loadActiveReservations()
                  setShowTerrainPicker(true)
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-950">Terrain</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Créneau actif</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Table Plan Modal ──────────────────────────────────────────── */}
      {showTablePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">Plan de salle</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Sélectionnez une table disponible — {formatCurrency(cartTotal)}
                </p>
              </div>
              <button
                onClick={() => setShowTablePlan(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {posTables.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 stroke-1" />
                <p className="text-sm">Aucune table configurée</p>
                <p className="text-xs mt-1">Allez dans Paramètres &gt; Plan de salle pour ajouter des tables</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {posTables.map((table) => {
                  const isOccupied = occupiedTableIds.includes(table.id)
                  return (
                    <button
                      key={table.id}
                      onClick={() => !isOccupied && handleCommandeTable(table)}
                      disabled={isOccupied || isProcessing}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        isOccupied
                          ? "border-red-200 bg-red-50 cursor-not-allowed opacity-60"
                          : "border-neutral-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
                      )}
                    >
                      {table.shape === "round" ? (
                        <div className={cn(
                          "h-16 w-16 rounded-full border-2 flex items-center justify-center transition-colors",
                          isOccupied
                            ? "bg-red-100 border-red-300"
                            : "bg-neutral-100 border-neutral-300"
                        )}>
                          <span className="text-sm font-bold text-neutral-700">{table.name}</span>
                        </div>
                      ) : table.shape === "rectangle" ? (
                        <div className={cn(
                          "h-12 w-24 rounded-lg border-2 flex items-center justify-center transition-colors",
                          isOccupied
                            ? "bg-red-100 border-red-300"
                            : "bg-neutral-100 border-neutral-300"
                        )}>
                          <span className="text-sm font-bold text-neutral-700">{table.name}</span>
                        </div>
                      ) : (
                        <div className={cn(
                          "h-16 w-16 rounded-lg border-2 flex items-center justify-center transition-colors",
                          isOccupied
                            ? "bg-red-100 border-red-300"
                            : "bg-neutral-100 border-neutral-300"
                        )}>
                          <span className="text-sm font-bold text-neutral-700">{table.name}</span>
                        </div>
                      )}
                      <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        isOccupied
                          ? "bg-red-100 text-red-600"
                          : "bg-emerald-100 text-emerald-700"
                      )}>
                        {isOccupied ? "Occupée" : "Disponible"}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Terrain Picker Modal (Grid: terrains × créneaux) ────────── */}
      {showTerrainPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">Commande terrain</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Sélectionnez un créneau actif — {formatCurrency(cartTotal)}
                </p>
              </div>
              <button
                onClick={() => setShowTerrainPicker(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeReservations.length === 0 ? (
              <div className="text-center py-16 text-neutral-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 stroke-1" />
                <p className="text-sm font-medium">Aucune réservation active aujourd&apos;hui</p>
                <p className="text-xs mt-1">Les réservations confirmées ou payées apparaîtront ici</p>
              </div>
            ) : (() => {
              // Build grid: unique time slots as rows, terrains as columns
              const activeTerrains = terrains.filter((t) => t.is_active)
              const slotIds = [...new Set(activeReservations.map((r) => r.time_slot_id))]
              const uniqueSlots = slotIds
                .map((sid) => {
                  const r = activeReservations.find((r) => r.time_slot_id === sid)
                  return r?.time_slot ? { id: sid, start: r.time_slot.start_time, end: r.time_slot.end_time } : null
                })
                .filter(Boolean) as { id: number; start: string; end: string }[]
              uniqueSlots.sort((a, b) => a.start.localeCompare(b.start))

              return (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-28">
                          <Clock className="inline h-3.5 w-3.5 mr-1" />
                          Créneau
                        </th>
                        {activeTerrains.map((t) => (
                          <th key={t.id} className="p-2 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-lg">
                              <MapPin className="h-3.5 w-3.5 text-neutral-600" />
                              <span className="text-sm font-bold text-neutral-800">Terrain {t.code}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueSlots.map((slot) => (
                        <tr key={slot.id} className="border-t border-neutral-100">
                          <td className="p-2 align-middle">
                            <span className="text-sm font-mono font-semibold text-neutral-700">
                              {slot.start.slice(0, 5)}
                            </span>
                            <span className="text-xs text-neutral-400 ml-1">
                              – {slot.end.slice(0, 5)}
                            </span>
                          </td>
                          {activeTerrains.map((t) => {
                            const res = activeReservations.find(
                              (r) => r.terrain_id === t.id && r.time_slot_id === slot.id
                            )
                            const existingOrder = pendingOrders.find(
                              (o) => o.order_type === "terrain" && o.terrain_id === t.id && o.time_slot_id === slot.id
                            )
                            if (!res) {
                              return (
                                <td key={t.id} className="p-2 text-center align-middle">
                                  <div className="h-16 flex items-center justify-center text-neutral-300 text-xs">
                                    —
                                  </div>
                                </td>
                              )
                            }
                            return (
                              <td key={t.id} className="p-2 align-middle">
                                <button
                                  onClick={() => handleCommandeTerrain(res)}
                                  disabled={isProcessing || res.status === "PAID"}
                                  className={cn(
                                    "w-full p-3 rounded-xl border-2 transition-all text-left",
                                    res.status === "PAID"
                                      ? "border-emerald-200 bg-emerald-50/50 opacity-60 cursor-not-allowed"
                                      : existingOrder
                                        ? "border-blue-300 bg-blue-50 hover:border-blue-400"
                                        : "border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={cn(
                                      "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                      res.status === "PAID"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    )}>
                                      {res.status === "PAID" ? "Payée" : "Confirmée"}
                                    </span>
                                    {existingOrder && (
                                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                        +{formatCurrency(existingOrder.total)}
                                      </span>
                                    )}
                                  </div>
                                  {res.client ? (
                                    <>
                                      <p className="text-xs font-semibold text-neutral-900 truncate">{res.client.full_name}</p>
                                      <p className="text-[10px] text-neutral-500 truncate">{res.client.phone}</p>
                                    </>
                                  ) : (
                                    <p className="text-xs text-neutral-400">Sans client</p>
                                  )}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* ─── Pending Orders Modal ─────────────────────────────────────── */}
      {showPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-950">
                Commandes en attente
                {pendingOrders.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    ({pendingOrders.length})
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowPending(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 stroke-1" />
                <p className="text-sm">Aucune commande en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-neutral-200 rounded-xl p-4 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950 font-mono">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                          {" — "}
                          {order.employee_name}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-neutral-950">
                        {formatCurrency(order.total)}
                      </p>
                    </div>

                    {/* Order type info */}
                    <div className="flex items-center gap-2 mb-3 text-xs flex-wrap">
                      {order.order_type === "table" && order.table && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                          <ClipboardList className="h-3 w-3" />
                          {order.table.name}
                        </span>
                      )}
                      {order.order_type === "terrain" && (
                        <>
                          {order.terrain && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium">
                              <MapPin className="h-3 w-3" />
                              {order.terrain.code}
                            </span>
                          )}
                          {order.time_slot && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md font-medium">
                              <Clock className="h-3 w-3" />
                              {order.time_slot.start_time.slice(0, 5)} – {order.time_slot.end_time.slice(0, 5)}
                            </span>
                          )}
                          {order.client_name && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md font-medium">
                              {order.client_name}{order.client_phone ? ` — ${order.client_phone}` : ""}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openPayModal(order)}
                        className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Banknote className="h-3.5 w-3.5" />
                        Encaisser
                      </button>
                      <button
                        onClick={() => handleCancelPendingOrder(order)}
                        className="px-3 py-2.5 text-red-600 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <p className="text-lg font-bold text-neutral-900">PadelHouse</p>
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
    <div class="title">PadelHouse</div>
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
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
                <span className="text-neutral-500">Ventes espèces</span>
                <span className="font-medium text-emerald-600">
                  +{formatCurrency(todayCash)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nb tickets</span>
                <span className="font-medium">{todayOrders.length}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2.5">
                <span className="font-semibold text-neutral-700">Attendu en caisse</span>
                <span className="font-bold text-neutral-900">
                  {formatCurrency(currentSession.opening_amount + todayCash)}
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
                      currentSession.opening_amount + todayCash
                      ? "bg-emerald-50 text-emerald-700"
                      : parseInt(closingAmount) <
                          currentSession.opening_amount + todayCash
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                  )}
                >
                  {parseInt(closingAmount) ===
                  currentSession.opening_amount + todayCash
                    ? "La caisse est juste"
                    : `Écart: ${formatCurrency(
                        parseInt(closingAmount) -
                          (currentSession.opening_amount + todayCash)
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
        </div>
      )}

      {/* ─── History Modal ──────────────────────────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-950">
                Tickets du jour
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 text-sm">
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                {formatCurrency(todayTotal)}
              </div>
              <div className="text-neutral-500">
                {todayOrders.length} ticket{todayOrders.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
              {todayOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                  <Receipt className="h-10 w-10 mb-3 stroke-1" />
                  <p className="text-sm">Aucun ticket aujourd&apos;hui</p>
                </div>
              ) : (
                todayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900 font-mono">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(order.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        — {order.employee_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded-full",
                          order.payment_method === "cash"
                            ? "bg-emerald-50 text-emerald-600"
                            : order.payment_method === "card"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                        )}
                      >
                        {order.payment_method === "cash"
                          ? "Espèces"
                          : order.payment_method === "card"
                            ? "Carte"
                            : "Mobile"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Product Modal ──────────────────────────────────────────── */}
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
    </div>
  )
}
