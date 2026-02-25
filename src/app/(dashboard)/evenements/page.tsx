"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  Plus, Pencil, Trash2, Star, StarOff, CalendarDays, MapPin,
  X, Upload, Image as ImageIcon, Loader2, Search, Filter
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventImage,
  useAddEventImage,
  useDeleteEventImage,
} from "@/hooks/use-events"
import { eventSchema, type EventFormData } from "@/lib/validations"
import type { Event, EventCategory, EventStatus, EventImage } from "@/types/database"

// ─── Config ──────────────────────────────────────────────────────────

const categoryConfig: Record<EventCategory, { label: string; color: string; bg: string }> = {
  TOURNOI:     { label: "Tournoi",     color: "text-purple-700", bg: "bg-purple-100" },
  FORMATION:   { label: "Formation",   color: "text-blue-700",   bg: "bg-blue-100" },
  SOCIAL:      { label: "Social",      color: "text-pink-700",   bg: "bg-pink-100" },
  ANIMATION:   { label: "Animation",   color: "text-amber-700",  bg: "bg-amber-100" },
  COMPETITION: { label: "Compétition", color: "text-red-700",    bg: "bg-red-100" },
  AUTRE:       { label: "Autre",       color: "text-neutral-700", bg: "bg-neutral-100" },
}

const statusConfig: Record<EventStatus, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: "Brouillon", color: "text-neutral-600", bg: "bg-neutral-100" },
  PUBLISHED: { label: "Publié",    color: "text-emerald-700", bg: "bg-emerald-100" },
  CANCELLED: { label: "Annulé",    color: "text-red-700",     bg: "bg-red-100" },
  COMPLETED: { label: "Terminé",   color: "text-blue-700",    bg: "bg-blue-100" },
}

const categoryOptions: { value: EventCategory; label: string }[] = [
  { value: "TOURNOI",     label: "Tournoi" },
  { value: "FORMATION",   label: "Formation" },
  { value: "SOCIAL",      label: "Social" },
  { value: "ANIMATION",   label: "Animation" },
  { value: "COMPETITION", label: "Compétition" },
  { value: "AUTRE",       label: "Autre" },
]

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: "DRAFT",     label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "CANCELLED", label: "Annulé" },
  { value: "COMPLETED", label: "Terminé" },
]

// ─── Main Page ───────────────────────────────────────────────────────

export default function EvenementsPage() {
  const { data: events = [], isLoading } = useEvents()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEventMutation = useDeleteEvent()

  const [modal, setModal] = useState<{ type: "create" | "edit"; event?: Event } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Event | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<string>("")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let result = events
    if (filterStatus) result = result.filter((e) => e.status === filterStatus)
    if (filterCategory) result = result.filter((e) => e.category === filterCategory)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      )
    }
    return result
  }, [events, filterStatus, filterCategory, search])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteEventMutation.mutateAsync(deleteConfirm.id)
      toast.success("Événement supprimé")
      setDeleteConfirm(null)
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleSave = async (data: EventFormData) => {
    try {
      if (modal?.event) {
        await updateEvent.mutateAsync({ id: modal.event.id, updates: data as any })
        toast.success("Événement modifié")
      } else {
        await createEvent.mutateAsync(data as any)
        toast.success("Événement créé")
      }
      setModal(null)
    } catch (err: any) {
      console.error("Save event error:", err)
      const msg = err?.message || err?.details || "Erreur inconnue"
      toast.error(`Erreur: ${msg}`)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Événements</h1>
          <p className="text-sm text-neutral-500 mt-1">Gérer les événements et animations</p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel événement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
          >
            <option value="">Toutes les catégories</option>
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Titre</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Catégorie</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Statut</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Date début</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Lieu</th>
                <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Mis en avant</th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <CalendarDays className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">Aucun événement trouvé</p>
                  </td>
                </tr>
              ) : (
                filtered.map((event) => {
                  const cat = categoryConfig[event.category]
                  const stat = statusConfig[event.status]
                  return (
                    <tr key={event.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {event.cover_image_url ? (
                            <img
                              src={event.cover_image_url}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <CalendarDays className="h-5 w-5 text-neutral-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-neutral-950">{event.title}</p>
                            {event.subtitle && (
                              <p className="text-xs text-neutral-500">{event.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cat.color, cat.bg)}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", stat.color, stat.bg)}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {format(new Date(event.start_date), "d MMM yyyy · HH:mm", { locale: fr })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {event.is_featured ? (
                          <Star className="h-4 w-4 text-amber-500 mx-auto fill-amber-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-neutral-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModal({ type: "edit", event })}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(event)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-950 mb-2">Supprimer l&apos;événement</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{deleteConfirm.title}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteEventMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteEventMutation.isPending ? "..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {modal && (
        <EventFormModal
          event={modal.event}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={createEvent.isPending || updateEvent.isPending}
        />
      )}
    </div>
  )
}

// ─── Event Form Modal ────────────────────────────────────────────────

function EventFormModal({
  event,
  onClose,
  onSave,
  isSaving,
}: {
  event?: Event
  onClose: () => void
  onSave: (data: EventFormData) => Promise<void>
  isSaving: boolean
}) {
  const uploadImage = useUploadEventImage()
  const addImage = useAddEventImage()
  const deleteImage = useDeleteEventImage()

  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [galleryImages, setGalleryImages] = useState<EventImage[]>(event?.event_images || [])
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [tagsInput, setTagsInput] = useState(event?.tags?.join(", ") || "")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: event?.title || "",
      subtitle: event?.subtitle || "",
      description: event?.description || "",
      long_description: event?.long_description || "",
      category: event?.category || "AUTRE",
      status: event?.status || "DRAFT",
      start_date: event?.start_date
        ? new Date(event.start_date).toISOString().slice(0, 16)
        : "",
      end_date: event?.end_date
        ? new Date(event.end_date).toISOString().slice(0, 16)
        : "",
      location: event?.location || "",
      cover_image_url: event?.cover_image_url || "",
      is_featured: event?.is_featured ?? false,
      display_order: event?.display_order ?? 0,
      tags: event?.tags || [],
      price_info: event?.price_info || "",
      is_free: event?.is_free ?? true,
      contact_phone: event?.contact_phone || "+225",
    },
  })

  useEffect(() => {
    if (!event) {
      const supabase = createClient()
      supabase.from('app_settings').select('business_phone').single().then(({ data }) => {
        if (data?.business_phone) {
          const phone = data.business_phone.startsWith('+225')
            ? data.business_phone
            : `+225${data.business_phone}`
          setValue('contact_phone', phone)
        }
      })
    }
  }, [event, setValue])

  const coverUrl = watch("cover_image_url")

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingCover(true)
    try {
      const url = await uploadImage.mutateAsync(file)
      setValue("cover_image_url", url)
      toast.success("Image de couverture uploadée")
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !event?.id) return
    setIsUploadingGallery(true)
    try {
      const url = await uploadImage.mutateAsync(file)
      const img = await addImage.mutateAsync({
        eventId: event.id,
        imageUrl: url,
        displayOrder: galleryImages.length,
      })
      setGalleryImages([...galleryImages, img])
      toast.success("Image ajoutée à la galerie")
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setIsUploadingGallery(false)
    }
  }

  const handleDeleteGalleryImage = async (img: EventImage) => {
    try {
      await deleteImage.mutateAsync(img.id)
      setGalleryImages(galleryImages.filter((i) => i.id !== img.id))
      toast.success("Image supprimée")
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const onSubmit = (data: EventFormData) => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const cleaned = {
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      location: data.location,
      subtitle: data.subtitle || null,
      long_description: data.long_description || null,
      start_date: data.start_date ? new Date(data.start_date).toISOString() : data.start_date,
      end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      cover_image_url: data.cover_image_url || null,
      is_featured: data.is_featured ?? false,
      display_order: (data.display_order != null && !isNaN(data.display_order)) ? data.display_order : 0,
      tags: tags.length > 0 ? tags : null,
      price_info: data.price_info || null,
      is_free: data.is_free ?? true,
      contact_phone: data.contact_phone || null,
    }

    return onSave(cleaned as any)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-950">
            {event ? "Modifier l'événement" : "Nouvel événement"}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                placeholder="Titre de l'événement"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Sous-titre</label>
              <input
                {...register("subtitle")}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                placeholder="Sous-titre (optionnel)"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                {...register("category")}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
              >
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                {...register("status")}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("start_date")}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
              {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Date de fin</label>
              <input
                type="datetime-local"
                {...register("end_date")}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
              Lieu <span className="text-red-500">*</span>
            </label>
            <input
              {...register("location")}
              className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
              placeholder="Lieu de l'événement"
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Téléphone de contact</label>
            <input
              type="tel"
              {...register("contact_phone")}
              className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
              placeholder="+225 XX XX XX XX XX"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-none"
              placeholder="Description courte"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Long Description */}
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Description longue</label>
            <textarea
              {...register("long_description")}
              rows={4}
              className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-none"
              placeholder="Description détaillée (optionnel)"
            />
          </div>

          {/* Price & Options */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Info prix</label>
              <input
                {...register("price_info")}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                placeholder="ex: 5000 FCFA"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Ordre d&apos;affichage</label>
              <input
                type="number"
                {...register("display_order", { valueAsNumber: true })}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Tags</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                placeholder="padel, tournoi, ..."
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_free")}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
              />
              <span className="text-sm text-neutral-700">Gratuit</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_featured")}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
              />
              <span className="text-sm text-neutral-700">Mis en avant</span>
            </label>
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Image de couverture</label>
            <div className="mt-1.5 flex items-center gap-4">
              {coverUrl ? (
                <div className="relative group">
                  <img src={coverUrl} alt="Couverture" className="h-20 w-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setValue("cover_image_url", "")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-32 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-neutral-300" />
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                {isUploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploadingCover ? "Upload..." : "Choisir"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Gallery (only in edit mode) */}
          {event && (
            <div>
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Galerie d&apos;images</label>
              <div className="mt-1.5 flex flex-wrap gap-3">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image_url}
                      alt={img.caption || ""}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(img)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {img.caption && (
                      <p className="text-[10px] text-neutral-500 text-center mt-1 truncate max-w-[80px]">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isUploadingGallery}
                  className="h-20 w-20 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center hover:border-neutral-400 transition-colors disabled:opacity-50"
                >
                  {isUploadingGallery ? (
                    <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit(onSubmit as any)}
            disabled={isSaving}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  )
}
