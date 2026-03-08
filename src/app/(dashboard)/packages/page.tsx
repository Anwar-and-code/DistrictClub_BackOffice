"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Gift, Plus, Search, Edit2, Trash2, X, Users, Check,
  Eye, Clock, Package as PackageIcon, Loader2
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading"
import type {
  Package as PackageType,
  ClientPackage,
  ClientPackageSession,
  User,
  TimeSlot,
} from "@/types/database"
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getClientPackages,
  assignPackageToUser,
  updateClientPackage,
  getClientPackageSessions,
  cancelPackageSession,
  getPackageTimeSlotIds,
  setPackageTimeSlots,
} from "@/lib/services/packages"
import { getTimeSlots } from "@/lib/services/time-slots"
import { useAuth } from "@/components/providers/auth-provider"

type Tab = "definitions" | "assigned"

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE:    { label: "Actif",    bg: "bg-emerald-50", color: "text-emerald-700" },
  COMPLETED: { label: "Terminé",  bg: "bg-blue-50",    color: "text-blue-700" },
  EXPIRED:   { label: "Expiré",   bg: "bg-red-50",     color: "text-red-700" },
  CANCELLED: { label: "Annulé",   bg: "bg-neutral-100", color: "text-neutral-500" },
}

const paymentLabels: Record<string, string> = {
  cash: "Espèces",
  card: "Carte",
  transfer: "Virement",
  mixed: "Mixte",
}

function formatPrice(amount: number) {
  return amount.toLocaleString("fr-FR") + " F"
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getUserName(user?: User | null) {
  if (!user) return "—"
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
  return user.first_name || user.last_name || user.email || "—"
}

function is1hSlot(slot: TimeSlot) {
  const [sh, sm] = slot.start_time.split(":").map(Number)
  const [eh, em] = slot.end_time.split(":").map(Number)
  return (eh * 60 + em) - (sh * 60 + sm) === 60
}

// ═════════════════════════════════════════════════════════════════════
export default function PackagesPage() {
  const { employee } = useAuth()
  const [tab, setTab] = useState<Tab>("definitions")

  // ─── Package definitions state ───────────────────────────────────
  const [packages, setPackages] = useState<PackageType[]>([])
  const [isLoadingPkgs, setIsLoadingPkgs] = useState(true)
  const [showPkgModal, setShowPkgModal] = useState(false)
  const [editingPkg, setEditingPkg] = useState<PackageType | null>(null)
  const [pkgForm, setPkgForm] = useState({
    name: "",
    description: "",
    total_sessions: 12,
    price: 100000,
    regular_price: 120000,
    is_active: true,
  })
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([])
  // Map packageId -> time_slot_ids for display in cards
  const [pkgSlotMap, setPkgSlotMap] = useState<Record<number, number[]>>({})

  // ─── Client packages state ──────────────────────────────────────
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([])
  const [isLoadingCP, setIsLoadingCP] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({
    package_id: 0,
    user_id: "",
    paid_amount: 0,
    payment_method: "cash",
    notes: "",
  })
  const [searchQuery, setSearchQuery] = useState("")

  // ─── Player search ──────────────────────────────────────────────
  const [playerSearch, setPlayerSearch] = useState("")
  const [playerResults, setPlayerResults] = useState<User[]>([])
  const [isSearchingPlayers, setIsSearchingPlayers] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null)

  // ─── Detail modal ───────────────────────────────────────────────
  const [detailCP, setDetailCP] = useState<ClientPackage | null>(null)
  const [sessions, setSessions] = useState<ClientPackageSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const supabase = createClient()

  // Only 1h slots are eligible for packages
  const eligibleSlots = allTimeSlots.filter(is1hSlot)

  // ═════════════════════════════════════════════════════════════════
  // LOADERS
  // ═════════════════════════════════════════════════════════════════

  const loadPackages = useCallback(async () => {
    setIsLoadingPkgs(true)
    try {
      const data = await getPackages()
      setPackages(data)
      // Load time slot associations for all packages
      const map: Record<number, number[]> = {}
      await Promise.all(
        data.map(async (pkg) => {
          map[pkg.id] = await getPackageTimeSlotIds(pkg.id)
        })
      )
      setPkgSlotMap(map)
    } catch {
      toast.error("Erreur lors du chargement des packages")
    } finally {
      setIsLoadingPkgs(false)
    }
  }, [])

  const loadClientPackages = useCallback(async () => {
    setIsLoadingCP(true)
    try {
      const data = await getClientPackages()
      setClientPackages(data)
    } catch {
      toast.error("Erreur lors du chargement des attributions")
    } finally {
      setIsLoadingCP(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const slots = await getTimeSlots()
      setAllTimeSlots(slots.filter(s => s.is_active))
    }
    init()
    loadPackages()
    loadClientPackages()
  }, [loadPackages, loadClientPackages])

  // ─── Player search ──────────────────────────────────────────────
  useEffect(() => {
    if (playerSearch.trim().length < 2) {
      setPlayerResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setIsSearchingPlayers(true)
      try {
        const q = playerSearch.trim()
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "JOUEUR")
          .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
          .limit(10)
        setPlayerResults((data || []) as User[])
      } catch {
        // silent
      } finally {
        setIsSearchingPlayers(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [playerSearch])

  // ═════════════════════════════════════════════════════════════════
  // PACKAGE CRUD
  // ═════════════════════════════════════════════════════════════════

  const openCreatePkg = () => {
    setEditingPkg(null)
    setPkgForm({
      name: "",
      description: "",
      total_sessions: 12,
      price: 100000,
      regular_price: 120000,
      is_active: true,
    })
    // Pre-select all 1h slots by default
    setSelectedSlotIds(eligibleSlots.map(s => s.id))
    setShowPkgModal(true)
  }

  const openEditPkg = async (pkg: PackageType) => {
    setEditingPkg(pkg)
    setPkgForm({
      name: pkg.name,
      description: pkg.description || "",
      total_sessions: pkg.total_sessions,
      price: pkg.price,
      regular_price: pkg.regular_price,
      is_active: pkg.is_active,
    })
    // Load existing time slot associations
    const ids = pkgSlotMap[pkg.id] || []
    setSelectedSlotIds(ids)
    setShowPkgModal(true)
  }

  const toggleSlotId = (id: number) => {
    setSelectedSlotIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSavePkg = async () => {
    if (!pkgForm.name.trim()) {
      toast.error("Le nom est requis")
      return
    }
    if (selectedSlotIds.length === 0) {
      toast.error("Sélectionnez au moins un créneau")
      return
    }
    try {
      if (editingPkg) {
        await updatePackage(editingPkg.id, pkgForm)
        await setPackageTimeSlots(editingPkg.id, selectedSlotIds)
        toast.success("Package modifié")
      } else {
        const created = await createPackage(pkgForm)
        await setPackageTimeSlots(created.id, selectedSlotIds)
        toast.success("Package créé")
      }
      setShowPkgModal(false)
      loadPackages()
    } catch {
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const handleDeletePkg = async (id: number) => {
    if (!confirm("Supprimer ce package ?")) return
    try {
      await deletePackage(id)
      toast.success("Package supprimé")
      loadPackages()
    } catch {
      toast.error("Impossible de supprimer (peut-être attribué à des joueurs)")
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // ASSIGN PACKAGE
  // ═════════════════════════════════════════════════════════════════

  const openAssignModal = () => {
    setAssignForm({
      package_id: packages.find((p) => p.is_active)?.id || 0,
      user_id: "",
      paid_amount: 0,
      payment_method: "cash",
      notes: "",
    })
    setSelectedPlayer(null)
    setPlayerSearch("")
    setPlayerResults([])
    setShowAssignModal(true)
  }

  const handleSelectPlayer = (user: User) => {
    setSelectedPlayer(user)
    setAssignForm((f) => ({ ...f, user_id: user.id }))
    setPlayerResults([])
    setPlayerSearch("")
  }

  const handleAssign = async () => {
    if (!assignForm.package_id) {
      toast.error("Sélectionnez un package")
      return
    }
    if (!assignForm.user_id) {
      toast.error("Sélectionnez un joueur")
      return
    }
    try {
      const pkg = packages.find((p) => p.id === assignForm.package_id)
      await assignPackageToUser({
        package_id: assignForm.package_id,
        user_id: assignForm.user_id,
        sessions_total: pkg?.total_sessions || 0,
        paid_amount: assignForm.paid_amount,
        payment_method: assignForm.payment_method,
        notes: assignForm.notes || undefined,
        assigned_by: employee?.full_name || employee?.username || undefined,
      })
      toast.success("Package attribué avec succès")
      setShowAssignModal(false)
      loadClientPackages()
    } catch {
      toast.error("Erreur lors de l'attribution")
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // DETAIL / SESSIONS
  // ═════════════════════════════════════════════════════════════════

  const openDetail = async (cp: ClientPackage) => {
    setDetailCP(cp)
    setIsLoadingSessions(true)
    try {
      const data = await getClientPackageSessions(cp.id)
      setSessions(data)
    } catch {
      toast.error("Erreur chargement séances")
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleCancelCP = async (id: number) => {
    if (!confirm("Annuler ce package attribué ?")) return
    try {
      await updateClientPackage(id, { status: "CANCELLED" } as Partial<ClientPackage>)
      toast.success("Package annulé")
      setDetailCP(null)
      loadClientPackages()
    } catch {
      toast.error("Erreur lors de l'annulation")
    }
  }

  const handleCancelSession = async (sessionId: number) => {
    if (!confirm("Annuler cette séance ?")) return
    try {
      await cancelPackageSession(sessionId)
      toast.success("Séance annulée")
      if (detailCP) {
        const data = await getClientPackageSessions(detailCP.id)
        setSessions(data)
        loadClientPackages()
        const updated = await getClientPackages()
        const refreshed = updated.find((cp) => cp.id === detailCP.id)
        if (refreshed) setDetailCP(refreshed)
      }
    } catch {
      toast.error("Erreur lors de l'annulation")
    }
  }

  // ─── Filter client packages ─────────────────────────────────────
  const filteredCP = clientPackages.filter((cp) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const name = getUserName(cp.user).toLowerCase()
    const pkgName = cp.package?.name?.toLowerCase() || ""
    return name.includes(q) || pkgName.includes(q)
  })

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Packages</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les packages et attributions aux joueurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "definitions" && (
            <button
              onClick={openCreatePkg}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouveau package
            </button>
          )}
          {tab === "assigned" && (
            <button
              onClick={openAssignModal}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Attribuer un package
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-neutral-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("definitions")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            tab === "definitions"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <Gift className="h-4 w-4 inline mr-2" />
          Packages ({packages.length})
        </button>
        <button
          onClick={() => setTab("assigned")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            tab === "assigned"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Attributions ({clientPackages.length})
        </button>
      </div>

      {/* ════════ TAB: DEFINITIONS ════════ */}
      {tab === "definitions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingPkgs ? (
            <CardSkeleton count={3} />
          ) : packages.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Gift className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">Aucun package défini</p>
              <button
                onClick={openCreatePkg}
                className="mt-4 text-sm text-neutral-950 font-medium hover:underline"
              >
                Créer un package
              </button>
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "bg-white rounded-xl border border-neutral-200 p-6 relative group",
                  !pkg.is_active && "opacity-60"
                )}
              >
                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditPkg(pkg)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePkg(pkg.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Gift className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-950">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-xs text-neutral-500 mt-0.5">{pkg.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Séances</span>
                    <span className="font-medium text-neutral-950">{pkg.total_sessions} x 1h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Prix package</span>
                    <span className="font-bold text-emerald-600">{formatPrice(pkg.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Prix normal</span>
                    <span className="text-neutral-400 line-through">{formatPrice(pkg.regular_price)}</span>
                  </div>
                  {pkgSlotMap[pkg.id]?.length > 0 && (
                    <div className="pt-1">
                      <span className="text-xs text-neutral-500">Créneaux : </span>
                      <span className="text-xs font-medium text-neutral-700">
                        {pkgSlotMap[pkg.id]
                          .map(tsId => allTimeSlots.find(s => s.id === tsId))
                          .filter(Boolean)
                          .sort((a, b) => a!.start_time.localeCompare(b!.start_time))
                          .map(s => s!.start_time.slice(0, 5))
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {pkg.regular_price > pkg.price && (
                  <div className="mt-4 px-3 py-2 bg-emerald-50 rounded-lg text-center">
                    <span className="text-xs font-medium text-emerald-700">
                      Économie : {formatPrice(pkg.regular_price - pkg.price)} ({Math.round((1 - pkg.price / pkg.regular_price) * 100)}%)
                    </span>
                  </div>
                )}

                {!pkg.is_active && (
                  <div className="mt-3 text-center">
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                      Inactif
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ════════ TAB: ASSIGNED ════════ */}
      {tab === "assigned" && (
        <>
          {/* Search */}
          <div className="mb-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher joueur ou package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 w-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {isLoadingCP ? (
              <TableSkeleton rows={5} cols={6} />
            ) : filteredCP.length === 0 ? (
              <div className="p-12 text-center">
                <PackageIcon className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">
                  {searchQuery ? "Aucun résultat" : "Aucun package attribué"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Joueur</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Package</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Progression</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Paiement</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Statut</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredCP.map((cp) => {
                    const st = statusConfig[cp.status] || statusConfig.ACTIVE
                    const pct = cp.sessions_total > 0
                      ? Math.round((cp.sessions_used / cp.sessions_total) * 100)
                      : 0
                    return (
                      <tr key={cp.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {cp.user?.first_name?.charAt(0) || "?"}{cp.user?.last_name?.charAt(0) || ""}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-950">{getUserName(cp.user)}</p>
                              <p className="text-xs text-neutral-500">{cp.user?.phone || cp.user?.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-neutral-950">{cp.package?.name || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  pct >= 100 ? "bg-blue-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-neutral-500 whitespace-nowrap">
                              {cp.sessions_used}/{cp.sessions_total}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-600">{formatPrice(cp.paid_amount)}</span>
                          {cp.payment_method && (
                            <span className="text-xs text-neutral-400 ml-1">
                              ({paymentLabels[cp.payment_method] || cp.payment_method})
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", st.bg, st.color)}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-500">{formatDate(cp.created_at)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => openDetail(cp)}
                            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ════════ MODAL: Create/Edit Package ════════ */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPkgModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-950">
                {editingPkg ? "Modifier le package" : "Nouveau package"}
              </h3>
              <button onClick={() => setShowPkgModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Pack 12 séances"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  value={pkgForm.description}
                  onChange={(e) => setPkgForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="12 séances d'1 heure"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre de séances (1h / séance) *</label>
                <input
                  type="number"
                  value={pkgForm.total_sessions}
                  onChange={(e) => setPkgForm((f) => ({ ...f, total_sessions: parseInt(e.target.value) || 0 }))}
                  min={1}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Créneaux éligibles *</label>
                <div className="flex flex-wrap gap-2">
                  {eligibleSlots
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((slot) => {
                      const selected = selectedSlotIds.includes(slot.id)
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleSlotId(slot.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                            selected
                              ? "border-neutral-950 bg-neutral-950 text-white"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                          )}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {slot.start_time.slice(0, 5)}
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </button>
                      )
                    })}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSlotIds(eligibleSlots.map(s => s.id))}
                    className="text-xs text-neutral-500 hover:text-neutral-700 underline"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSlotIds([])}
                    className="text-xs text-neutral-500 hover:text-neutral-700 underline"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Prix package (F) *</label>
                  <input
                    type="number"
                    value={pkgForm.price}
                    onChange={(e) => setPkgForm((f) => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                    min={0}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Prix normal (F)</label>
                  <input
                    type="number"
                    value={pkgForm.regular_price}
                    onChange={(e) => setPkgForm((f) => ({ ...f, regular_price: parseInt(e.target.value) || 0 }))}
                    min={0}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pkgForm.is_active}
                  onChange={(e) => setPkgForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-700">Actif</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-neutral-100">
              <button
                onClick={() => setShowPkgModal(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePkg}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {editingPkg ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL: Assign Package ════════ */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAssignModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-950">Attribuer un package</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Package selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Package *</label>
                <select
                  value={assignForm.package_id}
                  onChange={(e) => {
                    const pkgId = parseInt(e.target.value)
                    const pkg = packages.find((p) => p.id === pkgId)
                    setAssignForm((f) => ({
                      ...f,
                      package_id: pkgId,
                      paid_amount: pkg?.price || 0,
                    }))
                  }}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                >
                  <option value={0} disabled>Sélectionner un package</option>
                  {packages.filter((p) => p.is_active).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.total_sessions} séances — {formatPrice(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player search */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Joueur *</label>
                {selectedPlayer ? (
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-neutral-950 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {selectedPlayer.first_name?.charAt(0) || "?"}{selectedPlayer.last_name?.charAt(0) || ""}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-950">{getUserName(selectedPlayer)}</p>
                        <p className="text-xs text-neutral-500">{selectedPlayer.phone || selectedPlayer.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlayer(null)
                        setAssignForm((f) => ({ ...f, user_id: "" }))
                      }}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      placeholder="Rechercher par nom, email, téléphone..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                    {playerResults.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {playerResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleSelectPlayer(u)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 text-left transition-colors"
                          >
                            <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-neutral-600">
                                {u.first_name?.charAt(0) || "?"}{u.last_name?.charAt(0) || ""}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-950">{getUserName(u)}</p>
                              <p className="text-xs text-neutral-500">{u.phone || u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {isSearchingPlayers && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg p-3 text-center">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400 mx-auto" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Montant payé (F)</label>
                  <input
                    type="number"
                    value={assignForm.paid_amount}
                    onChange={(e) => setAssignForm((f) => ({ ...f, paid_amount: parseInt(e.target.value) || 0 }))}
                    min={0}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Mode de paiement</label>
                  <select
                    value={assignForm.payment_method}
                    onChange={(e) => setAssignForm((f) => ({ ...f, payment_method: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  >
                    <option value="cash">Espèces</option>
                    <option value="card">Carte</option>
                    <option value="transfer">Virement</option>
                    <option value="mixed">Mixte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes optionnelles..."
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-neutral-100">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssign}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Attribuer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL: Detail (sessions) ════════ */}
      {detailCP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailCP(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 bg-neutral-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                    <span className="text-neutral-950 text-lg font-semibold">
                      {detailCP.user?.first_name?.charAt(0) || "?"}{detailCP.user?.last_name?.charAt(0) || ""}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{getUserName(detailCP.user)}</h3>
                    <p className="text-sm text-neutral-400">{detailCP.package?.name}</p>
                  </div>
                </div>
                <button onClick={() => setDetailCP(null)} className="text-neutral-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-950">Progression</span>
                  <span className="text-sm text-neutral-500">
                    {detailCP.sessions_used} / {detailCP.sessions_total} séances
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      detailCP.sessions_used >= detailCP.sessions_total ? "bg-blue-500" : "bg-emerald-500"
                    )}
                    style={{
                      width: `${Math.min(Math.round((detailCP.sessions_used / detailCP.sessions_total) * 100), 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Statut</p>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1",
                    statusConfig[detailCP.status]?.bg,
                    statusConfig[detailCP.status]?.color
                  )}>
                    {statusConfig[detailCP.status]?.label}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Paiement</p>
                  <p className="text-sm font-medium text-neutral-950 mt-1">{formatPrice(detailCP.paid_amount)}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Attribué le</p>
                  <p className="text-sm font-medium text-neutral-950 mt-1">{formatDate(detailCP.created_at)}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Par</p>
                  <p className="text-sm font-medium text-neutral-950 mt-1">{detailCP.assigned_by || "—"}</p>
                </div>
              </div>

              {/* Actions */}
              {detailCP.status === "ACTIVE" && (
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-xs text-neutral-500">
                    Les séances sont attribuées depuis la page Réservations après avoir réservé un créneau.
                  </p>
                  <button
                    onClick={() => handleCancelCP(detailCP.id)}
                    className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Annuler le package
                  </button>
                </div>
              )}

              {/* Sessions list */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-950 mb-3">Séances</h4>
                {isLoadingSessions ? (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    <p className="text-xs text-neutral-500">Chargement des séances...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">Aucune séance enregistrée</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          s.status === "CANCELLED"
                            ? "border-neutral-100 bg-neutral-50 opacity-60"
                            : "border-neutral-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center",
                            s.status === "CANCELLED" ? "bg-neutral-200" : "bg-emerald-50"
                          )}>
                            {s.status === "CANCELLED" ? (
                              <X className="h-4 w-4 text-neutral-400" />
                            ) : (
                              <Check className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-950">
                              {formatDate(s.session_date)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {s.terrain?.code && `${s.terrain.code} · `}
                              {s.time_slot?.start_time?.slice(0, 5)} - {s.time_slot?.end_time?.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                        {s.status === "USED" && detailCP.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancelSession(s.id)}
                            className="text-xs text-neutral-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Annuler
                          </button>
                        )}
                        {s.status === "CANCELLED" && (
                          <span className="text-xs text-neutral-400">Annulée</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
