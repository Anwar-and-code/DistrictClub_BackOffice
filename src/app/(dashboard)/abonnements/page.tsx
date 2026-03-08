"use client"

import { useEffect, useState, useCallback } from "react"
import {
  RefreshCw, Plus, Search, Edit2, Trash2, X, Users, Eye,
  Calendar, MapPin, Clock, Repeat, Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading"
import type { Abonnement, User, Terrain, TimeSlot } from "@/types/database"
import {
  getAbonnements,
  createAbonnement,
  updateAbonnement,
  deleteAbonnement,
  generateAbonnementReservations,
} from "@/lib/services/abonnements"
import { getTerrains } from "@/lib/services/terrains"
import { getTimeSlots } from "@/lib/services/time-slots"
import { useAuth } from "@/components/providers/auth-provider"

// ─── Constants ────────────────────────────────────────────────────────

const DAY_LABELS = [
  { value: 0, label: "Dimanche", short: "Dim" },
  { value: 1, label: "Lundi", short: "Lun" },
  { value: 2, label: "Mardi", short: "Mar" },
  { value: 3, label: "Mercredi", short: "Mer" },
  { value: 4, label: "Jeudi", short: "Jeu" },
  { value: 5, label: "Vendredi", short: "Ven" },
  { value: 6, label: "Samedi", short: "Sam" },
]

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE:    { label: "Actif",    bg: "bg-emerald-50", color: "text-emerald-700" },
  PAUSED:    { label: "En pause", bg: "bg-amber-50",   color: "text-amber-700" },
  EXPIRED:   { label: "Expiré",   bg: "bg-red-50",     color: "text-red-700" },
  CANCELLED: { label: "Annulé",   bg: "bg-neutral-100", color: "text-neutral-500" },
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
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

// ═════════════════════════════════════════════════════════════════════
export default function AbonnementsPage() {
  const { employee } = useAuth()
  const supabase = createClient()

  // ─── Data state ───────────────────────────────────────────────────
  const [abonnements, setAbonnements] = useState<Abonnement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  // ─── Modal state ──────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [editingAbo, setEditingAbo] = useState<Abonnement | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // ─── Form state ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    user_id: "",
    terrain_id: 0,
    time_slot_id: 0,
    day_of_week: 1,
    start_date: "",
    end_date: "",
    notes: "",
    generate_reservations: true,
  })

  // ─── Player search ────────────────────────────────────────────────
  const [playerSearch, setPlayerSearch] = useState("")
  const [playerResults, setPlayerResults] = useState<User[]>([])
  const [isSearchingPlayers, setIsSearchingPlayers] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null)

  // ─── Detail modal ─────────────────────────────────────────────────
  const [detailAbo, setDetailAbo] = useState<Abonnement | null>(null)

  // ═════════════════════════════════════════════════════════════════
  // LOADERS
  // ═════════════════════════════════════════════════════════════════

  const loadAbonnements = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAbonnements(filterStatus ? { status: filterStatus } : undefined)
      setAbonnements(data)
    } catch {
      toast.error("Erreur lors du chargement des abonnements")
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    const init = async () => {
      try {
        const [t, ts] = await Promise.all([getTerrains(), getTimeSlots()])
        setTerrains(t.filter(x => x.is_active))
        setTimeSlots(ts.filter(x => x.is_active))
      } catch {
        toast.error("Erreur lors du chargement des données")
      }
    }
    init()
  }, [])

  useEffect(() => {
    loadAbonnements()
  }, [loadAbonnements])

  // ─── Player search ────────────────────────────────────────────────
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerSearch])

  // ═════════════════════════════════════════════════════════════════
  // CRUD
  // ═════════════════════════════════════════════════════════════════

  const openCreate = () => {
    setEditingAbo(null)
    setSelectedPlayer(null)
    setPlayerSearch("")
    setPlayerResults([])
    const today = new Date().toISOString().split("T")[0]
    const threeMonthsLater = new Date()
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
    const endDefault = threeMonthsLater.toISOString().split("T")[0]
    setForm({
      user_id: "",
      terrain_id: terrains[0]?.id || 0,
      time_slot_id: timeSlots[0]?.id || 0,
      day_of_week: 1,
      start_date: today,
      end_date: endDefault,
      notes: "",
      generate_reservations: true,
    })
    setShowModal(true)
  }

  const openEdit = (abo: Abonnement) => {
    setEditingAbo(abo)
    setSelectedPlayer(abo.user || null)
    setPlayerSearch("")
    setPlayerResults([])
    setForm({
      user_id: abo.user_id,
      terrain_id: abo.terrain_id,
      time_slot_id: abo.time_slot_id,
      day_of_week: abo.day_of_week,
      start_date: abo.start_date,
      end_date: abo.end_date,
      notes: abo.notes || "",
      generate_reservations: false,
    })
    setShowModal(true)
  }

  const handleSelectPlayer = (user: User) => {
    setSelectedPlayer(user)
    setForm((f) => ({ ...f, user_id: user.id }))
    setPlayerResults([])
    setPlayerSearch("")
  }

  const handleSave = async () => {
    if (!form.user_id) {
      toast.error("Sélectionnez un joueur")
      return
    }
    if (!form.terrain_id) {
      toast.error("Sélectionnez un terrain")
      return
    }
    if (!form.time_slot_id) {
      toast.error("Sélectionnez un créneau")
      return
    }
    if (!form.start_date || !form.end_date) {
      toast.error("Les dates de début et de fin sont requises")
      return
    }
    if (form.end_date < form.start_date) {
      toast.error("La date de fin doit être après la date de début")
      return
    }

    setIsSaving(true)
    try {
      if (editingAbo) {
        await updateAbonnement(editingAbo.id, {
          terrain_id: form.terrain_id,
          time_slot_id: form.time_slot_id,
          day_of_week: form.day_of_week,
          start_date: form.start_date,
          end_date: form.end_date,
          notes: form.notes || null,
        })
        toast.success("Abonnement modifié")
      } else {
        const abo = await createAbonnement({
          user_id: form.user_id,
          terrain_id: form.terrain_id,
          time_slot_id: form.time_slot_id,
          day_of_week: form.day_of_week,
          start_date: form.start_date,
          end_date: form.end_date,
          notes: form.notes || undefined,
          created_by: employee?.full_name || employee?.username || undefined,
        })

        if (form.generate_reservations) {
          const result = await generateAbonnementReservations({
            user_id: form.user_id,
            terrain_id: form.terrain_id,
            time_slot_id: form.time_slot_id,
            day_of_week: form.day_of_week,
            start_date: form.start_date,
            end_date: form.end_date,
          })
          toast.success(
            `Abonnement créé — ${result.created} réservation(s) générée(s)` +
            (result.skipped > 0 ? `, ${result.skipped} créneau(x) déjà occupé(s)` : "")
          )
        } else {
          toast.success("Abonnement créé")
        }
      }
      setShowModal(false)
      loadAbonnements()
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet abonnement ? Les réservations existantes ne seront pas supprimées.")) return
    try {
      await deleteAbonnement(id)
      toast.success("Abonnement supprimé")
      loadAbonnements()
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await updateAbonnement(id, { status })
      toast.success(`Statut mis à jour : ${statusConfig[status]?.label || status}`)
      loadAbonnements()
      if (detailAbo?.id === id) {
        setDetailAbo((prev) => prev ? { ...prev, status: status as Abonnement["status"] } : null)
      }
    } catch {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  // ─── Computed ─────────────────────────────────────────────────────
  const filteredAbonnements = abonnements.filter((abo) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const name = getUserName(abo.user).toLowerCase()
    const terrainCode = abo.terrain?.code?.toLowerCase() || ""
    return name.includes(q) || terrainCode.includes(q)
  })

  const countByStatus = (status: string) =>
    abonnements.filter((a) => a.status === status).length

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Abonnements</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les abonnements récurrents des joueurs
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel abonnement
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: abonnements.length, color: "bg-neutral-50 text-neutral-700" },
          { label: "Actifs", value: countByStatus("ACTIVE"), color: "bg-emerald-50 text-emerald-700" },
          { label: "En pause", value: countByStatus("PAUSED"), color: "bg-amber-50 text-amber-700" },
          { label: "Expirés", value: countByStatus("EXPIRED") + countByStatus("CANCELLED"), color: "bg-red-50 text-red-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher joueur ou terrain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="PAUSED">En pause</option>
          <option value="EXPIRED">Expiré</option>
          <option value="CANCELLED">Annulé</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredAbonnements.length === 0 ? (
          <div className="p-12 text-center">
            <Repeat className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">
              {searchQuery || filterStatus ? "Aucun résultat" : "Aucun abonnement"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Joueur</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Terrain</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Créneau</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Jour</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Période</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredAbonnements.map((abo) => {
                const st = statusConfig[abo.status] || statusConfig.ACTIVE
                const dayLabel = DAY_LABELS.find((d) => d.value === abo.day_of_week)?.label || "—"
                return (
                  <tr key={abo.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {abo.user?.first_name?.charAt(0) || "?"}{abo.user?.last_name?.charAt(0) || ""}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-950">{getUserName(abo.user)}</p>
                          <p className="text-xs text-neutral-500">{abo.user?.phone || abo.user?.email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-neutral-950">{abo.terrain?.code || "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-700">
                        {abo.time_slot?.start_time?.slice(0, 5)} - {abo.time_slot?.end_time?.slice(0, 5)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-neutral-700">{dayLabel}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-neutral-500">
                        {formatDate(abo.start_date)} → {formatDate(abo.end_date)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", st.bg, st.color)}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailAbo(abo)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(abo)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(abo.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ════════ MODAL: Create/Edit Abonnement ════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-neutral-950">
                {editingAbo ? "Modifier l'abonnement" : "Nouvel abonnement"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Player selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  <Users className="h-4 w-4 inline mr-1.5" />
                  Joueur *
                </label>
                {selectedPlayer ? (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {selectedPlayer.first_name?.charAt(0) || "?"}{selectedPlayer.last_name?.charAt(0) || ""}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-950">{getUserName(selectedPlayer)}</p>
                      <p className="text-xs text-neutral-500">{selectedPlayer.phone || selectedPlayer.email}</p>
                    </div>
                    {!editingAbo && (
                      <button
                        onClick={() => {
                          setSelectedPlayer(null)
                          setForm((f) => ({ ...f, user_id: "" }))
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      placeholder="Rechercher par nom, email ou téléphone..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                    {isSearchingPlayers && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 animate-spin" />
                    )}
                    {playerResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {playerResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleSelectPlayer(u)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 text-left"
                          >
                            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
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
                  </div>
                )}
              </div>

              {/* Terrain */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  <MapPin className="h-4 w-4 inline mr-1.5" />
                  Terrain *
                </label>
                <div className="flex flex-wrap gap-2">
                  {terrains.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, terrain_id: t.id }))}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                        form.terrain_id === t.id
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      )}
                    >
                      {t.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  <Clock className="h-4 w-4 inline mr-1.5" />
                  Créneau horaire *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((ts) => (
                      <button
                        key={ts.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, time_slot_id: ts.id }))}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-center",
                          form.time_slot_id === ts.id
                            ? "border-neutral-950 bg-neutral-950 text-white"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        )}
                      >
                        {ts.start_time.slice(0, 5)}
                      </button>
                    ))}
                </div>
              </div>

              {/* Day of week */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  <Repeat className="h-4 w-4 inline mr-1.5" />
                  Jour de la semaine *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, day_of_week: d.value }))}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                        form.day_of_week === d.value
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      )}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    <Calendar className="h-4 w-4 inline mr-1.5" />
                    Date début *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    <Calendar className="h-4 w-4 inline mr-1.5" />
                    Date fin *
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Notes optionnelles..."
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-none"
                />
              </div>

              {/* Generate reservations toggle */}
              {!editingAbo && (
                <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.generate_reservations}
                    onChange={(e) => setForm((f) => ({ ...f, generate_reservations: e.target.checked }))}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Générer les réservations automatiquement</p>
                    <p className="text-xs text-blue-700">
                      Crée les réservations pour chaque {DAY_LABELS.find(d => d.value === form.day_of_week)?.label || "jour"} entre les dates sélectionnées
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingAbo ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL: Detail ════════ */}
      {detailAbo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailAbo(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-950">Détails de l&apos;abonnement</h3>
              <button onClick={() => setDetailAbo(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Player */}
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-neutral-950 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {detailAbo.user?.first_name?.charAt(0) || "?"}{detailAbo.user?.last_name?.charAt(0) || ""}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-neutral-950">{getUserName(detailAbo.user)}</p>
                  <p className="text-sm text-neutral-500">{detailAbo.user?.phone || detailAbo.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-0.5">Terrain</p>
                  <p className="text-sm font-medium text-neutral-950">{detailAbo.terrain?.code || "—"}</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-0.5">Créneau</p>
                  <p className="text-sm font-medium text-neutral-950">
                    {detailAbo.time_slot?.start_time?.slice(0, 5)} - {detailAbo.time_slot?.end_time?.slice(0, 5)}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-0.5">Jour</p>
                  <p className="text-sm font-medium text-neutral-950">
                    {DAY_LABELS.find((d) => d.value === detailAbo.day_of_week)?.label || "—"}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-0.5">Statut</p>
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    statusConfig[detailAbo.status]?.bg,
                    statusConfig[detailAbo.status]?.color
                  )}>
                    {statusConfig[detailAbo.status]?.label || detailAbo.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-500 mb-0.5">Période</p>
                <p className="text-sm font-medium text-neutral-950">
                  {formatDate(detailAbo.start_date)} → {formatDate(detailAbo.end_date)}
                </p>
              </div>

              {detailAbo.notes && (
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-0.5">Notes</p>
                  <p className="text-sm text-neutral-700">{detailAbo.notes}</p>
                </div>
              )}

              {detailAbo.created_by && (
                <p className="text-xs text-neutral-400">Créé par : {detailAbo.created_by}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-6 border-t border-neutral-100">
              {detailAbo.status === "ACTIVE" && (
                <>
                  <button
                    onClick={() => handleChangeStatus(detailAbo.id, "PAUSED")}
                    className="flex-1 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Mettre en pause
                  </button>
                  <button
                    onClick={() => handleChangeStatus(detailAbo.id, "CANCELLED")}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Annuler
                  </button>
                </>
              )}
              {detailAbo.status === "PAUSED" && (
                <button
                  onClick={() => handleChangeStatus(detailAbo.id, "ACTIVE")}
                  className="flex-1 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Réactiver
                </button>
              )}
              {(detailAbo.status === "EXPIRED" || detailAbo.status === "CANCELLED") && (
                <button
                  onClick={() => handleChangeStatus(detailAbo.id, "ACTIVE")}
                  className="flex-1 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Réactiver
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
