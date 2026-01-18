"use client"

import { useEffect, useState } from "react"
import { Calendar, CheckCircle, XCircle, X } from "lucide-react"
import { toast } from "sonner"
import { getReservations, updateReservationStatus } from "@/lib/services/reservations"
import type { Reservation, ReservationStatus } from "@/types/database"
import { cn } from "@/lib/utils"

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: "Confirmé", color: "text-emerald-700", bg: "bg-emerald-50" },
  PENDING: { label: "En attente", color: "text-amber-700", bg: "bg-amber-50" },
  CANCELLED: { label: "Annulé", color: "text-neutral-500", bg: "bg-neutral-100" },
}

const statusFilters = [
  { value: "", label: "Tous" },
  { value: "CONFIRMED", label: "Confirmés" },
  { value: "PENDING", label: "En attente" },
  { value: "CANCELLED", label: "Annulés" },
]

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchDate, setSearchDate] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [cancelModal, setCancelModal] = useState<Reservation | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadReservations = async () => {
    setIsLoading(true)
    try {
      const data = await getReservations({
        date: searchDate || undefined,
        status: statusFilter || undefined,
      })
      setReservations(data)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [searchDate, statusFilter])

  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    setIsUpdating(true)
    try {
      await updateReservationStatus(id, newStatus)
      toast.success("Statut mis à jour")
      loadReservations()
      setCancelModal(null)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-950">Réservations</h1>
        <p className="text-sm text-neutral-500 mt-1">Gérer les réservations des terrains</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  statusFilter === filter.value
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate("")}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
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
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Aucune réservation trouvée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Terrain</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Horaire</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Prix</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {reservations.map((reservation) => {
                const status = statusConfig[reservation.status]
                return (
                  <tr key={reservation.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-neutral-950">
                        {formatDate(reservation.reservation_date)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-8 w-8 rounded-lg bg-neutral-950 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{reservation.terrain?.code}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-600">
                        {reservation.time_slot && `${formatTime(reservation.time_slot.start_time)} - ${formatTime(reservation.time_slot.end_time)}`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-950">{reservation.user?.full_name || "—"}</p>
                        <p className="text-xs text-neutral-500">{reservation.user?.phone || reservation.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-neutral-950">
                        {reservation.time_slot?.price.toLocaleString('fr-FR')} F
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", status.bg, status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 justify-end">
                        {reservation.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusChange(reservation.id, 'CONFIRMED')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Confirmer"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {reservation.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setCancelModal(reservation)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCancelModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-950 mb-2">Annuler la réservation</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Terrain {cancelModal.terrain?.code} · {formatDate(cancelModal.reservation_date)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleStatusChange(cancelModal.id, 'CANCELLED')}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
