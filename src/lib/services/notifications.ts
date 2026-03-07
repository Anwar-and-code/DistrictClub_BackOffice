import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────
export type NotificationType = 'reservation_confirmed' | 'reservation_reminder' | 'event_published' | 'custom'
export type TargetType = 'single' | 'multiple' | 'all'

export interface NotificationLog {
  id: number
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
  target_type: TargetType
  target_user_ids: string[]
  total_sent: number
  total_failed: number
  sent_by: string | null
  created_at: string
}

export interface SendNotificationParams {
  type: NotificationType
  title: string
  body: string
  data?: Record<string, string>
  target_type: TargetType
  target_user_ids?: string[]
  sent_by?: string
}

export interface SendNotificationResult {
  success: boolean
  sent: number
  failed: number
  total_tokens?: number
  message?: string
  error?: string
}

export interface NotificationStats {
  total_notifications: number
  total_sent: number
  total_failed: number
  active_devices: number
  by_type: Record<string, number>
}

export interface Joueur {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
}

export const PAGE_SIZE = 15

// ─── Labels & Config ──────────────────────────────────────────────────
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  reservation_confirmed: 'Réservation confirmée',
  reservation_reminder: 'Rappel de réservation',
  event_published: 'Événement publié',
  custom: 'Personnalisée',
}

export const NOTIFICATION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'reservation_confirmed', label: 'Réservation confirmée' },
  { value: 'reservation_reminder', label: 'Rappel de réservation' },
  { value: 'event_published', label: 'Événement publié' },
  { value: 'custom', label: 'Personnalisée' },
]

export const NOTIFICATION_TARGET_LABELS: Record<string, string> = {
  single: 'Un joueur',
  multiple: 'Plusieurs joueurs',
  all: 'Tous les joueurs',
}

// ─── API ──────────────────────────────────────────────────────────────

export async function sendPushNotification(
  params: SendNotificationParams
): Promise<SendNotificationResult> {
  const res = await fetch('/api/send-push-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  const result = await res.json()
  if (!res.ok) {
    throw new Error(result.error || 'Erreur lors de l\'envoi de la notification')
  }
  return result as SendNotificationResult
}

export async function getNotificationLogs(params: {
  page: number
  type?: string
  search?: string
}): Promise<{ data: NotificationLog[]; count: number }> {
  const supabase = createClient()
  const from = (params.page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('notification_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params.type) {
    query = query.eq('type', params.type)
  }

  if (params.search?.trim()) {
    const q = params.search.trim()
    query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data || []) as NotificationLog[], count: count ?? 0 }
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const supabase = createClient()

  const [logsResult, tokensResult] = await Promise.all([
    supabase
      .from('notification_logs')
      .select('type, total_sent, total_failed'),
    supabase
      .from('fcm_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  if (logsResult.error) throw logsResult.error
  if (tokensResult.error) throw tokensResult.error

  const logs = logsResult.data || []
  const byType: Record<string, number> = {}
  let totalSent = 0
  let totalFailed = 0

  for (const log of logs) {
    totalSent += log.total_sent || 0
    totalFailed += log.total_failed || 0
    byType[log.type] = (byType[log.type] || 0) + 1
  }

  return {
    total_notifications: logs.length,
    total_sent: totalSent,
    total_failed: totalFailed,
    active_devices: tokensResult.count ?? 0,
    by_type: byType,
  }
}

export async function getJoueurs(search?: string): Promise<Joueur[]> {
  const supabase = createClient()
  let query = supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone')
    .eq('role', 'JOUEUR')
    .order('first_name', { ascending: true })

  if (search?.trim()) {
    const q = search.trim()
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  const { data, error } = await query.limit(50)
  if (error) throw error
  return (data || []) as Joueur[]
}
