"use client"

import { useEffect, useState, useCallback } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────
interface StockMovement {
  id: number
  product_id: number
  product_name: string
  movement_type: "entry" | "sale" | "adjustment" | "return"
  quantity: number
  reference_type: string | null
  reference_id: number | null
  reference_number: string | null
  note: string | null
  created_by: string
  created_at: string
}

interface PosProduct {
  id: number
  name: string
}

const PAGE_SIZE = 25

// ─── Helpers ─────────────────────────────────────────────────────────
const movementLabels: Record<string, { label: string; color: string; icon: "in" | "out" }> = {
  entry: { label: "Entrée", color: "text-emerald-600 bg-emerald-50", icon: "in" },
  sale: { label: "Vente", color: "text-red-600 bg-red-50", icon: "out" },
  adjustment: { label: "Ajustement", color: "text-amber-600 bg-amber-50", icon: "out" },
  return: { label: "Retour", color: "text-blue-600 bg-blue-50", icon: "in" },
}

// ═════════════════════════════════════════════════════════════════════
export default function MouvementsPage() {
  const supabase = createClient()

  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<PosProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)

  // Filters
  const [filterMonth, setFilterMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [filterType, setFilterType] = useState("")
  const [filterProduct, setFilterProduct] = useState("")

  // ─── Load Data ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from("pos_stock_movements")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (filterMonth) {
        const [y, m] = filterMonth.split("-")
        const start = `${y}-${m}-01T00:00:00`
        const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate()
        const end = `${y}-${m}-${String(lastDay).padStart(2, "0")}T23:59:59`
        query = query.gte("created_at", start).lte("created_at", end)
      }

      if (filterType) {
        query = query.eq("movement_type", filterType)
      }

      if (filterProduct) {
        query = query.eq("product_id", parseInt(filterProduct))
      }

      const [movRes, prodRes] = await Promise.all([
        query,
        supabase
          .from("pos_products")
          .select("id, name")
          .eq("is_active", true)
          .eq("product_type", "bien")
          .order("name"),
      ])

      if (movRes.error) throw movRes.error
      if (prodRes.error) throw prodRes.error

      setMovements(movRes.data || [])
      setTotalCount(movRes.count || 0)
      setProducts(prodRes.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }, [page, filterMonth, filterType, filterProduct])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setPage(0)
  }, [filterMonth, filterType, filterProduct])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // ─── Stats ─────────────────────────────────────────────────────
  const entriesCount = movements.filter(
    (m) => m.movement_type === "entry" || m.movement_type === "return"
  ).length
  const exitsCount = movements.filter(
    (m) => m.movement_type === "sale" || m.movement_type === "adjustment"
  ).length
  const entriesQty = movements
    .filter((m) => m.movement_type === "entry" || m.movement_type === "return")
    .reduce((sum, m) => sum + m.quantity, 0)
  const exitsQty = movements
    .filter((m) => m.movement_type === "sale" || m.movement_type === "adjustment")
    .reduce((sum, m) => sum + m.quantity, 0)

  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">
            Mouvements de stock
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Historique des entrées et sorties de stock
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950">{totalCount}</p>
              <p className="text-xs text-neutral-500">Mouvements</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">+{entriesQty}</p>
              <p className="text-xs text-neutral-500">
                Entrées ({entriesCount} mvt{entriesCount > 1 ? "s" : ""})
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">-{exitsQty}</p>
              <p className="text-xs text-neutral-500">
                Sorties ({exitsCount} mvt{exitsCount > 1 ? "s" : ""})
              </p>
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
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
        >
          <option value="">Tous les types</option>
          <option value="entry">Entrée</option>
          <option value="sale">Vente</option>
          <option value="adjustment">Ajustement</option>
          <option value="return">Retour</option>
        </select>
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
        >
          <option value="">Tous les produits</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Package className="w-12 h-12 mb-3 stroke-1" />
            <p>Aucun mouvement trouvé</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Par
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {movements.map((movement) => {
                  const meta = movementLabels[movement.movement_type] || {
                    label: movement.movement_type,
                    color: "text-neutral-600 bg-neutral-50",
                    icon: "out" as const,
                  }
                  const isIn = meta.icon === "in"
                  return (
                    <tr
                      key={movement.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(movement.created_at).toLocaleDateString(
                          "fr-FR",
                          { day: "2-digit", month: "2-digit", year: "2-digit" }
                        )}{" "}
                        <span className="text-neutral-400">
                          {new Date(movement.created_at).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
                            meta.color
                          )}
                        >
                          {isIn ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-950">
                        {movement.product_name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isIn ? "text-emerald-600" : "text-red-600"
                          )}
                        >
                          {isIn ? "+" : "-"}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 font-mono">
                        {movement.reference_number || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500 max-w-[200px] truncate">
                        {movement.note || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {movement.created_by}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-neutral-50">
                <p className="text-xs text-neutral-500">
                  Page {page + 1} sur {totalPages} — {totalCount} mouvement
                  {totalCount > 1 ? "s" : ""}
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
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
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
    </div>
  )
}
