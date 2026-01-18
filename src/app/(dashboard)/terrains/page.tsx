"use client"

import { useEffect, useState } from "react"
import { MapPin, Plus, Pencil, Power, PowerOff, X } from "lucide-react"
import { toast } from "sonner"
import { getTerrains, updateTerrain, createTerrain } from "@/lib/services/terrains"
import type { Terrain } from "@/types/database"
import { cn } from "@/lib/utils"

export default function TerrainsPage() {
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<{ type: 'create' | 'edit', terrain?: Terrain } | null>(null)
  const [formData, setFormData] = useState({ code: "", name: "" })
  const [isSaving, setIsSaving] = useState(false)

  const loadTerrains = async () => {
    setIsLoading(true)
    try {
      const data = await getTerrains()
      setTerrains(data)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTerrains()
  }, [])

  const openModal = (type: 'create' | 'edit', terrain?: Terrain) => {
    if (terrain) {
      setFormData({ code: terrain.code, name: terrain.name })
    } else {
      setFormData({ code: "", name: "" })
    }
    setModal({ type, terrain })
  }

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsSaving(true)
    try {
      if (modal?.terrain) {
        await updateTerrain(modal.terrain.id, formData)
        toast.success("Terrain mis à jour")
      } else {
        await createTerrain(formData)
        toast.success("Terrain créé")
      }
      setModal(null)
      loadTerrains()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (terrain: Terrain) => {
    try {
      await updateTerrain(terrain.id, { is_active: !terrain.is_active })
      toast.success(terrain.is_active ? "Terrain désactivé" : "Terrain activé")
      loadTerrains()
    } catch (error) {
      console.error(error)
      toast.error("Erreur")
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Terrains</h1>
          <p className="text-sm text-neutral-500 mt-1">Gérer les terrains de padel</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
              <div className="h-12 w-12 bg-neutral-100 rounded-xl mb-4" />
              <div className="h-4 bg-neutral-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/3" />
            </div>
          ))
        ) : terrains.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <MapPin className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Aucun terrain configuré</p>
          </div>
        ) : (
          terrains.map((terrain) => (
            <div
              key={terrain.id}
              className={cn(
                "bg-white rounded-xl border p-6 transition-all",
                terrain.is_active ? "border-neutral-200" : "border-neutral-100 opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-neutral-950 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">{terrain.code}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal('edit', terrain)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(terrain)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      terrain.is_active
                        ? "text-red-500 hover:bg-red-50"
                        : "text-emerald-500 hover:bg-emerald-50"
                    )}
                  >
                    {terrain.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-neutral-950">{terrain.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {terrain.is_active ? "Actif" : "Inactif"} · Créé le {new Date(terrain.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-950">
                {modal.type === 'edit' ? 'Modifier le terrain' : 'Nouveau terrain'}
              </h3>
              <button onClick={() => setModal(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Code</label>
                <input
                  type="text"
                  placeholder="A"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={2}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Nom</label>
                <input
                  type="text"
                  placeholder="Terrain A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {isSaving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
