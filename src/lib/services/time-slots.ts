import { createClient } from '@/lib/supabase/client'
import type { TimeSlot } from '@/types/database'

export async function getTimeSlots() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .order('start_time', { ascending: true })

  if (error) throw error
  return data as TimeSlot[]
}

export async function getTimeSlotById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as TimeSlot
}

export async function updateTimeSlot(id: number, updates: Partial<TimeSlot>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TimeSlot
}

export async function createTimeSlot(timeSlot: {
  start_time: string
  end_time: string
  price: number
  is_active?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_slots')
    .insert({
      ...timeSlot,
      is_active: timeSlot.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return data as TimeSlot
}

export async function deleteTimeSlot(id: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('time_slots')
    .delete()
    .eq('id', id)

  if (error) throw error
}
