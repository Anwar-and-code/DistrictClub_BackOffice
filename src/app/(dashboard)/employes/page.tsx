"use client"

import { useEffect, useState, useCallback } from "react"
import {
  UserCog, Plus, Pencil, Trash2, X, Shield,
  Check, Home, Lock, Eye, Settings2
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { PERMISSIONS, AVAILABLE_ROUTES } from "@/lib/permissions"

// ─── Types ──────────────────────────────────────────────────────────
interface Employee {
  id: string
  username: string
  full_name: string | null
  role: string
  profile_id: string | null
  is_active: boolean
  created_at: string
}

interface Profile {
  id: string
  name: string
  display_name: string
  description: string | null
  base_route: string
  hierarchy_level: number
  is_system: boolean
  created_at: string
}

interface PermissionRow {
  id: string
  display_name: string
  description: string | null
  category: string
  sort_order: number
}

// ─── Couleurs par niveau hiérarchique ───────────────────────────────
const HIERARCHY_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-red-50", text: "text-red-700" },
  2: { bg: "bg-purple-50", text: "text-purple-700" },
  3: { bg: "bg-blue-50", text: "text-blue-700" },
  4: { bg: "bg-emerald-50", text: "text-emerald-700" },
}
const DEFAULT_COLOR = { bg: "bg-neutral-50", text: "text-neutral-700" }

function getProfileColor(level: number) {
  return HIERARCHY_COLORS[level] || DEFAULT_COLOR
}

// ═════════════════════════════════════════════════════════════════════
export default function EmployesPage() {
  const { can } = useAuth()
  const canManage = can(PERMISSIONS.EMPLOYES_MANAGE)
  const supabase = createClient()

  const [tab, setTab] = useState<'employes' | 'profils'>('employes')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [allPermissions, setAllPermissions] = useState<PermissionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ─── Employee modal state ─────────────────────────────────────────
  const [empModal, setEmpModal] = useState<{ type: 'create' | 'edit'; employee?: Employee } | null>(null)
  const [empForm, setEmpForm] = useState({ username: "", full_name: "", password: "", profile_id: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState<Employee | null>(null)

  // ─── Profile modal state ──────────────────────────────────────────
  const [profileModal, setProfileModal] = useState<{ type: 'create' | 'edit'; profile?: Profile } | null>(null)
  const [profileForm, setProfileForm] = useState({
    name: "", display_name: "", description: "", base_route: "/", hierarchy_level: 5
  })
  const [profilePerms, setProfilePerms] = useState<Set<string>>(new Set())
  const [deleteProfileModal, setDeleteProfileModal] = useState<Profile | null>(null)

  // ─── Data loading ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [empRes, profRes, permRes] = await Promise.all([
        supabase.from('employees').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('hierarchy_level'),
        supabase.from('permissions').select('*').order('sort_order'),
      ])
      if (empRes.error) throw empRes.error
      if (profRes.error) throw profRes.error
      if (permRes.error) throw permRes.error
      setEmployees(empRes.data || [])
      setProfiles(profRes.data || [])
      setAllPermissions(permRes.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ─── Profile helpers ──────────────────────────────────────────────
  const getProfile = (id: string | null) => profiles.find(p => p.id === id)

  // ─── Permissions grouped by category ──────────────────────────────
  const permsByCategory = allPermissions.reduce<Record<string, PermissionRow[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  // ─── Load permissions for a profile ───────────────────────────────
  const loadProfilePermissions = async (profileId: string) => {
    const { data } = await supabase
      .from('profile_permissions')
      .select('permission_id')
      .eq('profile_id', profileId)
    return new Set((data || []).map(d => d.permission_id))
  }

  // ═════════════════════════════════════════════════════════════════
  // EMPLOYEE ACTIONS
  // ═════════════════════════════════════════════════════════════════
  const openEmpModal = (type: 'create' | 'edit', employee?: Employee) => {
    setEmpForm({
      username: employee?.username || "",
      full_name: employee?.full_name || "",
      password: "",
      profile_id: employee?.profile_id || profiles[profiles.length - 1]?.id || "",
    })
    setEmpModal({ type, employee })
  }

  const handleSaveEmployee = async () => {
    if (!empForm.username || !empForm.full_name || !empForm.profile_id) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }
    if (empModal?.type === 'create' && !empForm.password) {
      toast.error("Le mot de passe est requis")
      return
    }

    setIsSaving(true)
    try {
      const profile = getProfile(empForm.profile_id)
      if (empModal?.employee) {
        const updateData: Record<string, unknown> = {
          username: empForm.username,
          full_name: empForm.full_name,
          profile_id: empForm.profile_id,
          role: profile?.name || empModal.employee.role,
        }
        if (empForm.password) updateData.password_hash = empForm.password
        const { error } = await supabase.from('employees').update(updateData).eq('id', empModal.employee.id)
        if (error) throw error
        toast.success("Employé mis à jour")
      } else {
        const { error } = await supabase.from('employees').insert({
          username: empForm.username,
          full_name: empForm.full_name,
          password_hash: empForm.password,
          profile_id: empForm.profile_id,
          role: profile?.name || 'caissiere',
          is_active: true,
        })
        if (error) throw error
        toast.success("Employé créé")
      }
      setEmpModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEmployee = async () => {
    if (!deleteModal) return
    try {
      const { error } = await supabase.from('employees').delete().eq('id', deleteModal.id)
      if (error) throw error
      toast.success("Employé supprimé")
      setDeleteModal(null)
      loadData()
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
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur")
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // PROFILE ACTIONS
  // ═════════════════════════════════════════════════════════════════
  const openProfileModal = async (type: 'create' | 'edit', profile?: Profile) => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        display_name: profile.display_name,
        description: profile.description || "",
        base_route: profile.base_route,
        hierarchy_level: profile.hierarchy_level,
      })
      const perms = await loadProfilePermissions(profile.id)
      setProfilePerms(perms)
    } else {
      setProfileForm({ name: "", display_name: "", description: "", base_route: "/", hierarchy_level: 5 })
      setProfilePerms(new Set())
    }
    setProfileModal({ type, profile })
  }

  const togglePermission = (permId: string) => {
    setProfilePerms(prev => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })
  }

  const toggleCategoryPermissions = (category: string) => {
    const catPerms = permsByCategory[category] || []
    const allSelected = catPerms.every(p => profilePerms.has(p.id))
    setProfilePerms(prev => {
      const next = new Set(prev)
      catPerms.forEach(p => {
        if (allSelected) next.delete(p.id)
        else next.add(p.id)
      })
      return next
    })
  }

  const handleSaveProfile = async () => {
    if (!profileForm.name || !profileForm.display_name) {
      toast.error("Veuillez remplir le nom et le libellé")
      return
    }

    setIsSaving(true)
    try {
      let profileId: string

      if (profileModal?.profile) {
        profileId = profileModal.profile.id
        const { error } = await supabase.from('profiles').update({
          name: profileForm.name,
          display_name: profileForm.display_name,
          description: profileForm.description || null,
          base_route: profileForm.base_route,
          hierarchy_level: profileForm.hierarchy_level,
        }).eq('id', profileId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('profiles').insert({
          name: profileForm.name.toLowerCase().replace(/\s+/g, '_'),
          display_name: profileForm.display_name,
          description: profileForm.description || null,
          base_route: profileForm.base_route,
          hierarchy_level: profileForm.hierarchy_level,
        }).select('id').single()
        if (error) throw error
        profileId = data.id
      }

      // Sync permissions: delete all then re-insert
      await supabase.from('profile_permissions').delete().eq('profile_id', profileId)
      if (profilePerms.size > 0) {
        const rows = Array.from(profilePerms).map(pid => ({
          profile_id: profileId,
          permission_id: pid,
        }))
        const { error: permError } = await supabase.from('profile_permissions').insert(rows)
        if (permError) throw permError
      }

      toast.success(profileModal?.profile ? "Profil mis à jour" : "Profil créé")
      setProfileModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!deleteProfileModal) return
    const usedBy = employees.filter(e => e.profile_id === deleteProfileModal.id).length
    if (usedBy > 0) {
      toast.error(`Ce profil est utilisé par ${usedBy} employé(s). Réassignez-les d'abord.`)
      setDeleteProfileModal(null)
      return
    }
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', deleteProfileModal.id)
      if (error) throw error
      toast.success("Profil supprimé")
      setDeleteProfileModal(null)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression")
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Employés & Profils</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestion des comptes, profils et permissions</p>
        </div>
        {canManage && (
          <button
            onClick={() => tab === 'employes' ? openEmpModal('create') : openProfileModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {tab === 'employes' ? 'Nouvel employé' : 'Nouveau profil'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit mb-6">
        <button
          onClick={() => setTab('employes')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            tab === 'employes' ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <UserCog className="h-4 w-4 inline-block mr-2 -mt-0.5" />
          Employés ({employees.length})
        </button>
        <button
          onClick={() => setTab('profils')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            tab === 'profils' ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <Shield className="h-4 w-4 inline-block mr-2 -mt-0.5" />
          Profils ({profiles.length})
        </button>
      </div>

      {/* ═══ TAB: EMPLOYÉS ═══ */}
      {tab === 'employes' && (
        <>
          {/* Profile summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {profiles.map((profile) => {
              const count = employees.filter(e => e.profile_id === profile.id && e.is_active).length
              const color = getProfileColor(profile.hierarchy_level)
              return (
                <div key={profile.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", color.bg, color.text)}>
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-950 text-sm truncate">{profile.display_name}</p>
                      <p className="text-xs text-neutral-400">{profile.description}</p>
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-neutral-950">{count}</p>
                </div>
              )
            })}
          </div>

          {/* Employees table */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />)}
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
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Profil</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Statut</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Créé le</th>
                    {canManage && <th className="px-5 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {employees.map((employee) => {
                    const profile = getProfile(employee.profile_id)
                    const color = profile ? getProfileColor(profile.hierarchy_level) : DEFAULT_COLOR
                    return (
                      <tr key={employee.id} className={cn("hover:bg-neutral-50 transition-colors", !employee.is_active && "opacity-50")}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center shrink-0">
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
                          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", color.bg, color.text)}>
                            <Shield className="h-3 w-3" />
                            {profile?.display_name || employee.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {canManage ? (
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
                          ) : (
                            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", employee.is_active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500")}>
                              {employee.is_active ? "Actif" : "Inactif"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-neutral-500">{new Date(employee.created_at).toLocaleDateString('fr-FR')}</span>
                        </td>
                        {canManage && (
                          <td className="px-5 py-4">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => openEmpModal('edit', employee)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteModal(employee)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ═══ TAB: PROFILS ═══ */}
      {tab === 'profils' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-xl border border-neutral-200 animate-pulse" />)}
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Shield className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">Aucun profil configuré</p>
            </div>
          ) : (
            profiles.map((profile) => {
              const color = getProfileColor(profile.hierarchy_level)
              const empCount = employees.filter(e => e.profile_id === profile.id).length
              return (
                <div key={profile.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", color.bg, color.text)}>
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-neutral-950">{profile.display_name}</h3>
                          {profile.is_system && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">SYSTÈME</span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">{profile.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            {profile.base_route}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCog className="h-3 w-3" />
                            {empCount} employé{empCount !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            Niveau {profile.hierarchy_level}
                          </span>
                        </div>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex gap-1">
                        <button onClick={() => openProfileModal('edit', profile)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        {!profile.is_system && (
                          <button onClick={() => setDeleteProfileModal(profile)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ═══ MODAL: Employé (create/edit) ═══ */}
      {empModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEmpModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-950">
                {empModal.type === 'edit' ? "Modifier l'employé" : "Nouvel employé"}
              </h3>
              <button onClick={() => setEmpModal(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Nom complet *</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={empForm.full_name}
                  onChange={(e) => setEmpForm({ ...empForm, full_name: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Identifiant *</label>
                <input
                  type="text"
                  placeholder="jean.dupont"
                  value={empForm.username}
                  onChange={(e) => setEmpForm({ ...empForm, username: e.target.value.toLowerCase().replace(/\s/g, '.') })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Mot de passe {empModal.type === 'create' ? '*' : '(laisser vide pour ne pas changer)'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={empForm.password}
                  onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Profil *</label>
                <div className="mt-2 space-y-2">
                  {profiles.map((profile) => {
                    const color = getProfileColor(profile.hierarchy_level)
                    return (
                      <label
                        key={profile.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          empForm.profile_id === profile.id
                            ? "border-neutral-950 bg-neutral-50"
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        <input
                          type="radio"
                          name="profile"
                          value={profile.id}
                          checked={empForm.profile_id === profile.id}
                          onChange={() => setEmpForm({ ...empForm, profile_id: profile.id })}
                          className="sr-only"
                        />
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", color.bg, color.text)}>
                          <Shield className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-950">{profile.display_name}</p>
                          <p className="text-xs text-neutral-500">{profile.description}</p>
                        </div>
                        {empForm.profile_id === profile.id && (
                          <Check className="h-4 w-4 text-neutral-950" />
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEmpModal(null)} className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                Annuler
              </button>
              <button onClick={handleSaveEmployee} disabled={isSaving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">
                {isSaving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Profil (create/edit) ═══ */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setProfileModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-950">
                {profileModal.type === 'edit' ? "Modifier le profil" : "Nouveau profil"}
              </h3>
              <button onClick={() => setProfileModal(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Nom technique *</label>
                <input
                  type="text"
                  placeholder="superviseur"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  disabled={profileModal.profile?.is_system}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Libellé *</label>
                <input
                  type="text"
                  placeholder="Superviseur"
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="Description du profil"
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Niveau hiérarchique</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={profileForm.hierarchy_level}
                  onChange={(e) => setProfileForm({ ...profileForm, hierarchy_level: parseInt(e.target.value) || 5 })}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
                <p className="text-[10px] text-neutral-400 mt-1">1 = plus élevé, 10 = plus bas</p>
              </div>
            </div>

            {/* Base route */}
            <div className="mb-6">
              <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="h-3 w-3" />
                Page d'accueil après connexion
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVAILABLE_ROUTES.map((route) => (
                  <button
                    key={route.value}
                    onClick={() => setProfileForm({ ...profileForm, base_route: route.value })}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                      profileForm.base_route === route.value
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    )}
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  Permissions ({profilePerms.size}/{allPermissions.length})
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProfilePerms(new Set(allPermissions.map(p => p.id)))}
                    className="text-[10px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setProfilePerms(new Set())}
                    className="text-[10px] font-medium text-neutral-500 hover:text-neutral-700"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(permsByCategory).map(([category, perms]) => {
                  const allSelected = perms.every(p => profilePerms.has(p.id))
                  const someSelected = perms.some(p => profilePerms.has(p.id))
                  return (
                    <div key={category} className="border border-neutral-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategoryPermissions(category)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                      >
                        <span className="text-xs font-semibold text-neutral-700">{category}</span>
                        <div className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                          allSelected ? "bg-neutral-950 border-neutral-950" :
                          someSelected ? "bg-neutral-400 border-neutral-400" :
                          "border-neutral-300"
                        )}>
                          {(allSelected || someSelected) && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                      <div className="divide-y divide-neutral-100">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                          >
                            <div className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              profilePerms.has(perm.id) ? "bg-neutral-950 border-neutral-950" : "border-neutral-300"
                            )}>
                              {profilePerms.has(perm.id) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-neutral-800">{perm.display_name}</p>
                              <p className="text-[10px] text-neutral-400">{perm.id}</p>
                            </div>
                            {perm.id.endsWith('.manage') ? (
                              <Settings2 className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-blue-400" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-neutral-100">
              <button onClick={() => setProfileModal(null)} className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                Annuler
              </button>
              <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">
                {isSaving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Supprimer employé ═══ */}
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
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                Annuler
              </button>
              <button onClick={handleDeleteEmployee} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Supprimer profil ═══ */}
      {deleteProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteProfileModal(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-950 mb-2">Supprimer le profil ?</h3>
              <p className="text-sm text-neutral-500">
                Le profil <strong>{deleteProfileModal.display_name}</strong> et toutes ses permissions seront supprimés.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteProfileModal(null)} className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
                Annuler
              </button>
              <button onClick={handleDeleteProfile} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
