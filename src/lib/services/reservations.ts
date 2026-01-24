import { createClient } from '@/lib/supabase/client'
import type { Reservation, AvailableSlot } from '@/types/database'

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
      terrain:terrains(id, code),
      time_slot:time_slots(id, start_time, end_time, price),
      user:profiles!reservations_user_id_profiles_fkey(id, first_name, last_name, email, phone)
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
