import { createClient } from '@/lib/supabase/client'
import type { Terrain } from '@/types/database'

const supabase = createClient()

export async function getTerrains() {
  const { data, error } = await supabase
    .from('terrains')
    .select('*')
    .order('code', { ascending: true })

  if (error) throw error
  return data as Terrain[]
}

export async function getTerrainById(id: string) {
  const { data, error } = await supabase
    .from('terrains')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Terrain
}

export async function updateTerrain(id: string, updates: Partial<Terrain>) {
  const { data, error } = await supabase
    .from('terrains')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Terrain
}

export async function createTerrain(terrain: { code: string; name: string; is_active?: boolean }) {
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

export async function deleteTerrain(id: string) {
  const { error } = await supabase
    .from('terrains')
    .delete()
    .eq('id', id)

  if (error) throw error
}
