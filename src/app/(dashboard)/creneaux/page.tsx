"use client"

import { useEffect, useState } from "react"
import { Clock, Plus, Pencil, Power, PowerOff, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getTimeSlots, updateTimeSlot, createTimeSlot } from "@/lib/services/time-slots"
import type { TimeSlot } from "@/types/database"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading"

export default function CreneauxPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<{ type: 'create' | 'edit', slot?: TimeSlot } | null>(null)
  const [formData, setFormData] = useState({ start_time: "", end_time: "", price: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadTimeSlots = async () => {
    setIsLoading(true)
    try {
      const data = await getTimeSlots()
      setTimeSlots(data)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTimeSlots()
  }, [])

  const openModal = (type: 'create' | 'edit', slot?: TimeSlot) => {
    if (slot) {
      setFormData({
        start_time: slot.start_time.slice(0, 5),
        end_time: slot.end_time.slice(0, 5),
        price: slot.price.toString(),
      })
    } else {
      setFormData({ start_time: "", end_time: "", price: "" })
    }
    setModal({ type, slot })
  }

  const handleSave = async () => {
    if (!formData.start_time || !formData.end_time || !formData.price) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    const price = parseInt(formData.price)
    if (isNaN(price) || price < 0) {
      toast.error("Le prix doit être un nombre positif")
      return
    }

    setIsSaving(true)
    try {
      if (modal?.slot) {
        await updateTimeSlot(modal.slot.id, {
          start_time: formData.start_time,
          end_time: formData.end_time,
          price,
        })
        toast.success("Créneau mis à jour")
      } else {
        await createTimeSlot({
          start_time: formData.start_time,
          end_time: formData.end_time,
          price,
        })
        toast.success("Créneau créé")
      }
      setModal(null)
      loadTimeSlots()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (slot: TimeSlot) => {
    setTogglingId(slot.id)
    try {
      await updateTimeSlot(slot.id, { is_active: !slot.is_active })
      toast.success(slot.is_active ? "Créneau désactivé" : "Créneau activé")
      loadTimeSlots()
    } catch (error) {
      console.error(error)
      toast.error("Erreur")
    } finally {
      setTogglingId(null)
    }
  }

  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  const getDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    const diff = (endH * 60 + endM) - (startH * 60 + startM)
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    if (hours === 0) return `${minutes}min`
    if (minutes === 0) return `${hours}h`
    return `${hours}h${minutes}`
  }

  const getPeriod = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0])
    if (hour < 12) return { label: "Matin", bg: "bg-amber-50", color: "text-amber-700" }
    if (hour < 16) return { label: "Après-midi", bg: "bg-blue-50", color: "text-blue-700" }
    return { label: "Soir", bg: "bg-purple-50", color: "text-purple-700" }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Créneaux</h1>
          <p className="text-sm text-neutral-500 mt-1">Gérer les créneaux horaires</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : timeSlots.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Aucun créneau configuré</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Période</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Horaire</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Durée</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Prix</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {timeSlots.map((slot) => {
                const period = getPeriod(slot.start_time)
                return (
                  <tr key={slot.id} className={cn("hover:bg-neutral-50 transition-colors", !slot.is_active && "opacity-50")}>
                    <td className="px-5 py-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", period.bg, period.color)}>
                        {period.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono font-medium text-neutral-950">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-600">{getDuration(slot.start_time, slot.end_time)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-neutral-950">
                        {slot.price.toLocaleString('fr-FR')} F
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        slot.is_active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                      )}>
                        {slot.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openModal('edit', slot)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(slot)}
                          disabled={togglingId === slot.id}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors disabled:opacity-50",
                            slot.is_active ? "text-red-500 hover:bg-red-50" : "text-emerald-500 hover:bg-emerald-50"
                          )}
                        >
                          {togglingId === slot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : slot.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-950">
                {modal.type === 'edit' ? 'Modifier le créneau' : 'Nouveau créneau'}
              </h3>
              <button onClick={() => setModal(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Début</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Fin</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Prix (FCFA)</label>
                <input
                  type="number"
                  placeholder="15000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min={0}
                  step={1000}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
