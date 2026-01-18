"use client"

import { useEffect, useState } from "react"
import { Bell, Calendar, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: 'new_reservation' | 'cancelled_reservation' | 'new_user'
  title: string
  message: string
  created_at: string
  read: boolean
  data?: Record<string, unknown>
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const loadNotifications = async () => {
    try {
      // Get recent reservations as notifications
      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          id,
          status,
          created_at,
          reservation_date,
          user:profiles(full_name, email),
          terrain:terrains(code),
          time_slot:time_slots(start_time, end_time)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      const notifs: Notification[] = (reservations || []).map((r) => {
        const user = r.user as { full_name?: string; email?: string } | null
        const terrain = r.terrain as { code?: string } | null
        return {
          id: r.id,
          type: r.status === 'CANCELLED' ? 'cancelled_reservation' : 'new_reservation',
          title: r.status === 'CANCELLED' ? 'Réservation annulée' : 'Nouvelle réservation',
          message: `${user?.full_name || user?.email || 'Utilisateur'} - Terrain ${terrain?.code || '?'} le ${new Date(r.reservation_date).toLocaleDateString('fr-FR')}`,
          created_at: r.created_at,
          read: false,
          data: r as Record<string, unknown>,
        }
      })

      setNotifications(notifs)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications.slice(0, 5)

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}min`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-950">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex gap-3 p-4 hover:bg-neutral-50 transition-colors cursor-pointer",
                        !notif.read && "bg-blue-50/50"
                      )}
                    >
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                        notif.type === 'new_reservation' ? "bg-emerald-100" : "bg-red-100"
                      )}>
                        {notif.type === 'new_reservation' ? (
                          <Calendar className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-950">{notif.title}</p>
                        <p className="text-xs text-neutral-500 truncate">{notif.message}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">{formatTime(notif.created_at)}</p>
                      </div>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50">
              <a
                href="/reservations"
                className="text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
              >
                Voir toutes les réservations →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
