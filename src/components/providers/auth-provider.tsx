"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getStoredEmployee, clearEmployee, type Employee } from "@/lib/services/auth"
import { hasPermission, hasAllPermissions, hasAnyPermission } from "@/lib/permissions"

interface AuthContextType {
  employee: Employee | null
  isLoading: boolean
  logout: () => void
  can: (permission: string) => boolean
  canAll: (permissions: string[]) => boolean
  canAny: (permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextType>({
  employee: null,
  isLoading: true,
  logout: () => {},
  can: () => false,
  canAll: () => false,
  canAny: () => false,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const stored = getStoredEmployee()
    setEmployee(stored)
    setIsLoading(false)

    // Redirect to login if not authenticated and not on login page
    if (!stored && pathname !== "/login") {
      router.push("/login")
    }
    // Redirect to base_route if authenticated and on login page
    if (stored && pathname === "/login") {
      router.push(stored.base_route || "/")
    }
  }, [pathname, router])

  const logout = () => {
    clearEmployee()
    setEmployee(null)
    router.push("/login")
  }

  const permissions = employee?.permissions || []

  const can = (permission: string) => hasPermission(permissions, permission)
  const canAll = (required: string[]) => hasAllPermissions(permissions, required)
  const canAny = (required: string[]) => hasAnyPermission(permissions, required)

  return (
    <AuthContext.Provider value={{ employee, isLoading, logout, can, canAll, canAny }}>
      {children}
    </AuthContext.Provider>
  )
}
