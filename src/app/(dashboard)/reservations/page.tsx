"use client"

import { useEffect, useState, useMemo } from "react"
import { 
  Calendar, List, ChevronLeft, ChevronRight, Phone, 
  X, CreditCard, Eye, EyeOff, Clock, User, MapPin, CalendarDays
} from "lucide-react"
import { toast } from "sonner"
import { getReservations, updateReservationStatus, createReservationWithClient, isSlotAvailable } from "@/lib/services/reservations"
import { getOrCreateClient } from "@/lib/services/clients"
import { getTerrains } from "@/lib/services/terrains"
import { getTimeSlots } from "@/lib/services/time-slots"
import type { Reservation, Terrain, TimeSlot, ReservationStatus } from "@/types/database"
import { cn } from "@/lib/utils"

type ViewMode = "calendar" | "list"

const statusConfig: Record<ReservationStatus, { 
  label: string
  color: string
  bg: string
  bgSolid: string
  border: string
}> = {
  PENDING: { 
    label: "En attente", 
    color: "text-amber-700", 
    bg: "bg-amber-100", 
    bgSolid: "bg-amber-500",
    border: "border-amber-500" 
  },
  CONFIRMED: { 
    label: "Confirmé", 
    color: "text-blue-700", 
    bg: "bg-blue-100", 
    bgSolid: "bg-blue-500",
    border: "border-blue-500" 
  },
  PAID: { 
    label: "Payé", 
    color: "text-emerald-700", 
    bg: "bg-emerald-100", 
    bgSolid: "bg-emerald-500",
    border: "border-emerald-500" 
  },
  CANCELED: { 
    label: "Annulé", 
    color: "text-neutral-500", 
    bg: "bg-neutral-100", 
    bgSolid: "bg-neutral-400",
    border: "border-neutral-400" 
  },
  EXPIRED: { 
    label: "Expiré", 
    color: "text-red-700", 
    bg: "bg-red-100", 
    bgSolid: "bg-red-500",
    border: "border-red-500" 
  },
}

export default function ReservationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCanceled, setShowCanceled] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [quickAdd, setQuickAdd] = useState<{ terrainId: number; slotId: number } | null>(null)
  const [quickAddForm, setQuickAddForm] = useState({ name: "", phone: "" })

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [terrainsData, timeSlotsData] = await Promise.all([
          getTerrains(),
          getTimeSlots(),
        ])
        setTerrains(terrainsData.filter(t => t.is_active))
        setTimeSlots(timeSlotsData.filter(ts => ts.is_active))
      } catch (error) {
        console.error(error)
        toast.error("Erreur lors du chargement")
      }
    }
    loadInitialData()
  }, [])

  const loadReservations = async () => {
    setIsLoading(true)
    try {
      const data = await getReservations({ date: selectedDate })
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
  }, [selectedDate])


  const handleStatusChange = async (id: number, newStatus: ReservationStatus) => {
    try {
      await updateReservationStatus(id, newStatus)
      toast.success(
        newStatus === "CONFIRMED" ? "Réservation payée" :
        newStatus === "CANCELED" ? "Réservation annulée" : "Statut mis à jour"
      )
      loadReservations()
      setSelectedReservation(null)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatTime = (t: string) => t.slice(0, 5)
  
  const isToday = selectedDate === new Date().toISOString().split("T")[0]
  
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr + "T00:00:00")
    
    if (target.getTime() === today.getTime()) return "Aujourd'hui"
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (target.getTime() === tomorrow.getTime()) return "Demain"
    
    return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
  }

  const changeDate = (days: number) => {
    const current = new Date(selectedDate + "T00:00:00")
    current.setDate(current.getDate() + days)
    setSelectedDate(current.toISOString().split("T")[0])
  }

  const getReservation = (terrainId: number, slotId: number) => {
    return reservations.find(
      r => r.terrain_id === terrainId && r.time_slot_id === slotId && (showCanceled || r.status !== "CANCELED")
    )
  }

  const getPlayerName = (r: Reservation) => {
    if (r.client?.full_name) return r.client.full_name
    if (r.user?.first_name && r.user?.last_name) return `${r.user.first_name} ${r.user.last_name}`
    return r.user?.first_name || r.user?.last_name || "Client"
  }

  const getPlayerPhone = (r: Reservation) => {
    if (r.client?.phone) return r.client.phone
    return r.user?.phone || null
  }

  const stats = {
    total: reservations.filter(r => r.status !== "CANCELED").length,
    confirmed: reservations.filter(r => r.status === "CONFIRMED").length,
    pending: reservations.filter(r => r.status === "PENDING").length,
    canceled: reservations.filter(r => r.status === "CANCELED").length,
  }

  const sortedReservations = [...reservations]
    .filter(r => showCanceled || r.status !== "CANCELED")
    .sort((a, b) => (a.time_slot?.start_time || "").localeCompare(b.time_slot?.start_time || ""))

  // Calculate current time indicator position
  const getCurrentTimePosition = useMemo(() => {
    if (!isToday) return null
    
    const now = currentTime
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i]
      const [startH, startM] = slot.start_time.split(':').map(Number)
      const [endH, endM] = slot.end_time.split(':').map(Number)
      const slotStart = startH * 60 + startM
      const slotEnd = endH * 60 + endM
      
      if (currentMinutes >= slotStart && currentMinutes < slotEnd) {
        const progress = (currentMinutes - slotStart) / (slotEnd - slotStart)
        return { slotIndex: i, progress }
      }
    }
    return null
  }, [currentTime, timeSlots, isToday])

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isToday 
                  ? "bg-gray-900 text-white" 
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              Aujourd'hui
            </button>
            
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>

            <div className="ml-4 flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("fr-FR", { 
                  weekday: "long", day: "numeric", month: "long"
                })}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="ml-2 px-2 py-1 text-sm border border-gray-200 rounded-md bg-white hover:border-gray-300 outline-none"
            />
          </div>

          {/* Right: View Toggle & Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span><strong className="text-gray-900">{stats.total}</strong> réservations</span>
            </div>

            <div className="h-6 w-px bg-gray-200" />

            <button
              onClick={() => setShowCanceled(!showCanceled)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-colors",
                showCanceled 
                  ? "bg-gray-900 text-white" 
                  : "hover:bg-gray-100 text-gray-600"
              )}
            >
              {showCanceled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Annulées
            </button>

            <div className="flex bg-gray-100 p-0.5 rounded-md">
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors",
                  viewMode === "calendar" 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Calendar className="h-4 w-4" />
                Grille
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors",
                  viewMode === "list" 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <List className="h-4 w-4" />
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : viewMode === "calendar" ? (
          /* GRID VIEW - Table Layout */
          <div className="h-full bg-white">
            {terrains.length === 0 || timeSlots.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun terrain ou créneau configuré</p>
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-16" />
                  {terrains.map((terrain) => (
                    <col key={terrain.id} />
                  ))}
                </colgroup>
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th className="border-b border-r border-gray-300 bg-gray-900 py-3 px-2">
                      <span className="text-xs font-medium text-gray-400">Heure</span>
                    </th>
                    {terrains.map((terrain) => (
                      <th 
                        key={terrain.id} 
                        className="border-b border-r border-gray-700 py-3 bg-gray-900 last:border-r-0"
                      >
                        <span className="text-sm font-semibold text-white">Terrain {terrain.code}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIndex) => (
                    <tr key={slot.id} className={slotIndex % 2 === 1 ? "bg-gray-50" : "bg-white"}>
                      {/* Time */}
                      <td className="border-b border-r border-gray-300 py-3 px-3 align-middle">
                        <div className="text-base font-bold text-gray-900">{formatTime(slot.start_time)}</div>
                        <div className="text-sm text-gray-500">{formatTime(slot.end_time)}</div>
                      </td>
                      
                      {/* Cells */}
                      {terrains.map((terrain) => {
                        const reservation = getReservation(terrain.id, slot.id)
                        const config = reservation ? statusConfig[reservation.status] : null
                        const isQuickAddOpen = quickAdd?.terrainId === terrain.id && quickAdd?.slotId === slot.id
                        
                        return (
                          <td 
                            key={terrain.id} 
                            className="border-b border-r border-gray-200 p-0 h-16 last:border-r-0 relative"
                          >
                            {reservation && config ? (
                              <div
                                onClick={() => setSelectedReservation(reservation)}
                                className={cn(
                                  "h-full w-full cursor-pointer px-3 py-2 flex items-center justify-between",
                                  config.bg,
                                  reservation.status === "CANCELED" && "opacity-50"
                                )}
                              >
                                <div className="min-w-0 flex-1">
                                  <p className={cn(
                                    "font-bold text-base truncate",
                                    reservation.status === "CANCELED" ? "text-gray-400 line-through" : "text-gray-900"
                                  )}>
                                    {getPlayerName(reservation)}
                                  </p>
                                  {getPlayerPhone(reservation) && (
                                    <p className={cn(
                                      "text-sm font-mono",
                                      config.color
                                    )}>
                                      {formatPhone(getPlayerPhone(reservation)!)}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1 ml-2">
                                  <span className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded",
                                    reservation.status === "PENDING" && "bg-amber-200 text-amber-800",
                                    reservation.status === "CONFIRMED" && "bg-blue-200 text-blue-800",
                                    reservation.status === "PAID" && "bg-emerald-200 text-emerald-800",
                                    reservation.status === "CANCELED" && "bg-gray-200 text-gray-600"
                                  )}>
                                    {statusConfig[reservation.status].label}
                                  </span>
                                  <span className="text-sm font-bold text-gray-700">
                                    {reservation.time_slot?.price.toLocaleString("fr-FR")} F
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setQuickAdd({ terrainId: terrain.id, slotId: slot.id })
                                  setQuickAddForm({ name: "", phone: "" })
                                }}
                                className="h-full w-full flex items-center justify-center cursor-pointer hover:bg-gray-50 group"
                              >
                                <span className="text-gray-300 group-hover:text-gray-400 text-xl font-light">+</span>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {sortedReservations.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">Aucune réservation pour cette date</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Horaire</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Terrain</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Prix</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Statut</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sortedReservations.map(reservation => {
                    const status = statusConfig[reservation.status]
                    const isCanceled = reservation.status === "CANCELED"
                    
                    return (
                      <tr 
                        key={reservation.id} 
                        className={cn("hover:bg-neutral-50 transition-colors", isCanceled && "opacity-50")}
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-bold text-neutral-900">
                              {reservation.time_slot && formatTime(reservation.time_slot.start_time)}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {reservation.time_slot && formatTime(reservation.time_slot.end_time)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm font-bold">
                            {reservation.terrain?.code}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className={cn("font-semibold", isCanceled && "line-through")}>
                            {getPlayerName(reservation)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {reservation.user?.phone && (
                            <a 
                              href={`tel:${reservation.user.phone}`}
                              className="text-neutral-600 hover:text-neutral-900 hover:underline flex items-center gap-1.5"
                            >
                              <Phone className="h-4 w-4" />
                              {reservation.user.phone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className={cn("font-bold", isCanceled && "line-through")}>
                            {reservation.time_slot?.price.toLocaleString("fr-FR")} F
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white",
                            status.bgSolid
                          )}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelectedReservation(reservation)}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Voir
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedReservation(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg w-80"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">#{selectedReservation.id}</span>
                <h3 className="font-bold text-gray-900">{getPlayerName(selectedReservation)}</h3>
              </div>
              <button onClick={() => setSelectedReservation(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info */}
            <div className="px-4 py-3 space-y-2 text-sm border-b">
              <div className="flex justify-between">
                <span className="text-gray-500">Téléphone</span>
                <span className="font-mono font-semibold">{getPlayerPhone(selectedReservation) && formatPhone(getPlayerPhone(selectedReservation)!)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Terrain</span>
                <span className="font-semibold">{selectedReservation.terrain?.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Créneau</span>
                <span className="font-semibold">{selectedReservation.time_slot && `${formatTime(selectedReservation.time_slot.start_time)} - ${formatTime(selectedReservation.time_slot.end_time)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Prix</span>
                <span className="font-bold text-emerald-600">{selectedReservation.time_slot?.price.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut</span>
                <span className={cn(
                  "font-bold",
                  statusConfig[selectedReservation.status].color
                )}>{statusConfig[selectedReservation.status].label}</span>
              </div>
            </div>

            {/* Actions */}
            {selectedReservation.status !== "CANCELED" && selectedReservation.status !== "PAID" && (
              <div className="p-4 space-y-2">
                {selectedReservation.status === "PENDING" && (
                  <button
                    onClick={() => handleStatusChange(selectedReservation.id, "CONFIRMED")}
                    className="w-full py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600"
                  >
                    Confirmer
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange(selectedReservation.id, "PAID")}
                  className="w-full py-2 rounded bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
                >
                  Marquer payé
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReservation.id, "CANCELED")}
                  className="w-full py-2 rounded border border-red-300 text-red-600 font-semibold hover:bg-red-50"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {quickAdd && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setQuickAdd(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-5">
              <h3 className="font-bold text-white text-lg">Nouvelle réservation</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {terrains.find(t => t.id === quickAdd.terrainId)?.code}
                </span>
                <span className="text-white/80 text-sm">
                  {timeSlots.find(ts => ts.id === quickAdd.slotId)?.start_time && 
                    `${formatTime(timeSlots.find(ts => ts.id === quickAdd.slotId)!.start_time)} - ${formatTime(timeSlots.find(ts => ts.id === quickAdd.slotId)!.end_time)}`
                  }
                </span>
                <span className="text-white/60 text-sm">
                  {timeSlots.find(ts => ts.id === quickAdd.slotId)?.price?.toLocaleString("fr-FR")} F
                </span>
              </div>
            </div>
            
            {/* Form */}
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">
                  Nom du client <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={quickAddForm.name}
                  onChange={e => setQuickAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Prénom Nom"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={quickAddForm.phone}
                  onChange={e => setQuickAddForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="07 XX XX XX XX"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
                <p className="text-xs text-neutral-400 mt-1.5">Format: 10 chiffres commençant par 01, 05 ou 07</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setQuickAdd(null)
                  setQuickAddForm({ name: "", phone: "" })
                }}
                className="flex-1 py-3 rounded-xl border-2 border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                disabled={!quickAddForm.name.trim() || quickAddForm.phone.replace(/\D/g, '').length !== 10}
                onClick={async () => {
                  const phoneDigits = quickAddForm.phone.replace(/\D/g, '')
                  if (!phoneDigits.startsWith('01') && !phoneDigits.startsWith('05') && !phoneDigits.startsWith('07')) {
                    toast.error("Le numéro doit commencer par 01, 05 ou 07")
                    return
                  }
                  
                  try {
                    const available = await isSlotAvailable(quickAdd.terrainId, quickAdd.slotId, selectedDate)
                    if (!available) {
                      toast.error("Ce créneau vient d'être réservé par un autre utilisateur")
                      setQuickAdd(null)
                      loadReservations()
                      return
                    }
                    
                    const client = await getOrCreateClient(quickAddForm.name.trim(), phoneDigits)
                    await createReservationWithClient({
                      terrain_id: quickAdd.terrainId,
                      time_slot_id: quickAdd.slotId,
                      reservation_date: selectedDate,
                      client_id: client.id,
                      status: 'CONFIRMED'
                    })
                    toast.success("Réservation confirmée")
                    setQuickAdd(null)
                    setQuickAddForm({ name: "", phone: "" })
                    loadReservations()
                  } catch (error) {
                    console.error(error)
                    toast.error("Erreur lors de la réservation")
                  }
                }}
                className={cn(
                  "flex-1 py-3 rounded-xl font-semibold transition-all",
                  quickAddForm.name.trim() && quickAddForm.phone.replace(/\D/g, '').length === 10
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
              >
                Réserver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
