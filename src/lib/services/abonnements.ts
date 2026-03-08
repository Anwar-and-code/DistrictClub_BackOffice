import { createClient } from '@/lib/supabase/client'
import type { Abonnement } from '@/types/database'

const ABONNEMENT_SELECT = `
  id,
  user_id,
  terrain_id,
  time_slot_id,
  day_of_week,
  start_date,
  end_date,
  status,
  notes,
  created_by,
  created_at,
  updated_at,
  user:profiles!abonnements_user_id_fkey(id, first_name, last_name, email, phone, role),
  terrain:terrains(id, code),
  time_slot:time_slots(id, start_time, end_time, price)
`

export async function getAbonnements(filters?: {
  status?: string
  userId?: string
}) {
  const supabase = createClient()

  let query = supabase
    .from('abonnements')
    .select(ABONNEMENT_SELECT)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching abonnements:', error)
    throw error
  }
  return (data || []) as unknown as Abonnement[]
}

export async function getAbonnementById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('abonnements')
    .select(ABONNEMENT_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as Abonnement
}

export async function createAbonnement(abonnement: {
  user_id: string
  terrain_id: number
  time_slot_id: number
  day_of_week: number
  start_date: string
  end_date: string
  notes?: string
  created_by?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('abonnements')
    .insert({
      ...abonnement,
      status: 'ACTIVE',
    })
    .select(ABONNEMENT_SELECT)
    .single()

  if (error) throw error
  return data as unknown as Abonnement
}

export async function updateAbonnement(id: number, updates: Partial<{
  terrain_id: number
  time_slot_id: number
  day_of_week: number
  start_date: string
  end_date: string
  status: string
  notes: string | null
}>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('abonnements')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ABONNEMENT_SELECT)
    .single()

  if (error) throw error
  return data as unknown as Abonnement
}

export async function deleteAbonnement(id: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('abonnements')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Generate reservations for an abonnement between start_date and end_date
 * for the specified day_of_week.
 */
export async function generateAbonnementReservations(abonnement: {
  user_id: string
  terrain_id: number
  time_slot_id: number
  day_of_week: number
  start_date: string
  end_date: string
}) {
  const supabase = createClient()
  const dates = getRecurringDates(
    abonnement.start_date,
    abonnement.end_date,
    abonnement.day_of_week
  )

  if (dates.length === 0) return { created: 0, skipped: 0 }

  let created = 0
  let skipped = 0

  for (const date of dates) {
    // Check if slot is already reserved
    const { data: existing } = await supabase
      .from('reservations')
      .select('id')
      .eq('terrain_id', abonnement.terrain_id)
      .eq('time_slot_id', abonnement.time_slot_id)
      .eq('reservation_date', date)
      .neq('status', 'CANCELED')
      .limit(1)

    if (existing && existing.length > 0) {
      skipped++
      continue
    }

    const { error } = await supabase
      .from('reservations')
      .insert({
        terrain_id: abonnement.terrain_id,
        time_slot_id: abonnement.time_slot_id,
        reservation_date: date,
        user_id: abonnement.user_id,
        status: 'CONFIRMED',
      })

    if (error) {
      console.error(`Error creating reservation for ${date}:`, error)
      skipped++
    } else {
      created++
    }
  }

  return { created, skipped }
}

/**
 * Get all dates matching a specific day_of_week between start and end dates.
 * day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
function getRecurringDates(startDate: string, endDate: string, dayOfWeek: number): string[] {
  const dates: string[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  // Find first occurrence of dayOfWeek on or after start
  const current = new Date(start)
  while (current.getDay() !== dayOfWeek) {
    current.setDate(current.getDate() + 1)
  }

  // Iterate weekly
  while (current <= end) {
    const yyyy = current.getFullYear()
    const mm = String(current.getMonth() + 1).padStart(2, '0')
    const dd = String(current.getDate()).padStart(2, '0')
    dates.push(`${yyyy}-${mm}-${dd}`)
    current.setDate(current.getDate() + 7)
  }

  return dates
}
