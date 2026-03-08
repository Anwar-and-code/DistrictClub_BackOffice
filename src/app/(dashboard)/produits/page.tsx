"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  Archive,
  Coffee,
  Box,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading"

// ─── Types ───────────────────────────────────────────────────────────
interface PosCategory {
  id: number
  name: string
  icon: string | null
  is_active: boolean
}

interface PosProduct {
  id: number
  category_id: number | null
  name: string
  product_type: "bien" | "service"
  purchase_price: number
  selling_price_ht: number
  tax_rate: number
  price_ttc: number
  price: number
  stock_quantity: number | null
  is_active: boolean
  created_at: string
  category?: PosCategory | null
}

// ─── Helpers ─────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR").format(amount) + " F"

const computeTTC = (ht: number, tax: number) =>
  Math.round(ht * (1 + tax / 100))

// ═════════════════════════════════════════════════════════════════════
export default function ProduitsPage() {
  const supabase = createClient()

  const [products, setProducts] = useState<PosProduct[]>([])
  const [categories, setCategories] = useState<PosCategory[]>([])
  const [defaultTaxRate, setDefaultTaxRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Filters & pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterType, setFilterType] = useState<"" | "bien" | "service">("")
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 25

  // Modal
  const [modal, setModal] = useState<{
    type: "create" | "edit"
    product?: PosProduct
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<PosProduct | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    product_type: "service" as "bien" | "service",
    purchase_price: "",
    selling_price_ht: "",
    tax_rate: "",
    stock_quantity: "",
  })

  // Computed TTC from form
  const formTTC = computeTTC(
    parseInt(form.selling_price_ht) || 0,
    parseFloat(form.tax_rate) || 0
  )

  // ─── Load Data ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [prodRes, catRes, settingsRes] = await Promise.all([
        supabase
          .from("pos_products")
          .select("*, category:pos_categories(*)")
          .order("name"),
        supabase
          .from("pos_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("app_settings")
          .select("default_tax_rate")
          .single(),
      ])

      if (prodRes.error) throw prodRes.error
      if (catRes.error) throw catRes.error

      setProducts(prodRes.data || [])
      setCategories(catRes.data || [])
      if (settingsRes.data?.default_tax_rate !== undefined) {
        setDefaultTaxRate(Number(settingsRes.data.default_tax_rate))
      }
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Filtered ────────────────────────────────────────────────────
  const allFiltered = products.filter((p) => {
    if (!p.is_active) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false
    if (filterCategory && p.category_id?.toString() !== filterCategory)
      return false
    if (filterType && p.product_type !== filterType) return false
    return true
  })

  const totalFiltered = allFiltered.length
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)
  const filtered = allFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // ─── Open Modal ──────────────────────────────────────────────────
  const openModal = (type: "create" | "edit", product?: PosProduct) => {
    if (type === "edit" && product) {
      setForm({
        name: product.name,
        category_id: product.category_id?.toString() || "",
        product_type: product.product_type,
        purchase_price: product.purchase_price.toString(),
        selling_price_ht: product.selling_price_ht.toString(),
        tax_rate: product.tax_rate.toString(),
        stock_quantity: product.stock_quantity?.toString() || "",
      })
    } else {
      setForm({
        name: "",
        category_id: "",
        product_type: "service",
        purchase_price: "0",
        selling_price_ht: "",
        tax_rate: defaultTaxRate.toString(),
        stock_quantity: "",
      })
    }
    setModal({ type, product })
  }

  // ─── Save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.selling_price_ht) {
      toast.error("Nom et prix de vente HT sont obligatoires")
      return
    }

    const sellingHT = parseInt(form.selling_price_ht) || 0
    const tax = parseFloat(form.tax_rate) || 0
    const ttc = computeTTC(sellingHT, tax)

    setIsSaving(true)
    try {
      const data = {
        name: form.name,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        product_type: form.product_type,
        purchase_price: parseInt(form.purchase_price) || 0,
        selling_price_ht: sellingHT,
        tax_rate: tax,
        price_ttc: ttc,
        price: ttc,
        stock_quantity:
          form.product_type === "bien" && form.stock_quantity
            ? parseInt(form.stock_quantity)
            : null,
      }

      if (modal?.type === "edit" && modal.product) {
        const { error } = await supabase
          .from("pos_products")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", modal.product.id)
        if (error) throw error
        toast.success("Produit modifié")
      } else {
        const { error } = await supabase.from("pos_products").insert(data)
        if (error) throw error
        toast.success("Produit ajouté")
      }

      setModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Delete (soft: set is_active = false) ────────────────────────
  const handleDelete = async () => {
    if (!deleteModal) return
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("pos_products")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", deleteModal.id)
      if (error) throw error
      toast.success("Produit archivé")
      setDeleteModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
    }
  }

  // Reset page on filter change
  useEffect(() => {
    setPage(0)
  }, [searchQuery, filterCategory, filterType])

  // ─── Stats ───────────────────────────────────────────────────────
  const totalProducts = allFiltered.length
  const bienCount = allFiltered.filter((p) => p.product_type === "bien").length
  const serviceCount = allFiltered.filter((p) => p.product_type === "service").length

  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Produits</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez vos produits, prix et stock
          </p>
        </div>
        <button
          onClick={() => openModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950">{totalProducts}</p>
              <p className="text-xs text-neutral-500">Produits actifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Box className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950">{bienCount}</p>
              <p className="text-xs text-neutral-500">Biens (stock géré)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Coffee className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-950">{serviceCount}</p>
              <p className="text-xs text-neutral-500">Services (sans stock)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as "" | "bien" | "service")
          }
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
        >
          <option value="">Tous les types</option>
          <option value="bien">Bien (stock)</option>
          <option value="service">Service</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Package className="w-12 h-12 mb-3 stroke-1" />
            <p>Aucun produit trouvé</p>
          </div>
        ) : (
          <>
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  P. Achat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  P. Vente HT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  Taxe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  Prix TTC
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((product) => {
                const margin =
                  product.selling_price_ht - product.purchase_price
                const marginPct =
                  product.purchase_price > 0
                    ? Math.round((margin / product.purchase_price) * 100)
                    : 0
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-neutral-950">
                        {product.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full",
                          product.product_type === "bien"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {product.product_type === "bien" ? (
                          <Box className="h-3 w-3" />
                        ) : (
                          <Coffee className="h-3 w-3" />
                        )}
                        {product.product_type === "bien" ? "Bien" : "Service"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 text-right">
                      {formatCurrency(product.purchase_price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 text-right">
                      {formatCurrency(product.selling_price_ht)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 text-right">
                      {Number(product.tax_rate)}%
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-950 text-right">
                      {formatCurrency(product.price_ttc)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {product.product_type === "bien" ? (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            product.stock_quantity !== null &&
                              product.stock_quantity <= 0
                              ? "text-red-600"
                              : product.stock_quantity !== null &&
                                  product.stock_quantity <= 5
                                ? "text-amber-600"
                                : "text-neutral-900"
                          )}
                        >
                          {product.stock_quantity ?? 0}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal("edit", product)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(product)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                  Page {page + 1} sur {totalPages} — {totalFiltered} produit{totalFiltered > 1 ? "s" : ""}
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

      {/* ─── Product Modal ────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                {modal.type === "create"
                  ? "Nouveau produit"
                  : "Modifier le produit"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Ex: Café expresso"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Type de produit *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, product_type: "service", stock_quantity: "" })
                    }
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                      form.product_type === "service"
                        ? "border-amber-500 bg-amber-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    )}
                  >
                    <Coffee
                      className={cn(
                        "h-5 w-5",
                        form.product_type === "service"
                          ? "text-amber-600"
                          : "text-neutral-400"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Service
                      </p>
                      <p className="text-xs text-neutral-500">
                        Sans gestion de stock
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, product_type: "bien" })}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                      form.product_type === "bien"
                        ? "border-blue-500 bg-blue-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    )}
                  >
                    <Box
                      className={cn(
                        "h-5 w-5",
                        form.product_type === "bien"
                          ? "text-blue-600"
                          : "text-neutral-400"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Bien
                      </p>
                      <p className="text-xs text-neutral-500">
                        Stock géré
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Sans catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing section */}
              <div className="border-t border-neutral-200 pt-5">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  Tarification
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Prix d&apos;achat (FCFA)
                    </label>
                    <input
                      type="number"
                      value={form.purchase_price}
                      onChange={(e) =>
                        setForm({ ...form, purchase_price: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Prix de vente HT (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={form.selling_price_ht}
                      onChange={(e) =>
                        setForm({ ...form, selling_price_ht: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Taxe (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.tax_rate}
                      onChange={(e) =>
                        setForm({ ...form, tax_rate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Prix TTC
                    </label>
                    <div className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-900">
                      {formatCurrency(formTTC)}
                    </div>
                  </div>
                </div>

                {/* Margin info */}
                {parseInt(form.purchase_price) > 0 &&
                  parseInt(form.selling_price_ht) > 0 && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-700">
                        <strong>Marge :</strong>{" "}
                        {formatCurrency(
                          (parseInt(form.selling_price_ht) || 0) -
                            (parseInt(form.purchase_price) || 0)
                        )}{" "}
                        (
                        {Math.round(
                          (((parseInt(form.selling_price_ht) || 0) -
                            (parseInt(form.purchase_price) || 0)) /
                            (parseInt(form.purchase_price) || 1)) *
                            100
                        )}
                        %)
                      </p>
                    </div>
                  )}
              </div>

              {/* Stock (only for 'bien') */}
              {form.product_type === "bien" && (
                <div className="border-t border-neutral-200 pt-5">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                    Stock
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Quantité en stock
                    </label>
                    <input
                      type="number"
                      value={form.stock_quantity}
                      onChange={(e) =>
                        setForm({ ...form, stock_quantity: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving
                  ? "Enregistrement..."
                  : modal.type === "create"
                    ? "Ajouter"
                    : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Modal ─────────────────────────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-neutral-950 mb-2">
              Archiver le produit ?
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Le produit &ldquo;{deleteModal.name}&rdquo; sera désactivé et ne
              sera plus visible dans la caisse.
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
                {isDeleting ? "Suppression..." : "Archiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
