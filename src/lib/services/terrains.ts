import { createClient } from '@/lib/supabase/client'
import type { Terrain } from '@/types/database'

export async function getTerrains() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('terrains')
    .select('*')
    .order('code', { ascending: true })

  if (error) throw error
  return data as Terrain[]
}

export async function getTerrainById(id: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('terrains')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Terrain
}

export async function updateTerrain(id: number, updates: Partial<Terrain>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('terrains')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Terrain
}

export async function createTerrain(terrain: { code: string; is_active?: boolean }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('terrains')
    .insert({
      ...terrain,
      is_active: terrain.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return data as Terrain
}

export async function deleteTerrain(id: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('terrains')
    .delete()
    .eq('id', id)

  if (error) throw error
}
