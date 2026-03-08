"use client"

import { useEffect, useState } from "react"
import { Settings, Building2, Clock, CreditCard, Bell, Save, Check, Wallet, GripVertical, Lock, ShoppingBag, LayoutGrid, Plus, Pencil, Trash2, X, Circle, Square, RectangleHorizontal, Users, Keyboard, Loader2 } from "lucide-react"
import { useVirtualKeyboardEnabled } from "@/components/ui/virtual-keyboard"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface AppSettings {
  business_name: string
  business_phone: string
  business_email: string
  business_address: string
  opening_time: string
  closing_time: string
  min_advance_booking: number
  max_advance_booking: number
  cancellation_deadline: number
  currency: string
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
  manual_reservation_user_id: string | null
  security_code: string
  default_tax_rate: number
}

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

interface PaymentMethod {
  id: number
  name: string
  is_active: boolean
  display_order: number
}

interface PosTable {
  id: number
  name: string
  capacity: number
  position_x: number
  position_y: number
  shape: 'round' | 'square' | 'rectangle'
  is_active: boolean
}

const defaultSettings: AppSettings = {
  business_name: "Padel House",
  business_phone: "",
  business_email: "",
  business_address: "",
  opening_time: "08:00",
  closing_time: "23:00",
  min_advance_booking: 1,
  max_advance_booking: 14,
  cancellation_deadline: 24,
  currency: "FCFA",
  notifications_enabled: true,
  email_notifications: true,
  sms_notifications: false,
  manual_reservation_user_id: null,
  security_code: "0451373",
  default_tax_rate: 0,
}

export default function ParametresPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'horaires' | 'reservations' | 'caisse' | 'tables' | 'paiements' | 'securite' | 'notifications'>('general')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [tables, setTables] = useState<PosTable[]>([])
  const [tableModal, setTableModal] = useState<{ type: 'create' | 'edit'; table?: PosTable } | null>(null)
  const [tableForm, setTableForm] = useState({ name: '', capacity: '2', shape: 'round' as 'round' | 'square' | 'rectangle' })
  const [isSavingTable, setIsSavingTable] = useState(false)
  const [vkEnabled, setVkEnabled] = useVirtualKeyboardEnabled()
  const supabase = createClient()

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('email')
      
      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('display_order')
      
      console.log('Payment methods:', data, 'Error:', error)
      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error('Load payment methods error:', error)
    }
  }

  const togglePaymentMethod = async (id: number, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      setPaymentMethods(prev => prev.map(pm => pm.id === id ? { ...pm, is_active } : pm))
      toast.success(is_active ? "Mode de paiement activé" : "Mode de paiement désactivé")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const loadTables = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_tables')
        .select('*')
        .order('name')
      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const openTableModal = (type: 'create' | 'edit', table?: PosTable) => {
    if (type === 'edit' && table) {
      setTableForm({ name: table.name, capacity: table.capacity.toString(), shape: table.shape })
    } else {
      setTableForm({ name: '', capacity: '2', shape: 'round' })
    }
    setTableModal({ type, table })
  }

  const handleSaveTable = async () => {
    if (!tableForm.name.trim()) { toast.error('Le nom est obligatoire'); return }
    setIsSavingTable(true)
    try {
      const payload = {
        name: tableForm.name.trim(),
        capacity: parseInt(tableForm.capacity) || 2,
        shape: tableForm.shape,
      }
      if (tableModal?.type === 'edit' && tableModal.table) {
        const { error } = await supabase.from('pos_tables').update(payload).eq('id', tableModal.table.id)
        if (error) throw error
        toast.success('Table modifiée')
      } else {
        const { error } = await supabase.from('pos_tables').insert(payload)
        if (error) throw error
        toast.success('Table créée')
      }
      setTableModal(null)
      loadTables()
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setIsSavingTable(false)
    }
  }

  const handleDeleteTable = async (id: number) => {
    try {
      const { error } = await supabase.from('pos_tables').update({ is_active: false }).eq('id', id)
      if (error) throw error
      toast.success('Table supprimée')
      loadTables()
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de la suppression')
    }
  }

  useEffect(() => {
    loadSettings()
    loadProfiles()
    loadPaymentMethods()
    loadTables()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ id: 1, ...settings })
      
      if (error) throw error
      toast.success("Paramètres enregistrés")
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Building2 },
    { id: 'horaires', label: 'Horaires', icon: Clock },
    { id: 'reservations', label: 'Réservations', icon: CreditCard },
    { id: 'caisse', label: 'Caisse & Produits', icon: ShoppingBag },
    { id: 'tables', label: 'Plan de salle', icon: LayoutGrid },
    { id: 'paiements', label: 'Mode de paiement', icon: Wallet },
    { id: 'securite', label: 'Code de sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Paramètres</h1>
          <p className="text-sm text-neutral-500 mt-1">Configuration générale de l'application</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-neutral-200 p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-1">Informations de l'établissement</h3>
                    <p className="text-sm text-neutral-500 mb-6">Ces informations seront affichées aux clients</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Nom de l'établissement</label>
                      <input
                        type="text"
                        value={settings.business_name}
                        onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Téléphone</label>
                      <input
                        type="tel"
                        value={settings.business_phone ?? ''}
                        onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                        placeholder="+225 XX XX XX XX XX"
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={settings.business_email ?? ''}
                        onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                        placeholder="contact@padelhouse.ci"
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Adresse</label>
                      <textarea
                        value={settings.business_address ?? ''}
                        onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                        placeholder="Abidjan, Côte d'Ivoire"
                        rows={2}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Horaires Tab */}
              {activeTab === 'horaires' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-1">Horaires d'ouverture</h3>
                    <p className="text-sm text-neutral-500 mb-6">Définissez les heures d'ouverture et de fermeture</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Heure d'ouverture</label>
                      <input
                        type="time"
                        value={settings.opening_time}
                        onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Heure de fermeture</label>
                      <input
                        type="time"
                        value={settings.closing_time}
                        onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      <strong>Note :</strong> Les créneaux horaires sont gérés dans la section "Créneaux" du menu principal.
                    </p>
                  </div>
                </div>
              )}

              {/* Reservations Tab */}
              {activeTab === 'reservations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-1">Règles de réservation</h3>
                    <p className="text-sm text-neutral-500 mb-6">Configurez les contraintes de réservation</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Réservation minimum à l'avance (heures)</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.min_advance_booking}
                        onChange={(e) => setSettings({ ...settings, min_advance_booking: parseInt(e.target.value) || 0 })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Nombre d'heures minimum avant le créneau pour réserver</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Réservation maximum à l'avance (jours)</label>
                      <input
                        type="number"
                        min={1}
                        value={settings.max_advance_booking}
                        onChange={(e) => setSettings({ ...settings, max_advance_booking: parseInt(e.target.value) || 1 })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Nombre de jours maximum à l'avance pour réserver</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Délai d'annulation (heures)</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.cancellation_deadline}
                        onChange={(e) => setSettings({ ...settings, cancellation_deadline: parseInt(e.target.value) || 0 })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Nombre d'heures minimum avant le créneau pour annuler</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Devise</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                      >
                        <option value="FCFA">FCFA (Franc CFA)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="USD">USD (Dollar US)</option>
                      </select>
                    </div>
                    
                    <div className="pt-4 border-t border-neutral-200">
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Réservation manuelle - Utilisateur par défaut</label>
                      <select
                        value={settings.manual_reservation_user_id || ''}
                        onChange={(e) => setSettings({ ...settings, manual_reservation_user_id: e.target.value || null })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                      >
                        <option value="">-- Sélectionner un utilisateur --</option>
                        {profiles.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.email} {profile.first_name && profile.last_name ? `(${profile.first_name} ${profile.last_name})` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-neutral-500 mt-1">Utilisateur associé aux réservations créées manuellement depuis le backoffice</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Caisse Tab */}
              {activeTab === 'caisse' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-1">Caisse & Produits</h3>
                    <p className="text-sm text-neutral-500 mb-6">Paramètres par défaut pour la tarification des produits</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Taux de taxe par défaut (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={settings.default_tax_rate}
                        onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) || 0 })}
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Ce taux sera appliqué par défaut lors de la création d'un nouveau produit (0% = pas de taxe)</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <h4 className="text-sm font-semibold text-neutral-950 mb-4 flex items-center gap-2">
                      <Keyboard className="h-4 w-4" />
                      Clavier virtuel
                    </h4>
                    <label className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-neutral-950">Clavier automatique</p>
                        <p className="text-xs text-neutral-500">Afficher un clavier virtuel à l&apos;écran lorsqu&apos;un champ est sélectionné en caisse</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={vkEnabled}
                          onChange={(e) => setVkEnabled(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-11 h-6 rounded-full transition-colors",
                          vkEnabled ? "bg-neutral-950" : "bg-neutral-200"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                            vkEnabled && "translate-x-5"
                          )} />
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      <strong>Note :</strong> Les produits existants ne seront pas affectés par le changement de taux de taxe. Le clavier virtuel est sauvegardé localement sur cet appareil.
                    </p>
                  </div>
                </div>
              )}

              {/* Tables Tab */}
              {activeTab === 'tables' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-950 mb-1">Plan de salle</h3>
                      <p className="text-sm text-neutral-500">Gérez les tables du café pour les commandes table</p>
                    </div>
                    <button
                      onClick={() => openTableModal('create')}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une table
                    </button>
                  </div>

                  {tables.filter(t => t.is_active).length === 0 ? (
                    <div className="text-center py-12 text-neutral-400">
                      <LayoutGrid className="h-12 w-12 mx-auto mb-3 stroke-1" />
                      <p className="text-sm">Aucune table configurée</p>
                      <p className="text-xs mt-1">Ajoutez des tables pour utiliser les commandes table dans la caisse</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {tables.filter(t => t.is_active).map((table) => (
                        <div
                          key={table.id}
                          className="relative group border border-neutral-200 rounded-xl p-4 bg-white hover:border-neutral-300 transition-colors"
                        >
                          <div className="flex items-center justify-center mb-3">
                            {table.shape === 'round' ? (
                              <div className="h-14 w-14 rounded-full bg-neutral-100 border-2 border-neutral-300 flex items-center justify-center">
                                <span className="text-sm font-bold text-neutral-600">{table.name}</span>
                              </div>
                            ) : table.shape === 'rectangle' ? (
                              <div className="h-10 w-20 rounded-lg bg-neutral-100 border-2 border-neutral-300 flex items-center justify-center">
                                <span className="text-sm font-bold text-neutral-600">{table.name}</span>
                              </div>
                            ) : (
                              <div className="h-14 w-14 rounded-lg bg-neutral-100 border-2 border-neutral-300 flex items-center justify-center">
                                <span className="text-sm font-bold text-neutral-600">{table.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                              <Users className="h-3 w-3" />
                              {table.capacity} place{table.capacity > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openTableModal('edit', table)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTable(table.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Paiements Tab */}
              {activeTab === 'paiements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-1">Modes de paiement</h3>
                    <p className="text-sm text-neutral-500 mb-6">Gérez les modes de paiement acceptés</p>
                  </div>
                  
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-neutral-400">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-950">{method.name}</p>
                          </div>
                        </div>
                        <label className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            checked={method.is_active}
                            onChange={(e) => togglePaymentMethod(method.id, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-11 h-6 rounded-full transition-colors",
                            method.is_active ? "bg-neutral-950" : "bg-neutral-200"
                          )}>
                            <div className={cn(
                              "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                              method.is_active && "translate-x-5"
                            )} />
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {paymentMethods.length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                      <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Aucun mode de paiement configuré</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sécurité Tab */}
              {activeTab === 'securite' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-1">Code de sécurité</h3>
                    <p className="text-sm text-neutral-500 mb-6">Code utilisé pour les opérations sensibles</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Code de sécurité</label>
                    <input
                      type="text"
                      value={settings.security_code ?? ''}
                      onChange={(e) => setSettings({ ...settings, security_code: e.target.value })}
                      placeholder="Entrez le code de sécurité"
                      className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 font-mono tracking-widest"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Ce code sera demandé pour valider certaines actions</p>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-1">Notifications</h3>
                    <p className="text-sm text-neutral-500 mb-6">Configurez les alertes et notifications</p>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-neutral-950">Activer les notifications</p>
                        <p className="text-xs text-neutral-500">Recevoir des alertes pour les nouvelles réservations</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings.notifications_enabled}
                          onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-11 h-6 rounded-full transition-colors",
                          settings.notifications_enabled ? "bg-neutral-950" : "bg-neutral-200"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                            settings.notifications_enabled && "translate-x-5"
                          )} />
                        </div>
                      </div>
                    </label>

                    <label className={cn(
                      "flex items-center justify-between p-4 rounded-lg border border-neutral-200 cursor-pointer transition-colors",
                      settings.notifications_enabled ? "hover:bg-neutral-50" : "opacity-50 cursor-not-allowed"
                    )}>
                      <div>
                        <p className="text-sm font-medium text-neutral-950">Notifications par email</p>
                        <p className="text-xs text-neutral-500">Recevoir les alertes par email</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings.email_notifications}
                          onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                          disabled={!settings.notifications_enabled}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-11 h-6 rounded-full transition-colors",
                          settings.email_notifications && settings.notifications_enabled ? "bg-neutral-950" : "bg-neutral-200"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                            settings.email_notifications && settings.notifications_enabled && "translate-x-5"
                          )} />
                        </div>
                      </div>
                    </label>

                    <label className={cn(
                      "flex items-center justify-between p-4 rounded-lg border border-neutral-200 cursor-pointer transition-colors",
                      settings.notifications_enabled ? "hover:bg-neutral-50" : "opacity-50 cursor-not-allowed"
                    )}>
                      <div>
                        <p className="text-sm font-medium text-neutral-950">Notifications SMS</p>
                        <p className="text-xs text-neutral-500">Recevoir les alertes par SMS (frais supplémentaires)</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings.sms_notifications}
                          onChange={(e) => setSettings({ ...settings, sms_notifications: e.target.checked })}
                          disabled={!settings.notifications_enabled}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-11 h-6 rounded-full transition-colors",
                          settings.sms_notifications && settings.notifications_enabled ? "bg-neutral-950" : "bg-neutral-200"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                            settings.sms_notifications && settings.notifications_enabled && "translate-x-5"
                          )} />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Table Modal ─────────────────────────────────────────────── */}
      {tableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-950">
                {tableModal.type === 'create' ? 'Nouvelle table' : 'Modifier la table'}
              </h2>
              <button onClick={() => setTableModal(null)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  placeholder="Ex: T1, Table VIP..."
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Capacité</label>
                <input
                  type="number"
                  min={1}
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Forme</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'round', label: 'Ronde', Icon: Circle },
                    { value: 'square', label: 'Carrée', Icon: Square },
                    { value: 'rectangle', label: 'Rectangle', Icon: RectangleHorizontal },
                  ] as const).map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTableForm({ ...tableForm, shape: value })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-xs font-medium",
                        tableForm.shape === value
                          ? "border-neutral-900 bg-neutral-50 text-neutral-900"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveTable}
              disabled={isSavingTable}
              className="w-full mt-6 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isSavingTable ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSavingTable ? "Enregistrement..." : (tableModal.type === 'create' ? 'Créer' : 'Enregistrer')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
