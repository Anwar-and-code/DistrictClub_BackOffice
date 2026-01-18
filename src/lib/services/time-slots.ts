import { createClient } from '@/lib/supabase/client'
import type { TimeSlot } from '@/types/database'

const supabase = createClient()

export async function getTimeSlots() {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .order('start_time', { ascending: true })

  if (error) throw error
  return data as TimeSlot[]
}

export async function getTimeSlotById(id: string) {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as TimeSlot
}

export async function updateTimeSlot(id: string, updates: Partial<TimeSlot>) {
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

export async function deleteTimeSlot(id: string) {
  const { error } = await supabase
    .from('time_slots')
    .delete()
    .eq('id', id)

  if (error) throw error
}
