"use client"

import { useEffect, useState, useMemo } from "react"
import { 
  Calendar, List, ChevronLeft, ChevronRight, Phone, 
  X, CreditCard, Eye, EyeOff, Clock, User, MapPin, CalendarDays, Lock, Plus, Wallet, Check
} from "lucide-react"
import { toast } from "sonner"
import { getReservations, updateReservationStatus, createReservationWithClient, isSlotAvailable } from "@/lib/services/reservations"
import { getOrCreateClient } from "@/lib/services/clients"
import { getTerrains } from "@/lib/services/terrains"
import { getTimeSlots } from "@/lib/services/time-slots"
import { createClient } from "@/lib/supabase/client"
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
  const [securityCodeModal, setSecurityCodeModal] = useState<{ reservationId: number; newStatus: ReservationStatus } | null>(null)
  const [securityCodeInput, setSecurityCodeInput] = useState("")
  const [storedSecurityCode, setStoredSecurityCode] = useState<string | null>(null)
  const [paymentModal, setPaymentModal] = useState<Reservation | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<{ id: number; name: string; is_active: boolean }[]>([])
  const [payments, setPayments] = useState<{ payment_method_id: number; amount: number; amount_received: number; amount_returned: number }[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [amountReceived, setAmountReceived] = useState("")
  const supabase = createClient()

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
        
        // Load security code from app_settings
        const { data: settingsData } = await supabase
          .from('app_settings')
          .select('security_code')
          .single()
        if (settingsData?.security_code) {
          setStoredSecurityCode(settingsData.security_code)
        }
        
        // Load payment methods
        const { data: paymentMethodsData } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
        if (paymentMethodsData) {
          setPaymentMethods(paymentMethodsData)
        }
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


  const handleStatusChange = async (id: number, newStatus: ReservationStatus, skipSecurityCheck = false) => {
    // If changing from PAID to CONFIRMED (annuler le paiement), require security code
    const reservation = reservations.find(r => r.id === id)
    if (!skipSecurityCheck && reservation?.status === "PAID" && newStatus === "CONFIRMED") {
      setSecurityCodeModal({ reservationId: id, newStatus })
      setSecurityCodeInput("")
      return
    }
    
    try {
      const wasPaymentCanceled = reservation?.status === "PAID" && newStatus === "CONFIRMED"
      await updateReservationStatus(id, newStatus)
      toast.success(
        wasPaymentCanceled ? "Paiement annulé" :
        newStatus === "CONFIRMED" ? "Réservation confirmée" :
        newStatus === "CANCELED" ? "Réservation annulée" : "Statut mis à jour"
      )
      loadReservations()
      setSelectedReservation(null)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleSecurityCodeSubmit = async () => {
    if (securityCodeInput !== storedSecurityCode) {
      toast.error("Code de sécurité incorrect")
      return
    }
    
    if (securityCodeModal) {
      setSecurityCodeModal(null)
      await handleStatusChange(securityCodeModal.reservationId, securityCodeModal.newStatus, true)
    }
  }

  const openPaymentModal = (reservation: Reservation) => {
    setPaymentModal(reservation)
    setPayments([])
    setSelectedPaymentMethod(null)
    setPaymentAmount("")
    setAmountReceived("")
    setSelectedReservation(null)
  }

  const addPayment = () => {
    if (!selectedPaymentMethod || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Sélectionnez un mode de paiement et entrez un montant valide")
      return
    }
    
    const amount = parseFloat(paymentAmount)
    const received = parseFloat(amountReceived) || amount
    const returned = received > amount ? received - amount : 0
    const totalPrice = paymentModal?.time_slot?.price || 0
    const currentTotal = payments.reduce((sum, p) => sum + p.amount, 0)
    
    if (currentTotal + amount > totalPrice) {
      toast.error("Le montant total dépasse le prix de la réservation")
      return
    }
    
    setPayments([...payments, { payment_method_id: selectedPaymentMethod, amount, amount_received: received, amount_returned: returned }])
    setPaymentAmount("")
    setAmountReceived("")
    setSelectedPaymentMethod(null)
  }

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const getTotalPaid = () => payments.reduce((sum, p) => sum + p.amount, 0)

  const getRemainingAmount = () => {
    const totalPrice = paymentModal?.time_slot?.price || 0
    return totalPrice - getTotalPaid()
  }

  const handlePaymentSubmit = async () => {
    if (!paymentModal) return
    
    const totalPrice = paymentModal.time_slot?.price || 0
    const totalPaid = getTotalPaid()
    
    if (totalPaid !== totalPrice) {
      toast.error(`Le montant total (${totalPaid.toLocaleString("fr-FR")} F) doit être égal au prix (${totalPrice.toLocaleString("fr-FR")} F)`)
      return
    }
    
    try {
      // Insert all payments
      for (const payment of payments) {
        const { error } = await supabase
          .from('reservation_payments')
          .insert({
            reservation_id: paymentModal.id,
            payment_method_id: payment.payment_method_id,
            amount: payment.amount,
            amount_received: payment.amount_received,
            amount_returned: payment.amount_returned
          })
        if (error) throw error
      }
      
      // Update reservation status to PAID
      await updateReservationStatus(paymentModal.id, "PAID")
      
      toast.success("Paiement enregistré")
      setPaymentModal(null)
      loadReservations()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement du paiement")
    }
  }

  const getPaymentMethodName = (id: number) => {
    return paymentMethods.find(pm => pm.id === id)?.name || "Inconnu"
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
                      <td className="border-b border-r border-gray-300 py-3 px-3 align-middle relative">
                        <div className="text-base font-bold text-gray-900">{formatTime(slot.start_time)}</div>
                        <div className="text-sm text-gray-500">{formatTime(slot.end_time)}</div>
                        {/* Current time indicator - left dot */}
                        {getCurrentTimePosition?.slotIndex === slotIndex && (
                          <div 
                            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                            style={{ top: `${getCurrentTimePosition.progress * 100}%` }}
                          >
                            <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-sm" />
                          </div>
                        )}
                      </td>
                      
                      {/* Cells */}
                      {terrains.map((terrain) => {
                        const reservation = getReservation(terrain.id, slot.id)
                        const config = reservation ? statusConfig[reservation.status] : null
                        const isQuickAddOpen = quickAdd?.terrainId === terrain.id && quickAdd?.slotId === slot.id
                        
                        return (
                          <td 
                            key={terrain.id} 
                            className="border-b border-r border-gray-200 p-0 h-16 last:border-r-0 relative overflow-visible"
                          >
                            {/* Current time indicator line */}
                            {getCurrentTimePosition?.slotIndex === slotIndex && (
                              <div 
                                className="absolute left-0 right-0 z-10 pointer-events-none"
                                style={{ top: `${getCurrentTimePosition.progress * 100}%` }}
                              >
                                <div className="h-0.5 bg-red-500 w-full" />
                              </div>
                            )}
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
            {selectedReservation.status !== "CANCELED" && (
              <div className="p-4 space-y-2">
                {selectedReservation.status === "PAID" && (
                  <button
                    onClick={() => handleStatusChange(selectedReservation.id, "CONFIRMED")}
                    className="w-full py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
                  >
                    Annuler le paiement
                  </button>
                )}
                {selectedReservation.status === "PENDING" && (
                  <button
                    onClick={() => handleStatusChange(selectedReservation.id, "CONFIRMED")}
                    className="w-full py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600"
                  >
                    Confirmer
                  </button>
                )}
                {(selectedReservation.status === "PENDING" || selectedReservation.status === "CONFIRMED") && (
                  <>
                    <button
                      onClick={() => openPaymentModal(selectedReservation)}
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
                  </>
                )}
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

      {/* Security Code Modal */}
      {securityCodeModal && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSecurityCodeModal(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-[360px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Code de sécurité</h3>
                  <p className="text-white/70 text-sm">Requis pour confirmer</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-2">
                  Entrez le code de sécurité
                </label>
                <input
                  type="password"
                  value={securityCodeInput}
                  onChange={e => setSecurityCodeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSecurityCodeSubmit()}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-base font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSecurityCodeModal(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSecurityCodeSubmit}
                  disabled={!securityCodeInput}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-semibold transition-all",
                    securityCodeInput
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  )}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setPaymentModal(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Orange */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-5 py-4 relative">
              <button 
                onClick={() => setPaymentModal(null)} 
                className="absolute top-3 right-3 text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="font-bold text-white text-lg">Encaissement</h3>
              <p className="text-white/90 text-xs">
                Client: {paymentModal.client?.full_name || paymentModal.user?.first_name || "Client"}
              </p>
              <div className="flex justify-between mt-3">
                <div>
                  <p className="text-white/80 text-xs">Total à payer</p>
                  <p className="text-white text-xl font-bold">{paymentModal.time_slot?.price.toLocaleString("fr-FR")} F</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs">Reste à payer</p>
                  <p className={cn(
                    "text-xl font-bold",
                    getRemainingAmount() === 0 ? "text-white" : "text-emerald-300"
                  )}>{getRemainingAmount().toLocaleString("fr-FR")} F</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Payment Methods - Grid 3x2 */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Mode de paiement</p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method, index) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={cn(
                        "p-2 rounded-lg border flex flex-col items-center gap-1 transition-all",
                        selectedPaymentMethod === method.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className={cn(
                        "h-7 w-7 rounded flex items-center justify-center",
                        selectedPaymentMethod === method.id ? "bg-orange-100" : "bg-neutral-100"
                      )}>
                        <CreditCard className={cn(
                          "h-3.5 w-3.5",
                          selectedPaymentMethod === method.id ? "text-orange-500" : "text-neutral-400"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium text-xs text-center leading-tight",
                        selectedPaymentMethod === method.id ? "text-orange-600" : "text-neutral-600"
                      )}>{method.name}</span>
                      <span className="text-[10px] text-neutral-400">{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Montant</p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      placeholder="Montant ..."
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  <button
                    onClick={addPayment}
                    disabled={!selectedPaymentMethod || !paymentAmount}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5",
                      selectedPaymentMethod && paymentAmount
                        ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Amount Received & Returned */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Montant reçu</p>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={e => setAmountReceived(e.target.value)}
                    placeholder="Reçu ..."
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Rendu</p>
                  <div className="px-3 py-2.5 bg-neutral-100 rounded-xl text-sm font-bold text-neutral-700">
                    {(() => {
                      const amount = parseFloat(paymentAmount) || 0
                      const received = parseFloat(amountReceived) || 0
                      const returned = received > amount ? received - amount : 0
                      return `${returned.toLocaleString("fr-FR")} F`
                    })()}
                  </div>
                </div>
              </div>

              {/* Added Payments List */}
              {payments.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Paiements ajoutés</p>
                  <div className="space-y-1.5">
                    {payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-sm text-neutral-700">{getPaymentMethodName(payment.payment_method_id)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-neutral-900">{payment.amount.toLocaleString("fr-FR")} F</span>
                          <button
                            onClick={() => removePayment(index)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-medium text-sm hover:bg-neutral-50 transition-colors"
                >
                  Annuler <span className="text-neutral-400 text-xs">Esc</span>
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={getRemainingAmount() !== 0}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5",
                    getRemainingAmount() === 0
                      ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  )}
                >
                  <Check className="h-4 w-4" />
                  Valider <span className="text-neutral-400 text-xs">Entrée</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
