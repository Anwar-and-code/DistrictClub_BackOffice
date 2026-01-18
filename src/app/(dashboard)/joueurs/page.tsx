"use client"

import { useEffect, useState } from "react"
import { Users, Search, Eye, X, Calendar, Phone, Mail, Trophy } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { User, Reservation } from "@/types/database"
import { cn } from "@/lib/utils"

const statusConfig = {
  CONFIRMED: { label: "Confirmé", bg: "bg-emerald-50", color: "text-emerald-700" },
  PENDING: { label: "En attente", bg: "bg-amber-50", color: "text-amber-700" },
  CANCELED: { label: "Annulé", bg: "bg-neutral-100", color: "text-neutral-500" },
  EXPIRED: { label: "Expiré", bg: "bg-red-50", color: "text-red-700" },
}

export default function JoueursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userReservations, setUserReservations] = useState<Reservation[]>([])
  const [userStats, setUserStats] = useState<{ total: number; confirmed: number } | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const supabase = createClient()

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'JOUEUR')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement des joueurs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.first_name?.toLowerCase().includes(query) ||
            user.last_name?.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.phone?.includes(query)
        )
      )
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

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
          <p className="text-sm text-neutral-500 mt-1">{users.length} joueur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}</p>
        </div>
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
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
              {filteredUsers.map((user) => (
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
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />
                    ))}
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
