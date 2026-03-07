import { createClient } from '@/lib/supabase/client'
import type { Event, EventImage } from '@/types/database'

export async function getEvents() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, event_images(*)')
    .order('display_order', { ascending: true })
    .order('start_date', { ascending: true })

  if (error) {
    console.error('getEvents error:', error)
    throw error
  }
  return (data || []) as unknown as Event[]
}

export async function getEventById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, event_images(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as Event
}

export interface EventInput {
  title: string
  subtitle?: string | null
  description: string
  long_description?: string | null
  category: string
  status: string
  start_date: string
  end_date?: string | null
  location: string
  cover_image_url?: string | null
  is_featured?: boolean
  display_order?: number
  tags?: string[] | null
  price_info?: string | null
  is_free?: boolean
  contact_phone?: string | null
}

export async function createEvent(event: EventInput) {
  const supabase = createClient()

  // Strip undefined values to avoid sending non-existent columns
  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(event)) {
    if (value !== undefined) {
      payload[key] = value
    }
  }

  console.log('createEvent payload:', JSON.stringify(payload, null, 2))
  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('createEvent error:', JSON.stringify(error, null, 2), 'code:', error.code, 'message:', error.message, 'details:', error.details, 'hint:', error.hint)
    throw new Error(error.message || error.details || `Insert failed (code: ${error.code})`)
  }
  console.log('createEvent success:', data)
  return data as unknown as Event
}

export async function updateEvent(id: string, updates: Partial<EventInput>) {
  const supabase = createClient()

  // Strip undefined values to avoid sending non-existent columns
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      payload[key] = value
    }
  }

  console.log('updateEvent id:', id, 'payload:', JSON.stringify(payload, null, 2))
  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateEvent error:', JSON.stringify(error, null, 2), 'code:', error.code, 'message:', error.message, 'details:', error.details, 'hint:', error.hint)
    throw new Error(error.message || error.details || `Update failed (code: ${error.code})`)
  }
  console.log('updateEvent success:', data)
  return data as unknown as Event
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function uploadEventImage(file: File): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { error } = await supabase.storage
    .from('event-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('event-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export async function addEventImage(
  eventId: string,
  imageUrl: string,
  caption?: string,
  displayOrder?: number
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('event_images')
    .insert({
      event_id: eventId,
      image_url: imageUrl,
      caption: caption || null,
      display_order: displayOrder || 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as EventImage
}

export async function deleteEventImage(imageId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('event_images')
    .delete()
    .eq('id', imageId)

  if (error) throw error
}
