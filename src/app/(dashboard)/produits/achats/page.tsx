"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  ShoppingCart,
  Plus,
  X,
  Calendar,
  Package,
  TrendingUp,
  Trash2,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading"

// ─── Types ───────────────────────────────────────────────────────────
interface PosProduct {
  id: number
  name: string
  product_type: "bien" | "service"
  purchase_price: number
  stock_quantity: number | null
  is_active: boolean
}

interface PurchaseOrder {
  id: number
  purchase_number: string
  supplier: string | null
  notes: string | null
  total_cost: number
  item_count: number
  purchase_date: string
  created_by: string
  created_at: string
}

interface PurchaseOrderItem {
  id: number
  purchase_order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_cost: number
  total_cost: number
}

interface OrderLine {
  product_id: string
  product_name: string
  quantity: string
  unit_cost: string
}

const PAGE_SIZE = 25

// ─── Helpers ─────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR").format(amount) + " F"

const generatePurchaseNumber = (date: string, seq: number) => {
  const d = new Date(date)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(2)
  return `${dd}${mm}${yy}-${String(seq).padStart(3, "0")}`
}

// ═════════════════════════════════════════════════════════════════════
export default function AchatsPage() {
  const { employee } = useAuth()
  const supabase = createClient()
  const printRef = useRef<HTMLDivElement>(null)

  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [products, setProducts] = useState<PosProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)

  // Filters
  const [filterMonth, setFilterMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )

  // Create modal
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [orderForm, setOrderForm] = useState({
    supplier: "",
    notes: "",
    purchase_date: new Date().toISOString().split("T")[0],
  })
  const [lines, setLines] = useState<OrderLine[]>([
    { product_id: "", product_name: "", quantity: "", unit_cost: "" },
  ])

  // View modal
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null)
  const [viewItems, setViewItems] = useState<PurchaseOrderItem[]>([])

  // Delete
  const [deleteModal, setDeleteModal] = useState<PurchaseOrder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ─── Load Data ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from("pos_purchase_orders")
        .select("*", { count: "exact" })
        .order("purchase_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (filterMonth) {
        const [y, m] = filterMonth.split("-")
        const start = `${y}-${m}-01`
        const endDate = new Date(parseInt(y), parseInt(m), 0)
        const end = `${y}-${m}-${String(endDate.getDate()).padStart(2, "0")}`
        query = query.gte("purchase_date", start).lte("purchase_date", end)
      }

      const [ordersRes, productsRes] = await Promise.all([
        query,
        supabase
          .from("pos_products")
          .select("id, name, product_type, purchase_price, stock_quantity, is_active")
          .eq("is_active", true)
          .eq("product_type", "bien")
          .order("name"),
      ])

      if (ordersRes.error) throw ordersRes.error
      if (productsRes.error) throw productsRes.error

      setOrders(ordersRes.data || [])
      setTotalCount(ordersRes.count || 0)
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }, [page, filterMonth])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset page when filter changes
  useEffect(() => {
    setPage(0)
  }, [filterMonth])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // ─── Stats (current page) ───────────────────────────────────────
  const totalFiltered = orders.reduce((sum, o) => sum + o.total_cost, 0)
  const totalItems = orders.reduce((sum, o) => sum + o.item_count, 0)

  // ─── Lines management ───────────────────────────────────────────
  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { product_id: "", product_name: "", quantity: "", unit_cost: "" },
    ])
  }

  const removeLine = (idx: number) => {
    if (lines.length <= 1) return
    setLines((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateLine = (idx: number, field: keyof OrderLine, value: string) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line
        const updated = { ...line, [field]: value }
        if (field === "product_id") {
          const product = products.find((p) => p.id.toString() === value)
          if (product) {
            updated.product_name = product.name
            updated.unit_cost = product.purchase_price.toString()
          }
        }
        return updated
      })
    )
  }

  const linesTotal = lines.reduce(
    (sum, l) => sum + (parseInt(l.quantity) || 0) * (parseInt(l.unit_cost) || 0),
    0
  )

  const validLines = lines.filter(
    (l) => l.product_id && parseInt(l.quantity) > 0 && parseInt(l.unit_cost) >= 0
  )

  // ─── Generate next purchase number ──────────────────────────────
  const getNextPurchaseNumber = async (date: string) => {
    const d = new Date(date)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yy = String(d.getFullYear()).slice(2)
    const prefix = `${dd}${mm}${yy}-`

    const { data } = await supabase
      .from("pos_purchase_orders")
      .select("purchase_number")
      .like("purchase_number", `%${mm}${yy}-%`)
      .order("purchase_number", { ascending: false })
      .limit(1)

    let seq = 1
    if (data && data.length > 0) {
      const lastNum = data[0].purchase_number
      const lastSeq = parseInt(lastNum.split("-")[1]) || 0
      seq = lastSeq + 1
    }

    return `${dd}${mm}${yy}-${String(seq).padStart(3, "0")}`
  }

  // ─── Open create modal ──────────────────────────────────────────
  const openCreateModal = () => {
    setOrderForm({
      supplier: "",
      notes: "",
      purchase_date: new Date().toISOString().split("T")[0],
    })
    setLines([{ product_id: "", product_name: "", quantity: "", unit_cost: "" }])
    setShowModal(true)
  }

  // ─── Save purchase order ────────────────────────────────────────
  const handleSave = async () => {
    if (validLines.length === 0) {
      toast.error("Ajoutez au moins un article valide")
      return
    }

    setIsSaving(true)
    try {
      const purchaseNumber = await getNextPurchaseNumber(orderForm.purchase_date)
      const totalCost = validLines.reduce(
        (sum, l) => sum + (parseInt(l.quantity) || 0) * (parseInt(l.unit_cost) || 0),
        0
      )

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("pos_purchase_orders")
        .insert({
          purchase_number: purchaseNumber,
          supplier: orderForm.supplier || null,
          notes: orderForm.notes || null,
          total_cost: totalCost,
          item_count: validLines.length,
          purchase_date: orderForm.purchase_date,
          created_by: employee?.full_name || employee?.username || "Employé",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const items = validLines.map((l) => ({
        purchase_order_id: order.id,
        product_id: parseInt(l.product_id),
        product_name: l.product_name || products.find((p) => p.id.toString() === l.product_id)?.name || "",
        quantity: parseInt(l.quantity),
        unit_cost: parseInt(l.unit_cost),
        total_cost: (parseInt(l.quantity) || 0) * (parseInt(l.unit_cost) || 0),
      }))

      const { error: itemsError } = await supabase
        .from("pos_purchase_order_items")
        .insert(items)
      if (itemsError) throw itemsError

      // Update stock + log movements
      for (const line of validLines) {
        const product = products.find((p) => p.id.toString() === line.product_id)
        if (product) {
          const qty = parseInt(line.quantity)
          const newStock = (product.stock_quantity || 0) + qty
          await supabase
            .from("pos_products")
            .update({
              stock_quantity: newStock,
              purchase_price: parseInt(line.unit_cost),
              updated_at: new Date().toISOString(),
            })
            .eq("id", product.id)

          // Stock movement entry
          await supabase.from("pos_stock_movements").insert({
            product_id: product.id,
            product_name: product.name,
            movement_type: "entry",
            quantity: qty,
            reference_type: "purchase",
            reference_id: order.id,
            reference_number: purchaseNumber,
            note: `Achat ${purchaseNumber}`,
            created_by: employee?.full_name || employee?.username || "Employé",
          })
        }
      }

      setShowModal(false)
      loadData()
      toast.success(`Bon d'achat ${purchaseNumber} enregistré`)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── View order detail ──────────────────────────────────────────
  const handleViewOrder = async (order: PurchaseOrder) => {
    setViewOrder(order)
    const { data } = await supabase
      .from("pos_purchase_order_items")
      .select("*")
      .eq("purchase_order_id", order.id)
      .order("id")
    setViewItems(data || [])
  }

  // ─── Print ──────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!printRef.current) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Bon d'achat ${viewOrder?.purchase_number}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
            th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 11px; }
            .right { text-align: right; }
            .total-row td { font-weight: 700; border-top: 2px solid #333; }
            .footer { margin-top: 32px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
          <div class="footer">Document généré le ${new Date().toLocaleString("fr-FR")}</div>
        </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  // ─── Delete order ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal) return
    setIsDeleting(true)
    try {
      // Get items to reverse stock
      const { data: items } = await supabase
        .from("pos_purchase_order_items")
        .select("*")
        .eq("purchase_order_id", deleteModal.id)

      if (items) {
        for (const item of items) {
          const product = products.find((p) => p.id === item.product_id)
          if (product) {
            const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity)
            await supabase
              .from("pos_products")
              .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
              .eq("id", product.id)
          }
          // Remove related stock movements
          await supabase
            .from("pos_stock_movements")
            .delete()
            .eq("reference_type", "purchase")
            .eq("reference_id", deleteModal.id)
            .eq("product_id", item.product_id)
        }
      }

      const { error } = await supabase
        .from("pos_purchase_orders")
        .delete()
        .eq("id", deleteModal.id)
      if (error) throw error

      toast.success("Bon d'achat supprimé")
      setDeleteModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Achats</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Bons d&apos;achat et approvisionnement
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel achat
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950">{totalCount}</p>
              <p className="text-xs text-neutral-500">Bons d&apos;achat</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950">{totalItems}</p>
              <p className="text-xs text-neutral-500">Articles (page)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalFiltered)}
              </p>
              <p className="text-xs text-neutral-500">Total (page)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <ShoppingCart className="w-12 h-12 mb-3 stroke-1" />
            <p>Aucun bon d&apos;achat trouvé</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    N° Achat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Par
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-neutral-950">
                        {order.purchase_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(order.purchase_date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {order.supplier || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right">
                      {order.item_count}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-950 text-right">
                      {formatCurrency(order.total_cost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {order.created_by}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Voir le détail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(order)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-neutral-50">
                <p className="text-xs text-neutral-500">
                  Page {page + 1} sur {totalPages} — {totalCount} résultat{totalCount > 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Create Purchase Modal ────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                Nouveau bon d&apos;achat
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order info */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Date d&apos;achat
                </label>
                <input
                  type="date"
                  value={orderForm.purchase_date}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, purchase_date: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fournisseur
                </label>
                <input
                  type="text"
                  value={orderForm.supplier}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, supplier: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  placeholder="Optionnel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={orderForm.notes}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                  placeholder="Optionnel"
                />
              </div>
            </div>

            {/* Lines */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Articles
                </p>
                <button
                  onClick={addLine}
                  className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une ligne
                </button>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 mb-2 px-1">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase">Produit</span>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase text-right">Qté</span>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase text-right">Coût unit.</span>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase text-right">Sous-total</span>
                <span />
              </div>

              <div className="space-y-2">
                {lines.map((line, idx) => {
                  const lineTotal =
                    (parseInt(line.quantity) || 0) * (parseInt(line.unit_cost) || 0)
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr_80px_100px_100px_32px] gap-2 items-center"
                    >
                      <select
                        value={line.product_id}
                        onChange={(e) =>
                          updateLine(idx, "product_id", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <option value="">Sélectionner...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.stock_quantity ?? 0})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(idx, "quantity", e.target.value)
                        }
                        className="w-full px-2 py-2 border border-neutral-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        value={line.unit_cost}
                        onChange={(e) =>
                          updateLine(idx, "unit_cost", e.target.value)
                        }
                        className="w-full px-2 py-2 border border-neutral-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        placeholder="0"
                      />
                      <p className="text-sm font-medium text-neutral-900 text-right pr-1">
                        {lineTotal > 0 ? formatCurrency(lineTotal) : "—"}
                      </p>
                      <button
                        onClick={() => removeLine(idx)}
                        disabled={lines.length <= 1}
                        className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-neutral-50 rounded-xl mb-6 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">
                Total ({validLines.length} article{validLines.length > 1 ? "s" : ""})
              </span>
              <span className="text-xl font-bold text-neutral-950">
                {formatCurrency(linesTotal)}
              </span>
            </div>

            {products.length === 0 && (
              <p className="text-xs text-amber-600 mb-4">
                Aucun produit de type &ldquo;Bien&rdquo; trouvé. Créez
                d&apos;abord un produit avec gestion de stock.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || validLines.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Enregistrement..." : "Valider et entrer en stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Order Modal ─────────────────────────────────────── */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-950">
                Bon d&apos;achat {viewOrder.purchase_number}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrint}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Imprimer"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewOrder(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable content */}
            <div ref={printRef}>
              <h1 style={{ display: "none" }}>
                Bon d&apos;achat {viewOrder.purchase_number}
              </h1>
              <div className="print-header" style={{ display: "none" }}>
                <h1>Bon d&apos;achat {viewOrder.purchase_number}</h1>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 mb-4 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">N° Achat</span>
                  <span className="font-mono font-medium">{viewOrder.purchase_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Date</span>
                  <span>{new Date(viewOrder.purchase_date).toLocaleDateString("fr-FR")}</span>
                </div>
                {viewOrder.supplier && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Fournisseur</span>
                    <span>{viewOrder.supplier}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Créé par</span>
                  <span>{viewOrder.created_by}</span>
                </div>
              </div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                      Produit
                    </th>
                    <th className="py-2 text-right text-xs font-medium text-neutral-500 uppercase">
                      Qté
                    </th>
                    <th className="py-2 text-right text-xs font-medium text-neutral-500 uppercase">
                      Coût unit.
                    </th>
                    <th className="py-2 text-right text-xs font-medium text-neutral-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {viewItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-medium text-neutral-900">
                        {item.product_name}
                      </td>
                      <td className="py-2.5 text-right text-neutral-600">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right text-neutral-600">
                        {formatCurrency(item.unit_cost)}
                      </td>
                      <td className="py-2.5 text-right font-medium text-neutral-900">
                        {formatCurrency(item.total_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-300">
                    <td colSpan={3} className="py-3 font-semibold text-neutral-700">
                      Total
                    </td>
                    <td className="py-3 text-right font-bold text-lg text-neutral-950">
                      {formatCurrency(viewOrder.total_cost)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {viewOrder.notes && (
                <p className="text-xs text-neutral-500">
                  <strong>Notes :</strong> {viewOrder.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Modal ─────────────────────────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-neutral-950 mb-2">
              Supprimer le bon d&apos;achat ?
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Le bon <strong className="font-mono">{deleteModal.purchase_number}</strong> et ses{" "}
              {deleteModal.item_count} article{deleteModal.item_count > 1 ? "s" : ""} seront
              supprimés. Le stock sera ajusté en conséquence.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
