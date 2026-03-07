import { createClient } from '@/lib/supabase/client'
import type { Package, ClientPackage, ClientPackageSession } from '@/types/database'

// ─── Package definitions ─────────────────────────────────────────────

export async function getPackages() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Package[]
}

export async function getPackageTimeSlotIds(packageId: number): Promise<number[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('package_time_slots')
    .select('time_slot_id')
    .eq('package_id', packageId)

  if (error) throw error
  return (data || []).map((r: { time_slot_id: number }) => r.time_slot_id)
}

export async function setPackageTimeSlots(packageId: number, timeSlotIds: number[]) {
  const supabase = createClient()
  // Delete existing
  const { error: delError } = await supabase
    .from('package_time_slots')
    .delete()
    .eq('package_id', packageId)
  if (delError) throw delError

  // Insert new
  if (timeSlotIds.length > 0) {
    const rows = timeSlotIds.map(tsId => ({ package_id: packageId, time_slot_id: tsId }))
    const { error: insError } = await supabase
      .from('package_time_slots')
      .insert(rows)
    if (insError) throw insError
  }
}

export async function getPackageById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Package
}

export async function createPackage(pkg: {
  name: string
  description?: string
  total_sessions: number
  price: number
  regular_price: number
  is_active?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('packages')
    .insert({
      ...pkg,
      duration_minutes: 60,
      is_active: pkg.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return data as Package
}

export async function updatePackage(id: number, updates: Partial<Package>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('packages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Package
}

export async function deletePackage(id: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Client packages (assigned to players) ───────────────────────────

export async function getClientPackages(filters?: {
  userId?: string
  status?: string
  packageId?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('client_packages')
    .select(`
      *,
      package:packages(*),
      user:profiles!client_packages_user_id_fkey(id, first_name, last_name, email, phone)
    `)
    .order('created_at', { ascending: false })

  if (filters?.userId) query = query.eq('user_id', filters.userId)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.packageId) query = query.eq('package_id', filters.packageId)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as ClientPackage[]
}

export async function getClientPackageById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_packages')
    .select(`
      *,
      package:packages(*),
      user:profiles!client_packages_user_id_fkey(id, first_name, last_name, email, phone)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ClientPackage
}

export async function assignPackageToUser(assignment: {
  package_id: number
  user_id: string
  sessions_total: number
  paid_amount: number
  payment_method?: string
  notes?: string
  assigned_by?: string
  expires_at?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_packages')
    .insert({
      ...assignment,
      status: 'ACTIVE',
      sessions_used: 0,
    })
    .select(`
      *,
      package:packages(*),
      user:profiles!client_packages_user_id_fkey(id, first_name, last_name, email, phone)
    `)
    .single()

  if (error) throw error
  return data as unknown as ClientPackage
}

export async function updateClientPackage(id: number, updates: Partial<ClientPackage>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_packages')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ClientPackage
}

// ─── Sessions (consumed from a client package) ───────────────────────

export async function getClientPackageSessions(clientPackageId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_package_sessions')
    .select(`
      *,
      terrain:terrains(id, code),
      time_slot:time_slots(id, start_time, end_time, price)
    `)
    .eq('client_package_id', clientPackageId)
    .order('session_date', { ascending: false })

  if (error) throw error
  return data as unknown as ClientPackageSession[]
}

export async function addPackageSession(session: {
  client_package_id: number
  reservation_id?: number
  session_date: string
  terrain_id?: number
  time_slot_id?: number
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_package_sessions')
    .insert({
      ...session,
      status: 'USED',
    })
    .select()
    .single()

  if (error) throw error
  return data as ClientPackageSession
}

export async function cancelPackageSession(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_package_sessions')
    .update({ status: 'CANCELLED' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ClientPackageSession
}

// ─── For reservation page: get active packages for a user ────────────

export async function getActiveClientPackagesForUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_packages')
    .select(`
      *,
      package:packages(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as ClientPackage[]
}

export async function getPackageTimeSlotIdsForPackage(packageId: number): Promise<number[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('package_time_slots')
    .select('time_slot_id')
    .eq('package_id', packageId)

  if (error) throw error
  return (data || []).map((r: { time_slot_id: number }) => r.time_slot_id)
}
