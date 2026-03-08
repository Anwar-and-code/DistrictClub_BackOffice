"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getStoredEmployee, clearEmployee, updateLastActivity, isSessionExpired, type Employee } from "@/lib/services/auth"
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
  const activityThrottleRef = useRef(0)

  const logout = useCallback(() => {
    clearEmployee()
    setEmployee(null)
    router.push("/login")
  }, [router])

  // Vérifier l'expiration de session
  const checkSession = useCallback(() => {
    if (employee && isSessionExpired()) {
      logout()
    }
  }, [employee, logout])

  // Mise à jour de l'activité (throttlée à 60s pour éviter les écritures excessives)
  const handleActivity = useCallback(() => {
    const now = Date.now()
    if (now - activityThrottleRef.current > 60_000) {
      activityThrottleRef.current = now
      updateLastActivity()
    }
  }, [])

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

  // Tracker d'activité utilisateur + vérification périodique
  useEffect(() => {
    if (!employee) return

    // Écouter les événements d'activité utilisateur
    const events = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"] as const
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }))

    // Vérifier la session toutes les 60 secondes
    const intervalId = setInterval(checkSession, 60_000)

    // Vérifier quand l'utilisateur revient sur l'onglet (après veille/extinction)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (isSessionExpired()) {
          logout()
        } else {
          updateLastActivity()
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity))
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [employee, handleActivity, checkSession, logout])

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
