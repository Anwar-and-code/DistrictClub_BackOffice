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
  
  const { data, error } = await supabase
    .rpc('verify_employee_login', {
      p_username: username,
      p_password: password
    })

  if (error) {
    console.error('Login error:', error.message, error.code, error.details, error.hint)
    throw new Error('Erreur de connexion')
  }

  if (!data || data.length === 0) {
    return null
  }

  return data[0] as Employee
}

const SESSION_TIMEOUT_MS = 3 * 60 * 60 * 1000 // 3 heures
const LAST_ACTIVITY_KEY = 'lastActivity'

export function getStoredEmployee(): Employee | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem('employee')
  if (!stored) return null
  
  try {
    // Vérifier si la session a expiré par inactivité
    if (isSessionExpired()) {
      clearEmployee()
      return null
    }
    return JSON.parse(stored) as Employee
  } catch {
    return null
  }
}

export function storeEmployee(employee: Employee): void {
  localStorage.setItem('employee', JSON.stringify(employee))
  updateLastActivity()
}

export function clearEmployee(): void {
  localStorage.removeItem('employee')
  localStorage.removeItem(LAST_ACTIVITY_KEY)
}

export function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
}

export function isSessionExpired(): boolean {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
  if (!lastActivity) return true
  
  const elapsed = Date.now() - parseInt(lastActivity, 10)
  return elapsed > SESSION_TIMEOUT_MS
}
