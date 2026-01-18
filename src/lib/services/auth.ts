import { createClient } from '@/lib/supabase/client'

export interface Employee {
  id: string
  username: string
  full_name: string | null
  role: string
  is_active: boolean
}

export async function loginEmployee(username: string, password: string): Promise<Employee | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('verify_employee_password', {
      p_username: username,
      p_password: password
    })

  if (error) {
    console.error('Login error:', error)
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
