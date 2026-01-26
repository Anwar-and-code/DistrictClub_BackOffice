import { createClient as createSupabaseClient } from '@/lib/supabase/client'

export interface Client {
  id: string
  full_name: string
  phone: string
  created_at: string
  updated_at: string
}

export async function getClientByPhone(phone: string): Promise<Client | null> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }
  return data as Client | null
}

export async function createNewClient(fullName: string, phone: string): Promise<Client> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({ full_name: fullName, phone })
    .select()
    .single()

  if (error) throw error
  return data as Client
}

export async function getOrCreateClient(fullName: string, phone: string): Promise<Client> {
  const existing = await getClientByPhone(phone)
  if (existing) {
    return existing
  }
  return createNewClient(fullName, phone)
}
