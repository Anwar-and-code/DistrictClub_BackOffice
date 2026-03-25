"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Search, Eye, X, Calendar, Phone, Mail, Trophy, ChevronLeft, ChevronRight, Loader2, Plus, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { User, Reservation } from "@/types/database"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading"

const PAGE_SIZE = 25

const statusConfig = {
  CONFIRMED: { label: "Confirmé", bg: "bg-emerald-50", color: "text-emerald-700" },
  PENDING: { label: "En attente", bg: "bg-amber-50", color: "text-amber-700" },
  CANCELED: { label: "Annulé", bg: "bg-neutral-100", color: "text-neutral-500" },
  EXPIRED: { label: "Expiré", bg: "bg-red-50", color: "text-red-700" },
}

export default function JoueursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userReservations, setUserReservations] = useState<Reservation[]>([])
  const [userStats, setUserStats] = useState<{ total: number; confirmed: number } | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [createForm, setCreateForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "" as "" | "M" | "F",
    birth_date: "",
  })
  const supabase = createClient()

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const loadUsers = useCallback(async (page: number, search: string) => {
    setIsLoading(true)
    try {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'JOUEUR')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search.trim()) {
        const q = search.trim()
        query = query.or(
          `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
        )
      }

      const { data, error, count } = await query

      if (error) throw error
      setUsers(data || [])
      setTotalCount(count ?? 0)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement des joueurs")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers(currentPage, searchQuery)
  }, [currentPage, loadUsers])

  useEffect(() => {
    setCurrentPage(1)
    loadUsers(1, searchQuery)
  }, [searchQuery])

  const handleViewUser = async (user: User) => {
    setSelectedUser(user)
    setIsLoadingDetails(true)
    try {
      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          *,
          terrain:terrains(code),
          time_slot:time_slots(start_time, end_time, price)
        `)
        .eq('user_id', user.id)
        .order('reservation_date', { ascending: false })
        .limit(10)
      
      setUserReservations(reservations || [])
      setUserStats({
        total: reservations?.length || 0,
        confirmed: reservations?.filter(r => r.status === 'CONFIRMED').length || 0,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const openCreateModal = () => {
    setCreateForm({ first_name: "", last_name: "", email: "", phone: "", gender: "", birth_date: "" })
    setShowCreateModal(true)
  }

  const handleCreatePlayer = async () => {
    if (!createForm.first_name.trim() || !createForm.last_name.trim()) {
      toast.error("Le prénom et le nom sont requis")
      return
    }
    if (!createForm.email.trim()) {
      toast.error("L'email est requis")
      return
    }
    if (!createForm.phone.trim()) {
      toast.error("Le téléphone est requis")
      return
    }
    if (!createForm.gender) {
      toast.error("Le genre est requis")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/create-joueur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: createForm.first_name.trim(),
          last_name: createForm.last_name.trim(),
          email: createForm.email.trim().toLowerCase(),
          phone: createForm.phone.trim(),
          gender: createForm.gender,
          birth_date: createForm.birth_date || null,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.error === 'duplicate_email') {
          toast.error("Un joueur avec cet email existe déjà")
        } else {
          toast.error(result.message || "Erreur lors de la création du joueur")
        }
        return
      }

      toast.success("Joueur créé avec succès")
      setShowCreateModal(false)
      loadUsers(currentPage, searchQuery)
    } catch (error) {
      console.error('[create-joueur]', error)
      toast.error("Erreur lors de la création du joueur")
    } finally {
      setIsSaving(false)
    }
  }

  const getFullName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.first_name || user.last_name || null
  }

  const getInitials = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    }
    if (user.first_name) return user.first_name.charAt(0)
    if (user.last_name) return user.last_name.charAt(0)
    return user.email.charAt(0).toUpperCase()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Joueurs</h1>
          <p className="text-sm text-neutral-500 mt-1">{totalCount} joueur{totalCount > 1 ? 's' : ''} inscrit{totalCount > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 w-72"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter un joueur
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={4} />
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">
              {searchQuery ? "Aucun joueur trouvé" : "Aucun joueur inscrit"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Joueur</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Genre</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Inscrit le</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-neutral-950 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{getInitials(user)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-950">{getFullName(user) || "—"}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-neutral-600">{user.phone || "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      user.gender === 'M' ? "bg-blue-50 text-blue-700" :
                      user.gender === 'F' ? "bg-pink-50 text-pink-700" :
                      "bg-neutral-100 text-neutral-500"
                    )}>
                      {user.gender === 'M' ? 'Homme' : user.gender === 'F' ? 'Femme' : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-neutral-500">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-neutral-500">
            Page {currentPage} sur {totalPages} · {totalCount} joueurs
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = totalPages <= 7
                ? i + 1
                : currentPage <= 4
                  ? i + 1
                  : currentPage >= totalPages - 3
                    ? totalPages - 6 + i
                    : currentPage - 3 + i
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                    page === currentPage
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create Player Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-xl">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-950 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-neutral-950 text-lg">Nouveau joueur</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Nom *</label>
                  <input
                    type="text"
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  placeholder="joueur@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Téléphone *</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  placeholder="+221 77 000 00 00"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Genre *</label>
                  <select
                    value={createForm.gender}
                    onChange={(e) => setCreateForm(f => ({ ...f, gender: e.target.value as "" | "M" | "F" }))}
                    className="w-full px-3 py-2 h-[38px] text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Date de naissance</label>
                  <input
                    type="date"
                    value={createForm.birth_date}
                    onChange={(e) => setCreateForm(f => ({ ...f, birth_date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePlayer}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Créer le joueur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 bg-neutral-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center">
                    <span className="text-neutral-950 text-xl font-semibold">{getInitials(selectedUser)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{getFullName(selectedUser) || "Joueur"}</h3>
                    <p className="text-sm text-neutral-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-neutral-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Stats */}
              {userStats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4 text-center">
                    <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-neutral-950">{userStats.total}</p>
                    <p className="text-xs text-neutral-500">Réservations</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 text-center">
                    <Calendar className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-semibold text-neutral-950">{userStats.confirmed}</p>
                    <p className="text-xs text-neutral-500">Confirmées</p>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Email</p>
                    <p className="text-sm font-medium text-neutral-950">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Phone className="h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Téléphone</p>
                    <p className="text-sm font-medium text-neutral-950">{selectedUser.phone || "Non renseigné"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500">Genre</p>
                    <p className="text-sm font-medium text-neutral-950">
                      {selectedUser.gender === 'M' ? 'Homme' : selectedUser.gender === 'F' ? 'Femme' : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500">Inscrit le</p>
                    <p className="text-sm font-medium text-neutral-950">{formatDate(selectedUser.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Reservations */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-950 mb-3">Dernières réservations</h4>
                {isLoadingDetails ? (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    <p className="text-xs text-neutral-500">Chargement des réservations...</p>
                  </div>
                ) : userReservations.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">Aucune réservation</p>
                ) : (
                  <div className="space-y-2">
                    {userReservations.map((reservation) => {
                      const terrain = reservation.terrain as { code?: string } | null
                      const timeSlot = reservation.time_slot as { start_time?: string; end_time?: string; price?: number } | null
                      const status = statusConfig[reservation.status as keyof typeof statusConfig]
                      return (
                        <div
                          key={reservation.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-neutral-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-neutral-950 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{terrain?.code || '?'}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-950">
                                {formatDate(reservation.reservation_date)}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {timeSlot?.start_time?.slice(0, 5)} - {timeSlot?.end_time?.slice(0, 5)} · {timeSlot?.price?.toLocaleString('fr-FR')} F
                              </p>
                            </div>
                          </div>
                          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", status?.bg, status?.color)}>
                            {status?.label}
                          </span>
                        </div>
                      )
                    })}
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
