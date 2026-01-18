import { createClient } from '@/lib/supabase/client'
import type { Reservation, AvailableSlot } from '@/types/database'

const supabase = createClient()

export async function getReservations(filters?: {
  date?: string
  status?: string
  terrainId?: string
}) {
  let query = supabase
    .from('reservations')
    .select(`
      *,
      terrain:terrains(*),
      time_slot:time_slots(*),
      user:profiles(*)
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

  if (error) throw error
  return data as Reservation[]
}

export async function getReservationById(id: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      terrain:terrains(*),
      time_slot:time_slots(*),
      user:profiles(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Reservation
}

export async function updateReservationStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Reservation
}

export async function deleteReservation(id: string) {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAvailableSlots(date: string) {
  const { data, error } = await supabase
    .rpc('get_available_slots', { p_date: date })

  if (error) throw error
  return data as AvailableSlot[]
}

export async function createReservation(reservation: {
  terrain_id: string
  time_slot_id: string
  reservation_date: string
  user_id: string
  status?: string
}) {
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      ...reservation,
      status: reservation.status || 'CONFIRMED',
    })
    .select(`
      *,
      terrain:terrains(*),
      time_slot:time_slots(*)
    `)
    .single()

  if (error) throw error
  return data as Reservation
}
