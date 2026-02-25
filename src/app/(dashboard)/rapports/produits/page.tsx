"use client"

import { useEffect, useState, useMemo } from "react"
import {
  PackageSearch,
  Download,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Types ──────────────────────────────────────────────────────────
interface PosProduct {
  id: number
  name: string
  category_id: number | null
  product_type: "bien" | "service"
  price_ttc: number
  purchase_price: number
  stock_quantity: number | null
  is_active: boolean
}

interface PosCategory {
  id: number
  name: string
  display_order: number
}

interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

interface PosOrder {
  id: number
  status: string
  created_at: string
  employee_name: string
}

interface ProductSales {
  productId: number
  productName: string
  productType: "bien" | "service"
  categoryName: string
  quantitySold: number
  totalRevenue: number
  totalCost: number
  margin: number
  marginPercent: number
  currentStock: number | null
}

interface CategorySales {
  categoryName: string
  productCount: number
  quantitySold: number
  totalRevenue: number
  totalCost: number
  margin: number
}

// ─── Helpers ────────────────────────────────────────────────────────
const formatCurrency = (v: number) => v.toLocaleString("fr-FR") + " F"

// ─── Page ───────────────────────────────────────────────────────────
export default function RapportProduitsPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<PosProduct[]>([])
  const [categories, setCategories] = useState<PosCategory[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orders, setOrders] = useState<PosOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split("T")[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0])
  const [searchProduct, setSearchProduct] = useState("")
  const [sortBy, setSortBy] = useState<"revenue" | "quantity" | "margin">("revenue")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  // ─── Load data ─────────────────────────────────────────────────
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [prodRes, catRes, ordRes] = await Promise.all([
        supabase.from("pos_products").select("*").order("name"),
        supabase.from("pos_categories").select("*").order("display_order"),
        supabase
          .from("pos_orders")
          .select("id, status, created_at, employee_name")
          .eq("status", "completed")
          .gte("created_at", `${dateFrom}T00:00:00`)
          .lte("created_at", `${dateTo}T23:59:59`),
      ])

      if (prodRes.error) throw prodRes.error
      if (catRes.error) throw catRes.error
      if (ordRes.error) throw ordRes.error

      setProducts(prodRes.data || [])
      setCategories(catRes.data || [])
      setOrders(ordRes.data || [])

      // Load order items for completed orders
      const orderIds = (ordRes.data || []).map((o: PosOrder) => o.id)
      if (orderIds.length > 0) {
        // Batch load in chunks of 200
        const allItems: OrderItem[] = []
        for (let i = 0; i < orderIds.length; i += 200) {
          const chunk = orderIds.slice(i, i + 200)
          const { data: items, error } = await supabase
            .from("pos_order_items")
            .select("*")
            .in("order_id", chunk)
          if (error) throw error
          allItems.push(...(items || []))
        }
        setOrderItems(allItems)
      } else {
        setOrderItems([])
      }
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

  // ─── Computed: product sales ──────────────────────────────────
  const productSales: ProductSales[] = useMemo(() => {
    const catMap = new Map(categories.map((c) => [c.id, c.name]))
    const prodMap = new Map(products.map((p) => [p.id, p]))

    // Aggregate by product
    const salesMap = new Map<number, { quantity: number; revenue: number }>()
    for (const item of orderItems) {
      const existing = salesMap.get(item.product_id)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.total
      } else {
        salesMap.set(item.product_id, {
          quantity: item.quantity,
          revenue: item.total,
        })
      }
    }

    // Build product sales array
    const result: ProductSales[] = []
    for (const [productId, data] of salesMap) {
      const prod = prodMap.get(productId)
      const productName = prod?.name || orderItems.find((i) => i.product_id === productId)?.product_name || "Produit inconnu"
      const categoryName = prod?.category_id ? catMap.get(prod.category_id) || "Sans catégorie" : "Sans catégorie"
      const totalCost = (prod?.purchase_price || 0) * data.quantity
      const margin = data.revenue - totalCost
      const marginPercent = data.revenue > 0 ? (margin / data.revenue) * 100 : 0

      result.push({
        productId,
        productName,
        productType: prod?.product_type || "bien",
        categoryName,
        quantitySold: data.quantity,
        totalRevenue: data.revenue,
        totalCost,
        margin,
        marginPercent,
        currentStock: prod?.stock_quantity ?? null,
      })
    }

    // Filter
    let filtered = result
    if (searchProduct) {
      const q = searchProduct.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0
      if (sortBy === "revenue") cmp = a.totalRevenue - b.totalRevenue
      else if (sortBy === "quantity") cmp = a.quantitySold - b.quantitySold
      else cmp = a.margin - b.margin
      return sortDir === "desc" ? -cmp : cmp
    })

    return filtered
  }, [orderItems, products, categories, searchProduct, sortBy, sortDir])

  // ─── Computed: category sales ─────────────────────────────────
  const categorySales: CategorySales[] = useMemo(() => {
    const map = new Map<string, CategorySales>()
    for (const p of productSales) {
      const existing = map.get(p.categoryName)
      if (existing) {
        existing.productCount++
        existing.quantitySold += p.quantitySold
        existing.totalRevenue += p.totalRevenue
        existing.totalCost += p.totalCost
        existing.margin += p.margin
      } else {
        map.set(p.categoryName, {
          categoryName: p.categoryName,
          productCount: 1,
          quantitySold: p.quantitySold,
          totalRevenue: p.totalRevenue,
          totalCost: p.totalCost,
          margin: p.margin,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [productSales])

  // ─── KPIs ─────────────────────────────────────────────────────
  const totalRevenue = useMemo(
    () => productSales.reduce((s, p) => s + p.totalRevenue, 0),
    [productSales]
  )
  const totalQuantity = useMemo(
    () => productSales.reduce((s, p) => s + p.quantitySold, 0),
    [productSales]
  )
  const totalMargin = useMemo(
    () => productSales.reduce((s, p) => s + p.margin, 0),
    [productSales]
  )
  const topProduct = useMemo(
    () =>
      productSales.length > 0
        ? [...productSales].sort((a, b) => b.totalRevenue - a.totalRevenue)[0]
        : null,
    [productSales]
  )

  // ─── Sort toggle ──────────────────────────────────────────────
  const handleSort = (col: "revenue" | "quantity" | "margin") => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else {
      setSortBy(col)
      setSortDir("desc")
    }
  }

  const SortIcon = ({ col }: { col: "revenue" | "quantity" | "margin" }) => {
    if (sortBy !== col) return <ChevronDown className="h-3 w-3 text-neutral-300" />
    return sortDir === "desc" ? (
      <ChevronDown className="h-3 w-3 text-neutral-950" />
    ) : (
      <ChevronUp className="h-3 w-3 text-neutral-950" />
    )
  }

  // ─── Export CSV ───────────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      "Produit",
      "Type",
      "Catégorie",
      "Qté vendue",
      "CA",
      "Coût",
      "Marge",
      "Marge %",
      "Stock actuel",
    ]
    const rows = productSales.map((p) => [
      p.productName,
      p.productType === "bien" ? "Bien" : "Service",
      p.categoryName,
      p.quantitySold,
      p.totalRevenue,
      p.totalCost,
      p.margin,
      p.marginPercent.toFixed(1) + "%",
      p.currentStock ?? "N/A",
    ])

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `rapport_produits_${dateFrom}_${dateTo}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Export téléchargé")
  }

  // ─── Revenue bar helper ───────────────────────────────────────
  const maxRevenue = useMemo(
    () => Math.max(...productSales.map((p) => p.totalRevenue), 1),
    [productSales]
  )

  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">
            Rapport Produits
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Analyse des ventes produits et marges
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={isLoading || productSales.length === 0}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <p className="text-xs text-neutral-500 mb-1">CA Produits</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <ShoppingCart className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <p className="text-xs text-neutral-500 mb-1">Articles vendus</p>
              <p className="text-2xl font-semibold text-neutral-950">
                {totalQuantity}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center mb-3",
                  totalMargin >= 0 ? "bg-emerald-50" : "bg-red-50"
                )}
              >
                {totalMargin >= 0 ? (
                  <ArrowUpRight className="h-4.5 w-4.5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-4.5 w-4.5 text-red-600" />
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-1">Marge totale</p>
              <p
                className={cn(
                  "text-2xl font-semibold",
                  totalMargin >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {formatCurrency(totalMargin)}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
                <Package className="h-4.5 w-4.5 text-violet-600" />
              </div>
              <p className="text-xs text-neutral-500 mb-1">Top produit</p>
              <p className="text-lg font-semibold text-neutral-950 truncate">
                {topProduct?.productName || "—"}
              </p>
              {topProduct && (
                <p className="text-xs text-neutral-500">
                  {topProduct.quantitySold} vendus ·{" "}
                  {formatCurrency(topProduct.totalRevenue)}
                </p>
              )}
            </div>
          </div>

          {/* Tabs: By product / By category */}
          <Tabs defaultValue="products" className="space-y-4">
            <TabsList className="bg-neutral-100 p-1 rounded-lg">
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium rounded-md"
              >
                Par produit
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium rounded-md"
              >
                Par catégorie
              </TabsTrigger>
            </TabsList>

            {/* Products tab */}
            <TabsContent value="products" className="space-y-4">
              {/* Search & sort */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
                  <Search className="h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit ou catégorie..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="text-sm text-neutral-700 bg-transparent outline-none flex-1"
                  />
                </div>
              </div>

              {productSales.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <PackageSearch className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm">Aucune vente sur cette période</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    <div className="col-span-4">Produit</div>
                    <div className="col-span-1 text-center">Type</div>
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => handleSort("quantity")}
                        className="flex items-center gap-1 mx-auto hover:text-neutral-700"
                      >
                        Qté <SortIcon col="quantity" />
                      </button>
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleSort("revenue")}
                        className="flex items-center gap-1 ml-auto hover:text-neutral-700"
                      >
                        CA <SortIcon col="revenue" />
                      </button>
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleSort("margin")}
                        className="flex items-center gap-1 ml-auto hover:text-neutral-700"
                      >
                        Marge <SortIcon col="margin" />
                      </button>
                    </div>
                    <div className="col-span-1 text-center">Stock</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Table rows */}
                  <div className="divide-y divide-neutral-100">
                    {productSales.map((p, idx) => (
                      <div
                        key={p.productId}
                        className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-neutral-50 transition-colors"
                      >
                        <div className="col-span-4">
                          <p className="text-sm font-medium text-neutral-950 truncate">
                            {p.productName}
                          </p>
                          <p className="text-xs text-neutral-400">{p.categoryName}</p>
                        </div>
                        <div className="col-span-1 text-center">
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              p.productType === "bien"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-violet-50 text-violet-700"
                            )}
                          >
                            {p.productType === "bien" ? "Bien" : "Service"}
                          </span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-sm font-medium text-neutral-950">
                            {p.quantitySold}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-medium text-neutral-950">
                            {formatCurrency(p.totalRevenue)}
                          </p>
                          {/* Mini bar */}
                          <div className="h-1 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${(p.totalRevenue / maxRevenue) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              p.margin >= 0 ? "text-emerald-600" : "text-red-600"
                            )}
                          >
                            {formatCurrency(p.margin)}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {p.marginPercent.toFixed(1)}%
                          </p>
                        </div>
                        <div className="col-span-1 text-center">
                          {p.currentStock !== null ? (
                            <span
                              className={cn(
                                "text-sm font-medium",
                                p.currentStock <= 0
                                  ? "text-red-600"
                                  : p.currentStock < 5
                                  ? "text-amber-600"
                                  : "text-neutral-950"
                              )}
                            >
                              {p.currentStock}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </div>
                        <div className="col-span-1 text-center text-xs text-neutral-400">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer total */}
                  <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-neutral-50 border-t border-neutral-200 text-sm font-semibold">
                    <div className="col-span-4 text-neutral-700">
                      Total ({productSales.length} produit
                      {productSales.length > 1 ? "s" : ""})
                    </div>
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center text-neutral-950">
                      {totalQuantity}
                    </div>
                    <div className="col-span-2 text-right text-emerald-600">
                      {formatCurrency(totalRevenue)}
                    </div>
                    <div
                      className={cn(
                        "col-span-2 text-right",
                        totalMargin >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {formatCurrency(totalMargin)}
                    </div>
                    <div className="col-span-1"></div>
                    <div className="col-span-1"></div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Categories tab */}
            <TabsContent value="categories" className="space-y-4">
              {categorySales.length === 0 ? (
                <div className="text-center py-16 text-neutral-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm">Aucune vente sur cette période</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySales.map((c) => {
                    const maxCatRevenue = categorySales[0]?.totalRevenue || 1
                    const marginPercent =
                      c.totalRevenue > 0
                        ? (c.margin / c.totalRevenue) * 100
                        : 0

                    return (
                      <div
                        key={c.categoryName}
                        className="bg-white rounded-xl border border-neutral-200 p-5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-950">
                              {c.categoryName}
                            </h3>
                            <p className="text-xs text-neutral-500">
                              {c.productCount} produit
                              {c.productCount > 1 ? "s" : ""} · {c.quantitySold}{" "}
                              vendu{c.quantitySold > 1 ? "s" : ""}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-emerald-600">
                            {formatCurrency(c.totalRevenue)}
                          </p>
                        </div>

                        {/* Revenue bar */}
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-neutral-950 rounded-full transition-all"
                            style={{
                              width: `${(c.totalRevenue / maxCatRevenue) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                              Coût
                            </p>
                            <p className="text-sm font-medium text-neutral-700">
                              {formatCurrency(c.totalCost)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                              Marge
                            </p>
                            <p
                              className={cn(
                                "text-sm font-medium",
                                c.margin >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              )}
                            >
                              {formatCurrency(c.margin)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                              Marge %
                            </p>
                            <p
                              className={cn(
                                "text-sm font-medium",
                                marginPercent >= 30
                                  ? "text-emerald-600"
                                  : marginPercent >= 10
                                  ? "text-amber-600"
                                  : "text-red-600"
                              )}
                            >
                              {marginPercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
