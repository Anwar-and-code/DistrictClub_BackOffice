import { createClient } from '@/lib/supabase/client'
import type { EmployeeWithProfile } from '@/lib/permissions'

export interface Employee {
  id: string
  username: string
  full_name: string | null
  role: string
  is_active: boolean
  profile_id: string | null
  profile_name: string | null
  profile_display_name: string | null
  base_route: string
  hierarchy_level: number
  permissions: string[]
}

export async function loginEmployee(username: string, password: string): Promise<Employee | null> {
  const supabase = createClient()
  
  // Try v2 first (with profiles), fallback to v1
  const { data, error } = await supabase
    .rpc('verify_employee_password_v2', {
      p_username: username,
      p_password: password
    })

  if (error) {
    // Fallback to old RPC if v2 doesn't exist yet
    if (error.message?.includes('verify_employee_password_v2')) {
      const { data: legacyData, error: legacyError } = await supabase
        .rpc('verify_employee_password', {
          p_username: username,
          p_password: password
        })
      if (legacyError) {
        console.error('Login error:', legacyError.message)
        throw new Error('Erreur de connexion')
      }
      if (!legacyData || legacyData.length === 0) return null
      const emp = legacyData[0] as Record<string, unknown>
      return {
        id: emp.id as string,
        username: emp.username as string,
        full_name: (emp.full_name as string | null) ?? null,
        role: emp.role as string,
        is_active: emp.is_active as boolean,
        profile_id: null,
        profile_name: emp.role as string,
        profile_display_name: emp.role as string,
        base_route: '/',
        hierarchy_level: 10,
        permissions: [],
      } satisfies Employee
    }
    console.error('Login error:', error.message, error.code, error.details, error.hint)
    throw new Error('Erreur de connexion')
  }

  if (!data || data.length === 0) {
    return null
  }

  return data[0] as Employee
}

export function getStoredEmployee(): Employee | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem('employee')
  if (!stored) return null
  
  try {
    return JSON.parse(stored) as Employee
  } catch {
    return null
  }
}

export function storeEmployee(employee: Employee): void {
  localStorage.setItem('employee', JSON.stringify(employee))
}

export function clearEmployee(): void {
  localStorage.removeItem('employee')
}
