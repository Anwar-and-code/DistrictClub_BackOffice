"use client"

import { useEffect, useState } from "react"
import { UserCog, Plus, Pencil, Trash2, X, Shield, ShieldCheck, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Employee {
  id: string
  username: string
  full_name: string | null
  role: 'admin' | 'gerant' | 'superviseur' | 'caissiere'
  is_active: boolean
  created_at: string
}

const roleConfig = {
  admin: { label: "Administrateur", icon: ShieldAlert, color: "bg-red-50 text-red-700", description: "Accès total système" },
  gerant: { label: "Gérant", icon: ShieldAlert, color: "bg-purple-50 text-purple-700", description: "Accès complet" },
  superviseur: { label: "Superviseur", icon: ShieldCheck, color: "bg-blue-50 text-blue-700", description: "Gestion opérationnelle" },
  caissiere: { label: "Caissière", icon: Shield, color: "bg-emerald-50 text-emerald-700", description: "Réservations uniquement" },
}

export default function EmployesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState<{ type: 'create' | 'edit', employee?: Employee } | null>(null)
  const [deleteModal, setDeleteModal] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    password: "",
    role: "caissiere" as Employee['role'],
  })
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const loadEmployees = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const openModal = (type: 'create' | 'edit', employee?: Employee) => {
    if (employee) {
      setFormData({
        username: employee.username,
        full_name: employee.full_name || "",
        password: "",
        role: employee.role,
      })
    } else {
      setFormData({ username: "", full_name: "", password: "", role: "caissiere" })
    }
    setModal({ type, employee })
  }

  const handleSave = async () => {
    if (!formData.username || !formData.full_name) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (modal?.type === 'create' && !formData.password) {
      toast.error("Le mot de passe est requis")
      return
    }

    setIsSaving(true)
    try {
      if (modal?.employee) {
        const updateData: Record<string, string> = {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
        }
        if (formData.password) {
          updateData.password_hash = formData.password
        }
        
        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', modal.employee.id)
        
        if (error) throw error
        toast.success("Employé mis à jour")
      } else {
        const { error } = await supabase
          .from('employees')
          .insert({
            username: formData.username,
            full_name: formData.full_name,
            password_hash: formData.password,
            role: formData.role,
            is_active: true,
          })
        
        if (error) throw error
        toast.success("Employé créé")
      }
      setModal(null)
      loadEmployees()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', deleteModal.id)
      
      if (error) throw error
      toast.success("Employé supprimé")
      setDeleteModal(null)
      loadEmployees()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const toggleActive = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: !employee.is_active })
        .eq('id', employee.id)
      
      if (error) throw error
      toast.success(employee.is_active ? "Employé désactivé" : "Employé activé")
      loadEmployees()
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
          <h1 className="text-2xl font-semibold text-neutral-950">Employés</h1>
          <p className="text-sm text-neutral-500 mt-1">Gérer les comptes et permissions du personnel</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel employé
        </button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(roleConfig).map(([key, config]) => {
          const count = employees.filter(e => e.role === key && e.is_active).length
          const Icon = config.icon
          return (
            <div key={key} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-neutral-950">{config.label}</p>
                  <p className="text-xs text-neutral-500">{config.description}</p>
                </div>
              </div>
              <p className="text-2xl font-semibold text-neutral-950">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Aucun employé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Employé</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Rôle</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Statut</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Créé le</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {employees.map((employee) => {
                const role = roleConfig[employee.role]
                const Icon = role?.icon || Shield
                return (
                  <tr key={employee.id} className={cn("hover:bg-neutral-50 transition-colors", !employee.is_active && "opacity-50")}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {employee.full_name?.charAt(0) || employee.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-950">{employee.full_name || employee.username}</p>
                          <p className="text-xs text-neutral-500">@{employee.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", role?.color)}>
                        <Icon className="h-3 w-3" />
                        {role?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(employee)}
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                          employee.is_active 
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        )}
                      >
                        {employee.is_active ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-neutral-500">
                        {new Date(employee.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openModal('edit', employee)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(employee)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-950">
                {modal.type === 'edit' ? 'Modifier l\'employé' : 'Nouvel employé'}
              </h3>
              <button onClick={() => setModal(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Nom complet *</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Identifiant *</label>
                <input
                  type="text"
                  placeholder="jean.dupont"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '.') })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Mot de passe {modal.type === 'create' ? '*' : '(laisser vide pour ne pas changer)'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Rôle *</label>
                <div className="mt-2 space-y-2">
                  {Object.entries(roleConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <label
                        key={key}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          formData.role === key
                            ? "border-neutral-950 bg-neutral-50"
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={key}
                          checked={formData.role === key}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value as Employee['role'] })}
                          className="sr-only"
                        />
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", config.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-950">{config.label}</p>
                          <p className="text-xs text-neutral-500">{config.description}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
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

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-950 mb-2">Supprimer l'employé ?</h3>
              <p className="text-sm text-neutral-500">
                Cette action est irréversible. L'employé <strong>{deleteModal.full_name}</strong> sera définitivement supprimé.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
