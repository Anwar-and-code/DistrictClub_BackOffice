"use client"

import { useEffect, useState } from "react"
import { Users, Search, Eye, X, Calendar } from "lucide-react"
import { toast } from "sonner"
import { getUsers } from "@/lib/services/users"
import { getReservations } from "@/lib/services/reservations"
import type { User, Reservation } from "@/types/database"
import { cn } from "@/lib/utils"

const statusConfig = {
  CONFIRMED: { label: "Confirmé", bg: "bg-emerald-50", color: "text-emerald-700" },
  PENDING: { label: "En attente", bg: "bg-amber-50", color: "text-amber-700" },
  CANCELLED: { label: "Annulé", bg: "bg-neutral-100", color: "text-neutral-500" },
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userReservations, setUserReservations] = useState<Reservation[]>([])
  const [isLoadingReservations, setIsLoadingReservations] = useState(false)

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
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
            user.full_name?.toLowerCase().includes(query) ||
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
    setIsLoadingReservations(true)
    try {
      const reservations = await getReservations()
      setUserReservations(reservations.filter((r) => r.user_id === user.id))
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingReservations(false)
    }
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
          <h1 className="text-2xl font-semibold text-neutral-950">Utilisateurs</h1>
          <p className="text-sm text-neutral-500 mt-1">Gérer les comptes utilisateurs</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">
              {searchQuery ? "Aucun résultat" : "Aucun utilisateur"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Utilisateur</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Inscrit le</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-950">{user.full_name || "—"}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-neutral-600">{user.phone || "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-neutral-500">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
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
          <div className="relative bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-neutral-950 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-950">{selectedUser.full_name || "Utilisateur"}</h3>
                    <p className="text-sm text-neutral-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Téléphone</p>
                  <p className="text-sm font-medium text-neutral-950 mt-1">{selectedUser.phone || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Inscrit le</p>
                  <p className="text-sm font-medium text-neutral-950 mt-1">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-950">Réservations ({userReservations.length})</span>
                </div>
                {isLoadingReservations ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : userReservations.length === 0 ? (
                  <p className="text-sm text-neutral-500">Aucune réservation</p>
                ) : (
                  <div className="space-y-2">
                    {userReservations.map((reservation) => {
                      const status = statusConfig[reservation.status as keyof typeof statusConfig]
                      return (
                        <div
                          key={reservation.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-neutral-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-neutral-950 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">{reservation.terrain?.code}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-950">
                                {formatDate(reservation.reservation_date)}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {reservation.time_slot?.start_time.slice(0, 5)} - {reservation.time_slot?.end_time.slice(0, 5)}
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
