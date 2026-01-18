"use client"

import { useEffect, useState } from "react"
import { Settings, Building2, Clock, CreditCard, Bell, Save, Check } from "lucide-react"
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
}

export default function ParametresPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'horaires' | 'reservations' | 'notifications'>('general')
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

  useEffect(() => {
    loadSettings()
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
          {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
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
                        value={settings.business_phone}
                        onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                        placeholder="+225 XX XX XX XX XX"
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={settings.business_email}
                        onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                        placeholder="contact@padelhouse.ci"
                        className="mt-1.5 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Adresse</label>
                      <textarea
                        value={settings.business_address}
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
    </div>
  )
}
