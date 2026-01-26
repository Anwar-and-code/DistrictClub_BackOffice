import { createClient } from '@/lib/supabase/client'
import type { Reservation, AvailableSlot } from '@/types/database'

export async function isSlotAvailable(
  terrainId: number,
  timeSlotId: number,
  date: string
): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('terrain_id', terrainId)
    .eq('time_slot_id', timeSlotId)
    .eq('reservation_date', date)
    .neq('status', 'CANCELED')
    .limit(1)

  if (error) throw error
  return !data || data.length === 0
}

export async function getReservations(filters?: {
  date?: string
  status?: string
  terrainId?: string
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('reservations')
    .select(`
      id,
      reservation_date,
      status,
      created_at,
      terrain_id,
      time_slot_id,
      user_id,
      client_id,
      terrain:terrains(id, code),
      time_slot:time_slots(id, start_time, end_time, price),
      user:profiles!reservations_user_id_profiles_fkey(id, first_name, last_name, email, phone),
      client:clients(id, full_name, phone)
    `)
    .order('reservation_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.date) {
    query = query.eq('reservation_date', filters.date)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.terrainId) {
    query = query.eq('terrain_id', filters.terrainId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reservations:', error)
    throw error
  }
  return (data || []) as unknown as Reservation[]
}

export async function getReservationById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      terrain:terrains(id, code, is_active),
      time_slot:time_slots(id, start_time, end_time, price),
      user:profiles!reservations_user_id_profiles_fkey(id, first_name, last_name, email, phone)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Reservation
}

export async function updateReservationStatus(id: number, status: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Reservation
}

export async function deleteReservation(id: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAvailableSlots(date: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('get_available_slots', { p_date: date })

  if (error) throw error
  return data as AvailableSlot[]
}

export async function createReservation(reservation: {
  terrain_id: number
  time_slot_id: number
  reservation_date: string
  user_id: string
  status?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      ...reservation,
      status: reservation.status || 'CONFIRMED',
    })
    .select(`
      *,
      terrain:terrains(id, code),
      time_slot:time_slots(id, start_time, end_time, price)
    `)
    .single()

  if (error) throw error
  return data as Reservation
}

const MANUAL_RESERVATION_USER_ID = 'fdf34d9a-5024-4f27-8e46-0f34151f7d7c'

async function getManualReservationUserId(): Promise<string> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('app_settings')
      .select('manual_reservation_user_id')
      .eq('id', 1)
      .single()
    
    if (error || !data?.manual_reservation_user_id) {
      return MANUAL_RESERVATION_USER_ID
    }
    return data.manual_reservation_user_id
  } catch {
    return MANUAL_RESERVATION_USER_ID
  }
}

export async function createReservationWithClient(reservation: {
  terrain_id: number
  time_slot_id: number
  reservation_date: string
  client_id: string
  status?: string
}) {
  const supabase = createClient()
  const userId = await getManualReservationUserId()
  
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      terrain_id: reservation.terrain_id,
      time_slot_id: reservation.time_slot_id,
      reservation_date: reservation.reservation_date,
      user_id: userId,
      client_id: reservation.client_id,
      status: reservation.status || 'CONFIRMED',
    })
    .select(`
      *,
      terrain:terrains(id, code),
      time_slot:time_slots(id, start_time, end_time, price)
    `)
    .single()

  if (error) throw error
  return data as Reservation
}
